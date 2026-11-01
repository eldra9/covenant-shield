import 'package:flutter/material.dart';
import '../models/models.dart';
import '../services/guard_state.dart';
import '../theme/app_theme.dart';
import '../widgets/status_badge.dart';

class AttendanceHistoryScreen extends StatelessWidget {
  final GuardState state;

  const AttendanceHistoryScreen({
    Key? key,
    required this.state,
  }) : super(key: key);

  String _formatDateTime(int? ms) {
    if (ms == null) return "Pending";
    final dt = DateTime.fromMillisecondsSinceEpoch(ms).toLocal();
    final hour = dt.hour.toString().padLeft(2, '0');
    final min = dt.minute.toString().padLeft(2, '0');
    final month = dt.month.toString().padLeft(2, '0');
    final day = dt.day.toString().padLeft(2, '0');
    return "${dt.year}-$month-$day $hour:$min";
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardBorder = isDark ? const Color(0xFF214A43) : AppColors.lineColor;
    final records = state.attendanceRecords;

    return Scaffold(
      appBar: AppBar(
        title: const Text("ATTENDANCE AUDIT LOGS"),
      ),
      body: records.isEmpty
          ? Center(
              child: Text(
                "No past attendance logs recorded.",
                style: TextStyle(
                  color: isDark ? AppColors.statusNeutralDark : AppColors.textMuted,
                ),
              ),
            )
          : ListView.separated(
              padding: const EdgeInsets.all(16.0),
              itemCount: records.length,
              separatorBuilder: (_, __) => const SizedBox(height: 12),
              itemBuilder: (context, index) {
                final rec = records[index];

                return Container(
                  padding: const EdgeInsets.all(16.0),
                  decoration: BoxDecoration(
                    color: isDark ? const Color(0xFF0D2823) : AppColors.white,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: cardBorder, width: 1.0),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            rec.siteName,
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: isDark ? Colors.white : AppColors.ink,
                            ),
                          ),
                          StatusBadge.fromStatus(rec.status, isDark: isDark),
                        ],
                      ),
                      const SizedBox(height: 10),
                      Row(
                        children: [
                          Expanded(
                            child: _timeBlock("CHECK-IN", _formatDateTime(rec.checkInTime), rec.checkInMethod ?? "QR", isDark),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: _timeBlock("CHECK-OUT", _formatDateTime(rec.checkOutTime), rec.checkOutMethod ?? "SEAL", isDark),
                          ),
                        ],
                      ),
                      if (rec.notes != null && rec.notes!.isNotEmpty) ...[
                        const SizedBox(height: 8),
                        Text(
                          "Notes: ${rec.notes}",
                          style: TextStyle(
                            fontSize: 12,
                            fontStyle: FontStyle.italic,
                            color: isDark ? AppColors.statusNeutralDark : AppColors.textMuted,
                          ),
                        ),
                      ],
                      const Divider(height: 20),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            "SEAL: SHA256-${rec.id.substring(0, 10).toUpperCase()}",
                            style: TextStyle(
                              fontSize: 10,
                              fontFamily: 'Courier',
                              color: isDark ? AppColors.gold300 : AppColors.gold600,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          Text(
                            rec.isOfflineSynced ? "SYNCED TO CLOUD" : "LOCAL CACHED",
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                              color: rec.isOfflineSynced
                                  ? (isDark ? AppColors.statusSuccessDark : AppColors.statusSuccess)
                                  : AppColors.statusWarning,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                );
              },
            ),
    );
  }

  Widget _timeBlock(String title, String time, String method, bool isDark) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: TextStyle(
            fontSize: 10,
            fontWeight: FontWeight.bold,
            letterSpacing: 0.8,
            color: isDark ? AppColors.statusNeutralDark : AppColors.textMuted,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          time,
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w600,
            color: isDark ? Colors.white : AppColors.ink,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          "Method: $method",
          style: TextStyle(
            fontSize: 10,
            color: isDark ? AppColors.gold : AppColors.emerald,
          ),
        ),
      ],
    );
  }
}
