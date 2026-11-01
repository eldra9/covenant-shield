import 'package:flutter/material.dart';

class AppColors {
  // Covenant Shield Brand Tokens
  static const Color emerald = Color(0xFF003C35);
  static const Color gold = Color(0xFFC9A04A);
  static const Color forest = Color(0xFF092824);
  static const Color mist = Color(0xFFF4F6F4);
  static const Color ink = Color(0xFF24332F);
  static const Color white = Color(0xFFFFFFFF);

  // Derived Tokens
  static const Color emerald700 = Color(0xFF0B5247);
  static const Color emerald50 = Color(0xFFE6EFEC);
  static const Color forest2 = Color(0xFF0D322D);
  static const Color forest3 = Color(0xFF123D37);
  static const Color gold600 = Color(0xFFA47F2E);
  static const Color gold300 = Color(0xFFE6CB8A);
  static const Color lineColor = Color(0xFFD9E0DC);
  static const Color lineGold = Color(0x47C9A04A);
  static const Color textMuted = Color(0xFF52625D);

  // Status Light
  static const Color statusSuccess = Color(0xFF1E6B45);
  static const Color statusSuccessTint = Color(0xFFE7F3EC);
  static const Color statusWarning = Color(0xFF8A5A00);
  static const Color statusWarningTint = Color(0xFFFFF4DB);
  static const Color statusDanger = Color(0xFFA12B2B);
  static const Color statusDangerTint = Color(0xFFFBE9E9);
  static const Color statusInfo = Color(0xFF1D4E89);
  static const Color statusInfoTint = Color(0xFFE8F0FA);
  static const Color statusNeutral = Color(0xFF52625D);
  static const Color statusNeutralTint = Color(0xFFE8ECE9);

  // Status Dark
  static const Color statusSuccessDark = Color(0xFF4ADE80);
  static const Color statusSuccessDarkTint = Color(0xFF0F3822);
  static const Color statusWarningDark = Color(0xFFFBBF24);
  static const Color statusWarningDarkTint = Color(0xFF382300);
  static const Color statusDangerDark = Color(0xFFF87171);
  static const Color statusDangerDarkTint = Color(0xFF3E1414);
  static const Color statusInfoDark = Color(0xFF60A5FA);
  static const Color statusInfoDarkTint = Color(0xFF102847);
  static const Color statusNeutralDark = Color(0xFFA2B5AF);
  static const Color statusNeutralDarkTint = Color(0xFF1B2B26);

  // Foil Gradient
  static const LinearGradient foilGradient = LinearGradient(
    colors: [gold600, gold, gold300, gold, gold600],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
}

class AppTheme {
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      primaryColor: AppColors.emerald,
      scaffoldBackgroundColor: AppColors.mist,
      colorScheme: const ColorScheme(
        brightness: Brightness.light,
        primary: AppColors.emerald,
        onPrimary: AppColors.white,
        primaryContainer: AppColors.emerald50,
        onPrimaryContainer: AppColors.emerald,
        secondary: AppColors.gold600,
        onSecondary: AppColors.white,
        secondaryContainer: AppColors.emerald50,
        onSecondaryContainer: AppColors.emerald700,
        tertiary: AppColors.gold,
        onTertiary: AppColors.forest,
        error: AppColors.statusDanger,
        onError: AppColors.white,
        errorContainer: AppColors.statusDangerTint,
        onErrorContainer: AppColors.statusDanger,
        surface: AppColors.white,
        onSurface: AppColors.ink,
        surfaceContainerHighest: AppColors.emerald50,
        onSurfaceVariant: AppColors.textMuted,
        outline: AppColors.lineColor,
        outlineVariant: AppColors.lineGold,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: AppColors.emerald,
        foregroundColor: AppColors.white,
        elevation: 0,
        scrolledUnderElevation: 0,
        centerTitle: false,
        titleTextStyle: TextStyle(
          color: AppColors.white,
          fontSize: 18,
          fontWeight: FontWeight.bold,
          letterSpacing: 0.3,
        ),
      ),
      cardTheme: CardTheme(
        elevation: 0,
        color: AppColors.white,
        margin: EdgeInsets.zero,
        shape: RoundedCornerShape(12, borderColor: AppColors.lineColor),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          elevation: 0,
          backgroundColor: AppColors.emerald,
          foregroundColor: AppColors.white,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
          textStyle: const TextStyle(fontWeight: FontWeight.bold, letterSpacing: 0.5),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          elevation: 0,
          foregroundColor: AppColors.emerald,
          side: const BorderSide(color: AppColors.lineColor),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
          textStyle: const TextStyle(fontWeight: FontWeight.bold),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.white,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: AppColors.lineColor),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: AppColors.lineColor),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: AppColors.emerald, width: 2),
        ),
      ),
      dividerTheme: const DividerThemeData(
        color: AppColors.lineColor,
        thickness: 1,
        space: 1,
      ),
    );
  }

  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      primaryColor: AppColors.gold,
      scaffoldBackgroundColor: const Color(0xFF071412),
      colorScheme: const ColorScheme(
        brightness: Brightness.dark,
        primary: AppColors.gold,
        onPrimary: AppColors.forest,
        primaryContainer: AppColors.forest3,
        onPrimaryContainer: AppColors.gold300,
        secondary: AppColors.emerald700,
        onSecondary: AppColors.white,
        secondaryContainer: AppColors.forest2,
        onSecondaryContainer: AppColors.mist,
        tertiary: AppColors.gold300,
        onTertiary: AppColors.forest,
        error: Color(0xFFFF6B6B),
        onError: Color(0xFF3E1212),
        errorContainer: Color(0xFF4A1818),
        onErrorContainer: Color(0xFFFFDADA),
        surface: Color(0xFF0D2823),
        onSurface: Color(0xFFF4F6F4),
        surfaceContainerHighest: Color(0xFF133630),
        onSurfaceVariant: Color(0xFFA2B5AF),
        outline: Color(0xFF214A43),
        outlineVariant: AppColors.lineGold,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: AppColors.forest,
        foregroundColor: AppColors.white,
        elevation: 0,
        scrolledUnderElevation: 0,
        centerTitle: false,
        titleTextStyle: TextStyle(
          color: AppColors.white,
          fontSize: 18,
          fontWeight: FontWeight.bold,
          letterSpacing: 0.3,
        ),
      ),
      cardTheme: CardTheme(
        elevation: 0,
        color: const Color(0xFF0D2823),
        margin: EdgeInsets.zero,
        shape: RoundedCornerShape(12, borderColor: const Color(0xFF214A43)),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          elevation: 0,
          backgroundColor: AppColors.gold,
          foregroundColor: AppColors.forest,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
          textStyle: const TextStyle(fontWeight: FontWeight.bold, letterSpacing: 0.5),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          elevation: 0,
          foregroundColor: AppColors.gold,
          side: const BorderSide(color: Color(0xFF214A43)),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
          textStyle: const TextStyle(fontWeight: FontWeight.bold),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: const Color(0xFF0D2823),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: Color(0xFF214A43)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: Color(0xFF214A43)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: AppColors.gold, width: 2),
        ),
      ),
      dividerTheme: const DividerThemeData(
        color: Color(0xFF214A43),
        thickness: 1,
        space: 1,
      ),
    );
  }
}

// Flat card helper shape with 1px border
RoundedRectangleBorder RoundedCornerShape(double radius, {required Color borderColor}) {
  return RoundedRectangleBorder(
    borderRadius: BorderRadius.circular(radius),
    side: BorderSide(color: borderColor, width: 1.0),
  );
}
