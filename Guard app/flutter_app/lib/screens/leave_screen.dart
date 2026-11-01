import 'package:flutter/material.dart';
import '../models/models.dart';
import '../services/guard_state.dart';
import '../theme/app_theme.dart';
import '../widgets/status_badge.dart';

class LeaveScreen extends StatefulWidget {
  final GuardState state;

  const LeaveScreen({Key? key, required this.state}) : super(key: key);

  @override
  State<LeaveScreen> createState() => _LeaveScreenState();
}

class _LeaveScreenState extends State<LeaveScreen> {
  void _openRequestModal(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    String leaveType = "ANNUAL";
    final startController = TextEditingController(text: "2026-11-20");
    final endController = TextEditingController(text: "2026-11-23");
    final reasonController = TextEditingController();

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: isDark ? const Color(0xFF0D2823) : AppColors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (ctx) {
        return StatefulBuilder(
          builder: (context, setSheetState) {
            return Padding(
              padding: EdgeInsets.only(
                left: 20,
                right: 20,
                top: 24,
                bottom: MediaQuery.of(context).viewInsets.bottom + 24,
              ),
              child: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Text(
                      "REQUEST TIME OFF / LEAVE",
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 1.0,
                        color: isDark ? AppColors.gold : AppColors.emerald,
                      ),
                    ),
                    const SizedBox(height: 16),
                    DropdownButtonFormField<String>(
                      value: leaveType,
                      decoration: const InputDecoration(labelText: "Leave Category"),
                      items: ["ANNUAL", "SICK", "EMERGENCY", "COMPENSATORY"].map((s) {
                        return DropdownMenuItem(value: s, child: Text(s));
                      }).toList(),
                      onChanged: (v) {
                        if (v != null) setSheetState(() => leaveType = v);
                      },
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(
                          child: TextField(
                            controller: startController,
                            decoration: const InputDecoration(labelText: "Start Date (YYYY-MM-DD)"),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: TextField(
                            controller: endController,
                            decoration: const InputDecoration(labelText: "End Date (YYYY-MM-DD)"),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      controller: reasonController,
                      maxLines: 2,
                      decoration: const InputDecoration(
                        labelText: "Reason for absence",
                        hintText: "Annual family holiday leave...",
                      ),
                    ),
                    const SizedBox(height: 20),
                    ElevatedButton(
                      onPressed: () {
                        if (reasonController.text.trim().isEmpty) return;
                        final req = LeaveRequest(
                          id: "leave_${DateTime.now().millisecondsSinceEpoch}",
                          guardId: widget.state.currentUser?.id ?? "guard_001",
                          guardName: widget.state.currentUser?.name ?? "Officer",
                          startDate: startController.text.trim(),
                          endDate: endController.text.trim(),
                          leaveType: leaveType,
                          reason: reasonController.text.trim(),
                          status: "PENDING",
                          requestedAt: DateTime.now().millisecondsSinceEpoch,
                        );
                        widget.state.addLeaveRequest(req);
                        Navigator.pop(ctx);
                        setState(() {});
                      },
                      child: const Text("SUBMIT LEAVE REQUEST"),
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardBorder = isDark ? const Color(0xFF214A43) : AppColors.lineColor;
    final requests = widget.state.leaveRequests;

    return Scaffold(
      appBar: AppBar(
        title: const Text("TIME OFF & LEAVE"),
      ),
      floatingActionButton: FloatingActionButton.extended(
        elevation: 0,
        backgroundColor: isDark ? AppColors.gold : AppColors.emerald,
        foregroundColor: isDark ? AppColors.forest : Colors.white,
        icon: const Icon(Icons.add),
        label: const Text("REQUEST LEAVE"),
        onPressed: () => _openRequestModal(context),
      ),
      body: requests.isEmpty
          ? Center(
              child: Text(
                "No active leave requests.",
                style: TextStyle(
                  color: isDark ? AppColors.statusNeutralDark : AppColors.textMuted,
                ),
              ),
            )
          : ListView.separated(
              padding: const EdgeInsets.all(16.0),
              itemCount: requests.length,
              separatorBuilder: (_, __) => const SizedBox(height: 12),
              itemBuilder: (context, index) {
                final req = requests[index];

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
                            "${req.leaveType} LEAVE",
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.bold,
                              color: isDark ? AppColors.gold : AppColors.emerald,
                            ),
                          ),
                          StatusBadge.generic(
                            req.status,
                            color: req.status == "APPROVED" ? AppColors.statusSuccess : AppColors.statusWarning,
                            isDark: isDark,
                          ),
                        ],
                      ),
                      const SizedBox(height: 6),
                      Text(
                        "Dates: ${req.startDate} to ${req.endDate}",
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: isDark ? Colors.white : AppColors.ink,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        req.reason,
                        style: TextStyle(
                          fontSize: 12,
                          color: isDark ? AppColors.statusNeutralDark : AppColors.textMuted,
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
    );
  }
}
