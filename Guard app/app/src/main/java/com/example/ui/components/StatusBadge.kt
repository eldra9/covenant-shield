package com.example.ui.components

import androidx.compose.animation.Crossfade
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Schedule
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.model.AttendanceStatus
import com.example.ui.theme.*

/**
 * StatusBadge: dot + text, cross-fades 150ms when status changes.
 * - On time = success (#1E6B45 / #E7F3EC)
 * - Late = warning (#8A5A00 / #FFF4DB)
 * - Missed check-in = danger (#A12B2B / #FBE9E9)
 * - Absent = danger (#A12B2B / #FBE9E9)
 * - Pending sync = neutral (#52625D / #E8ECE9) with clock icon
 * - Corrected = info (#1D4E89 / #E8F0FA)
 */
@Composable
fun StatusBadge(
  status: AttendanceStatus,
  modifier: Modifier = Modifier,
  isPendingSync: Boolean = false
) {
  val isDark = isAppInDarkTheme()

  Crossfade(
    targetState = Pair(status, isPendingSync),
    animationSpec = tween(durationMillis = 150),
    label = "status_crossfade"
  ) { (currentStatus, pending) ->
    val (textColor, bgColor, label) = when {
      pending -> if (isDark) Triple(StatusNeutralDark, StatusNeutralDarkTint, "Pending sync")
                 else Triple(StatusNeutral, StatusNeutralTint, "Pending sync")
      currentStatus == AttendanceStatus.PRESENT -> if (isDark) Triple(StatusSuccessDark, StatusSuccessDarkTint, "On time")
                                                  else Triple(StatusSuccess, StatusSuccessTint, "On time")
      currentStatus == AttendanceStatus.LATE -> if (isDark) Triple(StatusWarningDark, StatusWarningDarkTint, "Late")
                                                else Triple(StatusWarning, StatusWarningTint, "Late")
      currentStatus == AttendanceStatus.ABSENT -> if (isDark) Triple(StatusDangerDark, StatusDangerDarkTint, "Absent")
                                                 else Triple(StatusDanger, StatusDangerTint, "Absent")
      currentStatus == AttendanceStatus.LEFT_EARLY -> if (isDark) Triple(StatusWarningDark, StatusWarningDarkTint, "Left early")
                                                      else Triple(StatusWarning, StatusWarningTint, "Left early")
      currentStatus == AttendanceStatus.MANUAL -> if (isDark) Triple(StatusInfoDark, StatusInfoDarkTint, "Corrected")
                                                  else Triple(StatusInfo, StatusInfoTint, "Corrected")
      currentStatus == AttendanceStatus.SCHEDULED -> if (isDark) Triple(StatusInfoDark, StatusInfoDarkTint, "Scheduled")
                                                     else Triple(StatusInfo, StatusInfoTint, "Scheduled")
      else -> if (isDark) Triple(StatusNeutralDark, StatusNeutralDarkTint, currentStatus.label)
              else Triple(StatusNeutral, StatusNeutralTint, currentStatus.label)
    }

    Row(
      verticalAlignment = Alignment.CenterVertically,
      horizontalArrangement = Arrangement.spacedBy(6.dp),
      modifier = modifier
        .clip(RoundedCornerShape(6.dp))
        .background(bgColor)
        .border(0.5.dp, textColor.copy(alpha = if (isDark) 0.45f else 0.25f), RoundedCornerShape(6.dp))
        .padding(horizontal = 8.dp, vertical = 3.dp)
    ) {
      if (pending) {
        Icon(
          imageVector = Icons.Default.Schedule,
          contentDescription = null,
          tint = textColor,
          modifier = Modifier.size(11.dp)
        )
      } else {
        Box(
          modifier = Modifier
            .size(6.dp)
            .clip(CircleShape)
            .background(textColor)
        )
      }

      Text(
        text = label,
        fontFamily = InterFontFamily,
        color = textColor,
        fontSize = 11.sp,
        fontWeight = FontWeight.SemiBold
      )
    }
  }
}
