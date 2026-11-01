import 'package:flutter/material.dart';
import '../models/models.dart';
import '../services/guard_state.dart';
import '../theme/app_theme.dart';
import '../widgets/status_badge.dart';

class ReportsScreen extends StatefulWidget {
  final GuardState state;

  const ReportsScreen({
    Key? key,
    required this.state,
  }) : super(key: key);

  @override
  State<ReportsScreen> createState() => _ReportsScreenState();
}

class _ReportsScreenState extends State<ReportsScreen> {
  void _openNewReportDialog(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final typeController = TextEditingController(text: "Suspicious Activity");
    final descController = TextEditingController();
    String severity = "MEDIUM";
    String selectedSite = widget.state.todayShift?.siteName ?? "Apex Tower HQ";

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
                      "FILE INCIDENT REPORT",
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 1.0,
                        color: isDark ? AppColors.gold : AppColors.emerald,
                      ),
                    ),
                    const SizedBox(height: 16),
                    TextField(
                      controller: typeController,
                      decoration: const InputDecoration(labelText: "Incident Type"),
                    ),
                    const SizedBox(height: 12),
                    DropdownButtonFormField<String>(
                      value: severity,
                      decoration: const InputDecoration(labelText: "Severity Level"),
                      items: ["LOW", "MEDIUM", "HIGH", "CRITICAL"].map((s) {
                        return DropdownMenuItem(value: s, child: Text(s));
                      }).toList(),
                      onChanged: (v) {
                        if (v != null) setSheetState(() => severity = v);
                      },
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      controller: descController,
                      maxLines: 3,
                      decoration: const InputDecoration(
                        labelText: "Detailed Observations & Actions Taken",
                        hintText: "Describe location, individuals, and measures taken...",
                      ),
                    ),
                    const SizedBox(height: 20),
                    ElevatedButton(
                      onPressed: () {
                        if (descController.text.trim().isEmpty) return;
                        final newReport = SecurityReport(
                          id: "rep_${DateTime.now().millisecondsSinceEpoch}",
                          guardId: widget.state.currentUser?.id ?? "guard_001",
                          guardName: widget.state.currentUser?.name ?? "Officer",
                          siteId: "site_alpha",
                          siteName: selectedSite,
                          timestamp: DateTime.now().millisecondsSinceEpoch,
                          incidentType: typeController.text.trim(),
                          description: descController.text.trim(),
                          severity: severity,
                        );
                        widget.state.addReport(newReport);
                        Navigator.pop(ctx);
                        setState(() {});
                      },
                      child: const Text("SUBMIT SECURITY INCIDENT"),
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

  Color _severityColor(String sev) {
    switch (sev) {
      case "CRITICAL":
      case "HIGH":
        return AppColors.statusDanger;
      case "MEDIUM":
        return AppColors.statusWarning;
      default:
        return AppColors.statusInfo;
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardBorder = isDark ? const Color(0xFF214A43) : AppColors.lineColor;
    final reports = widget.state.reports;

    return Scaffold(
      appBar: AppBar(
        title: const Text("INCIDENT LOGBOOK"),
      ),
      floatingActionButton: FloatingActionButton.extended(
        elevation: 0,
        backgroundColor: isDark ? AppColors.gold : AppColors.emerald,
        foregroundColor: isDark ? AppColors.forest : Colors.white,
        icon: const Icon(Icons.add_alert),
        label: const Text("FILE REPORT"),
        onPressed: () => _openNewReportDialog(context),
      ),
      body: reports.isEmpty
          ? Center(
              child: Text(
                "No security incident reports on record.",
                style: TextStyle(
                  color: isDark ? AppColors.statusNeutralDark : AppColors.textMuted,
                ),
              ),
            )
          : ListView.separated(
              padding: const EdgeInsets.all(16.0),
              itemCount: reports.length,
              separatorBuilder: (_, __) => const SizedBox(height: 12),
              itemBuilder: (context, index) {
                final rep = reports[index];
                final date = DateTime.fromMillisecondsSinceEpoch(rep.timestamp).toLocal();

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
                            rep.incidentType,
                            style: TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.bold,
                              color: isDark ? Colors.white : AppColors.ink,
                            ),
                          ),
                          StatusBadge.generic(
                            rep.severity,
                            color: _severityColor(rep.severity),
                            isDark: isDark,
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(
                        "${rep.siteName} • ${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')} ${date.hour.toString().padLeft(2, '0')}:${date.minute.toString().padLeft(2, '0')}",
                        style: TextStyle(
                          fontSize: 12,
                          color: isDark ? AppColors.gold300 : AppColors.gold600,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        rep.description,
                        style: TextStyle(
                          fontSize: 13,
                          color: isDark ? Colors.white70 : AppColors.ink,
                        ),
                      ),
                      const Divider(height: 18),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            "Logged by: ${rep.guardName}",
                            style: TextStyle(
                              fontSize: 11,
                              color: isDark ? AppColors.statusNeutralDark : AppColors.textMuted,
                            ),
                          ),
                          StatusBadge.generic(
                            rep.status,
                            color: AppColors.statusSuccess,
                            isDark: isDark,
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
}
