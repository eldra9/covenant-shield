package com.example.ui.components

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.size
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import com.example.ui.theme.Gold
import kotlin.math.PI
import kotlin.math.cos
import kotlin.math.sin

/**
 * GuillocheSeal: Mathematical rosette generated in code:
 * Two roulettes r(t) = R + a * sin(k * t),
 * k1 = 12, k2 = 18, a = 0.045R, 360 points each, 0.6px stroke,
 * plus outer and inner concentric containment rings.
 */
@Composable
fun GuillocheSeal(
  modifier: Modifier = Modifier,
  size: Dp = 80.dp,
  strokeColor: Color = Gold.copy(alpha = 0.28f),
  strokeWidth: Float = 1.2f,
  showInnerShield: Boolean = false
) {
  // Precompute normalized points once
  val pointsCount = 360
  val rouletteData = remember {
    val k1 = 12
    val k2 = 18
    val r1Angles = (0 until pointsCount).map { i ->
      val t = (i * 2.0 * PI / pointsCount).toFloat()
      val sinVal = sin(k1 * t)
      Triple(t, sinVal, 1)
    }
    val r2Angles = (0 until pointsCount).map { i ->
      val t = (i * 2.0 * PI / pointsCount).toFloat()
      val sinVal = sin(k2 * t)
      Triple(t, sinVal, 2)
    }
    r1Angles to r2Angles
  }

  Canvas(modifier = modifier.size(size)) {
    val cx = this.size.width / 2f
    val cy = this.size.height / 2f
    val baseRadius = (this.size.minDimension / 2f) * 0.88f
    val a = 0.045f * baseRadius

    // 1. Outer Ring
    drawCircle(
      color = strokeColor,
      radius = baseRadius + a * 1.5f,
      center = Offset(cx, cy),
      style = Stroke(width = strokeWidth)
    )

    // 2. Inner Ring
    drawCircle(
      color = strokeColor,
      radius = baseRadius * 0.58f,
      center = Offset(cx, cy),
      style = Stroke(width = strokeWidth)
    )

    // 3. Roulette 1: k=12
    val path1 = Path()
    rouletteData.first.forEachIndexed { index, (t, sinVal, _) ->
      val r = baseRadius + a * sinVal
      val x = cx + r * cos(t)
      val y = cy + r * sin(t)
      if (index == 0) path1.moveTo(x, y) else path1.lineTo(x, y)
    }
    path1.close()
    drawPath(path = path1, color = strokeColor, style = Stroke(width = strokeWidth * 0.8f))

    // 4. Roulette 2: k=18
    val path2 = Path()
    rouletteData.second.forEachIndexed { index, (t, sinVal, _) ->
      val r = baseRadius + a * sinVal
      val x = cx + r * cos(t)
      val y = cy + r * sin(t)
      if (index == 0) path2.moveTo(x, y) else path2.lineTo(x, y)
    }
    path2.close()
    drawPath(path = path2, color = strokeColor, style = Stroke(width = strokeWidth * 0.8f))

    // Optional central ring
    if (showInnerShield) {
      drawCircle(
        color = strokeColor,
        radius = baseRadius * 0.28f,
        center = Offset(cx, cy),
        style = Stroke(width = strokeWidth)
      )
    }
  }
}
