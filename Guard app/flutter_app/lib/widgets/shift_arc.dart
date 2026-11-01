import 'dart:math' as math;
import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class ShiftArc extends StatefulWidget {
  final double progress; // 0.0 to 1.0
  final String currentTimeFormatted;
  final String shiftHoursLabel;
  final double size;
  final String statusText;

  const ShiftArc({
    Key? key,
    required this.progress,
    required this.currentTimeFormatted,
    required this.shiftHoursLabel,
    this.size = 190.0,
    this.statusText = "ON POST",
  }) : super(key: key);

  @override
  State<ShiftArc> createState() => _ShiftArcState();
}

class _ShiftArcState extends State<ShiftArc> with SingleTickerProviderStateMixin {
  late AnimationController _pulseController;
  late Animation<double> _dotAlphaAnimation;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2000),
    )..repeat(reverse: true);

    _dotAlphaAnimation = Tween<double>(begin: 0.45, end: 1.0).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _pulseController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final trackColor = isDark ? AppColors.forest3 : AppColors.lineColor;
    final fillColor = isDark ? AppColors.gold : AppColors.emerald;

    return SizedBox(
      width: widget.size,
      height: widget.size,
      child: AnimatedBuilder(
        animation: _dotAlphaAnimation,
        builder: (context, child) {
          return CustomPaint(
            painter: _ShiftArcPainter(
              progress: widget.progress.clamp(0.0, 1.0),
              dotAlpha: _dotAlphaAnimation.value,
              trackColor: trackColor,
              fillColor: fillColor,
            ),
            child: child,
          );
        },
        child: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                widget.statusText,
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 1.5,
                  color: isDark ? AppColors.gold : AppColors.emerald,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                widget.currentTimeFormatted,
                style: TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.bold,
                  fontFamily: 'Courier',
                  color: isDark ? Colors.white : AppColors.ink,
                  letterSpacing: 1.0,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                widget.shiftHoursLabel,
                style: TextStyle(
                  fontSize: 12,
                  color: isDark ? AppColors.statusNeutralDark : AppColors.textMuted,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _ShiftArcPainter extends CustomPainter {
  final double progress;
  final double dotAlpha;
  final Color trackColor;
  final Color fillColor;

  _ShiftArcPainter({
    required this.progress,
    required this.dotAlpha,
    required this.trackColor,
    required this.fillColor,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final strokeW = 10.0;
    final center = Offset(size.width / 2.0, size.height / 2.0);
    final radius = (size.width - strokeW) / 2.0;

    final startAngle = 150.0 * (math.pi / 180.0);
    final sweepTotal = 240.0 * (math.pi / 180.0);

    // 1. Background Track
    final trackPaint = Paint()
      ..color = trackColor
      ..style = PaintingStyle.stroke
      ..strokeWidth = strokeW
      ..strokeCap = StrokeCap.round;

    canvas.drawArc(
      Rect.fromCircle(center: center, radius: radius),
      startAngle,
      sweepTotal,
      false,
      trackPaint,
    );

    // 2. Active Progress Arc
    if (progress > 0.0) {
      final fillPaint = Paint()
        ..color = fillColor
        ..style = PaintingStyle.stroke
        ..strokeWidth = strokeW
        ..strokeCap = StrokeCap.round;

      canvas.drawArc(
        Rect.fromCircle(center: center, radius: radius),
        startAngle,
        sweepTotal * progress,
        false,
        fillPaint,
      );

      // 3. Pulsing "Now" Dot Indicator
      final currentAngle = startAngle + (sweepTotal * progress);
      final dotX = center.dx + radius * math.cos(currentAngle);
      final dotY = center.dy + radius * math.sin(currentAngle);

      final dotOuterPaint = Paint()
        ..color = fillColor.withOpacity(0.3 * dotAlpha)
        ..style = PaintingStyle.fill;
      canvas.drawCircle(Offset(dotX, dotY), strokeW * 0.9, dotOuterPaint);

      final dotInnerPaint = Paint()
        ..color = AppColors.white.withOpacity(dotAlpha)
        ..style = PaintingStyle.fill;
      canvas.drawCircle(Offset(dotX, dotY), strokeW * 0.4, dotInnerPaint);
    }
  }

  @override
  bool shouldRepaint(covariant _ShiftArcPainter oldDelegate) {
    return oldDelegate.progress != progress ||
        oldDelegate.dotAlpha != dotAlpha ||
        oldDelegate.trackColor != trackColor ||
        oldDelegate.fillColor != fillColor;
  }
}
