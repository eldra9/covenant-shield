import 'package:flutter/material.dart';
import 'models/models.dart';
import 'services/guard_state.dart';
import 'theme/app_theme.dart';
import 'screens/login_screen.dart';
import 'screens/dashboard_screen.dart';
import 'screens/check_in_screen.dart';
import 'screens/check_out_screen.dart';
import 'screens/shifts_screen.dart';
import 'screens/attendance_history_screen.dart';
import 'screens/reports_screen.dart';
import 'screens/leave_screen.dart';
import 'screens/shift_swap_screen.dart';
import 'screens/notifications_screen.dart';
import 'screens/profile_screen.dart';

void main() {
  runApp(const AegisGuardFlutterApp());
}

class AegisGuardFlutterApp extends StatefulWidget {
  const AegisGuardFlutterApp({Key? key}) : super(key: key);

  @override
  State<AegisGuardFlutterApp> createState() => _AegisGuardFlutterAppState();
}

class _AegisGuardFlutterAppState extends State<AegisGuardFlutterApp> {
  final GuardState _state = GuardState();
  bool _isLoggedIn = false;

  @override
  void initState() {
    super.initState();
    _state.addListener(_onStateChange);
  }

  @override
  void dispose() {
    _state.removeListener(_onStateChange);
    _state.dispose();
    super.dispose();
  }

  void _onStateChange() {
    setState(() {
      // Auto-navigate to dashboard when session is restored
      if (_state.isAuthenticated && !_isLoggedIn) {
        _isLoggedIn = true;
      }
      // Auto-navigate to login when logged out
      if (!_state.isAuthenticated && _isLoggedIn) {
        _isLoggedIn = false;
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'AegisGuard',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: _state.isDarkMode ? ThemeMode.dark : ThemeMode.light,
      home: _isLoggedIn
          ? _MainNavigator(
              state: _state,
              onLogout: () async {
                await _state.logout();
              },
            )
          : LoginScreen(
              state: _state,
              onLoginSuccess: () {
                setState(() {
                  _isLoggedIn = true;
                });
              },
            ),
    );
  }
}

class _MainNavigator extends StatelessWidget {
  final GuardState state;
  final VoidCallback onLogout;

  const _MainNavigator({
    Key? key,
    required this.state,
    required this.onLogout,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Navigator(
      onGenerateRoute: (settings) {
        return MaterialPageRoute(
          builder: (ctx) {
            return DashboardScreen(
              state: state,
              onNavigateToCheckIn: (shift) {
                Navigator.of(ctx).push(
                  MaterialPageRoute(
                    builder: (_) => CheckInScreen(
                      shift: shift,
                      state: state,
                      onComplete: () => Navigator.of(ctx).pop(),
                    ),
                  ),
                );
              },
              onNavigateToCheckOut: (record) {
                Navigator.of(ctx).push(
                  MaterialPageRoute(
                    builder: (_) => CheckOutScreen(
                      record: record,
                      state: state,
                      onComplete: () => Navigator.of(ctx).pop(),
                    ),
                  ),
                );
              },
              onNavigateToShifts: () {
                Navigator.of(ctx).push(
                  MaterialPageRoute(
                    builder: (_) => ShiftsScreen(
                      state: state,
                      onSelectShift: (_) {},
                    ),
                  ),
                );
              },
              onNavigateToAttendance: () {
                Navigator.of(ctx).push(
                  MaterialPageRoute(
                    builder: (_) => AttendanceHistoryScreen(state: state),
                  ),
                );
              },
              onNavigateToReports: () {
                Navigator.of(ctx).push(
                  MaterialPageRoute(
                    builder: (_) => ReportsScreen(state: state),
                  ),
                );
              },
              onNavigateToLeave: () {
                Navigator.of(ctx).push(
                  MaterialPageRoute(
                    builder: (_) => LeaveScreen(state: state),
                  ),
                );
              },
              onNavigateToSwaps: () {
                Navigator.of(ctx).push(
                  MaterialPageRoute(
                    builder: (_) => ShiftSwapScreen(state: state),
                  ),
                );
              },
              onNavigateToNotifications: () {
                Navigator.of(ctx).push(
                  MaterialPageRoute(
                    builder: (_) => NotificationsScreen(state: state),
                  ),
                );
              },
              onNavigateToProfile: () {
                Navigator.of(ctx).push(
                  MaterialPageRoute(
                    builder: (_) => ProfileScreen(
                      state: state,
                      onLogout: onLogout,
                    ),
                  ),
                );
              },
            );
          },
        );
      },
    );
  }
}
