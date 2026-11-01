package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.material3.TabRowDefaults.tabIndicatorOffset
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.model.AttendanceStatus
import com.example.data.model.Shift
import com.example.ui.components.StatusBadge
import com.example.ui.theme.*
import com.example.ui.viewmodel.GuardViewModel
import com.example.util.DateTimeUtils

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ShiftsScreen(
  viewModel: GuardViewModel,
  onNavigateToCheckIn: (Shift) -> Unit,
  onNavigateBack: () -> Unit
) {
  val guardShifts by viewModel.guardShifts.collectAsState()
  val attendanceRecords by viewModel.attendanceRecords.collectAsState()
  var selectedTab by remember { mutableIntStateOf(0) } // 0: All, 1: Today, 2: Upcoming

  val today = remember { DateTimeUtils.getCurrentEatDateString() }

  val filteredShifts = remember(guardShifts, selectedTab, today) {
    when (selectedTab) {
      1 -> guardShifts.filter { it.shiftDate == today }
      2 -> guardShifts.filter { it.shiftDate > today }
      else -> guardShifts
    }
  }

  Scaffold(
    topBar = {
      TopAppBar(
        title = {
          Column {
            Text("Duty Roster & Shifts", fontFamily = FrauncesFontFamily, fontWeight = FontWeight.Bold, fontSize = 17.sp, color = White)
            Text("Assigned Posts & Stations", fontFamily = IbmPlexMonoFontFamily, fontSize = 10.sp, color = Gold300)
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
    ) {
      // Filter Tabs
      TabRow(
        selectedTabIndex = selectedTab,
        containerColor = if (isAppInDarkTheme()) Forest else Emerald,
        contentColor = Gold300,
        indicator = { tabPositions ->
          TabRowDefaults.SecondaryIndicator(
            modifier = Modifier.tabIndicatorOffset(tabPositions[selectedTab]),
            color = Gold
          )
        }
      ) {
        Tab(
          selected = selectedTab == 0,
          onClick = { selectedTab = 0 },
          text = { Text("All (${guardShifts.size})", fontFamily = InterFontFamily, color = if (selectedTab == 0) Gold else White) }
        )
        Tab(
          selected = selectedTab == 1,
          onClick = { selectedTab = 1 },
          text = { Text("Today", fontFamily = InterFontFamily, color = if (selectedTab == 1) Gold else White) }
        )
        Tab(
          selected = selectedTab == 2,
          onClick = { selectedTab = 2 },
          text = { Text("Upcoming", fontFamily = InterFontFamily, color = if (selectedTab == 2) Gold else White) }
        )
      }

      if (filteredShifts.isEmpty()) {
        Box(
          modifier = Modifier.fillMaxSize(),
          contentAlignment = Alignment.Center
        ) {
          Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Icon(Icons.Default.EventBusy, contentDescription = null, tint = MaterialTheme.colorScheme.onSurfaceVariant, modifier = Modifier.size(54.dp))
            Spacer(modifier = Modifier.height(12.dp))
            Text(
              text = "You do not have an assigned shift for this period.",
              fontFamily = FrauncesFontFamily,
              fontWeight = FontWeight.Bold,
              color = MaterialTheme.colorScheme.onSurface
            )
            Text(
              text = "Please contact dispatch operations for roster adjustments.",
              fontFamily = InterFontFamily,
              style = MaterialTheme.typography.bodySmall,
              color = MaterialTheme.colorScheme.onSurfaceVariant
            )
          }
        }
      } else {
        LazyColumn(
          modifier = Modifier.fillMaxSize(),
          contentPadding = PaddingValues(16.dp),
          verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
          items(filteredShifts, key = { it.id }) { shift ->
            val matchingAttendance = attendanceRecords.find { it.shiftId == shift.id }
            val isToday = shift.shiftDate == today

            Card(
              shape = RoundedCornerShape(14.dp),
              colors = CardDefaults.cardColors(
                containerColor = MaterialTheme.colorScheme.surface,
                contentColor = MaterialTheme.colorScheme.onSurface
              ),
              border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant),
              elevation = CardDefaults.cardElevation(0.dp),
              modifier = Modifier
                .fillMaxWidth()
                .testTag("shift_card_${shift.id}")
            ) {
              Column(modifier = Modifier.padding(16.dp)) {
                Row(
                  modifier = Modifier.fillMaxWidth(),
                  horizontalArrangement = Arrangement.SpaceBetween,
                  verticalAlignment = Alignment.CenterVertically
                ) {
                  Column(modifier = Modifier.weight(1f)) {
                    Text(
                      text = shift.siteName,
                      fontFamily = FrauncesFontFamily,
                      fontWeight = FontWeight.Bold,
                      fontSize = 15.sp,
                      color = MaterialTheme.colorScheme.onSurface
                    )
                    Text(
                      text = shift.siteAddress,
                      fontFamily = InterFontFamily,
                      fontSize = 11.sp,
                      color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                  }
                  StatusBadge(status = matchingAttendance?.status ?: AttendanceStatus.SCHEDULED)
                }

                Spacer(modifier = Modifier.height(10.dp))
                HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)
                Spacer(modifier = Modifier.height(10.dp))

                Row(
                  modifier = Modifier.fillMaxWidth(),
                  horizontalArrangement = Arrangement.SpaceBetween
                ) {
                  Column {
                    Text("Date", fontFamily = InterFontFamily, fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    Text(
                      text = "${shift.shiftDate}${if (isToday) " (Today)" else ""}",
                      fontFamily = IbmPlexMonoFontFamily,
                      fontWeight = FontWeight.Bold,
                      fontSize = 12.sp,
                      color = if (isToday) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurface
                    )
                  }
                  Column(horizontalAlignment = Alignment.End) {
                    Text("Hours (EAT)", fontFamily = InterFontFamily, fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    Text(
                      text = "${shift.startTime} – ${shift.endTime}",
                      fontFamily = IbmPlexMonoFontFamily,
                      fontWeight = FontWeight.Bold,
                      fontSize = 12.sp,
                      color = MaterialTheme.colorScheme.onSurface
                    )
                  }
                }

                Spacer(modifier = Modifier.height(8.dp))
                Text(
                  text = "Orders: ${shift.instructions}",
                  fontFamily = InterFontFamily,
                  fontSize = 11.sp,
                  color = MaterialTheme.colorScheme.onSurfaceVariant
                )

                if (isToday && matchingAttendance == null) {
                  Spacer(modifier = Modifier.height(12.dp))
                  Button(
                    onClick = { onNavigateToCheckIn(shift) },
                    shape = RoundedCornerShape(10.dp),
                    colors = covenantButtonColors(),
                    modifier = Modifier.fillMaxWidth()
                  ) {
                    Icon(Icons.Default.PinDrop, contentDescription = null, tint = Gold300)
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("START VERIFICATION & CHECK IN", fontFamily = InterFontFamily, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
