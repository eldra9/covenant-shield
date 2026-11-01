package com.example.ui.screens

import androidx.compose.foundation.background
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
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.model.AttendanceRecord
import com.example.data.model.AttendanceStatus
import com.example.ui.components.CameraXQrScannerDialog
import com.example.ui.components.GuillocheSeal
import com.example.ui.components.StatusBadge
import com.example.ui.theme.*
import com.example.ui.viewmodel.GuardViewModel
import com.example.util.DateTimeUtils

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CheckOutScreen(
  viewModel: GuardViewModel,
  record: AttendanceRecord,
  onNavigateBack: () -> Unit,
  onCheckOutCompleted: () -> Unit
) {
  val checkOutState by viewModel.checkOutState.collectAsState()
  var showCameraQrScanner by remember { mutableStateOf(false) }

  LaunchedEffect(record) {
    if (checkOutState.activeRecord?.id != record.id) {
      viewModel.startCheckOut(record)
    }
  }

  val site = checkOutState.site
  val completed = checkOutState.completedRecord
  var currentTimestamp by remember { mutableStateOf(System.currentTimeMillis()) }
  LaunchedEffect(Unit) {
    while (true) {
      kotlinx.coroutines.delay(1000)
      currentTimestamp = System.currentTimeMillis()
    }
  }

  val elapsedDuration = remember(currentTimestamp, record.checkInTime) {
    record.checkInTime?.let { DateTimeUtils.formatDuration((currentTimestamp - it).coerceAtLeast(0)) } ?: "--"
  }

  Scaffold(
    topBar = {
      TopAppBar(
        title = {
          Column {
            Text(
              text = "End Duty & Check Out",
              fontFamily = FrauncesFontFamily,
              fontWeight = FontWeight.Bold,
              fontSize = 17.sp,
              color = White
            )
            Text(
              text = "Covenant Shield Post Departure",
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
      if (completed != null) {
        // Confirmation View
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
              text = "Checkout Confirmed",
              fontFamily = FrauncesFontFamily,
              style = MaterialTheme.typography.titleLarge,
              fontWeight = FontWeight.Bold,
              color = sealTint
            )

            Spacer(modifier = Modifier.height(6.dp))

            Text(
              text = checkOutState.successMessage ?: "Official departure timestamp and shift duration finalized on station ledger.",
              fontFamily = InterFontFamily,
              fontSize = 13.sp,
              textAlign = TextAlign.Center,
              color = MaterialTheme.colorScheme.onSurface
            )

            Spacer(modifier = Modifier.height(20.dp))

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
                  Text("Final Status:", fontFamily = InterFontFamily, fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                  StatusBadge(status = completed.status)
                }
                Spacer(modifier = Modifier.height(6.dp))
                Row(
                  modifier = Modifier.fillMaxWidth(),
                  horizontalArrangement = Arrangement.SpaceBetween
                ) {
                  Text("Total Shift Duration:", fontFamily = InterFontFamily, fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                  Text(
                    text = completed.durationFormatted ?: "--",
                    fontFamily = IbmPlexMonoFontFamily,
                    fontWeight = FontWeight.Bold,
                    fontSize = 13.sp,
                    color = MaterialTheme.colorScheme.onSurface
                  )
                }
                Spacer(modifier = Modifier.height(6.dp))
                Row(
                  modifier = Modifier.fillMaxWidth(),
                  horizontalArrangement = Arrangement.SpaceBetween
                ) {
                  Text("Check-In Time:", fontFamily = InterFontFamily, fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                  Text(
                    text = completed.checkInFormatted ?: "--",
                    fontFamily = IbmPlexMonoFontFamily,
                    fontSize = 13.sp,
                    color = MaterialTheme.colorScheme.onSurface
                  )
                }
                Spacer(modifier = Modifier.height(4.dp))
                Row(
                  modifier = Modifier.fillMaxWidth(),
                  horizontalArrangement = Arrangement.SpaceBetween
                ) {
                  Text("Check-Out Time:", fontFamily = InterFontFamily, fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                  Text(
                    text = completed.checkOutFormatted ?: "--",
                    fontFamily = IbmPlexMonoFontFamily,
                    fontWeight = FontWeight.Bold,
                    fontSize = 13.sp,
                    color = MaterialTheme.colorScheme.onSurface
                  )
                }
                if (completed.earlyDeparture) {
                  Spacer(modifier = Modifier.height(8.dp))
                  Text(
                    text = "Note: Early departure recorded and flagged for supervisor review.",
                    fontFamily = InterFontFamily,
                    fontSize = 11.sp,
                    color = if (isAppInDarkTheme()) StatusWarningDark else StatusWarning,
                    fontWeight = FontWeight.SemiBold
                  )
                }
              }
            }

            Spacer(modifier = Modifier.height(24.dp))

            Button(
              onClick = onCheckOutCompleted,
              shape = RoundedCornerShape(12.dp),
              colors = covenantButtonColors(),
              modifier = Modifier
                .fillMaxWidth()
                .height(50.dp)
                .testTag("checkout_done_button")
            ) {
              Text("RETURN TO DASHBOARD", fontFamily = InterFontFamily, fontWeight = FontWeight.Bold)
            }
          }
        }
      } else {
        // Active Checkout Form
        Card(
          shape = RoundedCornerShape(18.dp),
          colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface,
            contentColor = MaterialTheme.colorScheme.onSurface
          ),
          border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant),
          elevation = CardDefaults.cardElevation(0.dp),
          modifier = Modifier.fillMaxWidth()
        ) {
          Column(modifier = Modifier.padding(20.dp)) {
            Text(
              text = "Duty Checkout Verification",
              fontFamily = FrauncesFontFamily,
              style = MaterialTheme.typography.titleMedium,
              fontWeight = FontWeight.Bold,
              fontSize = 18.sp,
              color = MaterialTheme.colorScheme.onSurface
            )
            Text(
              text = "Finalize your active duty shift at ${record.siteName}. Official server timestamp will be stamped on departure.",
              fontFamily = InterFontFamily,
              style = MaterialTheme.typography.bodySmall,
              color = MaterialTheme.colorScheme.onSurfaceVariant,
              modifier = Modifier.padding(top = 4.dp, bottom = 16.dp)
            )

            // Current Active Shift Summary
            Card(
              shape = RoundedCornerShape(12.dp),
              colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
              modifier = Modifier.fillMaxWidth()
            ) {
              Column(modifier = Modifier.padding(14.dp)) {
                Row(
                  modifier = Modifier.fillMaxWidth(),
                  horizontalArrangement = Arrangement.SpaceBetween
                ) {
                  Text("Site:", fontFamily = InterFontFamily, fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                  Text(
                    record.siteName,
                    fontFamily = FrauncesFontFamily,
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
                  Text("Scheduled:", fontFamily = InterFontFamily, fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                  Text(
                    "${record.scheduledStartTime} – ${record.scheduledEndTime} EAT",
                    fontFamily = IbmPlexMonoFontFamily,
                    fontSize = 12.sp,
                    color = MaterialTheme.colorScheme.onSurface
                  )
                }
                Spacer(modifier = Modifier.height(4.dp))
                Row(
                  modifier = Modifier.fillMaxWidth(),
                  horizontalArrangement = Arrangement.SpaceBetween
                ) {
                  Text("Check-In Time:", fontFamily = InterFontFamily, fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                  Text(
                    record.checkInFormatted ?: "--",
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
                  Text("Active Elapsed:", fontFamily = InterFontFamily, fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                  Text(
                    elapsedDuration,
                    fontFamily = IbmPlexMonoFontFamily,
                    fontWeight = FontWeight.Bold,
                    color = if (isAppInDarkTheme()) Gold else Emerald,
                    fontSize = 13.sp
                  )
                }
              }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Error Banner if any
            checkOutState.errorBanner?.let { err ->
              Card(
                shape = RoundedCornerShape(10.dp),
                colors = CardDefaults.cardColors(
                  containerColor = if (isAppInDarkTheme()) StatusDangerDarkTint else StatusDanger.copy(alpha = 0.12f)
                ),
                border = androidx.compose.foundation.BorderStroke(1.dp, if (isAppInDarkTheme()) StatusDangerDark else StatusDanger.copy(alpha = 0.3f)),
                modifier = Modifier
                  .fillMaxWidth()
                  .padding(bottom = 14.dp)
              ) {
                Text(
                  text = err,
                  color = if (isAppInDarkTheme()) StatusDangerDark else StatusDanger,
                  fontFamily = InterFontFamily,
                  fontSize = 12.sp,
                  modifier = Modifier.padding(12.dp)
                )
              }
            }

            // Departure Post QR Verification Card
            Card(
              shape = RoundedCornerShape(14.dp),
              colors = CardDefaults.cardColors(
                containerColor = if (isAppInDarkTheme()) Forest3 else Emerald50.copy(alpha = 0.5f)
              ),
              modifier = Modifier.fillMaxWidth()
            ) {
              Column(modifier = Modifier.padding(14.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                  val qrBoxBg = if (isAppInDarkTheme()) {
                    if (checkOutState.isQrVerified) StatusSuccessDarkTint else Gold.copy(alpha = 0.2f)
                  } else {
                    if (checkOutState.isQrVerified) StatusSuccess.copy(alpha = 0.15f) else Gold.copy(alpha = 0.15f)
                  }
                  val qrIconTint = if (isAppInDarkTheme()) {
                    if (checkOutState.isQrVerified) StatusSuccessDark else Gold
                  } else {
                    if (checkOutState.isQrVerified) StatusSuccess else Emerald
                  }
                  Box(
                    contentAlignment = Alignment.Center,
                    modifier = Modifier
                      .size(36.dp)
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
                      text = "Departure Post QR Token",
                      fontFamily = InterFontFamily,
                      fontWeight = FontWeight.Bold,
                      fontSize = 13.sp,
                      color = MaterialTheme.colorScheme.onSurface
                    )
                    val qrStatusTxtColor = if (isAppInDarkTheme()) {
                      if (checkOutState.isQrVerified) StatusSuccessDark else StatusWarningDark
                    } else {
                      if (checkOutState.isQrVerified) StatusSuccess else StatusWarning
                    }
                    Text(
                      text = if (checkOutState.isQrVerified)
                        "✓ Verified Departure Token: ${checkOutState.qrTokenInput}"
                      else
                        "Scan post QR badge to confirm departure",
                      fontFamily = InterFontFamily,
                      fontSize = 11.sp,
                      color = qrStatusTxtColor,
                      fontWeight = FontWeight.SemiBold
                    )
                  }
                }

                Spacer(modifier = Modifier.height(12.dp))

                Button(
                  onClick = { showCameraQrScanner = true },
                  shape = RoundedCornerShape(10.dp),
                  colors = covenantButtonColors(),
                  modifier = Modifier
                    .fillMaxWidth()
                    .height(46.dp)
                    .testTag("scan_checkout_qr_camerax_button")
                ) {
                  Icon(Icons.Default.QrCodeScanner, contentDescription = null, tint = if (isAppInDarkTheme()) Forest else Gold300, modifier = Modifier.size(18.dp))
                  Spacer(modifier = Modifier.width(8.dp))
                  Text("SCAN DEPARTURE QR (CAMERAX)", fontFamily = InterFontFamily, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                }

                Spacer(modifier = Modifier.height(8.dp))

                Row(
                  modifier = Modifier.fillMaxWidth(),
                  horizontalArrangement = Arrangement.SpaceBetween,
                  verticalAlignment = Alignment.CenterVertically
                ) {
                  Text(
                    text = "GPS Geofence: Inside ${site?.name ?: "site"}",
                    fontFamily = InterFontFamily,
                    fontSize = 11.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                  )
                  val linkColor = if (isAppInDarkTheme()) Gold else Emerald
                  TextButton(
                    onClick = { site?.let { viewModel.setCheckOutQrCode(it.qrCodeToken) } }
                  ) {
                    Text("Verify Post QR", fontFamily = InterFontFamily, fontSize = 11.sp, color = linkColor)
                  }
                }
              }
            }

            // CameraX QR Scanner Dialog for Checkout
            if (showCameraQrScanner) {
              CameraXQrScannerDialog(
                expectedToken = site?.qrCodeToken,
                siteName = site?.name,
                onQrCodeScanned = { scannedCode ->
                  viewModel.setCheckOutQrCode(scannedCode)
                  showCameraQrScanner = false
                },
                onDismiss = { showCameraQrScanner = false }
              )
            }

            Spacer(modifier = Modifier.height(24.dp))

            Button(
              onClick = { viewModel.submitCheckOut() },
              enabled = !checkOutState.isSubmitting && checkOutState.isQrVerified,
              shape = RoundedCornerShape(12.dp),
              colors = covenantButtonColors(),
              modifier = Modifier
                .fillMaxWidth()
                .height(52.dp)
                .testTag("submit_checkout_button")
            ) {
              if (checkOutState.isSubmitting) {
                CircularProgressIndicator(color = Gold, modifier = Modifier.size(24.dp), strokeWidth = 2.dp)
              } else {
                Icon(Icons.Default.ExitToApp, contentDescription = null, tint = if (isAppInDarkTheme()) Forest else Gold300)
                Spacer(modifier = Modifier.width(8.dp))
                Text("CONFIRM CHECK OUT", fontFamily = InterFontFamily, fontWeight = FontWeight.Bold, fontSize = 15.sp)
              }
            }
          }
        }
      }
    }
  }
}
