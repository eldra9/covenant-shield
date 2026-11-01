package com.example.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.TextFieldColors
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

/**
 * Covenant Shield On Post - Sunlight-Optimized Palette
 * Ivory page (--mist #F4F6F4) with 12:1 text contrast in bright sunlight (--ink #24332F on --white / --mist).
 * Accent with Emerald (#003C35), Gold (#C9A04A), and Forest (#092824).
 */
val CovenantLightColorScheme = lightColorScheme(
  primary = Emerald,
  onPrimary = White,
  primaryContainer = Emerald50,
  onPrimaryContainer = Emerald,
  secondary = Gold600,
  onSecondary = White,
  secondaryContainer = Emerald50,
  onSecondaryContainer = Emerald700,
  tertiary = Gold,
  onTertiary = Forest,
  background = Mist,                 // Ivory page (--mist #F4F6F4)
  onBackground = Ink,                // 12:1 text contrast in bright sunlight (--ink #24332F)
  surface = White,
  onSurface = Ink,
  surfaceVariant = Emerald50,
  onSurfaceVariant = TextMuted,
  outline = LineColor,
  outlineVariant = LineGold,
  error = StatusDanger,
  onError = White,
  errorContainer = StatusDangerTint,
  onErrorContainer = StatusDanger
)

/**
 * Covenant Shield Night Watch - Dark Mode Palette
 * Deep obsidian forest palette with gold illumination for low-light night patrols.
 */
val CovenantDarkColorScheme = darkColorScheme(
  primary = Gold,
  onPrimary = Forest,
  primaryContainer = Forest3,
  onPrimaryContainer = Gold300,
  secondary = Emerald700,
  onSecondary = White,
  secondaryContainer = Forest2,
  onSecondaryContainer = Mist,
  tertiary = Gold300,
  onTertiary = Forest,
  background = Color(0xFF071412),
  onBackground = Color(0xFFE8ECE9),
  surface = Color(0xFF0D2823),
  onSurface = Color(0xFFF4F6F4),
  surfaceVariant = Color(0xFF133630),
  onSurfaceVariant = Color(0xFFA2B5AF),
  outline = Color(0xFF214A43),
  outlineVariant = LineGold,
  error = Color(0xFFFF6B6B),
  onError = Color(0xFF3E1212),
  errorContainer = Color(0xFF4A1818),
  onErrorContainer = Color(0xFFFFDADA)
)

/**
 * Standard text field colors for Covenant Shield inputs to guarantee readability in both light & dark modes
 */
@Composable
fun covenantTextFieldColors(): TextFieldColors = OutlinedTextFieldDefaults.colors(
  focusedTextColor = MaterialTheme.colorScheme.onSurface,
  unfocusedTextColor = MaterialTheme.colorScheme.onSurface,
  focusedBorderColor = MaterialTheme.colorScheme.primary,
  unfocusedBorderColor = MaterialTheme.colorScheme.outline,
  focusedLabelColor = MaterialTheme.colorScheme.primary,
  unfocusedLabelColor = MaterialTheme.colorScheme.onSurfaceVariant,
  focusedPlaceholderColor = MaterialTheme.colorScheme.onSurfaceVariant,
  unfocusedPlaceholderColor = MaterialTheme.colorScheme.onSurfaceVariant,
  cursorColor = MaterialTheme.colorScheme.primary,
  focusedContainerColor = MaterialTheme.colorScheme.surface,
  unfocusedContainerColor = MaterialTheme.colorScheme.surface,
  focusedLeadingIconColor = MaterialTheme.colorScheme.primary,
  unfocusedLeadingIconColor = MaterialTheme.colorScheme.onSurfaceVariant,
  focusedTrailingIconColor = MaterialTheme.colorScheme.primary,
  unfocusedTrailingIconColor = MaterialTheme.colorScheme.onSurfaceVariant
)

/**
 * Check if the active theme is Night Watch / dark mode
 */
@Composable
fun isAppInDarkTheme(): Boolean {
  return MaterialTheme.colorScheme.surface != White
}

/**
 * Consistent TopAppBar styling that switches between Emerald (daytime) and Deep Forest (night watch)
 */
@androidx.compose.material3.ExperimentalMaterial3Api
@Composable
fun covenantTopAppBarColors(): androidx.compose.material3.TopAppBarColors {
  val isDark = isAppInDarkTheme()
  return androidx.compose.material3.TopAppBarDefaults.topAppBarColors(
    containerColor = if (isDark) Forest else Emerald,
    titleContentColor = White,
    navigationIconContentColor = White,
    actionIconContentColor = Gold300
  )
}

/**
 * Standard button colors that use vibrant Gold in dark mode and authoritative Emerald in light mode
 */
@Composable
fun covenantButtonColors(): androidx.compose.material3.ButtonColors = androidx.compose.material3.ButtonDefaults.buttonColors(
  containerColor = MaterialTheme.colorScheme.primary,
  contentColor = MaterialTheme.colorScheme.onPrimary
)

/**
 * Standard outlined button colors that contrast with current background
 */
@Composable
fun covenantOutlinedButtonColors(): androidx.compose.material3.ButtonColors = androidx.compose.material3.ButtonDefaults.outlinedButtonColors(
  contentColor = MaterialTheme.colorScheme.primary
)

@Composable
fun MyApplicationTheme(
  darkTheme: Boolean = androidx.compose.foundation.isSystemInDarkTheme(),
  content: @Composable () -> Unit
) {
  val colorScheme = if (darkTheme) CovenantDarkColorScheme else CovenantLightColorScheme
  MaterialTheme(
    colorScheme = colorScheme,
    typography = AppTypography,
    content = content
  )
}


