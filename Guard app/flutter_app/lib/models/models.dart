enum AttendanceStatus {
  scheduled,
  present,
  late,
  absent,
  onLeave,
  leftEarly,
  manual,
}

extension AttendanceStatusExt on AttendanceStatus {
  String get displayName {
    switch (this) {
      case AttendanceStatus.scheduled:
        return 'SCHEDULED';
      case AttendanceStatus.present:
        return 'PRESENT';
      case AttendanceStatus.late:
        return 'LATE';
      case AttendanceStatus.absent:
        return 'ABSENT';
      case AttendanceStatus.onLeave:
        return 'ON LEAVE';
      case AttendanceStatus.leftEarly:
        return 'LEFT EARLY';
      case AttendanceStatus.manual:
        return 'MANUAL ENTRY';
    }
  }
}

class User {
  final String id;
  final String name;
  final String badgeNumber;
  final String email;
  final String phone;
  final String role;
  final String department;
  final String emergencyContact;
  final String? avatarUrl;

  const User({
    required this.id,
    required this.name,
    required this.badgeNumber,
    required this.email,
    required this.phone,
    required this.role,
    required this.department,
    required this.emergencyContact,
    this.avatarUrl,
  });
}

class Site {
  final String id;
  final String name;
  final String address;
  final double latitude;
  final double longitude;
  final double geofenceRadiusMeters;
  final String qrCodePayload;

  const Site({
    required this.id,
    required this.name,
    required this.address,
    required this.latitude,
    required this.longitude,
    this.geofenceRadiusMeters = 150.0,
    required this.qrCodePayload,
  });
}

class Shift {
  final String id;
  final String guardId;
  final String siteId;
  final String siteName;
  final String siteAddress;
  final String startTime;
  final String endTime;
  final String date;
  final String role;
  final String status;
  final String qrCodePayload;

  const Shift({
    required this.id,
    required this.guardId,
    required this.siteId,
    required this.siteName,
    required this.siteAddress,
    required this.startTime,
    required this.endTime,
    required this.date,
    required this.role,
    required this.status,
    required this.qrCodePayload,
  });
}

class AttendanceRecord {
  final String id;
  final String shiftId;
  final String guardId;
  final String guardName;
  final String siteId;
  final String siteName;
  final int? checkInTime;
  final int? checkOutTime;
  final double? checkInLatitude;
  final double? checkInLongitude;
  final String? checkInMethod; // "QR_SCAN", "GEOFENCE", "MANUAL"
  final double? checkOutLatitude;
  final double? checkOutLongitude;
  final String? checkOutMethod;
  final AttendanceStatus status;
  final String? notes;
  final bool isOfflineSynced;

  const AttendanceRecord({
    required this.id,
    required this.shiftId,
    required this.guardId,
    required this.guardName,
    required this.siteId,
    required this.siteName,
    this.checkInTime,
    this.checkOutTime,
    this.checkInLatitude,
    this.checkInLongitude,
    this.checkInMethod,
    this.checkOutLatitude,
    this.checkOutLongitude,
    this.checkOutMethod,
    required this.status,
    this.notes,
    this.isOfflineSynced = true,
  });

  AttendanceRecord copyWith({
    String? id,
    String? shiftId,
    String? guardId,
    String? guardName,
    String? siteId,
    String? siteName,
    int? checkInTime,
    int? checkOutTime,
    double? checkInLatitude,
    double? checkInLongitude,
    String? checkInMethod,
    double? checkOutLatitude,
    double? checkOutLongitude,
    String? checkOutMethod,
    AttendanceStatus? status,
    String? notes,
    bool? isOfflineSynced,
  }) {
    return AttendanceRecord(
      id: id ?? this.id,
      shiftId: shiftId ?? this.shiftId,
      guardId: guardId ?? this.guardId,
      guardName: guardName ?? this.guardName,
      siteId: siteId ?? this.siteId,
      siteName: siteName ?? this.siteName,
      checkInTime: checkInTime ?? this.checkInTime,
      checkOutTime: checkOutTime ?? this.checkOutTime,
      checkInLatitude: checkInLatitude ?? this.checkInLatitude,
      checkInLongitude: checkInLongitude ?? this.checkInLongitude,
      checkInMethod: checkInMethod ?? this.checkInMethod,
      checkOutLatitude: checkOutLatitude ?? this.checkOutLatitude,
      checkOutLongitude: checkOutLongitude ?? this.checkOutLongitude,
      checkOutMethod: checkOutMethod ?? this.checkOutMethod,
      status: status ?? this.status,
      notes: notes ?? this.notes,
      isOfflineSynced: isOfflineSynced ?? this.isOfflineSynced,
    );
  }
}

class SecurityReport {
  final String id;
  final String guardId;
  final String guardName;
  final String siteId;
  final String siteName;
  final int timestamp;
  final String incidentType;
  final String description;
  final String severity; // "LOW", "MEDIUM", "HIGH", "CRITICAL"
  final String? photoUri;
  final String status; // "SUBMITTED", "UNDER_REVIEW", "RESOLVED"

  const SecurityReport({
    required this.id,
    required this.guardId,
    required this.guardName,
    required this.siteId,
    required this.siteName,
    required this.timestamp,
    required this.incidentType,
    required this.description,
    required this.severity,
    this.photoUri,
    this.status = "SUBMITTED",
  });
}

class LeaveRequest {
  final String id;
  final String guardId;
  final String guardName;
  final String startDate;
  final String endDate;
  final String leaveType; // "ANNUAL", "SICK", "EMERGENCY", "COMPENSATORY"
  final String reason;
  final String status; // "PENDING", "APPROVED", "REJECTED"
  final int requestedAt;

  const LeaveRequest({
    required this.id,
    required this.guardId,
    required this.guardName,
    required this.startDate,
    required this.endDate,
    required this.leaveType,
    required this.reason,
    this.status = "PENDING",
    required this.requestedAt,
  });
}

class ShiftSwapRequest {
  final String id;
  final String requesterGuardId;
  final String requesterGuardName;
  final String targetGuardId;
  final String targetGuardName;
  final String originalShiftId;
  final String targetShiftId;
  final String reason;
  final String status; // "PENDING", "ACCEPTED", "REJECTED"
  final int requestedAt;

  const ShiftSwapRequest({
    required this.id,
    required this.requesterGuardId,
    required this.requesterGuardName,
    required this.targetGuardId,
    required this.targetGuardName,
    required this.originalShiftId,
    required this.targetShiftId,
    required this.reason,
    this.status = "PENDING",
    required this.requestedAt,
  });
}

class NotificationItem {
  final String id;
  final String title;
  final String message;
  final int timestamp;
  final bool isRead;
  final String type; // "ALERT", "SHIFT_CHANGE", "LEAVE_STATUS", "ANNOUNCEMENT"

  const NotificationItem({
    required this.id,
    required this.title,
    required this.message,
    required this.timestamp,
    this.isRead = false,
    this.type = "ALERT",
  });

  NotificationItem copyWith({bool? isRead}) {
    return NotificationItem(
      id: id,
      title: title,
      message: message,
      timestamp: timestamp,
      isRead: isRead ?? this.isRead,
      type: type,
    );
  }
}

class AuditLogEntry {
  final String id;
  final String action;
  final String guardId;
  final String details;
  final int timestamp;

  const AuditLogEntry({
    required this.id,
    required this.action,
    required this.guardId,
    required this.details,
    required this.timestamp,
  });
}
