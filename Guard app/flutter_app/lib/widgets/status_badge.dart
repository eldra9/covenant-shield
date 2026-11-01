import 'package:flutter/material.dart';
import '../models/models.dart';
import '../theme/app_theme.dart';

class StatusBadge extends StatelessWidget {
  final String text;
  final Color textColor;
  final Color backgroundColor;
  final Color borderColor;

  const StatusBadge({
    Key? key,
    required this.text,
    required this.textColor,
    required this.backgroundColor,
    required this.borderColor,
  }) : super(key: key);

  factory StatusBadge.fromStatus(AttendanceStatus status, {required bool isDark}) {
    Color textCol;
    Color bgCol;

    switch (status) {
      case AttendanceStatus.present:
        textCol = isDark ? AppColors.statusSuccessDark : AppColors.statusSuccess;
        bgCol = isDark ? AppColors.statusSuccessDarkTint : AppColors.statusSuccessTint;
        break;
      case AttendanceStatus.late:
      case AttendanceStatus.leftEarly:
      case AttendanceStatus.manual:
        textCol = isDark ? AppColors.statusWarningDark : AppColors.statusWarning;
        bgCol = isDark ? AppColors.statusWarningDarkTint : AppColors.statusWarningTint;
        break;
      case AttendanceStatus.absent:
        textCol = isDark ? AppColors.statusDangerDark : AppColors.statusDanger;
        bgCol = isDark ? AppColors.statusDangerDarkTint : AppColors.statusDangerTint;
        break;
      case AttendanceStatus.scheduled:
        textCol = isDark ? AppColors.statusInfoDark : AppColors.statusInfo;
        bgCol = isDark ? AppColors.statusInfoDarkTint : AppColors.statusInfoTint;
        break;
      case AttendanceStatus.onLeave:
        textCol = isDark ? AppColors.statusNeutralDark : AppColors.statusNeutral;
        bgCol = isDark ? AppColors.statusNeutralDarkTint : AppColors.statusNeutralTint;
        break;
    }

    return StatusBadge(
      text: status.displayName,
      textColor: textCol,
      backgroundColor: bgCol,
      borderColor: textCol.withOpacity(0.4),
    );
  }

  factory StatusBadge.generic(String text, {required Color color, required bool isDark}) {
    return StatusBadge(
      text: text.toUpperCase(),
      textColor: color,
      backgroundColor: color.withOpacity(isDark ? 0.2 : 0.12),
      borderColor: color.withOpacity(0.4),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: borderColor, width: 1.0),
      ),
      child: Text(
        text,
        style: TextStyle(
          color: textColor,
          fontSize: 11,
          fontWeight: FontWeight.bold,
          letterSpacing: 0.8,
        ),
      ),
    );
  }
}
