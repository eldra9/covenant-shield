package com.example.ui.components

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.util.Log
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.annotation.OptIn
import androidx.camera.core.*
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.view.PreviewView
import androidx.compose.animation.core.*
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Rect
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.BlendMode
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalLifecycleOwner
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import androidx.core.content.ContextCompat
import com.example.ui.theme.*
import com.google.mlkit.vision.barcode.BarcodeScannerOptions
import com.google.mlkit.vision.barcode.BarcodeScanning
import com.google.mlkit.vision.barcode.common.Barcode
import com.google.mlkit.vision.common.InputImage
import java.util.concurrent.Executors

/**
 * High-reliability QR Code Scanner powered by CameraX and ML Kit Barcode Scanning.
 * Designed specifically for security guard post check-in and check-out verification.
 */
@Composable
fun CameraXQrScannerView(
  modifier: Modifier = Modifier,
  expectedToken: String? = null,
  siteName: String? = null,
  onQrCodeScanned: (String) -> Unit,
  onClose: () -> Unit
) {
  val context = LocalContext.current
  val lifecycleOwner = LocalLifecycleOwner.current

  var hasCameraPermission by remember {
    mutableStateOf(
      ContextCompat.checkSelfPermission(context, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED
    )
  }

  val permissionLauncher = rememberLauncherForActivityResult(
    contract = ActivityResultContracts.RequestPermission()
  ) { isGranted ->
    hasCameraPermission = isGranted
  }

  var torchEnabled by remember { mutableStateOf(false) }
  var cameraInstance by remember { mutableStateOf<Camera?>(null) }
  var lastScannedValue by remember { mutableStateOf<String?>(null) }
  var scanError by remember { mutableStateOf<String?>(null) }
  var isProcessing by remember { mutableStateOf(false) }

  // Prompt for permission if not granted
  LaunchedEffect(Unit) {
    if (!hasCameraPermission) {
      permissionLauncher.launch(Manifest.permission.CAMERA)
    }
  }

  Box(
    modifier = modifier
      .fillMaxSize()
      .background(Color.Black)
  ) {
    if (!hasCameraPermission) {
      // Permission required fallback UI
      CameraPermissionFallback(
        onRequestPermission = { permissionLauncher.launch(Manifest.permission.CAMERA) },
        expectedToken = expectedToken,
        onSimulateScan = {
          expectedToken?.let { token ->
            onQrCodeScanned(token)
          }
        },
        onClose = onClose
      )
    } else {
      // CameraX Live Preview with ImageAnalysis
      AndroidView(
        factory = { ctx ->
          val previewView = PreviewView(ctx).apply {
            scaleType = PreviewView.ScaleType.FILL_CENTER
          }
          val cameraExecutor = Executors.newSingleThreadExecutor()
          val cameraProviderFuture = ProcessCameraProvider.getInstance(ctx)

          cameraProviderFuture.addListener({
            try {
              val cameraProvider = cameraProviderFuture.get()

              val preview = Preview.Builder().build().also {
                it.setSurfaceProvider(previewView.surfaceProvider)
              }

              val barcodeScanner = BarcodeScanning.getClient(
                BarcodeScannerOptions.Builder()
                  .setBarcodeFormats(Barcode.FORMAT_QR_CODE, Barcode.FORMAT_ALL_FORMATS)
                  .build()
              )

              val imageAnalysis = ImageAnalysis.Builder()
                .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)
                .build()

              imageAnalysis.setAnalyzer(cameraExecutor) { imageProxy ->
                @OptIn(ExperimentalGetImage::class)
                val mediaImage = imageProxy.image
                if (mediaImage != null && !isProcessing) {
                  val image = InputImage.fromMediaImage(
                    mediaImage,
                    imageProxy.imageInfo.rotationDegrees
                  )
                  barcodeScanner.process(image)
                    .addOnSuccessListener { barcodes ->
                      for (barcode in barcodes) {
                        val rawValue = barcode.rawValue
                        if (!rawValue.isNullOrBlank() && rawValue != lastScannedValue) {
                          lastScannedValue = rawValue
                          isProcessing = true
                          // Verify against expected token if present
                          if (expectedToken != null && rawValue.trim() != expectedToken.trim()) {
                            scanError = "QR does not match $siteName post token!"
                            isProcessing = false
                          } else {
                            scanError = null
                            onQrCodeScanned(rawValue)
                          }
                          break
                        }
                      }
                    }
                    .addOnFailureListener { e ->
                      Log.e("CameraXScanner", "Barcode analysis failure", e)
                    }
                    .addOnCompleteListener {
                      imageProxy.close()
                    }
                } else {
                  imageProxy.close()
                }
              }

              val cameraSelector = CameraSelector.DEFAULT_BACK_CAMERA

              cameraProvider.unbindAll()
              val cam = cameraProvider.bindToLifecycle(
                lifecycleOwner,
                cameraSelector,
                preview,
                imageAnalysis
              )
              cameraInstance = cam
            } catch (e: Exception) {
              Log.e("CameraXScanner", "Camera binding failed", e)
            }
          }, ContextCompat.getMainExecutor(ctx))

          previewView
        },
        modifier = Modifier.fillMaxSize()
      )

      // High-Tech Viewfinder HUD Overlay
      ScannerHudOverlay(
        siteName = siteName,
        expectedToken = expectedToken,
        scanError = scanError,
        isTorchOn = torchEnabled,
        onToggleTorch = {
          torchEnabled = !torchEnabled
          cameraInstance?.cameraControl?.enableTorch(torchEnabled)
        },
        onSimulateValidScan = {
          expectedToken?.let { token ->
            onQrCodeScanned(token)
          }
        },
        onClose = onClose
      )
    }
  }
}

/**
 * Animated Viewfinder Overlay with corner brackets, sweep beam, and controls.
 */
@Composable
private fun ScannerHudOverlay(
  siteName: String?,
  expectedToken: String?,
  scanError: String?,
  isTorchOn: Boolean,
  onToggleTorch: () -> Unit,
  onSimulateValidScan: () -> Unit,
  onClose: () -> Unit
) {
  // Laser sweep animation
  val infiniteTransition = rememberInfiniteTransition(label = "scanner_laser")
  val scanProgress by infiniteTransition.animateFloat(
    initialValue = 0f,
    targetValue = 1f,
    animationSpec = infiniteRepeatable(
      animation = tween(durationMillis = 2000, easing = LinearEasing),
      repeatMode = RepeatMode.Reverse
    ),
    label = "laser_y"
  )

  BoxWithConstraints(modifier = Modifier.fillMaxSize()) {
    val boxWidth = maxWidth
    val boxHeight = maxHeight
    val boxSize = 260.dp

    // Canvas drawing semi-transparent scrim with clear square cutout
    Canvas(modifier = Modifier.fillMaxSize()) {
      val canvasWidth = size.width
      val canvasHeight = size.height
      val targetBoxPx = boxSize.toPx()
      val left = (canvasWidth - targetBoxPx) / 2f
      val top = (canvasHeight - targetBoxPx) / 2.2f

      // Draw dark scrim surrounding the box
      drawRect(
        color = Color.Black.copy(alpha = 0.65f),
        size = Size(canvasWidth, canvasHeight)
      )

      // Cutout box (blend mode clear)
      drawRoundRect(
        color = Color.Transparent,
        topLeft = Offset(left, top),
        size = Size(targetBoxPx, targetBoxPx),
        cornerRadius = CornerRadius(16.dp.toPx(), 16.dp.toPx()),
        blendMode = BlendMode.Clear
      )

      // Subtle target box boundary stroke
      drawRoundRect(
        color = Emerald.copy(alpha = 0.5f),
        topLeft = Offset(left, top),
        size = Size(targetBoxPx, targetBoxPx),
        cornerRadius = CornerRadius(16.dp.toPx(), 16.dp.toPx()),
        style = Stroke(width = 2.dp.toPx())
      )

      // Draw 4 security corner brackets
      val cornerLength = 32.dp.toPx()
      val strokeW = 4.dp.toPx()
      val bracketColor = Gold300

      // Top-Left
      drawLine(bracketColor, Offset(left - 2, top), Offset(left + cornerLength, top), strokeW)
      drawLine(bracketColor, Offset(left, top - 2), Offset(left, top + cornerLength), strokeW)

      // Top-Right
      val right = left + targetBoxPx
      drawLine(bracketColor, Offset(right - cornerLength, top), Offset(right + 2, top), strokeW)
      drawLine(bracketColor, Offset(right, top - 2), Offset(right, top + cornerLength), strokeW)

      // Bottom-Left
      val bottom = top + targetBoxPx
      drawLine(bracketColor, Offset(left - 2, bottom), Offset(left + cornerLength, bottom), strokeW)
      drawLine(bracketColor, Offset(left, bottom - cornerLength), Offset(left, bottom + 2), strokeW)

      // Bottom-Right
      drawLine(bracketColor, Offset(right - cornerLength, bottom), Offset(right + 2, bottom), strokeW)
      drawLine(bracketColor, Offset(right, bottom - cornerLength), Offset(right, bottom + 2), strokeW)

      // Animated Laser Scan Line
      val laserY = top + (targetBoxPx * scanProgress)
      drawLine(
        brush = Brush.horizontalGradient(
          colors = listOf(
            Color.Transparent,
            Emerald700.copy(alpha = 0.8f),
            Gold300,
            Emerald700.copy(alpha = 0.8f),
            Color.Transparent
          )
        ),
        start = Offset(left + 8.dp.toPx(), laserY),
        end = Offset(right - 8.dp.toPx(), laserY),
        strokeWidth = 3.dp.toPx()
      )
    }

    // Top Controls Bar
    Row(
      modifier = Modifier
        .fillMaxWidth()
        .statusBarsPadding()
        .padding(horizontal = 16.dp, vertical = 12.dp),
      horizontalArrangement = Arrangement.SpaceBetween,
      verticalAlignment = Alignment.CenterVertically
    ) {
      IconButton(
        onClick = onClose,
        modifier = Modifier
          .size(42.dp)
          .clip(CircleShape)
          .background(Color.Black.copy(alpha = 0.5f))
          .testTag("close_qr_scanner_button")
      ) {
        Icon(Icons.Default.Close, contentDescription = "Close Scanner", tint = White)
      }

      // Scanner Title Badge
      Surface(
        shape = RoundedCornerShape(20.dp),
        color = Emerald.copy(alpha = 0.85f),
        contentColor = White,
        tonalElevation = 0.dp
      ) {
        Row(
          modifier = Modifier.padding(horizontal = 14.dp, vertical = 6.dp),
          verticalAlignment = Alignment.CenterVertically
        ) {
          Icon(Icons.Default.QrCodeScanner, contentDescription = null, tint = Gold300, modifier = Modifier.size(16.dp))
          Spacer(modifier = Modifier.width(6.dp))
          Text(
            text = "Post QR Scanner",
            fontFamily = InterFontFamily,
            fontWeight = FontWeight.Bold,
            fontSize = 12.sp,
            color = White
          )
        }
      }

      // Flashlight / Torch toggle button
      IconButton(
        onClick = onToggleTorch,
        modifier = Modifier
          .size(42.dp)
          .clip(CircleShape)
          .background(if (isTorchOn) Gold.copy(alpha = 0.35f) else Color.Black.copy(alpha = 0.5f))
          .testTag("toggle_torch_button")
      ) {
        Icon(
          imageVector = if (isTorchOn) Icons.Default.FlashOn else Icons.Default.FlashOff,
          contentDescription = "Torch",
          tint = if (isTorchOn) Gold300 else White
        )
      }
    }

    // Target Info & Guidance Box below cutout
    Column(
      modifier = Modifier
        .align(Alignment.BottomCenter)
        .navigationBarsPadding()
        .padding(bottom = 24.dp, start = 20.dp, end = 20.dp),
      horizontalAlignment = Alignment.CenterHorizontally
    ) {
      // Error message if wrong QR scanned
      if (scanError != null) {
        Card(
          shape = RoundedCornerShape(12.dp),
          colors = CardDefaults.cardColors(containerColor = StatusDanger.copy(alpha = 0.9f)),
          modifier = Modifier
            .fillMaxWidth()
            .padding(bottom = 12.dp)
        ) {
          Row(
            modifier = Modifier.padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
          ) {
            Icon(Icons.Default.Warning, contentDescription = null, tint = White, modifier = Modifier.size(18.dp))
            Spacer(modifier = Modifier.width(8.dp))
            Text(
              text = scanError,
              fontFamily = InterFontFamily,
              color = White,
              fontSize = 12.sp,
              fontWeight = FontWeight.Medium
            )
          }
        }
      }

      // Info Card for target post
      Card(
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color.Black.copy(alpha = 0.75f)),
        border = CardDefaults.outlinedCardBorder().copy(brush = Brush.horizontalGradient(listOf(Emerald, Gold))),
        modifier = Modifier.fillMaxWidth()
      ) {
        Column(
          modifier = Modifier.padding(16.dp),
          horizontalAlignment = Alignment.CenterHorizontally
        ) {
          Text(
            text = "Align Post QR Code Within The Reticle",
            fontFamily = FrauncesFontFamily,
            fontWeight = FontWeight.Bold,
            fontSize = 14.sp,
            color = White,
            textAlign = TextAlign.Center
          )

          if (siteName != null) {
            Spacer(modifier = Modifier.height(4.dp))
            Text(
              text = "Target Post: $siteName",
              fontFamily = InterFontFamily,
              fontSize = 12.sp,
              color = Gold300,
              fontWeight = FontWeight.SemiBold
            )
          }

          if (expectedToken != null) {
            Spacer(modifier = Modifier.height(2.dp))
            Text(
              text = "Official Token: $expectedToken",
              fontFamily = IbmPlexMonoFontFamily,
              fontSize = 10.sp,
              color = Gold300
            )
          }

          Spacer(modifier = Modifier.height(12.dp))

          // Emulator / Fast Verify button
          OutlinedButton(
            onClick = onSimulateValidScan,
            shape = RoundedCornerShape(10.dp),
            colors = ButtonDefaults.outlinedButtonColors(contentColor = Gold300),
            modifier = Modifier
              .fillMaxWidth()
              .height(44.dp)
              .testTag("simulate_official_qr_scan_button")
          ) {
            Icon(Icons.Default.CheckCircle, contentDescription = null, modifier = Modifier.size(16.dp), tint = Gold300)
            Spacer(modifier = Modifier.width(6.dp))
            Text(
              text = "Simulate Official Post QR Scan",
              fontFamily = InterFontFamily,
              fontWeight = FontWeight.SemiBold,
              fontSize = 12.sp
            )
          }
        }
      }
    }
  }
}

/**
 * Fallback view when camera permission is denied or pending.
 */
@Composable
private fun CameraPermissionFallback(
  onRequestPermission: () -> Unit,
  expectedToken: String?,
  onSimulateScan: () -> Unit,
  onClose: () -> Unit
) {
  Column(
    modifier = Modifier
      .fillMaxSize()
      .background(Forest)
      .padding(24.dp),
    verticalArrangement = Arrangement.Center,
    horizontalAlignment = Alignment.CenterHorizontally
  ) {
    Box(
      contentAlignment = Alignment.Center,
      modifier = Modifier
        .size(80.dp)
        .clip(CircleShape)
        .background(Gold.copy(alpha = 0.2f))
    ) {
      Icon(
        imageVector = Icons.Default.CameraAlt,
        contentDescription = "Camera Permission",
        tint = Gold300,
        modifier = Modifier.size(40.dp)
      )
    }

    Spacer(modifier = Modifier.height(20.dp))

    Text(
      text = "Camera Permission Required",
      fontFamily = FrauncesFontFamily,
      fontWeight = FontWeight.Bold,
      fontSize = 20.sp,
      color = White,
      textAlign = TextAlign.Center
    )

    Spacer(modifier = Modifier.height(8.dp))

    Text(
      text = "Camera access is needed to scan physical QR badges at security posts for official check-in and check-out ledger stamping.",
      fontFamily = InterFontFamily,
      fontSize = 13.sp,
      color = Emerald50,
      textAlign = TextAlign.Center,
      lineHeight = 18.sp
    )

    Spacer(modifier = Modifier.height(24.dp))

    Button(
      onClick = onRequestPermission,
      shape = RoundedCornerShape(12.dp),
      colors = ButtonDefaults.buttonColors(containerColor = Gold, contentColor = Ink),
      modifier = Modifier
        .fillMaxWidth()
        .height(50.dp)
        .testTag("grant_camera_permission_button")
    ) {
      Icon(Icons.Default.Security, contentDescription = null, tint = Ink)
      Spacer(modifier = Modifier.width(8.dp))
      Text("GRANT CAMERA ACCESS", fontFamily = InterFontFamily, fontWeight = FontWeight.Bold)
    }

    Spacer(modifier = Modifier.height(12.dp))

    // Fallback simulate token
    if (expectedToken != null) {
      OutlinedButton(
        onClick = onSimulateScan,
        shape = RoundedCornerShape(12.dp),
        colors = ButtonDefaults.outlinedButtonColors(contentColor = White),
        modifier = Modifier
          .fillMaxWidth()
          .height(48.dp)
          .testTag("fallback_post_qr_scan_button")
      ) {
        Icon(Icons.Default.QrCode, contentDescription = null, tint = White)
        Spacer(modifier = Modifier.width(8.dp))
        Text("Verify Post With Official Token", fontFamily = InterFontFamily, fontSize = 13.sp)
      }
    }

    Spacer(modifier = Modifier.height(16.dp))

    TextButton(onClick = onClose) {
      Text("Cancel and Return", color = Gold300, fontFamily = InterFontFamily)
    }
  }
}

/**
 * Fullscreen or Dialog modal wrapper for the CameraX QR Scanner.
 */
@Composable
fun CameraXQrScannerDialog(
  expectedToken: String? = null,
  siteName: String? = null,
  onQrCodeScanned: (String) -> Unit,
  onDismiss: () -> Unit
) {
  Dialog(
    onDismissRequest = onDismiss,
    properties = DialogProperties(
      usePlatformDefaultWidth = false,
      dismissOnBackPress = true,
      dismissOnClickOutside = false
    )
  ) {
    Box(modifier = Modifier.fillMaxSize()) {
      CameraXQrScannerView(
        expectedToken = expectedToken,
        siteName = siteName,
        onQrCodeScanned = { scannedCode ->
          onQrCodeScanned(scannedCode)
          onDismiss()
        },
        onClose = onDismiss
      )
    }
  }
}
