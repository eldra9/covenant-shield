package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.model.AttendanceRecord
import com.example.data.model.AttendanceStatus
import com.example.ui.components.StatusBadge
import com.example.ui.theme.*
import com.example.ui.viewmodel.GuardViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AttendanceHistoryScreen(
  viewModel: GuardViewModel,
  onNavigateBack: () -> Unit
) {
  val user by viewModel.currentUser.collectAsState()
  val allRecords by viewModel.attendanceRecords.collectAsState()
  var selectedStatusFilter by remember { mutableStateOf<AttendanceStatus?>(null) }
  var reviewRecordDialog by remember { mutableStateOf<AttendanceRecord?>(null) }
  var reviewNotes by remember { mutableStateOf("") }

  val guardRecords = remember(allRecords, user) {
    allRecords.filter { it.guardId == user?.id }
  }

  val filteredRecords = remember(guardRecords, selectedStatusFilter) {
    if (selectedStatusFilter == null) guardRecords
    else guardRecords.filter { it.status == selectedStatusFilter }
  }

  Scaffold(
    topBar = {
      TopAppBar(
        title = {
          Column {
            Text("Attendance Ledger", fontFamily = FrauncesFontFamily, fontWeight = FontWeight.Bold, fontSize = 17.sp, color = White)
            Text("Tamper-Evident Station History", fontFamily = IbmPlexMonoFontFamily, fontSize = 10.sp, color = Gold300)
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
      // Filter Chips Row
      Row(
        modifier = Modifier
          .fillMaxWidth()
          .padding(horizontal = 16.dp, vertical = 10.dp),
        horizontalArrangement = Arrangement.spacedBy(8.dp)
      ) {
        val chipColors = FilterChipDefaults.filterChipColors(
          containerColor = MaterialTheme.colorScheme.surfaceVariant,
          labelColor = MaterialTheme.colorScheme.onSurface,
          selectedContainerColor = MaterialTheme.colorScheme.primary,
          selectedLabelColor = MaterialTheme.colorScheme.onPrimary
        )
        val chipBorder = FilterChipDefaults.filterChipBorder(
          enabled = true,
          selected = false,
          borderColor = MaterialTheme.colorScheme.outlineVariant,
          selectedBorderColor = MaterialTheme.colorScheme.primary
        )

        FilterChip(
          selected = selectedStatusFilter == null,
          onClick = { selectedStatusFilter = null },
          colors = chipColors,
          border = chipBorder,
          label = { Text("All (${guardRecords.size})", fontFamily = InterFontFamily, fontSize = 11.sp) }
        )
        FilterChip(
          selected = selectedStatusFilter == AttendanceStatus.PRESENT,
          onClick = { selectedStatusFilter = if (selectedStatusFilter == AttendanceStatus.PRESENT) null else AttendanceStatus.PRESENT },
          colors = chipColors,
          border = chipBorder,
          label = { Text("Present", fontFamily = InterFontFamily, fontSize = 11.sp) }
        )
        FilterChip(
          selected = selectedStatusFilter == AttendanceStatus.LATE,
          onClick = { selectedStatusFilter = if (selectedStatusFilter == AttendanceStatus.LATE) null else AttendanceStatus.LATE },
          colors = chipColors,
          border = chipBorder,
          label = { Text("Late", fontFamily = InterFontFamily, fontSize = 11.sp) }
        )
        FilterChip(
          selected = selectedStatusFilter == AttendanceStatus.LEFT_EARLY,
          onClick = { selectedStatusFilter = if (selectedStatusFilter == AttendanceStatus.LEFT_EARLY) null else AttendanceStatus.LEFT_EARLY },
          colors = chipColors,
          border = chipBorder,
          label = { Text("Left Early", fontFamily = InterFontFamily, fontSize = 11.sp) }
        )
      }

      if (filteredRecords.isEmpty()) {
        Box(
          modifier = Modifier.fillMaxSize(),
          contentAlignment = Alignment.Center
        ) {
          Text(text = "No attendance records match selected filter.", fontFamily = InterFontFamily, color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
      } else {
        LazyColumn(
          modifier = Modifier.fillMaxSize(),
          contentPadding = PaddingValues(16.dp),
          verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
          items(filteredRecords, key = { it.id }) { record ->
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
                .testTag("attendance_record_${record.id}")
            ) {
              Column(modifier = Modifier.padding(16.dp)) {
                Row(
                  modifier = Modifier.fillMaxWidth(),
                  horizontalArrangement = Arrangement.SpaceBetween,
                  verticalAlignment = Alignment.CenterVertically
                ) {
                  Column(modifier = Modifier.weight(1f)) {
                    Text(
                      text = record.siteName,
                      fontFamily = FrauncesFontFamily,
                      fontWeight = FontWeight.Bold,
                      fontSize = 15.sp,
                      color = MaterialTheme.colorScheme.onSurface
                    )
                    Text(
                      text = "Shift Date: ${record.shiftDate} · Method: ${record.method}",
                      fontFamily = InterFontFamily,
                      fontSize = 11.sp,
                      color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                  }
                  StatusBadge(status = record.status, isPendingSync = record.isOfflineQueued)
                }

                Spacer(modifier = Modifier.height(10.dp))
                HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)
                Spacer(modifier = Modifier.height(10.dp))

                Row(
                  modifier = Modifier.fillMaxWidth(),
                  horizontalArrangement = Arrangement.SpaceBetween
                ) {
                  Column {
                    Text("Check-In Time", fontFamily = InterFontFamily, fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    Text(
                      text = record.checkInFormatted ?: "Pending",
                      fontFamily = IbmPlexMonoFontFamily,
                      fontSize = 13.sp,
                      fontWeight = FontWeight.Bold,
                      color = if (isAppInDarkTheme()) StatusSuccessDark else StatusSuccess
                    )
                  }
                  Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text("Check-Out Time", fontFamily = InterFontFamily, fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    Text(
                      text = record.checkOutFormatted ?: "Active Duty",
                      fontFamily = IbmPlexMonoFontFamily,
                      fontSize = 13.sp,
                      fontWeight = FontWeight.Bold,
                      color = if (record.checkOutFormatted != null) MaterialTheme.colorScheme.onSurface
                              else if (isAppInDarkTheme()) StatusWarningDark else StatusWarning
                    )
                  }
                  Column(horizontalAlignment = Alignment.End) {
                    Text("Duration", fontFamily = InterFontFamily, fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    Text(
                      text = record.durationFormatted ?: "--",
                      fontFamily = IbmPlexMonoFontFamily,
                      fontSize = 13.sp,
                      fontWeight = FontWeight.Bold,
                      color = MaterialTheme.colorScheme.onSurface
                    )
                  }
                }

                if (record.reviewRequested) {
                  Spacer(modifier = Modifier.height(10.dp))
                  Card(
                    shape = RoundedCornerShape(8.dp),
                    colors = CardDefaults.cardColors(
                      containerColor = if (isAppInDarkTheme()) StatusWarningDarkTint else StatusWarning.copy(alpha = 0.12f)
                    ),
                    modifier = Modifier.fillMaxWidth()
                  ) {
                    Row(modifier = Modifier.padding(8.dp), verticalAlignment = Alignment.CenterVertically) {
                      Icon(
                        Icons.Default.HourglassTop,
                        contentDescription = null,
                        tint = if (isAppInDarkTheme()) StatusWarningDark else StatusWarning,
                        modifier = Modifier.size(16.dp)
                      )
                      Spacer(modifier = Modifier.width(6.dp))
                      Text(
                        text = "Review Requested (${record.reviewStatus}): \"${record.reviewNotes}\"",
                        fontFamily = InterFontFamily,
                        fontSize = 11.sp,
                        color = if (isAppInDarkTheme()) StatusWarningDark else StatusWarning,
                        fontWeight = FontWeight.Medium
                      )
                    }
                  }
                } else {
                  Spacer(modifier = Modifier.height(8.dp))
                  Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.End) {
                    TextButton(
                      onClick = {
                        reviewRecordDialog = record
                        reviewNotes = ""
                      },
                      contentPadding = PaddingValues(horizontal = 8.dp, vertical = 0.dp)
                    ) {
                      Icon(Icons.Default.HelpOutline, contentDescription = null, modifier = Modifier.size(14.dp), tint = MaterialTheme.colorScheme.primary)
                      Spacer(modifier = Modifier.width(4.dp))
                      Text("Request Review / Dispute", fontFamily = InterFontFamily, fontSize = 11.sp, color = MaterialTheme.colorScheme.primary)
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    // Review Request Dialog
    reviewRecordDialog?.let { rec ->
      AlertDialog(
        onDismissRequest = { reviewRecordDialog = null },
        title = { Text("Request Attendance Review", fontFamily = FrauncesFontFamily) },
        text = {
          Column {
            Text(
              text = "Official records cannot be altered directly. Submit an explanation for Station Supervisor review.",
              fontFamily = InterFontFamily,
              fontSize = 12.sp,
              color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            Spacer(modifier = Modifier.height(12.dp))
            OutlinedTextField(
              value = reviewNotes,
              onValueChange = { reviewNotes = it },
              label = { Text("Reason / Disputed Detail", fontFamily = InterFontFamily) },
              placeholder = { Text("e.g. Turnstile gate network delayed scanner by 5 minutes", fontFamily = InterFontFamily) },
              colors = covenantTextFieldColors(),
              modifier = Modifier.fillMaxWidth(),
              minLines = 3
            )
          }
        },
        confirmButton = {
          Button(
            onClick = {
              if (reviewNotes.isNotBlank()) {
                viewModel.requestAttendanceReview(rec.id, reviewNotes)
                reviewRecordDialog = null
              }
            },
            colors = covenantButtonColors()
          ) {
            Text("SUBMIT REVIEW", fontFamily = InterFontFamily)
          }
        },
        dismissButton = {
          TextButton(onClick = { reviewRecordDialog = null }) {
            Text("Cancel", fontFamily = InterFontFamily, color = MaterialTheme.colorScheme.onSurfaceVariant)
          }
        }
      )
    }
  }
}
