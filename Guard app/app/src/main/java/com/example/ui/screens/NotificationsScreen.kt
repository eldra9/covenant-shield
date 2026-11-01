package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
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
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.theme.*
import com.example.ui.viewmodel.GuardViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun NotificationsScreen(
  viewModel: GuardViewModel,
  onNavigateBack: () -> Unit
) {
  val user by viewModel.currentUser.collectAsState()
  val allNotifications by viewModel.notifications.collectAsState()

  val guardNotifs = remember(allNotifications, user) {
    allNotifications.filter { it.guardId == user?.id }
  }

  Scaffold(
    topBar = {
      TopAppBar(
        title = {
          Column {
            Text("Operations Alerts", fontFamily = FrauncesFontFamily, fontWeight = FontWeight.Bold, fontSize = 17.sp, color = White)
            Text("Station Dispatch Feed", fontFamily = IbmPlexMonoFontFamily, fontSize = 10.sp, color = Gold300)
          }
        },
        navigationIcon = {
          IconButton(onClick = onNavigateBack) {
            Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = White)
          }
        },
        actions = {
          if (guardNotifs.any { !it.isRead }) {
            TextButton(
              onClick = { viewModel.markAllNotificationsRead() },
              colors = ButtonDefaults.textButtonColors(contentColor = Gold300)
            ) {
              Text("Mark All Read", fontFamily = InterFontFamily, fontSize = 12.sp)
            }
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
      if (guardNotifs.isEmpty()) {
        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
          Text("No notifications.", fontFamily = InterFontFamily, color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
      } else {
        LazyColumn(
          modifier = Modifier.fillMaxSize(),
          contentPadding = PaddingValues(16.dp),
          verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
          items(guardNotifs, key = { it.id }) { notif ->
            Card(
              shape = RoundedCornerShape(12.dp),
              colors = CardDefaults.cardColors(
                containerColor = if (notif.isRead) MaterialTheme.colorScheme.surface else (if (isAppInDarkTheme()) Forest3 else Emerald50)
              ),
              border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant),
              elevation = CardDefaults.cardElevation(0.dp),
              modifier = Modifier
                .fillMaxWidth()
                .clickable { viewModel.markNotificationRead(notif.id) }
            ) {
              Row(
                modifier = Modifier
                  .fillMaxWidth()
                  .padding(14.dp),
                verticalAlignment = Alignment.Top
              ) {
                val boxBg = if (notif.isRead) {
                  MaterialTheme.colorScheme.surfaceVariant
                } else {
                  if (isAppInDarkTheme()) Forest2 else Emerald
                }
                val iconTint = if (notif.isRead) MaterialTheme.colorScheme.onSurfaceVariant else Gold

                Box(
                  contentAlignment = Alignment.Center,
                  modifier = Modifier
                    .size(36.dp)
                    .clip(CircleShape)
                    .background(boxBg)
                ) {
                  Icon(
                    imageVector = when (notif.type) {
                      "SHIFT_ASSIGNED" -> Icons.Default.EventAvailable
                      "WARNING" -> Icons.Default.Warning
                      else -> Icons.Default.Info
                    },
                    contentDescription = null,
                    tint = iconTint,
                    modifier = Modifier.size(20.dp)
                  )
                }

                Spacer(modifier = Modifier.width(12.dp))

                Column(modifier = Modifier.weight(1f)) {
                  Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                  ) {
                    Text(
                      text = notif.title,
                      fontFamily = InterFontFamily,
                      fontWeight = if (notif.isRead) FontWeight.SemiBold else FontWeight.Bold,
                      fontSize = 13.sp,
                      color = MaterialTheme.colorScheme.onSurface
                    )
                    Text(
                      text = notif.timestampFormatted,
                      fontFamily = IbmPlexMonoFontFamily,
                      fontSize = 10.sp,
                      color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                  }

                  Spacer(modifier = Modifier.height(4.dp))

                  Text(
                    text = notif.message,
                    fontFamily = InterFontFamily,
                    fontSize = 12.sp,
                    color = if (notif.isRead) MaterialTheme.colorScheme.onSurfaceVariant else MaterialTheme.colorScheme.onSurface
                  )
                }
              }
            }
          }
        }
      }
    }
  }
}
