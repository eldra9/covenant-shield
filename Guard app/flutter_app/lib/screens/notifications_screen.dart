import 'package:flutter/material.dart';
import '../services/guard_state.dart';
import '../theme/app_theme.dart';

class NotificationsScreen extends StatelessWidget {
  final GuardState state;

  const NotificationsScreen({Key? key, required this.state}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardBorder = isDark ? const Color(0xFF214A43) : AppColors.lineColor;
    final notifs = state.notifications;

    return Scaffold(
      appBar: AppBar(
        title: const Text("DISPATCH & STATION ALERTS"),
        actions: [
          IconButton(
            icon: const Icon(Icons.done_all),
            tooltip: "Mark all as read",
            onPressed: () => state.markAllNotificationsAsRead(),
          ),
        ],
      ),
      body: notifs.isEmpty
          ? Center(
              child: Text(
                "No alerts or notifications.",
                style: TextStyle(
                  color: isDark ? AppColors.statusNeutralDark : AppColors.textMuted,
                ),
              ),
            )
          : ListView.separated(
              padding: const EdgeInsets.all(16.0),
              itemCount: notifs.length,
              separatorBuilder: (_, __) => const SizedBox(height: 12),
              itemBuilder: (context, index) {
                final item = notifs[index];
                final date = DateTime.fromMillisecondsSinceEpoch(item.timestamp).toLocal();

                return InkWell(
                  onTap: () => state.markNotificationAsRead(item.id),
                  borderRadius: BorderRadius.circular(12),
                  child: Container(
                    padding: const EdgeInsets.all(16.0),
                    decoration: BoxDecoration(
                      color: isDark ? const Color(0xFF0D2823) : AppColors.white,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: !item.isRead
                            ? (isDark ? AppColors.gold : AppColors.emerald)
                            : cardBorder,
                        width: !item.isRead ? 1.5 : 1.0,
                      ),
                    ),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Icon(
                          item.type == "ALERT" ? Icons.warning_amber_rounded : Icons.info_outline,
                          color: !item.isRead
                              ? (isDark ? AppColors.gold : AppColors.emerald)
                              : (isDark ? AppColors.statusNeutralDark : AppColors.textMuted),
                          size: 24,
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(
                                    item.title,
                                    style: TextStyle(
                                      fontSize: 14,
                                      fontWeight: FontWeight.bold,
                                      color: isDark ? Colors.white : AppColors.ink,
                                    ),
                                  ),
                                  Text(
                                    "${date.hour.toString().padLeft(2, '0')}:${date.minute.toString().padLeft(2, '0')}",
                                    style: TextStyle(
                                      fontSize: 11,
                                      color: isDark ? AppColors.statusNeutralDark : AppColors.textMuted,
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 4),
                              Text(
                                item.message,
                                style: TextStyle(
                                  fontSize: 13,
                                  color: isDark ? Colors.white70 : AppColors.ink,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
    );
  }
}
