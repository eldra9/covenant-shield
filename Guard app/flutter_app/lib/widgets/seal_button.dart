import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../theme/app_theme.dart';
import 'guilloche_seal.dart';

class SealButton extends StatefulWidget {
  final String label;
  final String sublabel;
  final bool isHoldEnabled;
  final bool isLoading;
  final bool isSuccess;
  final VoidCallback? onHoldComplete;
  final VoidCallback? onTapFallback;
  final double size;

  const SealButton({
    Key? key,
    required this.label,
    this.sublabel = "HOLD TO SEAL",
    this.isHoldEnabled = true,
    this.isLoading = false,
    this.isSuccess = false,
    this.onHoldComplete,
    this.onTapFallback,
    this.size = 168.0,
  }) : super(key: key);

  @override
  State<SealButton> createState() => _SealButtonState();
}

class _SealButtonState extends State<SealButton> with SingleTickerProviderStateMixin {
  late AnimationController _progressController;
  Timer? _holdTimer;
  bool _isHolding = false;

  @override
  void initState() {
    super.initState();
    _progressController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 900),
    );

    _progressController.addStatusListener((status) {
      if (status == AnimationStatus.completed) {
        HapticFeedback.heavyImpact();
        widget.onHoldComplete?.call();
        _progressController.reset();
        setState(() {
          _isHolding = false;
        });
      }
    });
  }

  @override
  void dispose() {
    _progressController.dispose();
    _holdTimer?.cancel();
    super.dispose();
  }

  void _onPointerDown() {
    if (!widget.isHoldEnabled || widget.isLoading || widget.isSuccess) return;
    HapticFeedback.selectionClick();
    setState(() {
      _isHolding = true;
    });
    _progressController.forward(from: 0.0);
  }

  void _onPointerUp() {
    if (!_isHolding) return;
    setState(() {
      _isHolding = false;
    });
    // Rewind smoothly
    _progressController.reverse();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final primaryColor = isDark ? AppColors.forest : AppColors.emerald;
    final accentGold = AppColors.gold;

    return GestureDetector(
      onTap: () {
        if (!widget.isHoldEnabled) return;
        HapticFeedback.lightImpact();
        widget.onTapFallback?.call();
      },
      child: Listener(
        onPointerDown: (_) => _onPointerDown(),
        onPointerUp: (_) => _onPointerUp(),
        onPointerCancel: (_) => _onPointerUp(),
        child: SizedBox(
          width: widget.size,
          height: widget.size,
          child: Stack(
            alignment: Alignment.center,
            children: [
              // 1. Base Circular Button
              Container(
                width: widget.size,
                height: widget.size,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: primaryColor,
                  border: Border.all(
                    color: isDark ? AppColors.gold.withOpacity(0.5) : AppColors.gold,
                    width: 2.0,
                  ),
                ),
              ),

              // 2. Guilloche background pattern at subtle opacity
              Positioned.fill(
                child: Center(
                  child: GuillocheSeal(
                    size: widget.size * 0.85,
                    strokeColor: AppColors.gold.withOpacity(0.2),
                    strokeWidth: 1.0,
                  ),
                ),
              ),

              // 3. Animated Progress Ring
              AnimatedBuilder(
                animation: _progressController,
                builder: (context, _) {
                  if (_progressController.value <= 0.0) return const SizedBox.shrink();
                  return SizedBox(
                    width: widget.size + 4,
                    height: widget.size + 4,
                    child: CircularProgressIndicator(
                      value: _progressController.value,
                      strokeWidth: 6.0,
                      valueColor: const AlwaysStoppedAnimation<Color>(AppColors.gold300),
                      backgroundColor: Colors.transparent,
                    ),
                  );
                },
              ),

              // 4. Loading Spinner
              if (widget.isLoading)
                const SizedBox(
                  width: 48,
                  height: 48,
                  child: CircularProgressIndicator(
                    color: AppColors.gold,
                    strokeWidth: 3.0,
                  ),
                )
              else if (widget.isSuccess)
                const Icon(
                  Icons.check_circle,
                  color: AppColors.statusSuccessDark,
                  size: 48,
                )
              else
                // 5. Button Text Content
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16.0),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        Icons.fingerprint,
                        color: AppColors.gold,
                        size: 32,
                      ),
                      const SizedBox(height: 6),
                      Text(
                        widget.label,
                        textAlign: TextAlign.center,
                        style: const TextStyle(
                          color: AppColors.white,
                          fontSize: 15,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 0.8,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        _isHolding ? "HOLDING..." : widget.sublabel,
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          color: _isHolding ? AppColors.gold300 : AppColors.gold,
                          fontSize: 10,
                          fontWeight: FontWeight.w600,
                          letterSpacing: 1.2,
                        ),
                      ),
                    ],
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
