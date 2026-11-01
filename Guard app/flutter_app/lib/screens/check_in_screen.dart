import 'package:flutter/material.dart';
import '../models/models.dart';
import '../services/guard_state.dart';
import '../theme/app_theme.dart';
import '../widgets/guilloche_seal.dart';
import '../widgets/seal_button.dart';

class CheckInScreen extends StatefulWidget {
  final Shift shift;
  final GuardState state;
  final VoidCallback onComplete;

  const CheckInScreen({
    Key? key,
    required this.shift,
    required this.state,
    required this.onComplete,
  }) : super(key: key);

  @override
  State<CheckInScreen> createState() => _CheckInScreenState();
}

class _CheckInScreenState extends State<CheckInScreen> {
  final _notesController = TextEditingController();
  bool _isQrScanned = true;
  bool _isGeofenceValid = true;
  bool _isSubmitting = false;

  @override
  void dispose() {
    _notesController.dispose();
    super.dispose();
  }

  void _performCheckIn() async {
    setState(() {
      _isSubmitting = true;
    });

    await widget.state.checkIn(
      widget.shift,
      method: "QR_AND_GEOFENCE",
      notes: _notesController.text.trim().isEmpty ? null : _notesController.text.trim(),
    );

    if (mounted) {
      setState(() {
        _isSubmitting = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text("Shift Check-In Cryptographically Sealed & Recorded"),
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

    return Scaffold(
      appBar: AppBar(
        title: const Text("SITE CHECK-IN VERIFICATION"),
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
                        "ASSIGNED FACILITY",
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 1.0,
                          color: isDark ? AppColors.gold : AppColors.emerald,
                        ),
                      ),
                      GuillocheSeal(
                        size: 32,
                        strokeColor: AppColors.gold.withOpacity(0.5),
                        strokeWidth: 0.9,
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    widget.shift.siteName,
                    style: TextStyle(
                      fontSize: 17,
                      fontWeight: FontWeight.bold,
                      color: isDark ? Colors.white : AppColors.ink,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    widget.shift.siteAddress,
                    style: TextStyle(
                      fontSize: 12,
                      color: isDark ? AppColors.statusNeutralDark : AppColors.textMuted,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    "Shift Window: ${widget.shift.startTime} - ${widget.shift.endTime} • Role: ${widget.shift.role}",
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

            // Geofence Validation Card
            Container(
              padding: const EdgeInsets.all(16.0),
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF0D2823) : AppColors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: _isGeofenceValid
                      ? (isDark ? AppColors.statusSuccessDark : AppColors.statusSuccess).withOpacity(0.5)
                      : cardBorder,
                  width: 1.0,
                ),
              ),
              child: Row(
                children: [
                  Icon(
                    _isGeofenceValid ? Icons.location_on : Icons.location_off,
                    color: _isGeofenceValid
                        ? (isDark ? AppColors.statusSuccessDark : AppColors.statusSuccess)
                        : AppColors.statusDanger,
                    size: 28,
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          _isGeofenceValid ? "GEOFENCE PERIMETER VERIFIED" : "OUTSIDE GEOFENCE",
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 0.8,
                            color: _isGeofenceValid
                                ? (isDark ? AppColors.statusSuccessDark : AppColors.statusSuccess)
                                : AppColors.statusDanger,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          "GPS: 37.7749° N, 122.4194° W • Distance: 28m (Radius: 150m)",
                          style: TextStyle(
                            fontSize: 11,
                            color: isDark ? AppColors.statusNeutralDark : AppColors.textMuted,
                          ),
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.refresh),
                    tooltip: "Refresh Geofence",
                    onPressed: () {
                      setState(() {
                        _isGeofenceValid = true;
                      });
                    },
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // QR Scanner Viewfinder Mock
            Container(
              height: 220,
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF071412) : const Color(0xFF1E2926),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(
                  color: isDark ? AppColors.gold : AppColors.emerald,
                  width: 1.5,
                ),
              ),
              child: Stack(
                alignment: Alignment.center,
                children: [
                  // Scanner corner targets
                  CustomPaint(
                    size: const Size(160, 160),
                    painter: _ViewfinderPainter(
                      color: AppColors.gold,
                    ),
                  ),

                  // Center icon / payload status
                  Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        _isQrScanned ? Icons.qr_code_2 : Icons.camera_alt_outlined,
                        color: AppColors.gold,
                        size: 54,
                      ),
                      const SizedBox(height: 10),
                      Text(
                        _isQrScanned ? "CRYPTOGRAPHIC QR TOKEN LOCKED" : "ALIGN SITE QR CODE",
                        style: const TextStyle(
                          color: AppColors.white,
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 1.0,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        widget.shift.qrCodePayload,
                        style: TextStyle(
                          color: AppColors.gold300,
                          fontSize: 10,
                          fontFamily: 'Courier',
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Handover / Shift Notes Input
            TextField(
              controller: _notesController,
              maxLines: 2,
              decoration: const InputDecoration(
                labelText: "Pre-Shift Notes & Equipment Handover (Optional)",
                hintText: "Radio #04, Keys, Body Cam secured in good condition...",
              ),
            ),
            const SizedBox(height: 24),

            // Hold to Seal Button
            Center(
              child: SealButton(
                label: "SEAL CHECK-IN",
                sublabel: "HOLD TO COMMIT RECORD",
                isLoading: _isSubmitting,
                onHoldComplete: _performCheckIn,
                onTapFallback: _performCheckIn,
              ),
            ),
            const SizedBox(height: 12),
            Center(
              child: Text(
                "Digital signature secured with SHA-256 station seal",
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

class _ViewfinderPainter extends CustomPainter {
  final Color color;

  _ViewfinderPainter({required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..strokeWidth = 3.0
      ..style = PaintingStyle.stroke;

    const cornerLength = 24.0;

    // Top-Left
    canvas.drawLine(const Offset(0, 0), const Offset(cornerLength, 0), paint);
    canvas.drawLine(const Offset(0, 0), const Offset(0, cornerLength), paint);

    // Top-Right
    canvas.drawLine(Offset(size.width, 0), Offset(size.width - cornerLength, 0), paint);
    canvas.drawLine(Offset(size.width, 0), Offset(size.width, cornerLength), paint);

    // Bottom-Left
    canvas.drawLine(Offset(0, size.height), Offset(cornerLength, size.height), paint);
    canvas.drawLine(Offset(0, size.height), Offset(0, size.height - cornerLength), paint);

    // Bottom-Right
    canvas.drawLine(Offset(size.width, size.height), Offset(size.width - cornerLength, size.height), paint);
    canvas.drawLine(Offset(size.width, size.height), Offset(size.width, size.height - cornerLength), paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
