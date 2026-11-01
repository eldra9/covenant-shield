import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/models.dart';
import 'api_service.dart';

class GuardState extends ChangeNotifier {
  User? _currentUser;
  bool _isOnline = true;
  bool _isDarkMode = false;
  bool _isLoading = false;
  String? _authError;

  List<Shift> _shifts = [];
  List<AttendanceRecord> _attendanceRecords = [];
  List<SecurityReport> _reports = [];
  List<LeaveRequest> _leaveRequests = [];
  List<ShiftSwapRequest> _shiftSwapRequests = [];
  List<NotificationItem> _notifications = [];
  List<String> _offlineQueue = [];

  // Getters
  User? get currentUser => _currentUser;
  bool get isOnline => _isOnline;
  bool get isDarkMode => _isDarkMode;
  bool get isLoading => _isLoading;
  String? get authError => _authError;
  bool get isAuthenticated => _currentUser != null;
  List<Shift> get shifts => _shifts;
  List<AttendanceRecord> get attendanceRecords => _attendanceRecords;
  List<SecurityReport> get reports => _reports;
  List<LeaveRequest> get leaveRequests => _leaveRequests;
  List<ShiftSwapRequest> get shiftSwapRequests => _shiftSwapRequests;
  List<NotificationItem> get notifications => _notifications;
  List<String> get offlineQueue => _offlineQueue;
  int get unreadNotificationsCount =>
      _notifications.where((n) => !n.isRead).length;

  Shift? get todayShift {
    if (_shifts.isEmpty) return null;
    final today = _todayStr();
    return _shifts.cast<Shift?>().firstWhere(
          (s) => s?.date == today,
          orElse: () => _shifts.isNotEmpty ? _shifts.first : null,
        );
  }

  AttendanceRecord? get activeAttendanceRecord {
    return _attendanceRecords.cast<AttendanceRecord?>().firstWhere(
          (r) => r?.checkOutTime == null,
          orElse: () => null,
        );
  }

  AttendanceRecord? get todayAttendanceRecord => activeAttendanceRecord;

  String _todayStr() {
    final now = DateTime.now();
    return '${now.year}-${now.month.toString().padLeft(2, '0')}-${now.day.toString().padLeft(2, '0')}';
  }

  GuardState() {
    _restoreSession();
  }

  // ─── Session restore ────────────────────────────────────────────────────

  Future<void> _restoreSession() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final customUrl = prefs.getString('backend_url');
      if (customUrl != null && customUrl.isNotEmpty) {
        ApiService.baseUrl = customUrl;
      }
      final access = prefs.getString('access_token');
      final refresh = prefs.getString('refresh_token');
      if (access != null && access.isNotEmpty) {
        ApiService.setTokens(access, refresh ?? '');
        await _loadBackendData();
      }
    } catch (_) {
      // Ignore — user will need to log in
    }
  }

  Future<void> updateBackendUrl(String url) async {
    ApiService.baseUrl = url.trim();
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('backend_url', url.trim());
    notifyListeners();
  }

  // ─── Login / Logout ─────────────────────────────────────────────────────

  Future<bool> loginWithCredentials(String email, String password) async {
    _isLoading = true;
    _authError = null;
    notifyListeners();

    try {
      final data = await ApiService.login(email.trim(), password);
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('access_token', data['access'] ?? '');
      await prefs.setString('refresh_token', data['refresh'] ?? '');

      await _loadBackendData();
      _isLoading = false;
      notifyListeners();
      return true;
    } on ApiException catch (e) {
      _authError = e.message;
      _isLoading = false;
      notifyListeners();
      return false;
    } catch (e) {
      _authError = 'Connection failed. Is the server running?';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> logout() async {
    ApiService.clearTokens();
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('access_token');
    await prefs.remove('refresh_token');
    _currentUser = null;
    _shifts = [];
    _attendanceRecords = [];
    notifyListeners();
  }

  // ─── Load data from backend ─────────────────────────────────────────────

  Future<void> _loadBackendData() async {
    try {
      // Load profile
      final profile = await ApiService.getProfile();
      _currentUser = _userFromProfile(profile);

      // Load shifts
      final shiftsData = await ApiService.getShifts();
      _shifts = shiftsData
          .map((s) => _shiftFromJson(s as Map<String, dynamic>))
          .toList();

      // Load attendance history
      final attendanceData = await ApiService.getAttendance();
      _attendanceRecords = attendanceData
          .map((a) => _attendanceFromJson(a as Map<String, dynamic>))
          .toList();

      // Restore active check-in from profile
      final activeCheckIn = profile['active_check_in'];
      if (activeCheckIn != null) {
        final activeRecord = _attendanceFromJson(activeCheckIn as Map<String, dynamic>);
        // Ensure it's at the top of list
        _attendanceRecords.removeWhere((r) => r.id == activeRecord.id);
        _attendanceRecords.insert(0, activeRecord);
      }

      notifyListeners();
    } on ApiException catch (e) {
      // Token expired or server error — clear session
      if (e.statusCode == 401) {
        ApiService.clearTokens();
        _currentUser = null;
      }
      notifyListeners();
    } catch (_) {
      notifyListeners();
    }
  }

  /// Refresh data (call from pull-to-refresh)
  Future<void> refresh() async {
    if (!ApiService.isAuthenticated) return;
    await _loadBackendData();
  }

  // ─── Check In / Check Out ───────────────────────────────────────────────

  Future<bool> checkIn(Shift shift,
      {String method = 'GPS', String? notes}) async {
    final nowMs = DateTime.now().millisecondsSinceEpoch;

    if (!_isOnline) {
      // Queue for later
      final fakeId = 'offline_${nowMs}';
      final record = AttendanceRecord(
        id: fakeId,
        shiftId: shift.id,
        guardId: _currentUser?.id ?? '',
        guardName: _currentUser?.name ?? '',
        siteId: shift.siteId,
        siteName: shift.siteName,
        checkInTime: nowMs,
        checkInMethod: method,
        status: AttendanceStatus.present,
        notes: notes,
        isOfflineSynced: false,
      );
      _attendanceRecords.insert(0, record);
      _offlineQueue.add('CHECK_IN:$fakeId');
      _addNotification('Check-In Queued (Offline)',
          'Will sync when connection is restored.', 'ALERT');
      notifyListeners();
      return true;
    }

    try {
      final data = await ApiService.checkIn(
        lat: 0.0,
        lng: 0.0,
        method: method,
        shiftReference: shift.id,
      );
      final record = _attendanceFromJson(data);
      _attendanceRecords.insert(0, record);
      _addNotification('Check-In Verified',
          'Checked in at ${shift.siteName}.', 'ALERT');
      notifyListeners();
      return true;
    } on ApiException catch (e) {
      _addNotification('Check-In Failed', e.message, 'ALERT');
      notifyListeners();
      return false;
    }
  }

  Future<bool> checkOut(AttendanceRecord record,
      {String method = 'GPS', String? notes}) async {
    final nowMs = DateTime.now().millisecondsSinceEpoch;

    if (!_isOnline) {
      final index = _attendanceRecords.indexWhere((r) => r.id == record.id);
      if (index != -1) {
        _attendanceRecords[index] = _attendanceRecords[index].copyWith(
          checkOutTime: nowMs,
          checkOutMethod: method,
          isOfflineSynced: false,
        );
        _offlineQueue.add('CHECK_OUT:${record.id}');
        _addNotification('Check-Out Queued (Offline)',
            'Will sync when connection is restored.', 'ALERT');
        notifyListeners();
      }
      return true;
    }

    try {
      final data = await ApiService.checkOut(
        attendanceId: record.id.startsWith('offline_') ? null : record.id,
        lat: 0.0,
        lng: 0.0,
      );
      final updated = _attendanceFromJson(data);
      final index = _attendanceRecords.indexWhere((r) => r.id == record.id);
      if (index != -1) {
        _attendanceRecords[index] = updated;
      } else {
        _attendanceRecords.insert(0, updated);
      }
      _addNotification(
          'Check-Out Complete', 'Shift ended at ${record.siteName}.', 'ALERT');
      notifyListeners();
      return true;
    } on ApiException catch (e) {
      _addNotification('Check-Out Failed', e.message, 'ALERT');
      notifyListeners();
      return false;
    }
  }

  // ─── Other state mutations ───────────────────────────────────────────────

  void toggleDarkMode() {
    _isDarkMode = !_isDarkMode;
    notifyListeners();
  }

  void toggleOnlineStatus() {
    _isOnline = !_isOnline;
    if (_isOnline && _offlineQueue.isNotEmpty) {
      _offlineQueue.clear();
    }
    notifyListeners();
  }

  void addReport(SecurityReport report) {
    _reports.insert(0, report);
    if (!_isOnline) _offlineQueue.add('REPORT:${report.id}');
    notifyListeners();
  }

  void addLeaveRequest(LeaveRequest request) {
    _leaveRequests.insert(0, request);
    notifyListeners();
  }

  void addShiftSwapRequest(ShiftSwapRequest request) {
    _shiftSwapRequests.insert(0, request);
    notifyListeners();
  }

  void markNotificationAsRead(String id) {
    final idx = _notifications.indexWhere((n) => n.id == id);
    if (idx != -1) {
      _notifications[idx] = _notifications[idx].copyWith(isRead: true);
      notifyListeners();
    }
  }

  void markAllNotificationsAsRead() {
    _notifications = _notifications.map((n) => n.copyWith(isRead: true)).toList();
    notifyListeners();
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────

  void _addNotification(String title, String message, String type) {
    final nowMs = DateTime.now().millisecondsSinceEpoch;
    _notifications.insert(
      0,
      NotificationItem(
        id: 'notif_$nowMs',
        title: title,
        message: message,
        timestamp: nowMs,
        isRead: false,
        type: type,
      ),
    );
  }

  User _userFromProfile(Map<String, dynamic> p) {
    final sites = (p['sites'] as List<dynamic>? ?? []);
    final firstSite = sites.isNotEmpty ? sites.first as Map<String, dynamic> : null;
    return User(
      id: p['id'] as String? ?? '',
      name: p['name'] as String? ?? p['email'] as String? ?? 'Guard',
      badgeNumber: p['employee_no'] as String? ?? '',
      email: p['email'] as String? ?? '',
      phone: p['phone'] as String? ?? '',
      role: 'Security Officer',
      department: firstSite != null ? firstSite['name'] as String? ?? '' : '',
      emergencyContact: '',
    );
  }

  Shift _shiftFromJson(Map<String, dynamic> s) {
    return Shift(
      id: s['id'] as String? ?? '',
      guardId: _currentUser?.id ?? '',
      siteId: s['site_id'] as String? ?? '',
      siteName: s['site_name'] as String? ?? '',
      siteAddress: s['site_address'] as String? ?? '',
      startTime: s['start_time'] as String? ?? '08:00',
      endTime: s['end_time'] as String? ?? '16:00',
      date: s['date'] as String? ?? _todayStr(),
      role: s['role'] as String? ?? 'Security Officer',
      status: s['status'] as String? ?? 'SCHEDULED',
      qrCodePayload: s['qr_code_payload'] as String? ?? '',
    );
  }

  AttendanceRecord _attendanceFromJson(Map<String, dynamic> a) {
    final checkInMs = a['check_in_at'] != null
        ? DateTime.parse(a['check_in_at'] as String).millisecondsSinceEpoch
        : null;
    final checkOutMs = a['check_out_at'] != null
        ? DateTime.parse(a['check_out_at'] as String).millisecondsSinceEpoch
        : null;
    return AttendanceRecord(
      id: a['id'] as String? ?? '',
      shiftId: a['shift_reference'] as String? ?? '',
      guardId: _currentUser?.id ?? '',
      guardName: _currentUser?.name ?? '',
      siteId: '',
      siteName: a['shift_reference'] as String? ?? 'Site',
      checkInTime: checkInMs,
      checkOutTime: checkOutMs,
      checkInMethod: a['method'] as String? ?? 'GPS',
      status: _parseStatus(a['status'] as String? ?? 'PRESENT'),
      isOfflineSynced: true,
    );
  }

  AttendanceStatus _parseStatus(String s) {
    switch (s) {
      case 'PRESENT':
        return AttendanceStatus.present;
      case 'LATE':
        return AttendanceStatus.late;
      case 'ABSENT':
        return AttendanceStatus.absent;
      case 'LEFT_EARLY':
        return AttendanceStatus.leftEarly;
      default:
        return AttendanceStatus.present;
    }
  }
}
