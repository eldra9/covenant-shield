import 'dart:math' as math;
import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class GuillocheSeal extends StatelessWidget {
  final double size;
  final Color? strokeColor;
  final double strokeWidth;
  final bool showInnerShield;

  const GuillocheSeal({
    Key? key,
    this.size = 80.0,
    this.strokeColor,
    this.strokeWidth = 1.2,
    this.showInnerShield = false,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final color = strokeColor ?? AppColors.gold.withOpacity(0.35);

    return SizedBox(
      width: size,
      height: size,
      child: CustomPaint(
        painter: _GuillochePainter(
          color: color,
          strokeWidth: strokeWidth,
          showInnerShield: showInnerShield,
        ),
      ),
    );
  }
}

class _GuillochePainter extends CustomPainter {
  final Color color;
  final double strokeWidth;
  final bool showInnerShield;

  _GuillochePainter({
    required this.color,
    required this.strokeWidth,
    required this.showInnerShield,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final cx = size.width / 2.0;
    final cy = size.height / 2.0;
    final baseRadius = (math.min(size.width, size.height) / 2.0) * 0.88;
    final a = 0.045 * baseRadius;

    final paintStroke = Paint()
      ..color = color
      ..style = PaintingStyle.stroke
      ..strokeWidth = strokeWidth
      ..isAntiAlias = true;

    // 1. Outer containment ring
    canvas.drawCircle(Offset(cx, cy), baseRadius, paintStroke);

    // 2. Fine secondary outer containment ring
    canvas.drawCircle(
      Offset(cx, cy),
      baseRadius * 0.94,
      paintStroke..strokeWidth = strokeWidth * 0.7,
    );

    // 3. Mathematical Rosette Roulette 1 (k1 = 12)
    const pointsCount = 360;
    final path1 = Path();
    for (int i = 0; i <= pointsCount; i++) {
      final t = i * 2.0 * math.pi / pointsCount;
      final r = baseRadius * 0.82 + a * math.sin(12 * t);
      final x = cx + r * math.cos(t);
      final y = cy + r * math.sin(t);
      if (i == 0) {
        path1.moveTo(x, y);
      } else {
        path1.lineTo(x, y);
      }
    }
    path1.close();
    canvas.drawPath(path1, paintStroke..strokeWidth = strokeWidth * 0.8);

    // 4. Mathematical Rosette Roulette 2 (k2 = 18)
    final path2 = Path();
    for (int i = 0; i <= pointsCount; i++) {
      final t = i * 2.0 * math.pi / pointsCount;
      final r = baseRadius * 0.68 + a * math.sin(18 * t);
      final x = cx + r * math.cos(t);
      final y = cy + r * math.sin(t);
      if (i == 0) {
        path2.moveTo(x, y);
      } else {
        path2.lineTo(x, y);
      }
    }
    path2.close();
    canvas.drawPath(path2, paintStroke..strokeWidth = strokeWidth * 0.8);

    // 5. Inner Core Ring
    canvas.drawCircle(
      Offset(cx, cy),
      baseRadius * 0.45,
      paintStroke..strokeWidth = strokeWidth * 0.9,
    );

    // 6. Center Emblem
    if (showInnerShield) {
      final shieldPaint = Paint()
        ..color = color.withOpacity(0.8)
        ..style = PaintingStyle.stroke
        ..strokeWidth = strokeWidth * 1.5;

      final shieldR = baseRadius * 0.26;
      final shieldPath = Path();
      shieldPath.moveTo(cx - shieldR, cy - shieldR * 0.6);
      shieldPath.lineTo(cx + shieldR, cy - shieldR * 0.6);
      shieldPath.lineTo(cx + shieldR, cy + shieldR * 0.2);
      shieldPath.quadraticBezierTo(cx, cy + shieldR * 1.2, cx, cy + shieldR * 1.2);
      shieldPath.quadraticBezierTo(cx, cy + shieldR * 1.2, cx - shieldR, cy + shieldR * 0.2);
      shieldPath.close();
      canvas.drawPath(shieldPath, shieldPaint);
    }
  }

  @override
  bool shouldRepaint(covariant _GuillochePainter oldDelegate) {
    return oldDelegate.color != color ||
        oldDelegate.strokeWidth != strokeWidth ||
        oldDelegate.showInnerShield != showInnerShield;
  }
}
