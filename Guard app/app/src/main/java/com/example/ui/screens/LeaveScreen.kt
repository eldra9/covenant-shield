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
import com.example.data.model.LeaveRequest
import com.example.ui.theme.*
import com.example.ui.viewmodel.GuardViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LeaveScreen(
  viewModel: GuardViewModel,
  onNavigateBack: () -> Unit
) {
  val user by viewModel.currentUser.collectAsState()
  val allLeaves by viewModel.leaveRequests.collectAsState()
  var showNewLeaveDialog by remember { mutableStateOf(false) }

  var selectedType by remember { mutableStateOf("ANNUAL") }
  var startDate by remember { mutableStateOf("2026-11-15") }
  var endDate by remember { mutableStateOf("2026-11-18") }
  var reason by remember { mutableStateOf("") }

  val guardLeaves = remember(allLeaves, user) {
    allLeaves.filter { it.guardId == user?.id }
  }

  Scaffold(
    topBar = {
      TopAppBar(
        title = {
          Column {
            Text("Duty Leave Requests", fontFamily = FrauncesFontFamily, fontWeight = FontWeight.Bold, fontSize = 17.sp, color = White)
            Text("Personnel Roster Exceptions", fontFamily = IbmPlexMonoFontFamily, fontSize = 10.sp, color = Gold300)
          }
        },
        navigationIcon = {
          IconButton(onClick = onNavigateBack) {
            Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = White)
          }
        },
        colors = covenantTopAppBarColors()
      )
    },
    floatingActionButton = {
      ExtendedFloatingActionButton(
        onClick = { showNewLeaveDialog = true },
        icon = { Icon(Icons.Default.Add, contentDescription = null, tint = Forest) },
        text = { Text("REQUEST LEAVE", fontFamily = InterFontFamily, fontWeight = FontWeight.Bold) },
        containerColor = Gold,
        contentColor = Forest,
        elevation = FloatingActionButtonDefaults.elevation(0.dp, 0.dp, 0.dp, 0.dp),
        modifier = Modifier.testTag("request_leave_fab")
      )
    }
  ) { innerPadding ->
    Column(
      modifier = Modifier
        .fillMaxSize()
        .padding(innerPadding)
        .background(MaterialTheme.colorScheme.background)
    ) {
      if (guardLeaves.isEmpty()) {
        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
          Text("No leave requests submitted.", fontFamily = InterFontFamily, color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
      } else {
        LazyColumn(
          modifier = Modifier.fillMaxSize(),
          contentPadding = PaddingValues(16.dp),
          verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
          items(guardLeaves, key = { it.id }) { leave ->
            Card(
              shape = RoundedCornerShape(14.dp),
              colors = CardDefaults.cardColors(
                containerColor = MaterialTheme.colorScheme.surface,
                contentColor = MaterialTheme.colorScheme.onSurface
              ),
              border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant),
              elevation = CardDefaults.cardElevation(0.dp),
              modifier = Modifier.fillMaxWidth()
            ) {
              Column(modifier = Modifier.padding(16.dp)) {
                Row(
                  modifier = Modifier.fillMaxWidth(),
                  horizontalArrangement = Arrangement.SpaceBetween,
                  verticalAlignment = Alignment.CenterVertically
                ) {
                  Text(
                    text = "${leave.leaveType} LEAVE",
                    fontFamily = FrauncesFontFamily,
                    fontWeight = FontWeight.Bold,
                    fontSize = 15.sp,
                    color = MaterialTheme.colorScheme.onSurface
                  )
                  val statusColor = if (isAppInDarkTheme()) {
                    when (leave.status) {
                      "APPROVED" -> StatusSuccessDark
                      "REJECTED" -> StatusDangerDark
                      else -> StatusWarningDark
                    }
                  } else {
                    when (leave.status) {
                      "APPROVED" -> StatusSuccess
                      "REJECTED" -> StatusDanger
                      else -> StatusWarning
                    }
                  }
                  Text(
                    text = leave.status,
                    fontFamily = IbmPlexMonoFontFamily,
                    fontWeight = FontWeight.Bold,
                    fontSize = 12.sp,
                    color = statusColor
                  )
                }

                Spacer(modifier = Modifier.height(8.dp))
                Text(
                  text = "Period: ${leave.startDate} to ${leave.endDate}",
                  fontFamily = IbmPlexMonoFontFamily,
                  fontSize = 12.sp,
                  color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Text(
                  text = "Reason: ${leave.reason}",
                  fontFamily = InterFontFamily,
                  fontSize = 12.sp,
                  color = MaterialTheme.colorScheme.onSurface
                )

                if (!leave.supervisorComment.isNullOrBlank()) {
                  Spacer(modifier = Modifier.height(6.dp))
                  Text(
                    text = "Supervisor Notes: ${leave.supervisorComment}",
                    fontFamily = InterFontFamily,
                    fontSize = 11.sp,
                    color = if (isAppInDarkTheme()) Gold else Emerald
                  )
                }
              }
            }
          }
        }
      }
    }

    if (showNewLeaveDialog) {
      AlertDialog(
        onDismissRequest = { showNewLeaveDialog = false },
        title = { Text("Submit Leave Request", fontFamily = FrauncesFontFamily, color = MaterialTheme.colorScheme.onSurface) },
        text = {
          Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
            OutlinedTextField(
              value = selectedType,
              onValueChange = { selectedType = it },
              label = { Text("Leave Type (ANNUAL, SICK, EMERGENCY)", fontFamily = InterFontFamily) },
              colors = covenantTextFieldColors(),
              modifier = Modifier.fillMaxWidth()
            )
            OutlinedTextField(
              value = startDate,
              onValueChange = { startDate = it },
              label = { Text("Start Date (YYYY-MM-DD)", fontFamily = InterFontFamily) },
              colors = covenantTextFieldColors(),
              modifier = Modifier.fillMaxWidth()
            )
            OutlinedTextField(
              value = endDate,
              onValueChange = { endDate = it },
              label = { Text("End Date (YYYY-MM-DD)", fontFamily = InterFontFamily) },
              colors = covenantTextFieldColors(),
              modifier = Modifier.fillMaxWidth()
            )
            OutlinedTextField(
              value = reason,
              onValueChange = { reason = it },
              label = { Text("Reason for absence", fontFamily = InterFontFamily) },
              colors = covenantTextFieldColors(),
              modifier = Modifier.fillMaxWidth(),
              minLines = 2
            )
          }
        },
        confirmButton = {
          Button(
            onClick = {
              if (reason.isNotBlank()) {
                viewModel.submitLeave(selectedType, startDate, endDate, reason)
                showNewLeaveDialog = false
              }
            },
            colors = covenantButtonColors()
          ) {
            Text("SUBMIT", fontFamily = InterFontFamily)
          }
        },
        dismissButton = {
          TextButton(
            onClick = { showNewLeaveDialog = false },
            colors = ButtonDefaults.textButtonColors(contentColor = MaterialTheme.colorScheme.onSurfaceVariant)
          ) {
            Text("Cancel", fontFamily = InterFontFamily)
          }
        }
      )
    }
  }
}
