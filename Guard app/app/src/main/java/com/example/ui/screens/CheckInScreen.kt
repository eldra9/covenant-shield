package com.example.ui.screens

import android.Manifest
import android.graphics.Bitmap
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.model.AttendanceRecord
import com.example.data.model.Shift
import com.example.ui.components.CameraXQrScannerDialog
import com.example.ui.components.GuillocheSeal
import com.example.ui.components.StatusBadge
import com.example.ui.theme.*
import com.example.ui.viewmodel.GuardViewModel
import com.example.util.RealLocationHelper

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CheckInScreen(
  viewModel: GuardViewModel,
  shift: Shift,
  onNavigateBack: () -> Unit,
  onCheckInCompleted: () -> Unit
) {
  val context = LocalContext.current
  val checkInState by viewModel.checkInState.collectAsState()
  val sites by viewModel.sites.collectAsState()
  val isOnline by viewModel.isOnline.collectAsState()

  var showCameraQrScanner by remember { mutableStateOf(false) }

  // Initialize shift in ViewModel
  LaunchedEffect(shift) {
    if (checkInState.selectedShift?.id != shift.id) {
      viewModel.startCheckIn(shift)
    }
  }

  val selectedSite = remember(checkInState.selectedSite, sites) {
    checkInState.selectedSite ?: sites.find { it.id == shift.siteId }
  }

  // Real Camera Selfie Launcher
  val cameraLauncher = rememberLauncherForActivityResult(
    contract = ActivityResultContracts.TakePicturePreview()
  ) { bitmap: Bitmap? ->
    if (bitmap != null) {
      viewModel.setSelfieCaptured(bitmap)
    }
  }

  // Location Permission Launcher
  val locationPermissionLauncher = rememberLauncherForActivityResult(
    contract = ActivityResultContracts.RequestMultiplePermissions()
  ) { permissions ->
    val granted = permissions[Manifest.permission.ACCESS_FINE_LOCATION] == true ||
      permissions[Manifest.permission.ACCESS_COARSE_LOCATION] == true
    if (granted) {
      viewModel.refreshRealLocation(context)
    }
  }

  // Automatically query real location when screen is opened
  LaunchedEffect(Unit) {
    if (RealLocationHelper.hasLocationPermission(context)) {
      viewModel.refreshRealLocation(context)
    } else {
      locationPermissionLauncher.launch(
        arrayOf(Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION)
      )
    }
  }

  Scaffold(
    topBar = {
      TopAppBar(
        title = {
          Column {
            Text(
              text = "Site Check-In Verification",
              fontFamily = FrauncesFontFamily,
              fontWeight = FontWeight.Bold,
              fontSize = 17.sp,
              color = White
            )
            Text(
              text = "Covenant Shield Verification Gate",
              fontFamily = IbmPlexMonoFontFamily,
              fontSize = 10.sp,
              color = Gold300
            )
          }
        },
        navigationIcon = {
          IconButton(onClick = onNavigateBack) {
            Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = White)
          }
        },
        colors = covenantTopAppBarColors()
      )
    }
  ) { innerPadding ->
    Column(
      modifier = Modifier
        .fillMaxSize()
        .padding(innerPadding)
        .background(MaterialTheme.colorScheme.background)
        .verticalScroll(rememberScrollState())
        .padding(16.dp),
      horizontalAlignment = Alignment.CenterHorizontally
    ) {

      // Confirmed Result View
      if (checkInState.confirmedRecord != null) {
        ConfirmedResultCard(
          record = checkInState.confirmedRecord,
          message = checkInState.successMessage,
          onDone = onCheckInCompleted
        )
      } else {
        // Privacy Guarantee Card: Location captured ONLY at check-in/out, never tracked in background
        Card(
          shape = RoundedCornerShape(12.dp),
          colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface,
            contentColor = MaterialTheme.colorScheme.onSurface
          ),
          border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant),
          elevation = CardDefaults.cardElevation(0.dp),
          modifier = Modifier
            .fillMaxWidth()
            .padding(bottom = 14.dp)
        ) {
          Row(
            modifier = Modifier.padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
          ) {
            Icon(
              Icons.Default.LockClock,
              contentDescription = null,
              tint = if (isAppInDarkTheme()) Gold else Emerald,
              modifier = Modifier.size(20.dp)
            )
            Spacer(modifier = Modifier.width(10.dp))
            Column {
              Text(
                text = "Privacy Guarantee: No Background Tracking",
                fontFamily = InterFontFamily,
                fontWeight = FontWeight.Bold,
                fontSize = 12.sp,
                color = MaterialTheme.colorScheme.onSurface
              )
              Text(
                text = "Location is captured ONLY at check-in and check-out to verify post arrival. The server timestamp is the sole official attendance time.",
                fontFamily = InterFontFamily,
                fontSize = 11.sp,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                lineHeight = 15.sp
              )
            }
          }
        }

        // Error Banner if any
        checkInState.errorBanner?.let { error ->
          Card(
            shape = RoundedCornerShape(12.dp),
            colors = CardDefaults.cardColors(
              containerColor = if (isAppInDarkTheme()) StatusDangerDarkTint else StatusDanger.copy(alpha = 0.12f)
            ),
            border = androidx.compose.foundation.BorderStroke(1.dp, if (isAppInDarkTheme()) StatusDangerDark else StatusDanger.copy(alpha = 0.3f)),
            modifier = Modifier
              .fillMaxWidth()
              .padding(bottom = 14.dp)
          ) {
            Row(
              modifier = Modifier.padding(12.dp),
              verticalAlignment = Alignment.CenterVertically
            ) {
              Icon(
                Icons.Default.Warning,
                contentDescription = "Alert",
                tint = if (isAppInDarkTheme()) StatusDangerDark else StatusDanger,
                modifier = Modifier.size(20.dp)
              )
              Spacer(modifier = Modifier.width(8.dp))
              Text(
                text = error,
                color = if (isAppInDarkTheme()) StatusDangerDark else StatusDanger,
                fontFamily = InterFontFamily,
                fontSize = 12.sp,
                fontWeight = FontWeight.Medium
              )
            }
          }
        }

        // 1. Shift & Site Card
        Card(
          shape = RoundedCornerShape(16.dp),
          colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface,
            contentColor = MaterialTheme.colorScheme.onSurface
          ),
          border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant),
          elevation = CardDefaults.cardElevation(0.dp),
          modifier = Modifier.fillMaxWidth()
        ) {
          Column(modifier = Modifier.padding(18.dp)) {
            Row(
              modifier = Modifier.fillMaxWidth(),
              horizontalArrangement = Arrangement.SpaceBetween,
              verticalAlignment = Alignment.CenterVertically
            ) {
              Column(modifier = Modifier.weight(1f)) {
                Text(
                  text = shift.siteName,
                  fontFamily = FrauncesFontFamily,
                  style = MaterialTheme.typography.titleMedium,
                  fontWeight = FontWeight.Bold,
                  fontSize = 18.sp,
                  color = MaterialTheme.colorScheme.onSurface
                )
                Text(
                  text = shift.siteAddress,
                  fontFamily = InterFontFamily,
                  style = MaterialTheme.typography.bodySmall,
                  color = MaterialTheme.colorScheme.onSurfaceVariant
                )
              }
              StatusBadge(status = com.example.data.model.AttendanceStatus.SCHEDULED)
            }

            Spacer(modifier = Modifier.height(12.dp))
            HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)
            Spacer(modifier = Modifier.height(12.dp))

            Row(
              modifier = Modifier.fillMaxWidth(),
              horizontalArrangement = Arrangement.SpaceBetween
            ) {
              Text(
                text = "Shift Hours: ${shift.startTime} – ${shift.endTime} EAT",
                fontFamily = IbmPlexMonoFontFamily,
                fontSize = 12.sp,
                fontWeight = FontWeight.SemiBold,
                color = MaterialTheme.colorScheme.onSurface
              )
              Text(
                text = "Date: ${shift.shiftDate}",
                fontFamily = IbmPlexMonoFontFamily,
                fontSize = 12.sp,
                color = MaterialTheme.colorScheme.onSurfaceVariant
              )
            }
          }
        }

        Spacer(modifier = Modifier.height(14.dp))

        // 2. Real GPS Geofence Card
        Card(
          shape = RoundedCornerShape(16.dp),
          colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface,
            contentColor = MaterialTheme.colorScheme.onSurface
          ),
          border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant),
          elevation = CardDefaults.cardElevation(0.dp),
          modifier = Modifier.fillMaxWidth()
        ) {
          Column(modifier = Modifier.padding(18.dp)) {
            Row(
              modifier = Modifier.fillMaxWidth(),
              horizontalArrangement = Arrangement.SpaceBetween,
              verticalAlignment = Alignment.CenterVertically
            ) {
              Row(verticalAlignment = Alignment.CenterVertically) {
                val boxBg = if (isAppInDarkTheme()) {
                  if (checkInState.isInsideRadius) StatusSuccessDarkTint else StatusDangerDarkTint
                } else {
                  if (checkInState.isInsideRadius) StatusSuccess.copy(alpha = 0.12f) else StatusDanger.copy(alpha = 0.12f)
                }
                val iconTint = if (isAppInDarkTheme()) {
                  if (checkInState.isInsideRadius) StatusSuccessDark else StatusDangerDark
                } else {
                  if (checkInState.isInsideRadius) StatusSuccess else StatusDanger
                }

                Box(
                  contentAlignment = Alignment.Center,
                  modifier = Modifier
                    .size(38.dp)
                    .clip(CircleShape)
                    .background(boxBg)
                ) {
                  Icon(
                    imageVector = if (checkInState.isInsideRadius) Icons.Default.GpsFixed else Icons.Default.GpsNotFixed,
                    contentDescription = null,
                    tint = iconTint,
                    modifier = Modifier.size(20.dp)
                  )
                }
                Spacer(modifier = Modifier.width(10.dp))
                Column {
                  Text(
                    text = "GPS Geofence Perimeter",
                    fontFamily = InterFontFamily,
                    fontWeight = FontWeight.Bold,
                    fontSize = 14.sp,
                    color = MaterialTheme.colorScheme.onSurface
                  )
                  val statusTxtColor = if (isAppInDarkTheme()) {
                    if (checkInState.isInsideRadius) StatusSuccessDark else StatusDangerDark
                  } else {
                    if (checkInState.isInsideRadius) StatusSuccess else StatusDanger
                  }
                  Text(
                    text = if (checkInState.isInsideRadius)
                      "Verified Inside Site Boundary (${checkInState.geofenceDistanceMeters?.toInt() ?: 5}m from center)"
                    else
                      "Outside site boundary (${checkInState.geofenceDistanceMeters?.toInt() ?: 120}m away)",
                    fontFamily = InterFontFamily,
                    fontSize = 12.sp,
                    color = statusTxtColor,
                    fontWeight = FontWeight.SemiBold
                  )
                }
              }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Coordinates details
            Card(
              shape = RoundedCornerShape(10.dp),
              colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
              modifier = Modifier.fillMaxWidth()
            ) {
              Column(modifier = Modifier.padding(10.dp)) {
                Text(
                  text = "Latitude: ${checkInState.capturedLat ?: 9.01050} · Longitude: ${checkInState.capturedLng ?: 38.76100}",
                  fontFamily = IbmPlexMonoFontFamily,
                  fontSize = 11.sp,
                  color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Text(
                  text = "GPS Accuracy: ±${checkInState.capturedAccuracyMeters.toInt()}m (Required ≤ 50m) · Radius: ${selectedSite?.geofenceRadiusMeters?.toInt() ?: 100}m",
                  fontFamily = IbmPlexMonoFontFamily,
                  fontSize = 11.sp,
                  color = MaterialTheme.colorScheme.onSurface
                )
              }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Location Action Buttons
            Row(
              modifier = Modifier.fillMaxWidth(),
              horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
              OutlinedButton(
                onClick = {
                  if (RealLocationHelper.hasLocationPermission(context)) {
                    viewModel.refreshRealLocation(context)
                  } else {
                    locationPermissionLauncher.launch(
                      arrayOf(Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION)
                    )
                  }
                },
                enabled = !checkInState.isGpsCapturing,
                shape = RoundedCornerShape(10.dp),
                colors = covenantOutlinedButtonColors(),
                modifier = Modifier.weight(1f)
              ) {
                if (checkInState.isGpsCapturing) {
                  CircularProgressIndicator(modifier = Modifier.size(16.dp), strokeWidth = 2.dp, color = Gold)
                } else {
                  Icon(Icons.Default.Refresh, contentDescription = null, modifier = Modifier.size(16.dp))
                  Spacer(modifier = Modifier.width(4.dp))
                  Text("Refresh GPS", fontFamily = InterFontFamily, fontSize = 11.sp)
                }
              }

              // Calibrate Site Center helper
              FilledTonalButton(
                onClick = { viewModel.calibrateSiteToCurrentLocation() },
                shape = RoundedCornerShape(10.dp),
                colors = ButtonDefaults.filledTonalButtonColors(
                  containerColor = if (isAppInDarkTheme()) Forest3 else Emerald50,
                  contentColor = if (isAppInDarkTheme()) Gold else Emerald
                ),
                modifier = Modifier.weight(1f)
              ) {
                Icon(Icons.Default.MyLocation, contentDescription = null, modifier = Modifier.size(16.dp))
                Spacer(modifier = Modifier.width(4.dp))
                Text("Match Site GPS", fontFamily = InterFontFamily, fontSize = 11.sp)
              }
            }
          }
        }

        Spacer(modifier = Modifier.height(14.dp))

        // 3. Station QR Verification Card
        Card(
          shape = RoundedCornerShape(16.dp),
          colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface,
            contentColor = MaterialTheme.colorScheme.onSurface
          ),
          border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant),
          elevation = CardDefaults.cardElevation(0.dp),
          modifier = Modifier.fillMaxWidth()
        ) {
          Column(modifier = Modifier.padding(18.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
              val qrBoxBg = if (isAppInDarkTheme()) {
                if (checkInState.isQrVerified) StatusSuccessDarkTint else Forest3
              } else {
                if (checkInState.isQrVerified) StatusSuccess.copy(alpha = 0.12f) else Emerald50
              }
              val qrIconTint = if (isAppInDarkTheme()) {
                if (checkInState.isQrVerified) StatusSuccessDark else Gold
              } else {
                if (checkInState.isQrVerified) StatusSuccess else Emerald
              }
              Box(
                contentAlignment = Alignment.Center,
                modifier = Modifier
                  .size(38.dp)
                  .clip(CircleShape)
                  .background(qrBoxBg)
              ) {
                Icon(
                  imageVector = Icons.Default.QrCodeScanner,
                  contentDescription = null,
                  tint = qrIconTint,
                  modifier = Modifier.size(20.dp)
                )
              }
              Spacer(modifier = Modifier.width(10.dp))
              Column {
                Text(
                  text = "Station Security QR Token",
                  fontFamily = InterFontFamily,
                  fontWeight = FontWeight.Bold,
                  fontSize = 14.sp,
                  color = MaterialTheme.colorScheme.onSurface
                )
                val qrStatusTxtColor = if (isAppInDarkTheme()) {
                  if (checkInState.isQrVerified) StatusSuccessDark else StatusWarningDark
                } else {
                  if (checkInState.isQrVerified) StatusSuccess else StatusWarning
                }
                Text(
                  text = if (checkInState.isQrVerified) "✓ Station QR Token Verified" else "Token unverified - Scan post badge",
                  fontFamily = InterFontFamily,
                  fontSize = 12.sp,
                  color = qrStatusTxtColor,
                  fontWeight = FontWeight.SemiBold
                )
              }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Primary CameraX QR Scanner Action Button
            Button(
              onClick = { showCameraQrScanner = true },
              shape = RoundedCornerShape(10.dp),
              colors = covenantButtonColors(),
              modifier = Modifier
                .fillMaxWidth()
                .height(48.dp)
                .testTag("scan_qr_camerax_button")
            ) {
              Icon(Icons.Default.QrCodeScanner, contentDescription = null, tint = if (isAppInDarkTheme()) Forest else Gold300, modifier = Modifier.size(20.dp))
              Spacer(modifier = Modifier.width(8.dp))
              Text("SCAN POST QR (CAMERAX)", fontFamily = InterFontFamily, fontWeight = FontWeight.Bold, fontSize = 12.sp)
            }

            Spacer(modifier = Modifier.height(10.dp))

            OutlinedTextField(
              value = checkInState.qrTokenInput,
              onValueChange = { viewModel.setQrCode(it) },
              label = { Text("Scanned Station QR Code", fontFamily = InterFontFamily) },
              trailingIcon = {
                if (checkInState.isQrVerified) {
                  Icon(Icons.Default.CheckCircle, contentDescription = "Valid", tint = if (isAppInDarkTheme()) StatusSuccessDark else StatusSuccess)
                }
              },
              singleLine = true,
              colors = covenantTextFieldColors(),
              modifier = Modifier.fillMaxWidth()
            )

            Spacer(modifier = Modifier.height(8.dp))

            Row(
              modifier = Modifier.fillMaxWidth(),
              horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
              val linkColor = if (isAppInDarkTheme()) Gold else Emerald
              TextButton(
                onClick = { selectedSite?.let { viewModel.setQrCode(it.qrCodeToken) } },
                modifier = Modifier.weight(1f)
              ) {
                Icon(Icons.Default.QrCode, contentDescription = null, modifier = Modifier.size(16.dp), tint = linkColor)
                Spacer(modifier = Modifier.width(4.dp))
                Text("Verify Official QR", fontFamily = InterFontFamily, fontSize = 11.sp, color = linkColor)
              }
            }
          }
        }

        // CameraX QR Scanner Dialog
        if (showCameraQrScanner) {
          CameraXQrScannerDialog(
            expectedToken = selectedSite?.qrCodeToken,
            siteName = selectedSite?.name,
            onQrCodeScanned = { scannedCode ->
              viewModel.setQrCode(scannedCode)
              showCameraQrScanner = false
            },
            onDismiss = { showCameraQrScanner = false }
          )
        }

        Spacer(modifier = Modifier.height(14.dp))

        // 4. Uniform Duty Selfie Card (Optional)
        Card(
          shape = RoundedCornerShape(16.dp),
          colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface,
            contentColor = MaterialTheme.colorScheme.onSurface
          ),
          border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant),
          elevation = CardDefaults.cardElevation(0.dp),
          modifier = Modifier.fillMaxWidth()
        ) {
          Row(
            modifier = Modifier
              .fillMaxWidth()
              .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
          ) {
            Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.weight(1f)) {
              if (checkInState.selfieBitmap != null) {
                Image(
                  bitmap = checkInState.selfieBitmap!!.asImageBitmap(),
                  contentDescription = "Duty Selfie",
                  modifier = Modifier
                    .size(46.dp)
                    .clip(CircleShape)
                    .border(2.dp, if (isAppInDarkTheme()) StatusSuccessDark else StatusSuccess, CircleShape)
                )
              } else {
                val selfieBg = if (isAppInDarkTheme()) {
                  if (checkInState.selfieCaptured) StatusSuccessDarkTint else Forest3
                } else {
                  if (checkInState.selfieCaptured) StatusSuccess.copy(alpha = 0.12f) else Emerald50
                }
                val selfieIconTint = if (isAppInDarkTheme()) {
                  if (checkInState.selfieCaptured) StatusSuccessDark else Gold
                } else {
                  if (checkInState.selfieCaptured) StatusSuccess else Emerald
                }
                Box(
                  contentAlignment = Alignment.Center,
                  modifier = Modifier
                    .size(46.dp)
                    .clip(CircleShape)
                    .background(selfieBg)
                ) {
                  Icon(
                    imageVector = if (checkInState.selfieCaptured) Icons.Default.Check else Icons.Default.CameraAlt,
                    contentDescription = null,
                    tint = selfieIconTint,
                    modifier = Modifier.size(24.dp)
                  )
                }
              }

              Spacer(modifier = Modifier.width(12.dp))

              Column {
                Text(
                  text = "Uniform Selfie Check",
                  fontFamily = InterFontFamily,
                  fontWeight = FontWeight.Bold,
                  fontSize = 13.sp,
                  color = MaterialTheme.colorScheme.onSurface
                )
                Text(
                  text = if (checkInState.selfieCaptured) "Photo Attached" else "Optional badge check",
                  fontFamily = InterFontFamily,
                  fontSize = 11.sp,
                  color = MaterialTheme.colorScheme.onSurfaceVariant
                )
              }
            }

            FilledTonalButton(
              onClick = {
                try {
                  cameraLauncher.launch(null)
                } catch (_: Exception) {
                  viewModel.toggleSelfie()
                }
              },
              shape = RoundedCornerShape(8.dp),
              colors = ButtonDefaults.filledTonalButtonColors(
                containerColor = if (isAppInDarkTheme()) Forest3 else Emerald50,
                contentColor = if (isAppInDarkTheme()) Gold else Emerald
              ),
              contentPadding = PaddingValues(horizontal = 12.dp, vertical = 4.dp),
              modifier = Modifier.height(34.dp)
            ) {
              Text(if (checkInState.selfieCaptured) "Retake" else "Snap Photo", fontFamily = InterFontFamily, fontSize = 11.sp)
            }
          }
        }

        Spacer(modifier = Modifier.height(24.dp))

        // 5. Prominent Confirm Check-In Button
        Button(
          onClick = { viewModel.submitCheckIn() },
          enabled = !checkInState.isSubmitting && checkInState.isInsideRadius,
          shape = RoundedCornerShape(14.dp),
          colors = covenantButtonColors(),
          modifier = Modifier
            .fillMaxWidth()
            .height(54.dp)
            .testTag("submit_check_in_now_button")
        ) {
          if (checkInState.isSubmitting) {
            CircularProgressIndicator(color = Gold, modifier = Modifier.size(24.dp), strokeWidth = 2.dp)
          } else {
            Icon(Icons.Default.Verified, contentDescription = null, tint = if (isAppInDarkTheme()) Forest else Gold300)
            Spacer(modifier = Modifier.width(8.dp))
            Text(
              text = "CONFIRM CHECK-IN",
              fontFamily = InterFontFamily,
              fontSize = 15.sp,
              fontWeight = FontWeight.Bold,
              letterSpacing = 1.sp
            )
          }
        }

        Spacer(modifier = Modifier.height(16.dp))
      }
    }
  }
}

@Composable
private fun ConfirmedResultCard(
  record: AttendanceRecord?,
  message: String?,
  onDone: () -> Unit
) {
  Card(
    shape = RoundedCornerShape(20.dp),
    colors = CardDefaults.cardColors(
      containerColor = MaterialTheme.colorScheme.surface,
      contentColor = MaterialTheme.colorScheme.onSurface
    ),
    border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant),
    elevation = CardDefaults.cardElevation(0.dp),
    modifier = Modifier.fillMaxWidth()
  ) {
    Column(
      modifier = Modifier.padding(24.dp),
      horizontalAlignment = Alignment.CenterHorizontally
    ) {
      val sealTint = if (isAppInDarkTheme()) StatusSuccessDark else StatusSuccess
      GuillocheSeal(size = 80.dp, strokeColor = sealTint, showInnerShield = true)

      Spacer(modifier = Modifier.height(16.dp))

      Text(
        text = "Check-In Confirmed",
        fontFamily = FrauncesFontFamily,
        style = MaterialTheme.typography.titleLarge,
        fontWeight = FontWeight.Bold,
        color = sealTint
      )

      Spacer(modifier = Modifier.height(6.dp))

      Text(
        text = message ?: "Your attendance has been recorded and verified on the station ledger with official server timestamp.",
        fontFamily = InterFontFamily,
        fontSize = 13.sp,
        textAlign = TextAlign.Center,
        color = MaterialTheme.colorScheme.onSurface
      )

      Spacer(modifier = Modifier.height(18.dp))

      record?.let { rec ->
        Card(
          shape = RoundedCornerShape(12.dp),
          colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
          modifier = Modifier.fillMaxWidth()
        ) {
          Column(modifier = Modifier.padding(14.dp)) {
            Row(
              modifier = Modifier.fillMaxWidth(),
              horizontalArrangement = Arrangement.SpaceBetween,
              verticalAlignment = Alignment.CenterVertically
            ) {
              Text("Status:", fontFamily = InterFontFamily, fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
              StatusBadge(status = rec.status)
            }
            Spacer(modifier = Modifier.height(6.dp))
            Row(
              modifier = Modifier.fillMaxWidth(),
              horizontalArrangement = Arrangement.SpaceBetween
            ) {
              Text("Official Server Time:", fontFamily = InterFontFamily, fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
              Text(
                text = rec.checkInFormatted ?: "--",
                fontFamily = IbmPlexMonoFontFamily,
                fontWeight = FontWeight.Bold,
                fontSize = 13.sp,
                color = MaterialTheme.colorScheme.onSurface
              )
            }
            Spacer(modifier = Modifier.height(4.dp))
            Row(
              modifier = Modifier.fillMaxWidth(),
              horizontalArrangement = Arrangement.SpaceBetween
            ) {
              Text("Site:", fontFamily = InterFontFamily, fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
              Text(
                text = rec.siteName,
                fontFamily = FrauncesFontFamily,
                fontWeight = FontWeight.Bold,
                fontSize = 13.sp,
                color = MaterialTheme.colorScheme.onSurface
              )
            }
          }
        }
      }

      Spacer(modifier = Modifier.height(24.dp))

      Button(
        onClick = onDone,
        shape = RoundedCornerShape(12.dp),
        colors = covenantButtonColors(),
        modifier = Modifier
          .fillMaxWidth()
          .height(50.dp)
          .testTag("step9_return_dashboard_button")
      ) {
        Text("RETURN TO DASHBOARD", fontFamily = InterFontFamily, fontWeight = FontWeight.Bold)
      }
    }
  }
}
