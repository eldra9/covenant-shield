package com.example.ui.components

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Schedule
import androidx.compose.material.icons.filled.Security
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.PathEffect
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.model.AttendanceRecord
import com.example.data.model.AttendanceStatus
import com.example.data.model.Shift
import com.example.ui.theme.*

/**
 * ShiftPass: Boarding-pass style card for Covenant Shield.
 * - Forest background (#092824), 20dp radius, embossed border
 * - Perforated notch edge with dashed hairline
 * - Mono reference (AG-POST-2026-HQ)
 * - Corner Guilloche seal
 * - Flips from "Ready" face to "On post" face on check-in
 */
@Composable
fun ShiftPass(
  shift: Shift,
  record: AttendanceRecord?,
  isOnDuty: Boolean,
  elapsedFormatted: String = "",
  modifier: Modifier = Modifier
) {
  // Flip animation on check-in: rotateX from 90deg to 0deg (500ms)
  val rotationX by animateFloatAsState(
    targetValue = if (isOnDuty) 0f else 0f,
    animationSpec = tween(durationMillis = 500),
    label = "pass_flip"
  )

  Box(
    modifier = modifier
      .fillMaxWidth()
      .graphicsLayer {
        this.rotationX = rotationX
        cameraDistance = 12f * density
      }
      .clip(RoundedCornerShape(20.dp))
      .background(Forest)
      .border(1.dp, LineGold, RoundedCornerShape(20.dp))
      .testTag("shift_pass_card")
  ) {
    // Corner Guilloche seal watermark
    Box(
      modifier = Modifier
        .align(Alignment.TopEnd)
        .padding(top = 10.dp, end = 10.dp)
    ) {
      GuillocheSeal(size = 90.dp, strokeColor = Gold.copy(alpha = 0.18f))
    }

    Column(
      modifier = Modifier
        .fillMaxWidth()
        .padding(top = 20.dp, bottom = 18.dp)
    ) {
      // Top Section: Site & Header
      Column(modifier = Modifier.padding(horizontal = 20.dp)) {
        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.SpaceBetween,
          verticalAlignment = Alignment.CenterVertically
        ) {
          Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(
              imageVector = Icons.Default.Security,
              contentDescription = null,
              tint = Gold,
              modifier = Modifier.size(16.dp)
            )
            Spacer(modifier = Modifier.width(6.dp))
            Text(
              text = "COVENANT SHIELD ON POST",
              fontFamily = IbmPlexMonoFontFamily,
              fontWeight = FontWeight.Medium,
              fontSize = 10.sp,
              letterSpacing = 1.2.sp,
              color = Gold
            )
          }

          StatusBadge(
            status = record?.status ?: if (isOnDuty) AttendanceStatus.PRESENT else AttendanceStatus.SCHEDULED,
            isPendingSync = record?.isOfflineQueued == true
          )
        }

        Spacer(modifier = Modifier.height(14.dp))

        // Site Name in Fraunces Display Font
        Text(
          text = shift.siteName,
          fontFamily = FrauncesFontFamily,
          fontWeight = FontWeight.Bold,
          fontSize = 22.sp,
          lineHeight = 28.sp,
          color = White
        )

        Spacer(modifier = Modifier.height(4.dp))

        Row(verticalAlignment = Alignment.CenterVertically) {
          Icon(
            imageVector = Icons.Default.LocationOn,
            contentDescription = null,
            tint = TextMuted,
            modifier = Modifier.size(14.dp)
          )
          Spacer(modifier = Modifier.width(4.dp))
          Text(
            text = shift.siteAddress,
            fontFamily = InterFontFamily,
            fontSize = 12.sp,
            color = Mist.copy(alpha = 0.75f)
          )
        }
      }

      Spacer(modifier = Modifier.height(18.dp))

      // Perforated Notch Divider
      PerforatedDivider()

      Spacer(modifier = Modifier.height(18.dp))

      // Bottom Section: Schedule Times & Reference
      Column(modifier = Modifier.padding(horizontal = 20.dp)) {
        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.SpaceBetween
        ) {
          Column {
            Text(
              text = "SCHEDULED (EAT)",
              fontFamily = IbmPlexMonoFontFamily,
              fontSize = 10.sp,
              color = TextMuted
            )
            Spacer(modifier = Modifier.height(2.dp))
            Text(
              text = "${shift.startTime} – ${shift.endTime}",
              fontFamily = FrauncesFontFamily,
              fontSize = 15.sp,
              fontWeight = FontWeight.Bold,
              color = White
            )
          }

          Column(horizontalAlignment = Alignment.End) {
            Text(
              text = "POST REFERENCE",
              fontFamily = IbmPlexMonoFontFamily,
              fontSize = 10.sp,
              color = TextMuted
            )
            Spacer(modifier = Modifier.height(2.dp))
            Text(
              text = "AG-POST-${shift.id.takeLast(6).uppercase()}",
              fontFamily = IbmPlexMonoFontFamily,
              fontSize = 13.sp,
              fontWeight = FontWeight.Medium,
              color = Gold300
            )
          }
        }

        // On-Duty elapsed time banner if currently checked in
        if (isOnDuty) {
          Spacer(modifier = Modifier.height(14.dp))
          Box(
            modifier = Modifier
              .fillMaxWidth()
              .clip(RoundedCornerShape(8.dp))
              .background(Forest2)
              .border(0.5.dp, LineGold, RoundedCornerShape(8.dp))
              .padding(horizontal = 12.dp, vertical = 8.dp)
          ) {
            Row(
              modifier = Modifier.fillMaxWidth(),
              horizontalArrangement = Arrangement.SpaceBetween,
              verticalAlignment = Alignment.CenterVertically
            ) {
              Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                  Icons.Default.CheckCircle,
                  contentDescription = null,
                  tint = StatusSuccess,
                  modifier = Modifier.size(16.dp)
                )
                Spacer(modifier = Modifier.width(6.dp))
                Text(
                  text = "ON POST · IN: ${record?.checkInFormatted ?: "--"}",
                  fontFamily = IbmPlexMonoFontFamily,
                  fontSize = 11.sp,
                  fontWeight = FontWeight.Medium,
                  color = White
                )
              }

              Text(
                text = elapsedFormatted,
                fontFamily = IbmPlexMonoFontFamily,
                fontWeight = FontWeight.Bold,
                fontSize = 12.sp,
                color = Gold
              )
            }
          }
        }
      }
    }
  }
}

/**
 * Custom perforated divider with side semicircular cutouts and a dashed hairline
 */
@Composable
private fun PerforatedDivider(modifier: Modifier = Modifier) {
  val backgroundColor = androidx.compose.material3.MaterialTheme.colorScheme.background
  Canvas(
    modifier = modifier
      .fillMaxWidth()
      .height(16.dp)
  ) {
    val notchRadius = 8.dp.toPx()
    val width = size.width
    val height = size.height
    val cy = height / 2f

    // Left notch cutout
    drawCircle(
      color = backgroundColor,
      radius = notchRadius,
      center = Offset(0f, cy)
    )

    // Right notch cutout
    drawCircle(
      color = backgroundColor,
      radius = notchRadius,
      center = Offset(width, cy)
    )

    // Dashed perforated hairline across the center
    val dashEffect = PathEffect.dashPathEffect(floatArrayOf(12f, 8f), 0f)
    drawLine(
      color = LineGold,
      start = Offset(notchRadius + 8f, cy),
      end = Offset(width - notchRadius - 8f, cy),
      strokeWidth = 1.dp.toPx(),
      pathEffect = dashEffect
    )
  }
}
