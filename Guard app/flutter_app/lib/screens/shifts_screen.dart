import 'package:flutter/material.dart';
import '../models/models.dart';
import '../services/guard_state.dart';
import '../theme/app_theme.dart';
import '../widgets/status_badge.dart';

class ShiftsScreen extends StatefulWidget {
  final GuardState state;
  final Function(Shift) onSelectShift;

  const ShiftsScreen({
    Key? key,
    required this.state,
    required this.onSelectShift,
  }) : super(key: key);

  @override
  State<ShiftsScreen> createState() => _ShiftsScreenState();
}

class _ShiftsScreenState extends State<ShiftsScreen> {
  String _filter = "ALL";

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardBorder = isDark ? const Color(0xFF214A43) : AppColors.lineColor;

    final shifts = widget.state.shifts;

    return Scaffold(
      appBar: AppBar(
        title: const Text("OFFICER SHIFT ROSTER"),
      ),
      body: Column(
        children: [
          // Filter Tabs
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: Row(
              children: [
                _filterChip("ALL", isDark),
                const SizedBox(width: 8),
                _filterChip("SCHEDULED", isDark),
                const SizedBox(width: 8),
                _filterChip("COMPLETED", isDark),
              ],
            ),
          ),
          const Divider(height: 1),

          // Shifts List
          Expanded(
            child: ListView.separated(
              padding: const EdgeInsets.all(16.0),
              itemCount: shifts.length,
              separatorBuilder: (_, __) => const SizedBox(height: 12),
              itemBuilder: (context, index) {
                final shift = shifts[index];
                final isToday = shift.id.contains("today");

                return Container(
                  padding: const EdgeInsets.all(16.0),
                  decoration: BoxDecoration(
                    color: isDark ? const Color(0xFF0D2823) : AppColors.white,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: isToday
                          ? (isDark ? AppColors.gold : AppColors.emerald)
                          : cardBorder,
                      width: isToday ? 1.5 : 1.0,
                    ),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              Icon(
                                Icons.calendar_today,
                                color: isDark ? AppColors.gold : AppColors.emerald,
                                size: 16,
                              ),
                              const SizedBox(width: 6),
                              Text(
                                shift.date,
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.bold,
                                  color: isDark ? AppColors.gold : AppColors.emerald,
                                ),
                              ),
                            ],
                          ),
                          StatusBadge.generic(
                            shift.status,
                            color: shift.status == "COMPLETED" ? AppColors.statusSuccess : AppColors.gold,
                            isDark: isDark,
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(
                        shift.siteName,
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: isDark ? Colors.white : AppColors.ink,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        shift.siteAddress,
                        style: TextStyle(
                          fontSize: 12,
                          color: isDark ? AppColors.statusNeutralDark : AppColors.textMuted,
                        ),
                      ),
                      const SizedBox(height: 10),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            "Window: ${shift.startTime} - ${shift.endTime}",
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                              color: isDark ? Colors.white : AppColors.ink,
                            ),
                          ),
                          Text(
                            shift.role,
                            style: TextStyle(
                              fontSize: 11,
                              color: isDark ? AppColors.statusNeutralDark : AppColors.textMuted,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _filterChip(String label, bool isDark) {
    final isSelected = _filter == label;
    return ChoiceChip(
      label: Text(label),
      selected: isSelected,
      onSelected: (_) => setState(() => _filter = label),
      selectedColor: isDark ? AppColors.forest3 : AppColors.emerald50,
      labelStyle: TextStyle(
        fontSize: 11,
        fontWeight: FontWeight.bold,
        color: isSelected
            ? (isDark ? AppColors.gold : AppColors.emerald)
            : (isDark ? AppColors.statusNeutralDark : AppColors.textMuted),
      ),
      side: BorderSide(
        color: isSelected
            ? (isDark ? AppColors.gold : AppColors.emerald)
            : (isDark ? const Color(0xFF214A43) : AppColors.lineColor),
      ),
    );
  }
}
