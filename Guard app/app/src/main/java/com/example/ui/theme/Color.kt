package com.example.ui.theme

import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color

// Covenant Shield Brand Tokens (Exact)
val Emerald = Color(0xFF003C35)        // --emerald #003C35
val Gold = Color(0xFFC9A04A)           // --gold #C9A04A
val Forest = Color(0xFF092824)         // --forest #092824
val Mist = Color(0xFFF4F6F4)           // --mist #F4F6F4 (ivory page background)
val Ink = Color(0xFF24332F)            // --ink #24332F (12:1 text contrast in bright sunlight)
val White = Color(0xFFFFFFFF)          // --white #FFFFFF

// Derived Tokens
val Emerald700 = Color(0xFF0B5247)     // --emerald-700 #0B5247
val Emerald50 = Color(0xFFE6EFEC)      // --emerald-50 #E6EFEC
val Forest2 = Color(0xFF0D322D)        // --forest-2 #0D322D
val Forest3 = Color(0xFF123D37)        // --forest-3 #123D37
val Gold600 = Color(0xFFA47F2E)        // --gold-600 #A47F2E (gold on white)
val Gold300 = Color(0xFFE6CB8A)        // --gold-300 #E6CB8A (foil highlight)
val LineColor = Color(0xFFD9E0DC)      // --line #D9E0DC
val LineGold = Color(0x47C9A04A)       // --line-gold rgba(201,160,74,.28)
val TextMuted = Color(0xFF52625D)      // --text-muted #52625D

// Status (text / tint) for Light mode
val StatusSuccess = Color(0xFF1E6B45)
val StatusSuccessTint = Color(0xFFE7F3EC)
val StatusWarning = Color(0xFF8A5A00)
val StatusWarningTint = Color(0xFFFFF4DB)
val StatusDanger = Color(0xFFA12B2B)
val StatusDangerTint = Color(0xFFFBE9E9)
val StatusInfo = Color(0xFF1D4E89)
val StatusInfoTint = Color(0xFFE8F0FA)
val StatusNeutral = Color(0xFF52625D)
val StatusNeutralTint = Color(0xFFE8ECE9)

// Status (text / tint) for Dark mode / Night Watch
val StatusSuccessDark = Color(0xFF4ADE80)
val StatusSuccessDarkTint = Color(0xFF0F3822)
val StatusWarningDark = Color(0xFFFBBF24)
val StatusWarningDarkTint = Color(0xFF382300)
val StatusDangerDark = Color(0xFFF87171)
val StatusDangerDarkTint = Color(0xFF3E1414)
val StatusInfoDark = Color(0xFF60A5FA)
val StatusInfoDarkTint = Color(0xFF102847)
val StatusNeutralDark = Color(0xFFA2B5AF)
val StatusNeutralDarkTint = Color(0xFF1B2B26)

// Luxury Foil Brush (linear-gradient(120deg,#A47F2E 0%,#C9A04A 35%,#E6CB8A 50%,#C9A04A 65%,#A47F2E 100%))
val FoilBrush = Brush.linearGradient(
  colors = listOf(
    Gold600,
    Gold,
    Gold300,
    Gold,
    Gold600
  )
)

// Backwards-compatible status aliases
val StatusScheduled = StatusInfo
val StatusScheduledContainer = StatusInfoTint
val StatusPresent = StatusSuccess
val StatusPresentContainer = StatusSuccessTint
val StatusLate = StatusWarning
val StatusLateContainer = StatusWarningTint
val StatusAbsent = StatusDanger
val StatusAbsentContainer = StatusDangerTint
val StatusOnLeave = StatusNeutral
val StatusOnLeaveContainer = StatusNeutralTint
val StatusManual = StatusWarning
val StatusManualContainer = StatusWarningTint
val StatusLeftEarly = StatusWarning
val StatusLeftEarlyContainer = StatusWarningTint

// Backwards-compatible palette aliases
val NavyDark = Forest
val NavyPrimary = Emerald
val NavyLight = Forest3
val GoldAccent = Gold
val GoldLight = Gold300
val SlateDark = Ink
val SlateMedium = TextMuted
val SlateLight = LineColor
