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
import com.example.data.model.Shift
import com.example.data.model.ShiftSwapRequest
import com.example.data.model.User
import com.example.ui.theme.*
import com.example.ui.viewmodel.GuardViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ShiftSwapScreen(
  viewModel: GuardViewModel,
  onNavigateBack: () -> Unit
) {
  val user by viewModel.currentUser.collectAsState()
  val allSwaps by viewModel.shiftSwapRequests.collectAsState()
  val guardShifts by viewModel.guardShifts.collectAsState()
  val allGuards by viewModel.allGuards.collectAsState()

  var showNewSwapDialog by remember { mutableStateOf(false) }
  var selectedShift by remember { mutableStateOf<Shift?>(null) }
  var selectedTargetGuard by remember { mutableStateOf<User?>(null) }
  var swapReason by remember { mutableStateOf("") }

  val guardSwaps = remember(allSwaps, user) {
    allSwaps.filter { it.requesterGuardId == user?.id }
  }

  val peerGuards = remember(allGuards, user) {
    allGuards.filter { it.id != user?.id && it.role == "GUARD" }
  }

  Scaffold(
    topBar = {
      TopAppBar(
        title = {
          Column {
            Text("Shift Swap Requests", fontFamily = FrauncesFontFamily, fontWeight = FontWeight.Bold, fontSize = 17.sp, color = White)
            Text("Peer Duty Trade Approvals", fontFamily = IbmPlexMonoFontFamily, fontSize = 10.sp, color = Gold300)
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
        onClick = { showNewSwapDialog = true },
        icon = { Icon(Icons.Default.SwapHoriz, contentDescription = null, tint = Forest) },
        text = { Text("REQUEST SWAP", fontFamily = InterFontFamily, fontWeight = FontWeight.Bold) },
        containerColor = Gold,
        contentColor = Forest,
        elevation = FloatingActionButtonDefaults.elevation(0.dp, 0.dp, 0.dp, 0.dp),
        modifier = Modifier.testTag("request_swap_fab")
      )
    }
  ) { innerPadding ->
    Column(
      modifier = Modifier
        .fillMaxSize()
        .padding(innerPadding)
        .background(MaterialTheme.colorScheme.background)
    ) {
      if (guardSwaps.isEmpty()) {
        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
          Text("No shift swap requests submitted.", fontFamily = InterFontFamily, color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
      } else {
        LazyColumn(
          modifier = Modifier.fillMaxSize(),
          contentPadding = PaddingValues(16.dp),
          verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
          items(guardSwaps, key = { it.id }) { swap ->
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
                    text = swap.shiftDate,
                    fontFamily = IbmPlexMonoFontFamily,
                    fontWeight = FontWeight.Bold,
                    fontSize = 14.sp,
                    color = MaterialTheme.colorScheme.onSurface
                  )
                  val statusColor = if (isAppInDarkTheme()) {
                    when (swap.status) {
                      "APPROVED" -> StatusSuccessDark
                      "REJECTED" -> StatusDangerDark
                      else -> StatusWarningDark
                    }
                  } else {
                    when (swap.status) {
                      "APPROVED" -> StatusSuccess
                      "REJECTED" -> StatusDanger
                      else -> StatusWarning
                    }
                  }
                  Text(
                    text = swap.status,
                    fontFamily = IbmPlexMonoFontFamily,
                    fontWeight = FontWeight.Bold,
                    fontSize = 12.sp,
                    color = statusColor
                  )
                }

                Spacer(modifier = Modifier.height(8.dp))
                Text(
                  text = "Offered to Peer Guard: ${swap.targetGuardName}",
                  fontFamily = InterFontFamily,
                  fontWeight = FontWeight.SemiBold,
                  fontSize = 13.sp,
                  color = MaterialTheme.colorScheme.onSurface
                )
                Text(
                  text = "Reason: ${swap.reason}",
                  fontFamily = InterFontFamily,
                  fontSize = 12.sp,
                  color = MaterialTheme.colorScheme.onSurfaceVariant
                )

                if (!swap.supervisorComment.isNullOrBlank()) {
                  Spacer(modifier = Modifier.height(6.dp))
                  Text(
                    text = "Supervisor Notes: ${swap.supervisorComment}",
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

    if (showNewSwapDialog) {
      AlertDialog(
        onDismissRequest = { showNewSwapDialog = false },
        title = { Text("Request Shift Swap", fontFamily = FrauncesFontFamily, color = MaterialTheme.colorScheme.onSurface) },
        text = {
          Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
            Text(
              text = "Select one of your scheduled shifts and a qualified peer guard for swap approval.",
              fontFamily = InterFontFamily,
              fontSize = 12.sp,
              color = MaterialTheme.colorScheme.onSurfaceVariant
            )

            val chipColors = FilterChipDefaults.filterChipColors(
              selectedContainerColor = if (isAppInDarkTheme()) Forest3 else Emerald50,
              selectedLabelColor = if (isAppInDarkTheme()) Gold else Emerald,
              containerColor = MaterialTheme.colorScheme.surfaceVariant,
              labelColor = MaterialTheme.colorScheme.onSurfaceVariant
            )

            // Shift picker
            Text("Select Your Shift:", fontFamily = InterFontFamily, fontWeight = FontWeight.Bold, fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurface)
            guardShifts.take(3).forEach { s ->
              FilterChip(
                selected = selectedShift?.id == s.id,
                onClick = { selectedShift = s },
                colors = chipColors,
                label = { Text("${s.shiftDate} (${s.siteName})", fontFamily = InterFontFamily, fontSize = 11.sp) }
              )
            }

            // Target guard picker
            Text("Select Peer Guard:", fontFamily = InterFontFamily, fontWeight = FontWeight.Bold, fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurface)
            peerGuards.take(3).forEach { g ->
              FilterChip(
                selected = selectedTargetGuard?.id == g.id,
                onClick = { selectedTargetGuard = g },
                colors = chipColors,
                label = { Text(g.fullName, fontFamily = InterFontFamily, fontSize = 11.sp) }
              )
            }

            OutlinedTextField(
              value = swapReason,
              onValueChange = { swapReason = it },
              label = { Text("Reason for trade", fontFamily = InterFontFamily) },
              colors = covenantTextFieldColors(),
              modifier = Modifier.fillMaxWidth()
            )
          }
        },
        confirmButton = {
          Button(
            onClick = {
              if (selectedShift != null && selectedTargetGuard != null && swapReason.isNotBlank()) {
                viewModel.submitShiftSwap(selectedShift!!, selectedTargetGuard!!, swapReason)
                showNewSwapDialog = false
              }
            },
            colors = covenantButtonColors()
          ) {
            Text("SUBMIT SWAP", fontFamily = InterFontFamily)
          }
        },
        dismissButton = {
          TextButton(
            onClick = { showNewSwapDialog = false },
            colors = ButtonDefaults.textButtonColors(contentColor = MaterialTheme.colorScheme.onSurfaceVariant)
          ) {
            Text("Cancel", fontFamily = InterFontFamily)
          }
        }
      )
    }
  }
}
