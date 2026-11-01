package com.example.ui.screens

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.ui.res.painterResource
import com.example.R
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.model.AttendanceRecord
import com.example.data.model.AttendanceStatus
import com.example.data.model.Shift
import com.example.ui.components.*
import com.example.ui.theme.*
import com.example.ui.viewmodel.GuardViewModel
import com.example.util.DateTimeUtils

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DashboardScreen(
  viewModel: GuardViewModel,
  onNavigateToCheckIn: (Shift) -> Unit,
  onNavigateToCheckOut: (AttendanceRecord) -> Unit,
  onNavigateToShifts: () -> Unit,
  onNavigateToAttendance: () -> Unit,
  onNavigateToLeave: () -> Unit,
  onNavigateToSwaps: () -> Unit,
  onNavigateToNotifications: () -> Unit,
  onNavigateToReports: () -> Unit = {},
  onLogout: () -> Unit
) {
  val user by viewModel.currentUser.collectAsState()
  val isOnline by viewModel.isOnline.collectAsState()
  val isDarkMode by viewModel.isDarkMode.collectAsState()
  val todayShift by viewModel.todayShift.collectAsState()
  val activeAttendance by viewModel.activeAttendance.collectAsState()
  val guardShifts by viewModel.guardShifts.collectAsState()
  val attendanceRecords by viewModel.attendanceRecords.collectAsState()
  val guardReports by viewModel.guardReports.collectAsState()
  val unreadCount by viewModel.unreadNotificationsCount.collectAsState()
  val offlineQueue by viewModel.offlineQueue.collectAsState()
  val leaveRequests by viewModel.leaveRequests.collectAsState()
  val shiftSwapRequests by viewModel.shiftSwapRequests.collectAsState()

  // Accessibility bottom sheet state when tap is used instead of hold
  var showConfirmSheet by remember { mutableStateOf(false) }
  var confirmSheetAction by remember { mutableStateOf<String?>(null) } // "CHECK_IN" or "CHECK_OUT"

  val guardRecords = remember(attendanceRecords, user) {
    attendanceRecords.filter { it.guardId == user?.id }
  }

  // Find attendance record matching today's shift
  val todayRecord = remember(guardRecords, todayShift) {
    todayShift?.let { shift -> guardRecords.find { it.shiftId == shift.id } }
  }

  val isCheckedIn = todayRecord?.checkInTime != null
  val isCheckedOut = todayRecord?.checkOutTime != null
  val isOnDuty = isCheckedIn && !isCheckedOut
  val isCompleted = isCheckedIn && isCheckedOut

  // Real-time ticker for live local device time and elapsed duration
  var currentTimestamp by remember { mutableStateOf(System.currentTimeMillis()) }
  LaunchedEffect(Unit) {
    while (true) {
      kotlinx.coroutines.delay(1000)
      currentTimestamp = System.currentTimeMillis()
    }
  }

  val liveTimeFormatted: String = remember(currentTimestamp) {
    DateTimeUtils.formatLiveClock(currentTimestamp)
  }

  val elapsedFormatted: String = remember(currentTimestamp, todayRecord?.checkInTime) {
    todayRecord?.checkInTime?.let { checkIn ->
      val diffMs = (currentTimestamp - checkIn).coerceAtLeast(0)
      DateTimeUtils.formatElapsedTimer(diffMs)
    } ?: "00:00:00"
  }

  // Calculate shift window progress (0f..1f)
  val shiftArcProgress = remember(todayShift, currentTimestamp, isCheckedIn, isCheckedOut) {
    when {
      isCompleted -> 1.0f
      isOnDuty -> {
        // Compute progress between checkInTime and scheduled end or 8h
        val checkIn = todayRecord?.checkInTime ?: currentTimestamp
        val elapsed = (currentTimestamp - checkIn).toFloat()
        val totalMs = 8f * 3600f * 1000f
        (elapsed / totalMs).coerceIn(0.05f, 0.95f)
      }
      todayShift != null -> 0.15f
      else -> 0f
    }
  }

  Scaffold(
    topBar = {
      Column {
        // Network Connectivity Status Banner (Covenant ConnectionBanner)
        NetworkBanner(
          isOnline = isOnline,
          pendingSyncCount = offlineQueue.size,
          onToggleNetwork = { viewModel.toggleNetwork() },
          onSyncClick = { viewModel.syncOfflineQueue() }
        )

        // Main Header Bar in Emerald
        TopAppBar(
          title = {
            Column {
              Row(verticalAlignment = Alignment.CenterVertically) {
                Image(
                  painter = painterResource(id = R.drawable.app_logo),
                  contentDescription = "Covenant Shield Emblem",
                  modifier = Modifier
                    .size(24.dp)
                    .clip(CircleShape)
                    .border(1.dp, Gold, CircleShape)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                  text = "COVENANT SHIELD",
                  fontFamily = FrauncesFontFamily,
                  fontWeight = FontWeight.Bold,
                  fontSize = 17.sp,
                  color = White
                )
                Spacer(modifier = Modifier.width(6.dp))
                Text(
                  text = "ON POST",
                  fontFamily = IbmPlexMonoFontFamily,
                  fontSize = 9.sp,
                  fontWeight = FontWeight.Medium,
                  color = Gold300,
                  letterSpacing = 1.sp
                )
              }
              Text(
                text = "${user?.fullName ?: "Security Officer"} · ${user?.badgeNumber ?: user?.employeeId ?: ""}",
                fontFamily = InterFontFamily,
                color = Mist.copy(alpha = 0.85f),
                fontSize = 11.sp
              )
            }
          },
          navigationIcon = {
            Box(
              contentAlignment = Alignment.Center,
              modifier = Modifier
                .padding(start = 12.dp, end = 8.dp)
                .size(38.dp)
                .clip(CircleShape)
                .background(Forest)
                .border(1.dp, Gold, CircleShape)
            ) {
              if (user?.profilePictureUri != null) {
                coil.compose.AsyncImage(
                  model = user?.profilePictureUri,
                  contentDescription = "Profile Picture",
                  contentScale = androidx.compose.ui.layout.ContentScale.Crop,
                  modifier = Modifier.fillMaxSize()
                )
              } else {
                Text(
                  text = user?.avatarInitials ?: "CS",
                  fontFamily = IbmPlexMonoFontFamily,
                  fontWeight = FontWeight.Bold,
                  color = Gold,
                  fontSize = 13.sp
                )
              }
            }
          },
          actions = {
            // Dark Mode / Night Watch toggle button
            IconButton(
              onClick = { viewModel.toggleDarkMode() },
              modifier = Modifier.testTag("dark_mode_toggle_button")
            ) {
              Icon(
                if (isDarkMode) Icons.Default.LightMode else Icons.Default.DarkMode,
                contentDescription = if (isDarkMode) "Switch to Light Mode" else "Switch to Night Watch Dark Mode",
                tint = Gold300
              )
            }

            // Notifications Icon with Gold Badge
            IconButton(
              onClick = onNavigateToNotifications,
              modifier = Modifier.testTag("notifications_icon")
            ) {
              BadgedBox(
                badge = {
                  if (unreadCount > 0) {
                    Badge(containerColor = Gold, contentColor = Forest) {
                      Text(unreadCount.toString(), fontFamily = IbmPlexMonoFontFamily)
                    }
                  }
                }
              ) {
                Icon(
                  Icons.Default.Notifications,
                  contentDescription = "Notifications",
                  tint = White
                )
              }
            }

            // Logout
            IconButton(
              onClick = { viewModel.performLogout(onLogout) },
              modifier = Modifier.testTag("logout_button")
            ) {
              Icon(
                Icons.Default.Logout,
                contentDescription = "Sign Out",
                tint = White.copy(alpha = 0.85f)
              )
            }
          },
          colors = covenantTopAppBarColors()
        )
      }
    }
  ) { innerPadding ->
    LazyColumn(
      modifier = Modifier
        .fillMaxSize()
        .padding(innerPadding)
        .background(MaterialTheme.colorScheme.background),
      contentPadding = PaddingValues(16.dp),
      verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {

      // 1. TODAY'S SHIFT PASS (Boarding Pass Card)
      item {
        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.SpaceBetween,
          verticalAlignment = Alignment.CenterVertically
        ) {
          Text(
            text = "TODAY'S POST ASSIGNMENT",
            fontFamily = IbmPlexMonoFontFamily,
            fontSize = 11.sp,
            fontWeight = FontWeight.Bold,
            letterSpacing = 1.sp,
            color = MaterialTheme.colorScheme.onSurface
          )

          Text(
            text = DateTimeUtils.getTimeZoneDisplayName(),
            fontFamily = IbmPlexMonoFontFamily,
            fontSize = 10.sp,
            color = MaterialTheme.colorScheme.onSurfaceVariant
          )
        }

        Spacer(modifier = Modifier.height(8.dp))

        if (todayShift != null) {
          val shift = todayShift!!

          // Luxury ShiftPass Card
          ShiftPass(
            shift = shift,
            record = todayRecord,
            isOnDuty = isOnDuty,
            elapsedFormatted = elapsedFormatted,
            modifier = Modifier.testTag("today_shift_card")
          )

          Spacer(modifier = Modifier.height(18.dp))

          // Center Arc & Hold-to-Seal Action Area
          Card(
            shape = RoundedCornerShape(18.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface, contentColor = MaterialTheme.colorScheme.onSurface),
            border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant),
            elevation = CardDefaults.cardElevation(0.dp),
            modifier = Modifier.fillMaxWidth()
          ) {
            Column(
              modifier = Modifier
                .fillMaxWidth()
                .padding(20.dp),
              horizontalAlignment = Alignment.CenterHorizontally
            ) {
              // 240-degree ShiftArc with animated progress & now-dot pulse
              ShiftArc(
                progress = shiftArcProgress,
                currentTimeFormatted = liveTimeFormatted,
                shiftHoursLabel = "${shift.startTime} – ${shift.endTime}"
              )

              Spacer(modifier = Modifier.height(20.dp))

              // 168dp Circular SealButton
              when {
                !isCheckedIn -> {
                  SealButton(
                    label = "CHECK IN",
                    sublabel = "HOLD TO SEAL",
                    isHoldEnabled = true,
                    onHoldComplete = {
                      onNavigateToCheckIn(shift)
                    },
                    onTapAccessible = {
                      confirmSheetAction = "CHECK_IN"
                      showConfirmSheet = true
                    }
                  )
                  Spacer(modifier = Modifier.height(10.dp))
                  Text(
                    text = "Press & hold for 900ms to seal post arrival with server timestamp",
                    fontFamily = InterFontFamily,
                    fontSize = 11.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    textAlign = TextAlign.Center
                  )

                  Spacer(modifier = Modifier.height(8.dp))

                  // Direct button fallback for quick verification screen navigation
                  OutlinedButton(
                    onClick = { onNavigateToCheckIn(shift) },
                    shape = RoundedCornerShape(10.dp),
                    colors = covenantOutlinedButtonColors(),
                    border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.primary),
                    modifier = Modifier.testTag("check_in_button")
                  ) {
                    Icon(Icons.Default.Verified, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("Open Verification Screen (GPS & QR)", fontFamily = InterFontFamily, fontSize = 12.sp)
                  }
                }

                isOnDuty -> {
                  SealButton(
                    label = "CHECK OUT",
                    sublabel = "HOLD TO SEAL",
                    isHoldEnabled = true,
                    onHoldComplete = {
                      todayRecord?.let { onNavigateToCheckOut(it) }
                    },
                    onTapAccessible = {
                      confirmSheetAction = "CHECK_OUT"
                      showConfirmSheet = true
                    }
                  )
                  Spacer(modifier = Modifier.height(10.dp))
                  Text(
                    text = "Active Duty: $elapsedFormatted elapsed · Hold 900ms to seal checkout",
                    fontFamily = InterFontFamily,
                    fontSize = 11.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    textAlign = TextAlign.Center
                  )

                  Spacer(modifier = Modifier.height(8.dp))

                  OutlinedButton(
                    onClick = { todayRecord?.let { onNavigateToCheckOut(it) } },
                    shape = RoundedCornerShape(10.dp),
                    colors = covenantOutlinedButtonColors(),
                    border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.primary),
                    modifier = Modifier.testTag("check_out_button")
                  ) {
                    Icon(Icons.Default.ExitToApp, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("Proceed to Duty Checkout", fontFamily = InterFontFamily, fontSize = 12.sp)
                  }
                }

                isCompleted -> {
                  Box(
                    contentAlignment = Alignment.Center,
                    modifier = Modifier
                      .fillMaxWidth()
                      .clip(RoundedCornerShape(12.dp))
                      .background(MaterialTheme.colorScheme.surfaceVariant)
                      .border(1.dp, MaterialTheme.colorScheme.outlineVariant, RoundedCornerShape(12.dp))
                      .padding(16.dp)
                  ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                      Icon(
                        Icons.Default.CheckCircle,
                        contentDescription = null,
                        tint = if (isAppInDarkTheme()) StatusSuccessDark else StatusSuccess,
                        modifier = Modifier.size(32.dp)
                      )
                      Spacer(modifier = Modifier.height(6.dp))
                      Text(
                        text = "Shift Completed & Sealed",
                        fontFamily = FrauncesFontFamily,
                        fontWeight = FontWeight.Bold,
                        fontSize = 16.sp,
                        color = MaterialTheme.colorScheme.onSurface
                      )
                      Text(
                        text = "Duration: ${todayRecord?.durationFormatted ?: "Recorded"} · Official Server Timestamp Verified",
                        fontFamily = InterFontFamily,
                        fontSize = 12.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                      )
                    }
                  }
                }
              }
            }
          }
        } else {
          // Empty State: Sun-dial line illustration / serene calm card
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
            Column(
              modifier = Modifier.padding(32.dp),
              horizontalAlignment = Alignment.CenterHorizontally
            ) {
              GuillocheSeal(size = 90.dp, strokeColor = MaterialTheme.colorScheme.primary.copy(alpha = 0.25f))
              Spacer(modifier = Modifier.height(16.dp))
              Text(
                text = "No shift assigned today",
                fontFamily = FrauncesFontFamily,
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurface
              )
              Spacer(modifier = Modifier.height(4.dp))
              Text(
                text = "You are currently off-duty. Please contact operations dispatch if you are scheduled for relief or post duty.",
                fontFamily = InterFontFamily,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                textAlign = TextAlign.Center
              )
            }
          }
        }
      }

      // 2. QUICK ACTIONS GRID (Personnel Actions)
      item {
        Text(
          text = "OPERATIONAL DISPATCH",
          fontFamily = IbmPlexMonoFontFamily,
          fontSize = 11.sp,
          fontWeight = FontWeight.Bold,
          letterSpacing = 1.sp,
          color = MaterialTheme.colorScheme.onBackground
        )

        Spacer(modifier = Modifier.height(8.dp))

        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
          QuickActionCard(
            title = "My Schedule",
            subtitle = "${guardShifts.size} Assigned",
            icon = Icons.Default.CalendarMonth,
            badgeColor = MaterialTheme.colorScheme.primary,
            modifier = Modifier.weight(1f),
            onClick = onNavigateToShifts
          )
          QuickActionCard(
            title = "Attendance",
            subtitle = "${guardRecords.size} Records",
            icon = Icons.Default.History,
            badgeColor = Gold,
            modifier = Modifier.weight(1f),
            onClick = onNavigateToAttendance
          )
        }

        Spacer(modifier = Modifier.height(10.dp))

        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
          QuickActionCard(
            title = "Leave Request",
            subtitle = "${leaveRequests.count { it.status == "PENDING" }} Pending",
            icon = Icons.Default.TimeToLeave,
            badgeColor = if (isAppInDarkTheme()) Gold300 else Forest3,
            modifier = Modifier.weight(1f),
            onClick = onNavigateToLeave
          )
          QuickActionCard(
            title = "Shift Swap",
            subtitle = "${shiftSwapRequests.count { it.status == "PENDING" }} Pending",
            icon = Icons.Default.SwapHoriz,
            badgeColor = if (isAppInDarkTheme()) StatusWarningDark else StatusWarning,
            modifier = Modifier.weight(1f),
            onClick = onNavigateToSwaps
          )
        }

        Spacer(modifier = Modifier.height(10.dp))

        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
          QuickActionCard(
            title = "Security Reports",
            subtitle = "${guardReports.size} Occurrences Filed",
            icon = Icons.Default.Assignment,
            badgeColor = if (isAppInDarkTheme()) Gold else Emerald700,
            modifier = Modifier.weight(1f),
            onClick = onNavigateToReports
          )
          QuickActionCard(
            title = "Duty Audit Summary",
            subtitle = "Verified SHA-256 Seal",
            icon = Icons.Default.Verified,
            badgeColor = Gold,
            modifier = Modifier.weight(1f),
            onClick = onNavigateToReports
          )
        }
      }

      // 3. UPCOMING SCHEDULE
      item {
        Text(
          text = "UPCOMING ROSTER",
          fontFamily = IbmPlexMonoFontFamily,
          fontSize = 11.sp,
          fontWeight = FontWeight.Bold,
          letterSpacing = 1.sp,
          color = MaterialTheme.colorScheme.onBackground
        )

        Spacer(modifier = Modifier.height(8.dp))

        val upcomingList = remember(guardShifts) {
          val today = DateTimeUtils.getCurrentEatDateString()
          guardShifts.filter { it.shiftDate > today }
        }

        if (upcomingList.isNotEmpty()) {
          Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            upcomingList.take(2).forEach { shift ->
              Card(
                shape = RoundedCornerShape(12.dp),
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
                    .padding(14.dp),
                  verticalAlignment = Alignment.CenterVertically
                ) {
                  Box(
                    contentAlignment = Alignment.Center,
                    modifier = Modifier
                      .size(42.dp)
                      .clip(RoundedCornerShape(8.dp))
                      .background(MaterialTheme.colorScheme.surfaceVariant)
                  ) {
                    Icon(
                      Icons.Default.Security,
                      contentDescription = null,
                      tint = MaterialTheme.colorScheme.primary,
                      modifier = Modifier.size(24.dp)
                    )
                  }

                  Spacer(modifier = Modifier.width(12.dp))

                  Column(modifier = Modifier.weight(1f)) {
                    Text(
                      text = shift.siteName,
                      fontFamily = FrauncesFontFamily,
                      fontWeight = FontWeight.Bold,
                      fontSize = 14.sp,
                      color = MaterialTheme.colorScheme.onSurface
                    )
                    Text(
                      text = "${shift.shiftDate} · ${shift.startTime} – ${shift.endTime} EAT",
                      fontFamily = InterFontFamily,
                      fontSize = 12.sp,
                      color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                  }

                  if (shift.isOvernight) {
                    SuggestionChip(
                      onClick = {},
                      label = { Text("Overnight", fontFamily = IbmPlexMonoFontFamily, fontSize = 10.sp) }
                    )
                  }
                }
              }
            }
          }
        } else {
          Text(
            text = "No further scheduled shifts this week.",
            fontFamily = InterFontFamily,
            fontSize = 12.sp,
            color = MaterialTheme.colorScheme.onSurfaceVariant
          )
        }
      }
    }
  }

  // Accessibility Fallback Bottom Sheet when SealButton is tapped instead of held
  if (showConfirmSheet) {
    ModalBottomSheet(
      onDismissRequest = { showConfirmSheet = false },
      containerColor = MaterialTheme.colorScheme.surface,
      contentColor = MaterialTheme.colorScheme.onSurface
    ) {
      Column(
        modifier = Modifier
          .fillMaxWidth()
          .padding(horizontal = 24.dp, vertical = 20.dp),
        horizontalAlignment = Alignment.CenterHorizontally
      ) {
        GuillocheSeal(size = 64.dp, strokeColor = MaterialTheme.colorScheme.primary)
        Spacer(modifier = Modifier.height(12.dp))

        Text(
          text = if (confirmSheetAction == "CHECK_IN") "Confirm Check-In to Post?" else "Confirm Duty Check-Out?",
          fontFamily = FrauncesFontFamily,
          fontWeight = FontWeight.Bold,
          fontSize = 18.sp,
          color = MaterialTheme.colorScheme.onSurface
        )

        Spacer(modifier = Modifier.height(6.dp))

        Text(
          text = if (confirmSheetAction == "CHECK_IN")
            "Official attendance will record server timestamp and site coordinates."
          else
            "Finalizes your on-duty shift and commits duration to the station ledger.",
          fontFamily = InterFontFamily,
          fontSize = 13.sp,
          color = MaterialTheme.colorScheme.onSurfaceVariant,
          textAlign = TextAlign.Center
        )

        Spacer(modifier = Modifier.height(20.dp))

        Button(
          onClick = {
            showConfirmSheet = false
            if (confirmSheetAction == "CHECK_IN") {
              todayShift?.let { onNavigateToCheckIn(it) }
            } else {
              todayRecord?.let { onNavigateToCheckOut(it) }
            }
          },
          shape = RoundedCornerShape(12.dp),
          colors = covenantButtonColors(),
          modifier = Modifier
            .fillMaxWidth()
            .height(50.dp)
        ) {
          Text(
            text = if (confirmSheetAction == "CHECK_IN") "CONFIRM CHECK-IN" else "CONFIRM CHECK-OUT",
            fontFamily = InterFontFamily,
            fontWeight = FontWeight.Bold
          )
        }

        Spacer(modifier = Modifier.height(10.dp))

        TextButton(
          onClick = { showConfirmSheet = false },
          modifier = Modifier.fillMaxWidth()
        ) {
          Text("Cancel", fontFamily = InterFontFamily, color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
      }
    }
  }
}

@Composable
private fun QuickActionCard(
  title: String,
  subtitle: String,
  icon: ImageVector,
  badgeColor: Color,
  modifier: Modifier = Modifier,
  onClick: () -> Unit
) {
  Card(
    shape = RoundedCornerShape(14.dp),
    colors = CardDefaults.cardColors(
      containerColor = MaterialTheme.colorScheme.surface,
      contentColor = MaterialTheme.colorScheme.onSurface
    ),
    border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant),
    elevation = CardDefaults.cardElevation(0.dp),
    modifier = modifier
      .clickable { onClick() }
      .testTag("action_${title.lowercase().replace(" ", "_")}")
  ) {
    Row(
      modifier = Modifier
        .fillMaxWidth()
        .padding(14.dp),
      verticalAlignment = Alignment.CenterVertically
    ) {
      Box(
        contentAlignment = Alignment.Center,
        modifier = Modifier
          .size(40.dp)
          .clip(CircleShape)
          .background(badgeColor.copy(alpha = if (isAppInDarkTheme()) 0.22f else 0.12f))
      ) {
        Icon(
          imageVector = icon,
          contentDescription = title,
          tint = badgeColor,
          modifier = Modifier.size(22.dp)
        )
      }
      Spacer(modifier = Modifier.width(10.dp))
      Column {
        Text(
          text = title,
          fontFamily = InterFontFamily,
          fontWeight = FontWeight.Bold,
          fontSize = 13.sp,
          color = MaterialTheme.colorScheme.onSurface
        )
        Text(
          text = subtitle,
          fontFamily = InterFontFamily,
          fontSize = 11.sp,
          color = MaterialTheme.colorScheme.onSurfaceVariant
        )
      }
    }
  }
}

