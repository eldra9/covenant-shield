package com.example.ui.components

import androidx.compose.animation.*
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.theme.*

/**
 * ConnectionBanner: Slides down 240ms when offline ("You're offline. Check-in needs a connection.")
 * and slides away when back online. Also shows pending offline sync items.
 */
@Composable
fun NetworkBanner(
  isOnline: Boolean,
  pendingSyncCount: Int,
  onToggleNetwork: () -> Unit,
  onSyncClick: () -> Unit,
  modifier: Modifier = Modifier
) {
  AnimatedVisibility(
    visible = !isOnline || pendingSyncCount > 0,
    enter = slideInVertically(animationSpec = tween(durationMillis = 240)) + fadeIn(tween(240)),
    exit = slideOutVertically(animationSpec = tween(durationMillis = 240)) + fadeOut(tween(240))
  ) {
    val bgColor = if (!isOnline) StatusDanger else Forest2
    val textColor = White

    Row(
      modifier = modifier
        .fillMaxWidth()
        .background(bgColor)
        .padding(horizontal = 16.dp, vertical = 8.dp),
      verticalAlignment = Alignment.CenterVertically,
      horizontalArrangement = Arrangement.SpaceBetween
    ) {
      Row(
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        modifier = Modifier
          .weight(1f)
          .clickable { onToggleNetwork() }
          .testTag("network_toggle_badge")
      ) {
        Icon(
          imageVector = if (isOnline) Icons.Default.Wifi else Icons.Default.WifiOff,
          contentDescription = if (isOnline) "Online" else "Offline",
          tint = if (isOnline) Gold else White,
          modifier = Modifier.size(16.dp)
        )
        Column {
          Text(
            text = if (!isOnline) "You're offline. Check-in needs a connection." else "Offline queue pending ($pendingSyncCount)",
            color = textColor,
            fontFamily = InterFontFamily,
            fontSize = 12.sp,
            fontWeight = FontWeight.Medium
          )
          Text(
            text = if (!isOnline) "Tap to toggle simulated network" else "Syncing ledger with cloud server...",
            color = textColor.copy(alpha = 0.75f),
            fontSize = 10.sp,
            fontFamily = InterFontFamily
          )
        }
      }

      if (pendingSyncCount > 0 && isOnline) {
        FilledTonalButton(
          onClick = onSyncClick,
          colors = ButtonDefaults.filledTonalButtonColors(
            containerColor = Gold,
            contentColor = Emerald
          ),
          contentPadding = PaddingValues(horizontal = 10.dp, vertical = 2.dp),
          modifier = Modifier
            .height(28.dp)
            .testTag("sync_offline_button")
        ) {
          Icon(
            imageVector = Icons.Default.Sync,
            contentDescription = "Sync",
            modifier = Modifier.size(13.dp)
          )
          Spacer(modifier = Modifier.width(4.dp))
          Text(
            text = "Sync ($pendingSyncCount)",
            fontFamily = IbmPlexMonoFontFamily,
            fontSize = 11.sp,
            fontWeight = FontWeight.Bold
          )
        }
      }
    }
  }
}

