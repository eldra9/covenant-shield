package com.example.ui.components

import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.*
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.HourglassTop
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.theme.*
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

/**
 * SealButton: Luxury "Hold to Seal" 168dp interactive circular button.
 * - Emerald (#003C35) circle with Guilloche seal at 20%
 * - 6dp track ring
 * - While pressed: gold ring fills clockwise over 900ms
 * - Haptic feedback at start and double-pulse at 900ms completion
 * - Early release rewinds in 150ms
 * - Server confirmation status with SealStamp
 * - Plain tap / accessibility opens BottomSheet confirmation
 */
@Composable
fun SealButton(
  label: String,
  sublabel: String = "HOLD TO SEAL",
  isHoldEnabled: Boolean = true,
  isLoading: Boolean = false,
  isSuccess: Boolean = false,
  serverTimestamp: String? = null,
  onHoldComplete: () -> Unit,
  onTapAccessible: () -> Unit,
  modifier: Modifier = Modifier,
  size: Dp = 168.dp
) {
  val context = LocalContext.current
  val vibrator = remember {
    try {
      context.getSystemService(android.content.Context.VIBRATOR_SERVICE) as? Vibrator
    } catch (_: Exception) {
      null
    }
  }

  var isPressing by remember { mutableStateOf(false) }
  val progress = remember { Animatable(0f) }
  val coroutineScope = rememberCoroutineScope()

  // Stamp scale spring animation when success is returned
  val stampScale = remember { Animatable(1.3f) }
  LaunchedEffect(isSuccess) {
    if (isSuccess) {
      stampScale.snapTo(1.3f)
      stampScale.animateTo(
        targetValue = 1.0f,
        animationSpec = spring(dampingRatio = 0.65f, stiffness = Spring.StiffnessMedium)
      )
    }
  }

  fun triggerHaptic(durationMs: Long) {
    try {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        vibrator?.vibrate(VibrationEffect.createOneShot(durationMs, VibrationEffect.DEFAULT_AMPLITUDE))
      } else {
        @Suppress("DEPRECATION")
        vibrator?.vibrate(durationMs)
      }
    } catch (_: Exception) {}
  }

  fun triggerDoubleHaptic() {
    try {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        val timings = longArrayOf(0, 30, 60, 30)
        vibrator?.vibrate(VibrationEffect.createWaveform(timings, -1))
      } else {
        @Suppress("DEPRECATION")
        vibrator?.vibrate(50)
      }
    } catch (_: Exception) {}
  }

  Box(
    contentAlignment = Alignment.Center,
    modifier = modifier
      .size(size)
      .pointerInput(isHoldEnabled, isLoading, isSuccess) {
        if (!isHoldEnabled || isLoading || isSuccess) {
          detectTapGestures(onTap = { onTapAccessible() })
        } else {
          detectTapGestures(
            onPress = {
              isPressing = true
              triggerHaptic(15)
              val job = coroutineScope.launch {
                // Animate progress to 1f over 900ms
                progress.animateTo(
                  targetValue = 1f,
                  animationSpec = tween(durationMillis = 900, easing = LinearEasing)
                )
                if (progress.value >= 0.98f) {
                  triggerDoubleHaptic()
                  onHoldComplete()
                }
              }
              tryAwaitRelease()
              isPressing = false
              job.cancel()
              // Early release rewinds within 150ms
              if (progress.value < 0.98f) {
                coroutineScope.launch {
                  progress.animateTo(
                    targetValue = 0f,
                    animationSpec = tween(durationMillis = 150, easing = FastOutLinearInEasing)
                  )
                }
              }
            },
            onTap = {
              // Plain tap triggers accessibility confirmation sheet
              onTapAccessible()
            }
          )
        }
      }
      .testTag("seal_button")
  ) {
    // 1. Base Circular Canvas with 6dp Track & Fills
    Canvas(modifier = Modifier.fillMaxSize()) {
      val strokeW = 6.dp.toPx()
      val arcSize = Size(this.size.width - strokeW, this.size.height - strokeW)
      val arcOffset = Offset(strokeW / 2f, strokeW / 2f)

      // Background Track Ring
      drawCircle(
        color = Forest2,
        radius = (this.size.minDimension - strokeW) / 2f,
        center = Offset(this.size.width / 2f, this.size.height / 2f),
        style = Stroke(width = strokeW)
      )

      // Active Filling Gold Arc (Clockwise over 900ms)
      if (progress.value > 0.01f && !isSuccess) {
        drawArc(
          color = Gold,
          startAngle = -90f,
          sweepAngle = 360f * progress.value,
          useCenter = false,
          topLeft = arcOffset,
          size = arcSize,
          style = Stroke(width = strokeW, cap = StrokeCap.Round)
        )
      } else if (isSuccess) {
        drawCircle(
          color = StatusSuccess,
          radius = (this.size.minDimension - strokeW) / 2f,
          center = Offset(this.size.width / 2f, this.size.height / 2f),
          style = Stroke(width = strokeW)
        )
      }
    }

    // 2. Button Center Content
    Box(
      contentAlignment = Alignment.Center,
      modifier = Modifier
        .size(size - 14.dp)
        .clip(CircleShape)
        .background(if (isSuccess) Forest else Emerald)
        .border(1.dp, LineGold, CircleShape)
        .padding(16.dp)
    ) {
      // Background Guilloche Seal Watermark
      GuillocheSeal(
        size = size - 32.dp,
        strokeColor = Gold.copy(alpha = if (isPressing) 0.35f else 0.20f),
        showInnerShield = true
      )

      Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
      ) {
        when {
          isSuccess -> {
            // SealStamp success with server-returned timestamp
            Box(
              modifier = Modifier.scale(stampScale.value),
              contentAlignment = Alignment.Center
            ) {
              Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Icon(
                  imageVector = Icons.Default.Check,
                  contentDescription = "Verified",
                  tint = Gold,
                  modifier = Modifier.size(36.dp)
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                  text = "SEALED ON POST",
                  fontFamily = IbmPlexMonoFontFamily,
                  fontSize = 10.sp,
                  fontWeight = FontWeight.Bold,
                  letterSpacing = 1.sp,
                  color = Gold300
                )
                serverTimestamp?.let {
                  Text(
                    text = it,
                    fontFamily = IbmPlexMonoFontFamily,
                    fontSize = 10.sp,
                    color = Mist.copy(alpha = 0.85f)
                  )
                }
              }
            }
          }
          isLoading -> {
            CircularProgressIndicator(
              color = Gold,
              modifier = Modifier.size(32.dp),
              strokeWidth = 2.5.dp
            )
            Spacer(modifier = Modifier.height(6.dp))
            Text(
              text = "Confirming with server...",
              fontFamily = InterFontFamily,
              fontSize = 10.sp,
              color = Mist,
              textAlign = TextAlign.Center
            )
          }
          else -> {
            Text(
              text = label,
              fontFamily = FrauncesFontFamily,
              fontWeight = FontWeight.Bold,
              fontSize = 17.sp,
              color = White,
              textAlign = TextAlign.Center
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
              text = if (isPressing) "HOLD..." else sublabel,
              fontFamily = IbmPlexMonoFontFamily,
              fontWeight = FontWeight.Medium,
              fontSize = 9.sp,
              letterSpacing = 1.sp,
              color = if (isPressing) Gold else Gold300
            )
          }
        }
      }
    }
  }
}
