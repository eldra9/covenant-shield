import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;

/// Default base URL based on platform.
/// - Web / desktop: localhost
/// - Android emulator: 10.0.2.2 maps to host machine
/// - iOS simulator: 127.0.0.1 (shares host loopback)
String get defaultBaseUrl {
  if (kIsWeb) return 'http://localhost:8000/api/v1';
  switch (defaultTargetPlatform) {
    case TargetPlatform.android:
      return 'http://10.0.2.2:8000/api/v1';
    case TargetPlatform.iOS:
      return 'http://127.0.0.1:8000/api/v1';
    default:
      return 'http://localhost:8000/api/v1';
  }
}

class ApiException implements Exception {
  final String message;
  final int? statusCode;
  ApiException(this.message, {this.statusCode});
  @override
  String toString() => message;
}

class ApiService {
  static String? _accessToken;
  static String? _refreshToken;
  static String _baseUrl = defaultBaseUrl;

  static String get baseUrl => _baseUrl;
  static set baseUrl(String url) => _baseUrl = url;

  /// Store tokens (call after successful login)
  static void setTokens(String access, String refresh) {
    _accessToken = access;
    _refreshToken = refresh;
  }

  static void clearTokens() {
    _accessToken = null;
    _refreshToken = null;
  }

  static bool get isAuthenticated => _accessToken != null;

  // ─── HTTP helpers ────────────────────────────────────────────────────────

  static Map<String, String> _headers({bool auth = true}) {
    final h = {'Content-Type': 'application/json'};
    if (auth && _accessToken != null) {
      h['Authorization'] = 'Bearer $_accessToken';
    }
    return h;
  }

  static Future<Map<String, dynamic>> _parseResponse(http.Response res) async {
    final body = utf8.decode(res.bodyBytes);
    if (res.statusCode >= 200 && res.statusCode < 300) {
      if (body.isEmpty) return {};
      return json.decode(body) as Map<String, dynamic>;
    }
    String errMsg;
    try {
      final err = json.decode(body);
      errMsg = err['error'] ?? err['detail'] ?? err.toString();
    } catch (_) {
      errMsg = 'Server error (${res.statusCode})';
    }
    throw ApiException(errMsg, statusCode: res.statusCode);
  }

  // ─── Auth ────────────────────────────────────────────────────────────────

  static Future<Map<String, dynamic>> login(
      String email, String password) async {
    final res = await http
        .post(
          Uri.parse('$_baseUrl/auth/login/'),
          headers: _headers(auth: false),
          body: json.encode({'email': email, 'password': password}),
        )
        .timeout(const Duration(seconds: 15));
    final data = await _parseResponse(res);
    final access = data['access'] as String?;
    final refresh = data['refresh'] as String?;
    if (access == null) throw ApiException('Login failed: no token returned');
    setTokens(access, refresh ?? '');
    return data;
  }

  // ─── Guard Profile ───────────────────────────────────────────────────────

  static Future<Map<String, dynamic>> getProfile() async {
    final res = await http
        .get(
          Uri.parse('$_baseUrl/guard/profile/'),
          headers: _headers(),
        )
        .timeout(const Duration(seconds: 10));
    return _parseResponse(res);
  }

  // ─── Shifts ──────────────────────────────────────────────────────────────

  static Future<List<dynamic>> getShifts() async {
    final res = await http
        .get(
          Uri.parse('$_baseUrl/guard/shifts/'),
          headers: _headers(),
        )
        .timeout(const Duration(seconds: 10));
    final body = utf8.decode(res.bodyBytes);
    if (res.statusCode >= 200 && res.statusCode < 300) {
      return json.decode(body) as List<dynamic>;
    }
    throw ApiException('Failed to load shifts (${res.statusCode})');
  }

  // ─── Attendance ──────────────────────────────────────────────────────────

  static Future<List<dynamic>> getAttendance() async {
    final res = await http
        .get(
          Uri.parse('$_baseUrl/guard/attendance/'),
          headers: _headers(),
        )
        .timeout(const Duration(seconds: 10));
    final body = utf8.decode(res.bodyBytes);
    if (res.statusCode >= 200 && res.statusCode < 300) {
      return json.decode(body) as List<dynamic>;
    }
    throw ApiException('Failed to load attendance (${res.statusCode})');
  }

  static Future<Map<String, dynamic>> checkIn({
    required double lat,
    required double lng,
    String method = 'GPS',
    String shiftReference = '',
  }) async {
    final res = await http
        .post(
          Uri.parse('$_baseUrl/guard/check-in/'),
          headers: _headers(),
          body: json.encode({
            'lat': lat,
            'lng': lng,
            'method': method,
            'shift_reference': shiftReference,
          }),
        )
        .timeout(const Duration(seconds: 10));
    return _parseResponse(res);
  }

  static Future<Map<String, dynamic>> checkOut({
    String? attendanceId,
    required double lat,
    required double lng,
  }) async {
    final body = <String, dynamic>{'lat': lat, 'lng': lng};
    if (attendanceId != null) body['attendance_id'] = attendanceId;
    final res = await http
        .post(
          Uri.parse('$_baseUrl/guard/check-out/'),
          headers: _headers(),
          body: json.encode(body),
        )
        .timeout(const Duration(seconds: 10));
    return _parseResponse(res);
  }
}
