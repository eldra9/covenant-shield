import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../services/guard_state.dart';
import '../theme/app_theme.dart';
import '../widgets/guilloche_seal.dart';

class LoginScreen extends StatefulWidget {
  final GuardState state;
  final VoidCallback onLoginSuccess;

  const LoginScreen({
    Key? key,
    required this.state,
    required this.onLoginSuccess,
  }) : super(key: key);

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscurePassword = true;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _handleLogin() async {
    final email = _emailController.text.trim();
    final password = _passwordController.text;

    if (email.isEmpty || password.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please enter your email and password.'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    final success =
        await widget.state.loginWithCredentials(email, password);
    if (success && mounted) {
      widget.onLoginSuccess();
    }
  }

  void _showServerDialog() {
    final serverController = TextEditingController(text: ApiService.baseUrl);
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Backend Server URL', style: TextStyle(fontSize: 16)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Set the API base URL. Use localhost on simulator or your machine IP on physical devices.',
              style: TextStyle(fontSize: 12),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: serverController,
              decoration: const InputDecoration(
                hintText: 'http://192.168.1.50:8000/api/v1',
                labelText: 'API Base URL',
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () {
              serverController.text = defaultBaseUrl;
            },
            child: const Text('Reset Default'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () async {
              final newUrl = serverController.text.trim();
              if (newUrl.isNotEmpty) {
                await widget.state.updateBackendUrl(newUrl);
              }
              if (mounted) Navigator.pop(ctx);
            },
            child: const Text('Save'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardBorderColor =
        isDark ? const Color(0xFF214A43) : AppColors.lineColor;
    final isLoading = widget.state.isLoading;
    final errorMsg = widget.state.authError;

    return Scaffold(
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding:
                const EdgeInsets.symmetric(horizontal: 24.0, vertical: 32.0),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 440),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  // Header seal
                  Stack(
                    alignment: Alignment.center,
                    children: [
                      GuillocheSeal(
                        size: 110,
                        strokeColor: AppColors.gold.withOpacity(0.4),
                        strokeWidth: 1.4,
                        showInnerShield: true,
                      ),
                      Icon(
                        Icons.shield,
                        color: isDark ? AppColors.gold : AppColors.emerald,
                        size: 40,
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'COVENANT SHIELD',
                    style: TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 2.0,
                      color: isDark ? AppColors.gold : AppColors.emerald,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'AEGISGUARD SECURITY TERMINAL',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      letterSpacing: 1.2,
                      color: isDark
                          ? AppColors.statusNeutralDark
                          : AppColors.textMuted,
                    ),
                  ),
                  const SizedBox(height: 32),

                  // Login card
                  Container(
                    padding: const EdgeInsets.all(24.0),
                    decoration: BoxDecoration(
                      color:
                          isDark ? const Color(0xFF0D2823) : AppColors.white,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: cardBorderColor, width: 1.0),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        Text(
                          'OFFICER AUTHENTICATION',
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 1.0,
                            color: isDark ? AppColors.gold : AppColors.emerald,
                          ),
                        ),
                        const SizedBox(height: 20),

                        // Error banner
                        if (errorMsg != null) ...[
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 12, vertical: 10),
                            decoration: BoxDecoration(
                              color: Colors.red.shade50,
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(color: Colors.red.shade200),
                            ),
                            child: Row(
                              children: [
                                const Icon(Icons.error_outline,
                                    color: Colors.red, size: 18),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: Text(
                                    errorMsg,
                                    style: const TextStyle(
                                        color: Colors.red, fontSize: 13),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 16),
                        ],

                        // Email
                        TextField(
                          controller: _emailController,
                          keyboardType: TextInputType.emailAddress,
                          autocorrect: false,
                          decoration: InputDecoration(
                            labelText: 'Email Address',
                            prefixIcon: Icon(
                              Icons.badge_outlined,
                              color: isDark
                                  ? AppColors.gold
                                  : AppColors.emerald,
                            ),
                          ),
                        ),
                        const SizedBox(height: 16),

                        // Password
                        TextField(
                          controller: _passwordController,
                          obscureText: _obscurePassword,
                          decoration: InputDecoration(
                            labelText: 'Password',
                            prefixIcon: Icon(
                              Icons.lock_outline,
                              color: isDark
                                  ? AppColors.gold
                                  : AppColors.emerald,
                            ),
                            suffixIcon: IconButton(
                              icon: Icon(
                                _obscurePassword
                                    ? Icons.visibility_off
                                    : Icons.visibility,
                                color: isDark
                                    ? AppColors.statusNeutralDark
                                    : AppColors.textMuted,
                              ),
                              onPressed: () {
                                setState(() {
                                  _obscurePassword = !_obscurePassword;
                                });
                              },
                            ),
                          ),
                          onSubmitted: (_) => _handleLogin(),
                        ),
                        const SizedBox(height: 24),

                        // Sign In button
                        SizedBox(
                          height: 48,
                          child: ElevatedButton(
                            onPressed: isLoading ? null : _handleLogin,
                            child: isLoading
                                ? const SizedBox(
                                    width: 20,
                                    height: 20,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2.5,
                                      color: AppColors.white,
                                    ),
                                  )
                                : const Text('SIGN IN TO POST'),
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 24),

                  // Hint text
                  Text(
                    'Use your Covenant Shield email and password',
                    style: TextStyle(
                      fontSize: 12,
                      color: isDark
                          ? AppColors.statusNeutralDark
                          : AppColors.textMuted,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 8),
                  TextButton.icon(
                    onPressed: _showServerDialog,
                    icon: Icon(
                      Icons.settings_outlined,
                      size: 14,
                      color: isDark ? AppColors.gold : AppColors.emerald,
                    ),
                    label: Text(
                      'Server: ${ApiService.baseUrl}',
                      style: TextStyle(
                        fontSize: 11,
                        color: isDark ? AppColors.gold : AppColors.emerald,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
