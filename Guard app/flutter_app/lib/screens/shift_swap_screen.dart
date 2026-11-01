import 'package:flutter/material.dart';
import '../models/models.dart';
import '../services/guard_state.dart';
import '../theme/app_theme.dart';
import '../widgets/status_badge.dart';

class ShiftSwapScreen extends StatefulWidget {
  final GuardState state;

  const ShiftSwapScreen({Key? key, required this.state}) : super(key: key);

  @override
  State<ShiftSwapScreen> createState() => _ShiftSwapScreenState();
}

class _ShiftSwapScreenState extends State<ShiftSwapScreen> {
  void _openSwapModal(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    // No peer guard list available from backend yet — use placeholder
    const User placeholderGuard = User(
      id: 'peer',
      name: 'Peer Guard',
      badgeNumber: 'CS-000',
      email: '',
      phone: '',
      role: 'Security Officer',
      department: '',
      emergencyContact: '',
    );
    final otherGuards = [placeholderGuard];
    User targetGuard = placeholderGuard;
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
                      "PROPOSE SHIFT SWAP",
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 1.0,
                        color: isDark ? AppColors.gold : AppColors.emerald,
                      ),
                    ),
                    const SizedBox(height: 16),
                    DropdownButtonFormField<User>(
                      value: targetGuard,
                      decoration: const InputDecoration(labelText: "Target Officer"),
                      items: otherGuards.map((g) {
                        return DropdownMenuItem(value: g, child: Text("${g.name} (${g.badgeNumber})"));
                      }).toList(),
                      onChanged: (v) {
                        if (v != null) setSheetState(() => targetGuard = v);
                      },
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      controller: reasonController,
                      maxLines: 2,
                      decoration: const InputDecoration(
                        labelText: "Reason for Swap Request",
                        hintText: "Need early shift due to family obligation...",
                      ),
                    ),
                    const SizedBox(height: 20),
                    ElevatedButton(
                      onPressed: () {
                        if (reasonController.text.trim().isEmpty) return;
                        final req = ShiftSwapRequest(
                          id: "swap_${DateTime.now().millisecondsSinceEpoch}",
                          requesterGuardId: widget.state.currentUser?.id ?? "guard_001",
                          requesterGuardName: widget.state.currentUser?.name ?? "Officer",
                          targetGuardId: targetGuard.id,
                          targetGuardName: targetGuard.name,
                          originalShiftId: widget.state.shifts.first.id,
                          targetShiftId: "shift_target",
                          reason: reasonController.text.trim(),
                          status: "PENDING",
                          requestedAt: DateTime.now().millisecondsSinceEpoch,
                        );
                        widget.state.addShiftSwapRequest(req);
                        Navigator.pop(ctx);
                        setState(() {});
                      },
                      child: const Text("SUBMIT SWAP PROPOSAL"),
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
    final swaps = widget.state.shiftSwapRequests;

    return Scaffold(
      appBar: AppBar(
        title: const Text("SHIFT SWAP EXCHANGE"),
      ),
      floatingActionButton: FloatingActionButton.extended(
        elevation: 0,
        backgroundColor: isDark ? AppColors.gold : AppColors.emerald,
        foregroundColor: isDark ? AppColors.forest : Colors.white,
        icon: const Icon(Icons.swap_calls),
        label: const Text("PROPOSE SWAP"),
        onPressed: () => _openSwapModal(context),
      ),
      body: swaps.isEmpty
          ? Center(
              child: Text(
                "No pending shift swaps.",
                style: TextStyle(
                  color: isDark ? AppColors.statusNeutralDark : AppColors.textMuted,
                ),
              ),
            )
          : ListView.separated(
              padding: const EdgeInsets.all(16.0),
              itemCount: swaps.length,
              separatorBuilder: (_, __) => const SizedBox(height: 12),
              itemBuilder: (context, index) {
                final s = swaps[index];

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
                            "SWAP PROPOSAL",
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 1.0,
                              color: isDark ? AppColors.gold : AppColors.emerald,
                            ),
                          ),
                          StatusBadge.generic(
                            s.status,
                            color: s.status == "ACCEPTED" ? AppColors.statusSuccess : AppColors.statusWarning,
                            isDark: isDark,
                          ),
                        ],
                      ),
                      const SizedBox(height: 6),
                      Text(
                        "${s.requesterGuardName} ➔ ${s.targetGuardName}",
                        style: TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.bold,
                          color: isDark ? Colors.white : AppColors.ink,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        "Reason: ${s.reason}",
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
