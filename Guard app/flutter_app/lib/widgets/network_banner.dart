import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class NetworkBanner extends StatelessWidget {
  final bool isOnline;
  final int queuedCount;
  final VoidCallback onToggle;

  const NetworkBanner({
    Key? key,
    required this.isOnline,
    required this.queuedCount,
    required this.onToggle,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    if (isOnline && queuedCount == 0) {
      return const SizedBox.shrink();
    }

    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bgColor = isOnline
        ? (isDark ? AppColors.statusSuccessDarkTint : AppColors.statusSuccessTint)
        : (isDark ? AppColors.statusWarningDarkTint : AppColors.statusWarningTint);
    final fgColor = isOnline
        ? (isDark ? AppColors.statusSuccessDark : AppColors.statusSuccess)
        : (isDark ? AppColors.statusWarningDark : AppColors.statusWarning);

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: bgColor,
        border: Border(bottom: BorderSide(color: fgColor.withOpacity(0.3))),
      ),
      child: Row(
        children: [
          Icon(
            isOnline ? Icons.cloud_done : Icons.cloud_off,
            color: fgColor,
            size: 18,
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              isOnline
                  ? "Back online. Syncing $queuedCount queued security events..."
                  : "Offline Mode Active • $queuedCount events queued locally",
              style: TextStyle(
                color: fgColor,
                fontSize: 12,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
          TextButton(
            onPressed: onToggle,
            style: TextButton.styleFrom(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              minimumSize: Size.zero,
              tapTargetSize: MaterialTapTargetSize.shrinkWrap,
            ),
            child: Text(
              isOnline ? "SIMULATE OFFLINE" : "SIMULATE ONLINE",
              style: TextStyle(
                color: fgColor,
                fontSize: 11,
                fontWeight: FontWeight.bold,
                decoration: TextDecoration.underline,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
