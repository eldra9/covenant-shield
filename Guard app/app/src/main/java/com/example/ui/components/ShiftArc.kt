package com.example.ui.components

import androidx.compose.animation.core.*
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.*
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.theme.*
import kotlin.math.PI
import kotlin.math.cos
import kotlin.math.sin

/**
 * ShiftArc: 240-degree arc representing the shift window.
 * - Fills to the current shift time (animated 600ms).
 * - "Now" dot pulses gently (opacity loop every 4s).
 * - Shows live EAT time and elapsed progress in center.
 */
@Composable
fun ShiftArc(
  progress: Float, // 0.0f .. 1.0f
  currentTimeFormatted: String,
  shiftHoursLabel: String,
  modifier: Modifier = Modifier,
  size: Dp = 190.dp
) {
  // Animate progress fill (600ms)
  val animatedProgress by animateFloatAsState(
    targetValue = progress.coerceIn(0f, 1f),
    animationSpec = tween(durationMillis = 600, easing = FastOutSlowInEasing),
    label = "shift_arc_fill"
  )

  // Gentle 4s ambient pulse on "now" indicator dot
  val infiniteTransition = rememberInfiniteTransition(label = "now_dot_pulse")
  val dotAlpha by infiniteTransition.animateFloat(
    initialValue = 0.45f,
    targetValue = 1.0f,
    animationSpec = infiniteRepeatable(
      animation = tween(2000, easing = FastOutSlowInEasing),
      repeatMode = RepeatMode.Reverse
    ),
    label = "dot_alpha"
  )

  val startAngle = 150f
  val sweepTotal = 240f

  val trackColor = if (isAppInDarkTheme()) Forest3 else LineColor

  Box(
    contentAlignment = Alignment.Center,
    modifier = modifier.size(size)
  ) {
    Canvas(modifier = Modifier.fillMaxSize().padding(14.dp)) {
      val strokeW = 6.dp.toPx()
      val arcSize = Size(this.size.width - strokeW, this.size.height - strokeW)
      val arcOffset = Offset(strokeW / 2f, strokeW / 2f)

      // 1. Background Track Arc (240 degrees)
      drawArc(
        color = trackColor,
        startAngle = startAngle,
        sweepAngle = sweepTotal,
        useCenter = false,
        topLeft = arcOffset,
        size = arcSize,
        style = Stroke(width = strokeW, cap = StrokeCap.Round)
      )

      // 2. Filled Shift Progress Arc
      val activeSweep = sweepTotal * animatedProgress
      if (activeSweep > 0.5f) {
        drawArc(
          color = Gold,
          startAngle = startAngle,
          sweepAngle = activeSweep,
          useCenter = false,
          topLeft = arcOffset,
          size = arcSize,
          style = Stroke(width = strokeW, cap = StrokeCap.Round)
        )
      }

      // 3. "Now" Indicator Dot on the Arc
      val currentAngleDeg = startAngle + activeSweep
      val currentAngleRad = (currentAngleDeg * PI / 180f).toFloat()
      val radius = arcSize.width / 2f
      val cx = this.size.width / 2f
      val cy = this.size.height / 2f

      val dotX = cx + radius * cos(currentAngleRad)
      val dotY = cy + radius * sin(currentAngleRad)

      // Outer glow pulse
      drawCircle(
        color = Gold.copy(alpha = dotAlpha * 0.35f),
        radius = 8.dp.toPx(),
        center = Offset(dotX, dotY)
      )
      // Solid center dot
      drawCircle(
        color = Gold,
        radius = 4.dp.toPx(),
        center = Offset(dotX, dotY)
      )
    }

    // Center Display
    Column(
      horizontalAlignment = Alignment.CenterHorizontally,
      verticalArrangement = Arrangement.Center,
      modifier = Modifier.padding(top = 10.dp)
    ) {
      Text(
        text = "LIVE TIME",
        fontFamily = IbmPlexMonoFontFamily,
        fontSize = 10.sp,
        fontWeight = FontWeight.Bold,
        color = Gold,
        letterSpacing = 1.5.sp
      )
      Spacer(modifier = Modifier.height(2.dp))
      Text(
        text = currentTimeFormatted,
        fontFamily = FrauncesFontFamily,
        fontSize = 20.sp,
        fontWeight = FontWeight.Bold,
        color = androidx.compose.material3.MaterialTheme.colorScheme.onSurface
      )
      Spacer(modifier = Modifier.height(2.dp))
      Text(
        text = shiftHoursLabel,
        fontFamily = InterFontFamily,
        fontSize = 11.sp,
        color = androidx.compose.material3.MaterialTheme.colorScheme.onSurfaceVariant
      )
    }
  }
}
