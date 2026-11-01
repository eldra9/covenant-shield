import 'dart:async';
import 'package:flutter/material.dart';
import '../models/models.dart';
import '../services/guard_state.dart';
import '../theme/app_theme.dart';
import '../widgets/guilloche_seal.dart';
import '../widgets/network_banner.dart';
import '../widgets/seal_button.dart';
import '../widgets/shift_arc.dart';
import '../widgets/status_badge.dart';

class DashboardScreen extends StatefulWidget {
  final GuardState state;
  final Function(Shift) onNavigateToCheckIn;
  final Function(AttendanceRecord) onNavigateToCheckOut;
  final VoidCallback onNavigateToShifts;
  final VoidCallback onNavigateToAttendance;
  final VoidCallback onNavigateToReports;
  final VoidCallback onNavigateToLeave;
  final VoidCallback onNavigateToSwaps;
  final VoidCallback onNavigateToNotifications;
  final VoidCallback onNavigateToProfile;

  const DashboardScreen({
    Key? key,
    required this.state,
    required this.onNavigateToCheckIn,
    required this.onNavigateToCheckOut,
    required this.onNavigateToShifts,
    required this.onNavigateToAttendance,
    required this.onNavigateToReports,
    required this.onNavigateToLeave,
    required this.onNavigateToSwaps,
    required this.onNavigateToNotifications,
    required this.onNavigateToProfile,
  }) : super(key: key);

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  Timer? _clockTimer;
  DateTime _currentTime = DateTime.now();

  @override
  void initState() {
    super.initState();
    _clockTimer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (mounted) {
        setState(() {
          _currentTime = DateTime.now();
        });
      }
    });
  }

  @override
  void dispose() {
    _clockTimer?.cancel();
    super.dispose();
  }

  String _formatTime(DateTime dt) {
    final hour = dt.hour.toString().padLeft(2, '0');
    final minute = dt.minute.toString().padLeft(2, '0');
    final second = dt.second.toString().padLeft(2, '0');
    return "$hour:$minute:$second";
  }

  String _formatElapsed(int startMs) {
    final diffMs = (_currentTime.millisecondsSinceEpoch - startMs).clamp(0, 864000000);
    final totalSec = diffMs ~/ 1000;
    final hours = (totalSec ~/ 3600).toString().padLeft(2, '0');
    final minutes = ((totalSec % 3600) ~/ 60).toString().padLeft(2, '0');
    final seconds = (totalSec % 60).toString().padLeft(2, '0');
    return "$hours:$minutes:$seconds";
  }

  void _showFallbackConfirmSheet(BuildContext context, String actionTitle, VoidCallback onConfirm) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    showModalBottomSheet(
      context: context,
      backgroundColor: isDark ? const Color(0xFF0D2823) : AppColors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (ctx) {
        return Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(
                actionTitle,
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: isDark ? AppColors.gold : AppColors.emerald,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                "Verify officer credentials and submit timestamped cryptographic record to central security dispatch.",
                style: TextStyle(
                  fontSize: 13,
                  color: isDark ? AppColors.statusNeutralDark : AppColors.textMuted,
                ),
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: () {
                  Navigator.pop(ctx);
                  onConfirm();
                },
                child: const Text("CONFIRM & STAMP"),
              ),
              const SizedBox(height: 12),
              OutlinedButton(
                onPressed: () => Navigator.pop(ctx),
                child: const Text("CANCEL"),
              ),
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final state = widget.state;
    final user = state.currentUser;
    final todayShift = state.todayShift;
    final attendance = state.todayAttendanceRecord;
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardBorder = isDark ? const Color(0xFF214A43) : AppColors.lineColor;

    final isCheckedIn = attendance?.checkInTime != null;
    final isCheckedOut = attendance?.checkOutTime != null;
    final isOnDuty = isCheckedIn && !isCheckedOut;
    final isCompleted = isCheckedIn && isCheckedOut;

    // Shift progress calculation
    double progress = 0.0;
    if (isOnDuty && attendance?.checkInTime != null) {
      final elapsedSec = (_currentTime.millisecondsSinceEpoch - attendance!.checkInTime!) / 1000.0;
      progress = (elapsedSec / (8 * 3600.0)).clamp(0.0, 1.0);
    } else if (isCompleted) {
      progress = 1.0;
    }

    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              "COVENANT SHIELD",
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, letterSpacing: 1.0),
            ),
            Text(
              "AEGISGUARD TERMINAL • POST #42",
              style: TextStyle(
                fontSize: 10,
                color: AppColors.gold300,
                fontWeight: FontWeight.w600,
                letterSpacing: 0.8,
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: Icon(state.isDarkMode ? Icons.light_mode : Icons.dark_mode),
            tooltip: "Toggle Night Watch",
            onPressed: () => state.toggleDarkMode(),
          ),
          Stack(
            children: [
              IconButton(
                icon: const Icon(Icons.notifications_outlined),
                tooltip: "Notifications",
                onPressed: widget.onNavigateToNotifications,
              ),
              if (state.unreadNotificationsCount > 0)
                Positioned(
                  right: 8,
                  top: 8,
                  child: Container(
                    padding: const EdgeInsets.all(4),
                    decoration: const BoxDecoration(
                      color: AppColors.statusDanger,
                      shape: BoxShape.circle,
                    ),
                    constraints: const BoxConstraints(minWidth: 16, minHeight: 16),
                    child: Text(
                      '${state.unreadNotificationsCount}',
                      style: const TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.bold),
                      textAlign: TextAlign.center,
                    ),
                  ),
                ),
            ],
          ),
          IconButton(
            icon: const Icon(Icons.account_circle_outlined),
            tooltip: "Guard Profile",
            onPressed: widget.onNavigateToProfile,
          ),
        ],
      ),
      body: Column(
        children: [
          // Network Banner
          NetworkBanner(
            isOnline: state.isOnline,
            queuedCount: state.offlineQueue.length,
            onToggle: () => state.toggleOnlineStatus(),
          ),

          // Main Scrollable Area
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Officer Identity Card
                  Container(
                    padding: const EdgeInsets.all(14.0),
                    decoration: BoxDecoration(
                      color: isDark ? const Color(0xFF0D2823) : AppColors.white,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: cardBorder, width: 1.0),
                    ),
                    child: Row(
                      children: [
                        CircleAvatar(
                          radius: 22,
                          backgroundColor: isDark ? AppColors.forest3 : AppColors.emerald50,
                          child: Icon(
                            Icons.shield_outlined,
                            color: isDark ? AppColors.gold : AppColors.emerald,
                            size: 24,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                user?.name ?? "Officer",
                                style: TextStyle(
                                  fontSize: 15,
                                  fontWeight: FontWeight.bold,
                                  color: isDark ? Colors.white : AppColors.ink,
                                ),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                "${user?.role ?? 'Patrol Officer'} • Badge: ${user?.badgeNumber ?? 'N/A'}",
                                style: TextStyle(
                                  fontSize: 12,
                                  color: isDark ? AppColors.statusNeutralDark : AppColors.textMuted,
                                ),
                              ),
                            ],
                          ),
                        ),
                        StatusBadge.generic(
                          isOnDuty ? "ON DUTY" : (isCompleted ? "COMPLETED" : "OFF DUTY"),
                          color: isOnDuty ? AppColors.statusSuccess : AppColors.gold,
                          isDark: isDark,
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Today's Shift Pass Card
                  if (todayShift != null)
                    Container(
                      padding: const EdgeInsets.all(18.0),
                      decoration: BoxDecoration(
                        color: isDark ? const Color(0xFF0D2823) : AppColors.white,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: cardBorder, width: 1.0),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    "TODAY'S POST ASSIGNMENT",
                                    style: TextStyle(
                                      fontSize: 11,
                                      fontWeight: FontWeight.bold,
                                      letterSpacing: 1.0,
                                      color: isDark ? AppColors.gold : AppColors.emerald,
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    todayShift.siteName,
                                    style: TextStyle(
                                      fontSize: 18,
                                      fontWeight: FontWeight.bold,
                                      color: isDark ? Colors.white : AppColors.ink,
                                    ),
                                  ),
                                ],
                              ),
                              GuillocheSeal(
                                size: 48,
                                strokeColor: AppColors.gold.withOpacity(0.4),
                                strokeWidth: 1.0,
                              ),
                            ],
                          ),
                          const SizedBox(height: 6),
                          Text(
                            todayShift.siteAddress,
                            style: TextStyle(
                              fontSize: 12,
                              color: isDark ? AppColors.statusNeutralDark : AppColors.textMuted,
                            ),
                          ),
                          const Divider(height: 24),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              _infoItem("HOURS", "${todayShift.startTime} - ${todayShift.endTime}", isDark),
                              _infoItem("ROLE", todayShift.role, isDark),
                              _infoItem("DATE", todayShift.date, isDark),
                            ],
                          ),
                        ],
                      ),
                    ),
                  const SizedBox(height: 20),

                  // Shift Arc & Interactive Seal Section
                  Container(
                    padding: const EdgeInsets.symmetric(vertical: 24.0, horizontal: 16.0),
                    decoration: BoxDecoration(
                      color: isDark ? const Color(0xFF0D2823) : AppColors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: cardBorder, width: 1.0),
                    ),
                    child: Column(
                      children: [
                        ShiftArc(
                          progress: progress,
                          currentTimeFormatted: _formatTime(_currentTime),
                          shiftHoursLabel: isOnDuty
                              ? "ELAPSED: ${_formatElapsed(attendance!.checkInTime!)}"
                              : "SCHEDULED: 8.0 HRS",
                          statusText: isOnDuty ? "POST ACTIVE" : (isCompleted ? "DUTY SEALED" : "AWAITING CHECK-IN"),
                        ),
                        const SizedBox(height: 24),

                        // Interactive Seal Button
                        if (!isCheckedIn) ...[
                          SealButton(
                            label: "VERIFY & CHECK IN",
                            sublabel: "HOLD TO SEAL ATTENDANCE",
                            onHoldComplete: () {
                              if (todayShift != null) {
                                widget.onNavigateToCheckIn(todayShift);
                              }
                            },
                            onTapFallback: () {
                              if (todayShift != null) {
                                _showFallbackConfirmSheet(
                                  context,
                                  "Confirm Check-In at ${todayShift.siteName}",
                                  () => widget.onNavigateToCheckIn(todayShift),
                                );
                              }
                            },
                          ),
                          const SizedBox(height: 8),
                          Text(
                            "Hold button for 1 second or tap for alternate confirmation",
                            style: TextStyle(
                              fontSize: 11,
                              color: isDark ? AppColors.statusNeutralDark : AppColors.textMuted,
                            ),
                          ),
                        ] else if (isOnDuty) ...[
                          SealButton(
                            label: "SEAL CHECK OUT",
                            sublabel: "HOLD TO END SHIFT",
                            onHoldComplete: () {
                              if (attendance != null) {
                                widget.onNavigateToCheckOut(attendance);
                              }
                            },
                            onTapFallback: () {
                              if (attendance != null) {
                                _showFallbackConfirmSheet(
                                  context,
                                  "Confirm Check-Out from ${attendance.siteName}",
                                  () => widget.onNavigateToCheckOut(attendance),
                                );
                              }
                            },
                          ),
                          const SizedBox(height: 8),
                          Text(
                            "Checked in at ${DateTime.fromMillisecondsSinceEpoch(attendance!.checkInTime!).toLocal().toString().substring(11, 16)}",
                            style: TextStyle(
                              fontSize: 11,
                              color: isDark ? AppColors.statusSuccessDark : AppColors.statusSuccess,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ] else ...[
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                            decoration: BoxDecoration(
                              color: isDark ? AppColors.statusSuccessDarkTint : AppColors.statusSuccessTint,
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(
                                color: (isDark ? AppColors.statusSuccessDark : AppColors.statusSuccess).withOpacity(0.4),
                              ),
                            ),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(
                                  Icons.verified,
                                  color: isDark ? AppColors.statusSuccessDark : AppColors.statusSuccess,
                                  size: 20,
                                ),
                                const SizedBox(width: 8),
                                Text(
                                  "SHIFT DUTY COMPLETED • ALL LOGS SEALED",
                                  style: TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.bold,
                                    color: isDark ? AppColors.statusSuccessDark : AppColors.statusSuccess,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),

                  // Quick Operational Actions Grid
                  Text(
                    "GUARD OPERATIONAL MODULES",
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 1.0,
                      color: isDark ? AppColors.gold : AppColors.emerald,
                    ),
                  ),
                  const SizedBox(height: 12),
                  GridView.count(
                    crossAxisCount: 2,
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    mainAxisSpacing: 12,
                    crossAxisSpacing: 12,
                    childAspectRatio: 1.4,
                    children: [
                      _actionCard(
                        icon: Icons.qr_code_scanner,
                        title: "Check-In / Out",
                        subtitle: "Site QR & Geofence",
                        isDark: isDark,
                        borderColor: cardBorder,
                        onTap: () {
                          if (todayShift != null) {
                            if (!isCheckedIn) {
                              widget.onNavigateToCheckIn(todayShift);
                            } else if (attendance != null) {
                              widget.onNavigateToCheckOut(attendance);
                            }
                          }
                        },
                      ),
                      _actionCard(
                        icon: Icons.calendar_month,
                        title: "Shift Schedule",
                        subtitle: "${state.shifts.length} active shifts",
                        isDark: isDark,
                        borderColor: cardBorder,
                        onTap: widget.onNavigateToShifts,
                      ),
                      _actionCard(
                        icon: Icons.report_problem_outlined,
                        title: "Incident Reports",
                        subtitle: "${state.reports.length} logged incidents",
                        isDark: isDark,
                        borderColor: cardBorder,
                        onTap: widget.onNavigateToReports,
                      ),
                      _actionCard(
                        icon: Icons.swap_horiz,
                        title: "Shift Swaps",
                        subtitle: "${state.shiftSwapRequests.length} pending requests",
                        isDark: isDark,
                        borderColor: cardBorder,
                        onTap: widget.onNavigateToSwaps,
                      ),
                      _actionCard(
                        icon: Icons.history,
                        title: "Attendance Logs",
                        subtitle: "Cryptographic history",
                        isDark: isDark,
                        borderColor: cardBorder,
                        onTap: widget.onNavigateToAttendance,
                      ),
                      _actionCard(
                        icon: Icons.event_busy,
                        title: "Leave Requests",
                        subtitle: "${state.leaveRequests.length} submitted",
                        isDark: isDark,
                        borderColor: cardBorder,
                        onTap: widget.onNavigateToLeave,
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _infoItem(String label, String value, bool isDark) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: 10,
            fontWeight: FontWeight.bold,
            letterSpacing: 0.8,
            color: isDark ? AppColors.statusNeutralDark : AppColors.textMuted,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          value,
          style: TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: isDark ? Colors.white : AppColors.ink,
          ),
        ),
      ],
    );
  }

  Widget _actionCard({
    required IconData icon,
    required String title,
    required String subtitle,
    required bool isDark,
    required Color borderColor,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.all(14.0),
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF0D2823) : AppColors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: borderColor, width: 1.0),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Icon(
              icon,
              color: isDark ? AppColors.gold : AppColors.emerald,
              size: 26,
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.bold,
                    color: isDark ? Colors.white : AppColors.ink,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  subtitle,
                  style: TextStyle(
                    fontSize: 11,
                    color: isDark ? AppColors.statusNeutralDark : AppColors.textMuted,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
