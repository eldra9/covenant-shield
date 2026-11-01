import 'package:flutter/material.dart';
import '../models/models.dart';
import '../services/guard_state.dart';
import '../theme/app_theme.dart';
import '../widgets/guilloche_seal.dart';
import '../widgets/seal_button.dart';

class CheckOutScreen extends StatefulWidget {
  final AttendanceRecord record;
  final GuardState state;
  final VoidCallback onComplete;

  const CheckOutScreen({
    Key? key,
    required this.record,
    required this.state,
    required this.onComplete,
  }) : super(key: key);

  @override
  State<CheckOutScreen> createState() => _CheckOutScreenState();
}

class _CheckOutScreenState extends State<CheckOutScreen> {
  final _handoverNotesController = TextEditingController();
  bool _checklistLock = true;
  bool _checklistKeys = true;
  bool _checklistIncidents = true;
  bool _isSubmitting = false;

  @override
  void dispose() {
    _handoverNotesController.dispose();
    super.dispose();
  }

  void _performCheckOut() async {
    setState(() {
      _isSubmitting = true;
    });

    await widget.state.checkOut(
      widget.record,
      method: "SEAL_HOLD",
      notes: _handoverNotesController.text.trim().isEmpty ? null : _handoverNotesController.text.trim(),
    );

    if (mounted) {
      setState(() {
        _isSubmitting = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text("Shift Duty Completed & Official Seal Recorded"),
          backgroundColor: AppColors.statusSuccess,
        ),
      );
      widget.onComplete();
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardBorder = isDark ? const Color(0xFF214A43) : AppColors.lineColor;

    final checkInDate = widget.record.checkInTime != null
        ? DateTime.fromMillisecondsSinceEpoch(widget.record.checkInTime!).toLocal()
        : DateTime.now();

    final elapsedMs = DateTime.now().millisecondsSinceEpoch - (widget.record.checkInTime ?? DateTime.now().millisecondsSinceEpoch);
    final hours = (elapsedMs / (1000 * 3600)).toStringAsFixed(1);

    return Scaffold(
      appBar: AppBar(
        title: const Text("SHIFT HANDOVER & CHECK-OUT"),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Shift Summary Card
            Container(
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
                        "SHIFT COMPLETION SUMMARY",
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 1.0,
                          color: isDark ? AppColors.gold : AppColors.emerald,
                        ),
                      ),
                      GuillocheSeal(
                        size: 36,
                        strokeColor: AppColors.gold.withOpacity(0.5),
                        strokeWidth: 1.0,
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    widget.record.siteName,
                    style: TextStyle(
                      fontSize: 17,
                      fontWeight: FontWeight.bold,
                      color: isDark ? Colors.white : AppColors.ink,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    "Checked in at: ${checkInDate.hour.toString().padLeft(2, '0')}:${checkInDate.minute.toString().padLeft(2, '0')} • Duration on post: $hours hrs",
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: isDark ? AppColors.gold300 : AppColors.emerald,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // End-of-Shift Verification Checklist
            Container(
              padding: const EdgeInsets.all(16.0),
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF0D2823) : AppColors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: cardBorder, width: 1.0),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    "MANDATORY HANDOVER CHECKLIST",
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 1.0,
                      color: isDark ? AppColors.gold : AppColors.emerald,
                    ),
                  ),
                  const SizedBox(height: 8),
                  CheckboxListTile(
                    title: const Text("All perimeter access gates & doors verified locked"),
                    value: _checklistLock,
                    activeColor: isDark ? AppColors.gold : AppColors.emerald,
                    contentPadding: EdgeInsets.zero,
                    onChanged: (v) => setState(() => _checklistLock = v ?? true),
                  ),
                  CheckboxListTile(
                    title: const Text("Master keys and patrol radio deposited to vault"),
                    value: _checklistKeys,
                    activeColor: isDark ? AppColors.gold : AppColors.emerald,
                    contentPadding: EdgeInsets.zero,
                    onChanged: (v) => setState(() => _checklistKeys = v ?? true),
                  ),
                  CheckboxListTile(
                    title: const Text("All station logbook incidents resolved or escalated"),
                    value: _checklistIncidents,
                    activeColor: isDark ? AppColors.gold : AppColors.emerald,
                    contentPadding: EdgeInsets.zero,
                    onChanged: (v) => setState(() => _checklistIncidents = v ?? true),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Relieving Guard / Handover Notes
            TextField(
              controller: _handoverNotesController,
              maxLines: 3,
              decoration: const InputDecoration(
                labelText: "Shift Handover Remarks to Relieving Guard",
                hintText: "All sectors secure. Loading bay #2 night sensor re-calibrated. Handed over to Officer Jenkins.",
              ),
            ),
            const SizedBox(height: 24),

            // Hold to Seal Button
            Center(
              child: SealButton(
                label: "SEAL CHECK-OUT",
                sublabel: "HOLD TO CLOSE SHIFT",
                isLoading: _isSubmitting,
                onHoldComplete: _performCheckOut,
                onTapFallback: _performCheckOut,
              ),
            ),
            const SizedBox(height: 12),
            Center(
              child: Text(
                "Final duty record will be signed with dispatch encryption",
                style: TextStyle(
                  fontSize: 11,
                  color: isDark ? AppColors.statusNeutralDark : AppColors.textMuted,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
