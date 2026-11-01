import 'package:flutter/material.dart';
import '../services/guard_state.dart';
import '../theme/app_theme.dart';
import '../widgets/guilloche_seal.dart';

class ProfileScreen extends StatelessWidget {
  final GuardState state;
  final VoidCallback onLogout;

  const ProfileScreen({
    Key? key,
    required this.state,
    required this.onLogout,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final user = state.currentUser;
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardBorder = isDark ? const Color(0xFF214A43) : AppColors.lineColor;

    return Scaffold(
      appBar: AppBar(
        title: const Text("OFFICER CREDENTIALS & PROFILE"),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Profile Header Card
            Container(
              padding: const EdgeInsets.all(20.0),
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF0D2823) : AppColors.white,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: cardBorder, width: 1.0),
              ),
              child: Column(
                children: [
                  Stack(
                    alignment: Alignment.center,
                    children: [
                      GuillocheSeal(
                        size: 96,
                        strokeColor: AppColors.gold.withOpacity(0.4),
                        strokeWidth: 1.2,
                        showInnerShield: true,
                      ),
                      CircleAvatar(
                        radius: 32,
                        backgroundColor: isDark ? AppColors.forest3 : AppColors.emerald50,
                        child: Icon(
                          Icons.person,
                          size: 36,
                          color: isDark ? AppColors.gold : AppColors.emerald,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Text(
                    user?.name ?? "Officer",
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: isDark ? Colors.white : AppColors.ink,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                    decoration: BoxDecoration(
                      color: isDark ? AppColors.forest3 : AppColors.emerald50,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(
                        color: (isDark ? AppColors.gold : AppColors.emerald).withOpacity(0.4),
                        width: 1.0,
                      ),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          Icons.badge,
                          size: 14,
                          color: isDark ? AppColors.gold : AppColors.emerald,
                        ),
                        const SizedBox(width: 6),
                        Text(
                          "GUARD ID: ${user?.id ?? 'N/A'}",
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            fontFamily: 'Courier',
                            letterSpacing: 0.8,
                            color: isDark ? AppColors.gold : AppColors.emerald,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    "BADGE ID: ${user?.badgeNumber ?? 'N/A'}",
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 1.2,
                      color: isDark ? AppColors.gold : AppColors.emerald,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    user?.role ?? "Security Officer",
                    style: TextStyle(
                      fontSize: 13,
                      color: isDark ? AppColors.statusNeutralDark : AppColors.textMuted,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Official Station Credentials
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
                    "STATION CREDENTIALS",
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 1.0,
                      color: isDark ? AppColors.gold : AppColors.emerald,
                    ),
                  ),
                  const SizedBox(height: 12),
                  _credentialRow("Guard ID", user?.id ?? "N/A", isDark),
                  _credentialRow("Badge Number", user?.badgeNumber ?? "N/A", isDark),
                  _credentialRow("Department", user?.department ?? "Perimeter Security", isDark),
                  _credentialRow("Official Email", user?.email ?? "N/A", isDark),
                  _credentialRow("Terminal Phone", user?.phone ?? "N/A", isDark),
                  _credentialRow("Emergency Contact", user?.emergencyContact ?? "N/A", isDark),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Active Security Certifications
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
                    "OPERATIONAL CERTIFICATIONS",
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 1.0,
                      color: isDark ? AppColors.gold : AppColors.emerald,
                    ),
                  ),
                  const SizedBox(height: 10),
                  _certItem("Level III Armed Perimeter Defense", "Valid thru Dec 2027", isDark),
                  _certItem("First Aid & Tactical Trauma Response (CPR/AED)", "Valid thru Aug 2027", isDark),
                  _certItem("Covenant Cryptographic Station Verification Protocol", "Active Seal", isDark),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Settings & Preferences
            Container(
              padding: const EdgeInsets.all(16.0),
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF0D2823) : AppColors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: cardBorder, width: 1.0),
              ),
              child: Column(
                children: [
                  SwitchListTile(
                    title: const Text("Night Watch Theme (Dark Mode)"),
                    subtitle: const Text("High-contrast gold & forest for low-light posts"),
                    value: state.isDarkMode,
                    activeColor: AppColors.gold,
                    contentPadding: EdgeInsets.zero,
                    onChanged: (_) => state.toggleDarkMode(),
                  ),
                  const Divider(),
                  SwitchListTile(
                    title: const Text("Dispatch Network Simulation"),
                    subtitle: Text(state.isOnline ? "Online (Real-time sync)" : "Offline (Local cryptographic cache)"),
                    value: state.isOnline,
                    activeColor: isDark ? AppColors.gold : AppColors.emerald,
                    contentPadding: EdgeInsets.zero,
                    onChanged: (_) => state.toggleOnlineStatus(),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Logout Button
            OutlinedButton.icon(
              onPressed: onLogout,
              icon: const Icon(Icons.logout, color: AppColors.statusDanger),
              label: const Text(
                "SIGN OUT OF GUARD TERMINAL",
                style: TextStyle(color: AppColors.statusDanger),
              ),
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: AppColors.statusDanger),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _credentialRow(String label, String value, bool isDark) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 130,
            child: Text(
              label,
              style: TextStyle(
                fontSize: 12,
                color: isDark ? AppColors.statusNeutralDark : AppColors.textMuted,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: isDark ? Colors.white : AppColors.ink,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _certItem(String title, String expiry, bool isDark) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.0),
      child: Row(
        children: [
          Icon(
            Icons.verified,
            color: isDark ? AppColors.statusSuccessDark : AppColors.statusSuccess,
            size: 18,
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: isDark ? Colors.white : AppColors.ink,
                  ),
                ),
                Text(
                  expiry,
                  style: TextStyle(
                    fontSize: 11,
                    color: isDark ? AppColors.statusNeutralDark : AppColors.textMuted,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
