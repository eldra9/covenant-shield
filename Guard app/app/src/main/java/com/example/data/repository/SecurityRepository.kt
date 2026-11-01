package com.example.data.repository

import com.example.data.model.*
import com.example.util.DateTimeUtils
import com.example.util.GeofenceUtils
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.util.UUID

class SecurityRepository {

  // Network connectivity state (can be toggled for offline testing)
  private val _isOnline = MutableStateFlow(true)
  val isOnline: StateFlow<Boolean> = _isOnline.asStateFlow()

  // Current authenticated user
  private val _currentUser = MutableStateFlow<User?>(null)
  val currentUser: StateFlow<User?> = _currentUser.asStateFlow()

  // Failed login tracking for 5-attempt lockout policy
  private val failedAttemptsMap = mutableMapOf<String, Int>()
  private val lockoutUntilMap = mutableMapOf<String, Long>()

  // Sites database
  private val _sites = MutableStateFlow<List<Site>>(emptyList())
  val sites: StateFlow<List<Site>> = _sites.asStateFlow()

  // Shifts database
  private val _shifts = MutableStateFlow<List<Shift>>(emptyList())
  val shifts: StateFlow<List<Shift>> = _shifts.asStateFlow()

  // Attendance records
  private val _attendanceRecords = MutableStateFlow<List<AttendanceRecord>>(emptyList())
  val attendanceRecords: StateFlow<List<AttendanceRecord>> = _attendanceRecords.asStateFlow()

  // Offline pending queue
  private val _offlineQueue = MutableStateFlow<List<AttendanceRecord>>(emptyList())
  val offlineQueue: StateFlow<List<AttendanceRecord>> = _offlineQueue.asStateFlow()

  // Leave requests
  private val _leaveRequests = MutableStateFlow<List<LeaveRequest>>(emptyList())
  val leaveRequests: StateFlow<List<LeaveRequest>> = _leaveRequests.asStateFlow()

  // Shift swap requests
  private val _shiftSwapRequests = MutableStateFlow<List<ShiftSwapRequest>>(emptyList())
  val shiftSwapRequests: StateFlow<List<ShiftSwapRequest>> = _shiftSwapRequests.asStateFlow()

  // Notifications
  private val _notifications = MutableStateFlow<List<NotificationItem>>(emptyList())
  val notifications: StateFlow<List<NotificationItem>> = _notifications.asStateFlow()

  // Audit Logs
  private val _auditLogs = MutableStateFlow<List<AuditLogEntry>>(emptyList())
  val auditLogs: StateFlow<List<AuditLogEntry>> = _auditLogs.asStateFlow()

  // Security & Incident Reports
  private val _reports = MutableStateFlow<List<SecurityReport>>(emptyList())
  val reports: StateFlow<List<SecurityReport>> = _reports.asStateFlow()

  // All employees for swaps & supervisor monitor
  private val _allGuards = MutableStateFlow<List<User>>(emptyList())
  val allGuards: StateFlow<List<User>> = _allGuards.asStateFlow()

  init {
    seedInitialData()
  }

  private fun seedInitialData() {
    val sampleSites = listOf(
      Site(
        id = "SITE-001",
        name = "Main Corporate Headquarters",
        clientName = "Ethio Telecom Towers",
        address = "Bole Road, Atlas Area, Addis Ababa",
        latitude = 9.01050,
        longitude = 38.76100,
        geofenceRadiusMeters = 100.0,
        qrCodeToken = "AEGIS-QR-SITE-001-HQ",
        contactPhone = "+251-11-551-7788",
        instructions = "Inspect badges at Gate A & B. Maintain 30-min log of secure server room."
      ),
      Site(
        id = "SITE-002",
        name = "Financial Center Banking Hub",
        clientName = "Commercial Bank Plaza",
        address = "Mexico Square, Financial District",
        latitude = 9.01350,
        longitude = 38.74900,
        geofenceRadiusMeters = 80.0,
        qrCodeToken = "AEGIS-QR-SITE-002-BANK",
        contactPhone = "+251-11-552-4411",
        instructions = "Armory check-in required. Arm metal detectors at main vault entry."
      ),
      Site(
        id = "SITE-003",
        name = "Industrial Logistics Hub",
        clientName = "Modjo Express Logistics",
        address = "Kaliti Cargo Terminus, Gate 3",
        latitude = 8.92200,
        longitude = 38.75600,
        geofenceRadiusMeters = 150.0,
        qrCodeToken = "AEGIS-QR-SITE-003-CARGO",
        contactPhone = "+251-11-443-9900",
        instructions = "Weighbridge clearance and seal inspection on outgoing 40ft container trucks."
      ),
      Site(
        id = "SITE-004",
        name = "Diplomatic Mission Compound",
        clientName = "AU Diplomatic Residences",
        address = "Old Airport Zone, Embassy Row",
        latitude = 8.98800,
        longitude = 38.73200,
        geofenceRadiusMeters = 100.0,
        qrCodeToken = "AEGIS-QR-SITE-004-DIP",
        contactPhone = "+251-11-371-2200",
        instructions = "High-vigilance post. Validate diplomat vehicle RFID transponders."
      )
    )
    _sites.value = sampleSites

    val sampleGuards = listOf(
      User(
        id = "ADMIN-001",
        employeeId = "ADMIN-001",
        fullName = "Abebe Bekele",
        role = "SUPER_ADMIN",
        phone = "+251-91-000-0001",
        email = "admin@aegisguard.et",
        pin = "0000",
        username = "admin",
        password = "admin123",
        baseSiteId = "SITE-001",
        baseSiteName = "Headquarters Command",
        isActive = true,
        badgeNumber = "AG-ADM-001"
      ),
      User(
        id = "OPS-501",
        employeeId = "OPS-501",
        fullName = "Sara Worku",
        role = "OPERATION_STAFF",
        phone = "+251-91-000-5555",
        email = "ops@aegisguard.et",
        pin = "5555",
        username = "ops",
        password = "ops123",
        baseSiteId = "SITE-001",
        baseSiteName = "Operations Control Center",
        isActive = true,
        badgeNumber = "AG-OPS-501"
      ),
      User(
        id = "SUP-201",
        employeeId = "EMP-8001",
        fullName = "Major Yonas Hailu",
        role = "SUPERVISOR",
        phone = "+251-91-000-8888",
        email = "y.hailu@aegisguard.et",
        pin = "9999",
        username = "supervisor",
        password = "super123",
        baseSiteId = "SITE-001",
        baseSiteName = "Operations Control Center",
        isActive = true,
        badgeNumber = "AG-SUP-101"
      ),
      User(
        id = "GUARD-101",
        employeeId = "EMP-1042",
        fullName = "Dawit Tadesse",
        role = "GUARD",
        phone = "+251-91-123-4567",
        email = "d.tadesse@aegisguard.et",
        pin = "1234",
        username = "dawit",
        password = "guard123",
        baseSiteId = "SITE-001",
        baseSiteName = "Main Corporate Headquarters",
        isActive = true,
        badgeNumber = "AG-SEC-892"
      ),
      User(
        id = "GUARD-102",
        employeeId = "EMP-1088",
        fullName = "Abebe Kebede",
        role = "GUARD",
        phone = "+251-91-987-6543",
        email = "a.kebede@aegisguard.et",
        pin = "1234",
        username = "abebe",
        password = "guard123",
        baseSiteId = "SITE-002",
        baseSiteName = "Financial Center Banking Hub",
        isActive = true,
        badgeNumber = "AG-SEC-914"
      ),
      User(
        id = "GUARD-103",
        employeeId = "EMP-1105",
        fullName = "Tigist Alemu",
        role = "GUARD",
        phone = "+251-92-345-6789",
        email = "t.alemu@aegisguard.et",
        pin = "1234",
        username = "tigist",
        password = "guard123",
        baseSiteId = "SITE-003",
        baseSiteName = "Industrial Logistics Hub",
        isActive = true,
        badgeNumber = "AG-SEC-763"
      )
    )
    _allGuards.value = sampleGuards

    // Setup shifts for the default guard (EMP-1042 / Dawit Tadesse)
    val now = System.currentTimeMillis()
    val todayDate = DateTimeUtils.getCurrentEatDateString()

    // Shift today starting at 08:00 AM EAT to 17:00 PM EAT
    val todayShift = Shift(
      id = "SHIFT-2026-TODAY",
      guardId = "GUARD-101",
      siteId = "SITE-001",
      siteName = "Main Corporate Headquarters",
      siteAddress = "Bole Road, Atlas Area, Addis Ababa",
      shiftDate = todayDate,
      startTime = "08:00 AM",
      endTime = "05:00 PM",
      isOvernight = false,
      instructions = "Perimeter security, visitor screening, and primary server room access log.",
      assignmentStatus = "CONFIRMED",
      scheduledStartUtcMillis = now - (30 * 60 * 1000), // Started 30 min ago
      scheduledEndUtcMillis = now + (8 * 60 * 60 * 1000)
    )

    val upcomingShift1 = Shift(
      id = "SHIFT-UPCOMING-1",
      guardId = "GUARD-101",
      siteId = "SITE-002",
      siteName = "Financial Center Banking Hub",
      siteAddress = "Mexico Square, Financial District",
      shiftDate = "2026-11-01",
      startTime = "08:00 AM",
      endTime = "05:00 PM",
      isOvernight = false,
      instructions = "Relieve morning cash-in-transit watch. Support main banking hall.",
      assignmentStatus = "CONFIRMED",
      scheduledStartUtcMillis = now + (24 * 60 * 60 * 1000),
      scheduledEndUtcMillis = now + (32 * 60 * 60 * 1000)
    )

    val overnightShift = Shift(
      id = "SHIFT-OVERNIGHT",
      guardId = "GUARD-101",
      siteId = "SITE-004",
      siteName = "Diplomatic Mission Compound",
      siteAddress = "Old Airport Zone, Embassy Row",
      shiftDate = "2026-11-03",
      startTime = "08:00 PM",
      endTime = "06:00 AM",
      isOvernight = true,
      instructions = "Night perimeter patrol. Hourly flashlight checkpoint log on fence boundary.",
      assignmentStatus = "CONFIRMED",
      scheduledStartUtcMillis = now + (72 * 60 * 60 * 1000),
      scheduledEndUtcMillis = now + (82 * 60 * 60 * 1000)
    )

    _shifts.value = listOf(todayShift, upcomingShift1, overnightShift)

    // Historical attendance records for Dawit
    val pastRecord1 = AttendanceRecord(
      id = "REC-PAST-01",
      shiftId = "SHIFT-PAST-01",
      guardId = "GUARD-101",
      guardName = "Dawit Tadesse",
      siteId = "SITE-001",
      siteName = "Main Corporate Headquarters",
      shiftDate = "2026-10-30",
      scheduledStartTime = "08:00 AM",
      scheduledEndTime = "05:00 PM",
      checkInTime = now - (26 * 60 * 60 * 1000),
      checkInFormatted = "08:04 AM EAT",
      checkInLat = 9.01052,
      checkInLng = 38.76103,
      checkInAccuracy = 12.0,
      checkOutTime = now - (17 * 60 * 60 * 1000),
      checkOutFormatted = "05:08 PM EAT",
      checkOutLat = 9.01049,
      checkOutLng = 38.76098,
      checkOutAccuracy = 14.5,
      method = "GPS+QR",
      status = AttendanceStatus.PRESENT,
      earlyDeparture = false,
      durationFormatted = "9h 04m"
    )

    val pastRecord2 = AttendanceRecord(
      id = "REC-PAST-02",
      shiftId = "SHIFT-PAST-02",
      guardId = "GUARD-101",
      guardName = "Dawit Tadesse",
      siteId = "SITE-003",
      siteName = "Industrial Logistics Hub",
      shiftDate = "2026-10-29",
      scheduledStartTime = "08:00 AM",
      scheduledEndTime = "05:00 PM",
      checkInTime = now - (50 * 60 * 60 * 1000),
      checkInFormatted = "08:22 AM EAT",
      checkInLat = 8.92205,
      checkInLng = 38.75602,
      checkInAccuracy = 18.0,
      checkOutTime = now - (41 * 60 * 60 * 1000),
      checkOutFormatted = "05:01 PM EAT",
      checkOutLat = 8.92198,
      checkOutLng = 38.75595,
      checkOutAccuracy = 15.0,
      method = "GPS+QR",
      status = AttendanceStatus.LATE,
      earlyDeparture = false,
      durationFormatted = "8h 39m"
    )

    val pastRecord3 = AttendanceRecord(
      id = "REC-PAST-03",
      shiftId = "SHIFT-PAST-03",
      guardId = "GUARD-101",
      guardName = "Dawit Tadesse",
      siteId = "SITE-002",
      siteName = "Financial Center Banking Hub",
      shiftDate = "2026-10-27",
      scheduledStartTime = "08:00 AM",
      scheduledEndTime = "05:00 PM",
      checkInTime = now - (98 * 60 * 60 * 1000),
      checkInFormatted = "08:00 AM EAT",
      checkInLat = 9.01351,
      checkInLng = 38.74898,
      checkInAccuracy = 10.0,
      checkOutTime = now - (91 * 60 * 60 * 1000),
      checkOutFormatted = "03:15 PM EAT",
      checkOutLat = 9.01348,
      checkOutLng = 38.74902,
      checkOutAccuracy = 11.2,
      method = "GPS+QR",
      status = AttendanceStatus.LEFT_EARLY,
      earlyDeparture = true,
      durationFormatted = "7h 15m"
    )

    _attendanceRecords.value = listOf(pastRecord1, pastRecord2, pastRecord3)

    // Seed notifications
    _notifications.value = listOf(
      NotificationItem(
        id = "NOTIF-1",
        guardId = "GUARD-101",
        title = "Shift Reminder: Today 08:00 AM",
        message = "Your assigned shift at Main Corporate Headquarters has begun. Please proceed to verify geofence & QR.",
        timestamp = now - (35 * 60 * 1000),
        timestampFormatted = "35m ago",
        isRead = false,
        type = "SHIFT_REMINDER"
      ),
      NotificationItem(
        id = "NOTIF-2",
        guardId = "GUARD-101",
        title = "Roster Update Confirmed",
        message = "Upcoming night watch on Nov 03 at Diplomatic Mission Compound assigned by Supervisor Yonas Hailu.",
        timestamp = now - (6 * 60 * 60 * 1000),
        timestampFormatted = "6h ago",
        isRead = true,
        type = "SUPERVISOR_NOTE"
      )
    )

    // Seed sample leave request
    _leaveRequests.value = listOf(
      LeaveRequest(
        id = "LEAVE-01",
        guardId = "GUARD-101",
        guardName = "Dawit Tadesse",
        leaveType = "ANNUAL",
        startDate = "2026-11-10",
        endDate = "2026-11-14",
        reason = "Annual scheduled family leave requested per CBA guidelines.",
        status = "PENDING",
        submittedAt = now - (24 * 60 * 60 * 1000),
        submittedAtFormatted = "Oct 30, 2026"
      )
    )

    // Seed realistic security & occurrence reports
    _reports.value = listOf(
      SecurityReport(
        id = "RPT-001",
        reportNumber = "CSR-94102",
        type = ReportType.INCIDENT,
        severity = ReportSeverity.PRIORITY,
        title = "Perimeter Motion Sensor Trip - Sector B",
        description = "Perimeter sensor #14 triggered at North fence boundary. Guard conducted visual sweep with high-beam patrol flashlight. Discovered stray feline breach through gravel culvert. Structural chain-link fence verified fully intact.",
        guardId = "GUARD-101",
        guardName = "Dawit Tadesse",
        badgeNumber = "AG-1042",
        siteId = "SITE-001",
        siteName = "Main Corporate Headquarters",
        locationSpecific = "North Perimeter Fence, Sector B Culvert",
        timestamp = now - (4 * 60 * 60 * 1000),
        timestampFormatted = "Today 04:30 AM EAT",
        status = ReportStatus.RESOLVED,
        actionTaken = "Culvert gap reinforced with temporary wire mesh. Perimeter confirmed clear and re-armed.",
        cryptographicHash = "SHA256:7f8a91c0e34b",
        witnessOrPersonnel = "Supervisor Yonas Hailu notified",
        resolutionNotes = "Verified by Operations Control. Work order dispatched to grounds maintenance.",
        latitude = 9.01053,
        longitude = 38.76105
      ),
      SecurityReport(
        id = "RPT-002",
        reportNumber = "CSR-94188",
        type = ReportType.VISITOR_EXCEPTION,
        severity = ReportSeverity.MINOR,
        title = "Unescorted HVAC Technician - Server Room",
        description = "Third-party HVAC technician arrived for chiller maintenance without registered visitor pass in the biometric registry. Contractor was held at security reception until host engineer verified credentials.",
        guardId = "GUARD-101",
        guardName = "Dawit Tadesse",
        badgeNumber = "AG-1042",
        siteId = "SITE-001",
        siteName = "Main Corporate Headquarters",
        locationSpecific = "Main Reception / Data Hall 1 Air-lock",
        timestamp = now - (22 * 60 * 60 * 1000),
        timestampFormatted = "Yesterday 10:45 AM EAT",
        status = ReportStatus.UNDER_REVIEW,
        actionTaken = "Contractor escorted to facility management office. Visitor visitor pass #T-082 issued upon phone confirmation.",
        cryptographicHash = "SHA256:c2980e159ab3",
        witnessOrPersonnel = "Engineer Kidist Wolde",
        latitude = 9.01050,
        longitude = 38.76100
      ),
      SecurityReport(
        id = "RPT-003",
        reportNumber = "CSR-93820",
        type = ReportType.SHIFT_HANDOVER,
        severity = ReportSeverity.ROUTINE,
        title = "Post Handover DOB & Equipment Audit",
        description = "Standard 8-hour shift handover. Completed physical inspection of 4 entry turnstiles, 12 fire extinguishers, server room biometric locks, and security key locker. All radios operational with full battery charge.",
        guardId = "GUARD-101",
        guardName = "Dawit Tadesse",
        badgeNumber = "AG-1042",
        siteId = "SITE-001",
        siteName = "Main Corporate Headquarters",
        locationSpecific = "Central Guard Post & Armory Desk",
        timestamp = now - (28 * 60 * 60 * 1000),
        timestampFormatted = "Oct 30, 2026 05:00 PM EAT",
        status = ReportStatus.RESOLVED,
        actionTaken = "Shift log countersigned by incoming Night Guard Solomon Girma. Log book sealed.",
        cryptographicHash = "SHA256:5b6028a4d701",
        witnessOrPersonnel = "Relieving Officer Solomon Girma",
        resolutionNotes = "Standard shift turnover confirmed.",
        latitude = 9.01048,
        longitude = 38.76098
      ),
      SecurityReport(
        id = "RPT-004",
        reportNumber = "CSR-93450",
        type = ReportType.MAINTENANCE_HAZARD,
        severity = ReportSeverity.MINOR,
        title = "Water Leakage Near East Emergency Exit",
        description = "Overhead sprinkler pipe dripping water onto stairwell landing near Exit Stairway E-2. Floor is slippery posing slip hazard to building occupants.",
        guardId = "GUARD-101",
        guardName = "Dawit Tadesse",
        badgeNumber = "AG-1042",
        siteId = "SITE-002",
        siteName = "Financial Center Banking Hub",
        locationSpecific = "East Stairwell Landing, Floor 2",
        timestamp = now - (74 * 60 * 60 * 1000),
        timestampFormatted = "Oct 28, 2026 02:15 PM EAT",
        status = ReportStatus.RESOLVED,
        actionTaken = "Yellow caution cones and warning tape erected around puddle. Building maintenance supervisor called.",
        cryptographicHash = "SHA256:e1a90c487f12",
        witnessOrPersonnel = "Facility Lead Michael K.",
        resolutionNotes = "Pipe gasket repaired by plumbing team on Oct 28 04:00 PM.",
        latitude = 9.01350,
        longitude = 38.74900
      )
    )

    // Start with unauthenticated state so user logs in on first open
    _currentUser.value = null
  }

  // --- Network State Simulation & Listener ---
  fun toggleNetworkConnectivity() {
    val next = !_isOnline.value
    _isOnline.value = next
    if (next) {
      // Auto synchronize pending offline submissions
      synchronizeOfflineQueue()
    }
  }

  fun setOnlineStatus(online: Boolean) {
    if (_isOnline.value != online) {
      _isOnline.value = online
      if (online) {
        synchronizeOfflineQueue()
      }
    }
  }

  fun calibrateSiteLocation(siteId: String, newLat: Double, newLng: Double) {
    _sites.value = _sites.value.map { site ->
      if (site.id == siteId) site.copy(latitude = newLat, longitude = newLng) else site
    }
    logSecurityAudit(
      guardId = _currentUser.value?.id ?: "SYSTEM",
      shiftId = "N/A",
      siteId = siteId,
      eventType = "SITE_CALIBRATION",
      reportedLat = newLat,
      reportedLng = newLng,
      geofenceResult = "UPDATED",
      qrResult = "N/A",
      isAccepted = true,
      reason = "Site center coordinates calibrated to current location ($newLat, $newLng)."
    )
  }

  // --- Authentication ---
  sealed class AuthResult {
    data class Success(val user: User) : AuthResult()
    data class AccountLocked(val remainingMinutes: Long) : AuthResult()
    data class InactiveAccount(val message: String) : AuthResult()
    data class InvalidCredentials(val remainingAttempts: Int) : AuthResult()
  }

  fun login(employeeId: String, pin: String): AuthResult {
    val identifier = employeeId.trim()
    val normalizedId = identifier.uppercase()
    val currentTime = System.currentTimeMillis()

    // 1. Check lockout policy (lockout for 15 minutes after 5 failed attempts)
    val lockoutExpiry = lockoutUntilMap[normalizedId] ?: 0L
    if (currentTime < lockoutExpiry) {
      val remainingMinutes = ((lockoutExpiry - currentTime) / (1000 * 60)) + 1
      logSecurityAudit(
        guardId = normalizedId,
        shiftId = "N/A",
        siteId = "N/A",
        eventType = "LOCKOUT_BLOCKED",
        geofenceResult = "N/A",
        qrResult = "N/A",
        isAccepted = false,
        reason = "Login attempted while locked out. Remaining: $remainingMinutes mins."
      )
      return AuthResult.AccountLocked(remainingMinutes)
    }

    // 2. Locate account by Employee ID or Username
    val user = _allGuards.value.find {
      it.employeeId.equals(normalizedId, ignoreCase = true) ||
      it.username.equals(identifier, ignoreCase = true)
    }

    val secretValid = user != null && (user.pin == pin || user.password == pin)

    if (user == null || !secretValid) {
      val attempts = (failedAttemptsMap[normalizedId] ?: 0) + 1
      failedAttemptsMap[normalizedId] = attempts

      if (attempts >= 5) {
        // Trigger 15 min lockout
        lockoutUntilMap[normalizedId] = currentTime + (15 * 60 * 1000)
        failedAttemptsMap[normalizedId] = 0
        logSecurityAudit(
          guardId = normalizedId,
          shiftId = "N/A",
          siteId = "N/A",
          eventType = "LOCKOUT",
          geofenceResult = "N/A",
          qrResult = "N/A",
          isAccepted = false,
          reason = "5 consecutive invalid password/PIN attempts. Account locked for 15 minutes."
        )
        return AuthResult.AccountLocked(15)
      } else {
        val remaining = 5 - attempts
        logSecurityAudit(
          guardId = normalizedId,
          shiftId = "N/A",
          siteId = "N/A",
          eventType = "AUTH_FAILURE",
          geofenceResult = "N/A",
          qrResult = "N/A",
          isAccepted = false,
          reason = "Invalid credentials entered. $remaining attempts remaining before lockout."
        )
        return AuthResult.InvalidCredentials(remaining)
      }
    }

    // 3. Check guard role (this mobile app is exclusively for security guards)
    if (user.role != "GUARD") {
      return AuthResult.InactiveAccount("This mobile terminal is exclusively for active Security Guards. Operations and supervisory staff should access the Web Operations Console.")
    }

    // 4. Check active status
    if (!user.isActive) {
      return AuthResult.InactiveAccount("Your employee account is suspended or inactive. Contact Security Operations.")
    }

    // 4. Success: reset failed attempts & set user
    failedAttemptsMap.remove(normalizedId)
    lockoutUntilMap.remove(normalizedId)
    _currentUser.value = user
    return AuthResult.Success(user)
  }

  fun logout() {
    _currentUser.value = null
  }

  // --- Check-In Workflow ---
  sealed class CheckInResult {
    data class Success(val record: AttendanceRecord, val message: String) : CheckInResult()
    data class QueuedOffline(val record: AttendanceRecord, val message: String) : CheckInResult()
    data class OutsideGeofence(val distanceMeters: Double, val radiusMeters: Double) : CheckInResult()
    data class InsufficientAccuracy(val accuracyMeters: Double, val requiredMeters: Double = 50.0) : CheckInResult()
    data class InvalidQr(val message: String) : CheckInResult()
    data class DuplicateAttendance(val message: String) : CheckInResult()
    data class Error(val message: String) : CheckInResult()
  }

  fun submitCheckIn(
    shift: Shift,
    site: Site,
    capturedLat: Double,
    capturedLng: Double,
    accuracyMeters: Double,
    qrToken: String,
    selfieUri: String? = null
  ): CheckInResult {
    val guard = _currentUser.value ?: return CheckInResult.Error("Not authenticated")

    // 1. Check duplicate check-in for this shift
    val existing = _attendanceRecords.value.find {
      it.shiftId == shift.id && it.guardId == guard.id && it.checkInTime != null
    }
    if (existing != null) {
      logSecurityAudit(
        guardId = guard.id,
        shiftId = shift.id,
        siteId = site.id,
        eventType = "CHECK_IN",
        reportedLat = capturedLat,
        reportedLng = capturedLng,
        reportedAccuracy = accuracyMeters,
        geofenceResult = "SKIPPED",
        qrResult = "SKIPPED",
        isAccepted = false,
        reason = "Rejected: Duplicate check-in attempt for active shift."
      )
      return CheckInResult.DuplicateAttendance("You have already checked in for this shift at ${existing.checkInFormatted}.")
    }

    // 2. Validate Geofence (Haversine & accuracy <= 50m)
    val geofenceEvaluation = GeofenceUtils.validateGeofence(
      guardLat = capturedLat,
      guardLng = capturedLng,
      guardAccuracyMeters = accuracyMeters,
      siteLat = site.latitude,
      siteLng = site.longitude,
      siteRadiusMeters = site.geofenceRadiusMeters,
      requiredAccuracyMeters = 50.0
    )

    when (geofenceEvaluation) {
      is GeofenceUtils.GeofenceValidationResult.InsufficientAccuracy -> {
        logSecurityAudit(
          guardId = guard.id,
          shiftId = shift.id,
          siteId = site.id,
          eventType = "CHECK_IN",
          reportedLat = capturedLat,
          reportedLng = capturedLng,
          reportedAccuracy = accuracyMeters,
          geofenceResult = "POOR_ACCURACY",
          qrResult = "SKIPPED",
          isAccepted = false,
          reason = "GPS accuracy ${accuracyMeters.toInt()}m exceeds maximum allowed 50m."
        )
        return CheckInResult.InsufficientAccuracy(accuracyMeters, 50.0)
      }
      is GeofenceUtils.GeofenceValidationResult.OutsideGeofence -> {
        logSecurityAudit(
          guardId = guard.id,
          shiftId = shift.id,
          siteId = site.id,
          eventType = "CHECK_IN",
          reportedLat = capturedLat,
          reportedLng = capturedLng,
          reportedAccuracy = accuracyMeters,
          geofenceResult = "FAILED_OUTSIDE_RADIUS",
          qrResult = "SKIPPED",
          isAccepted = false,
          reason = "Guard is outside perimeter. Distance: ${geofenceEvaluation.distanceMeters.toInt()}m, allowed radius: ${geofenceEvaluation.radiusMeters.toInt()}m."
        )
        return CheckInResult.OutsideGeofence(geofenceEvaluation.distanceMeters, geofenceEvaluation.radiusMeters)
      }
      is GeofenceUtils.GeofenceValidationResult.Success -> {
        // Geofence passed, continue to QR
      }
    }

    // 3. Validate QR Token
    if (qrToken.trim() != site.qrCodeToken.trim()) {
      logSecurityAudit(
        guardId = guard.id,
        shiftId = shift.id,
        siteId = site.id,
        eventType = "CHECK_IN",
        reportedLat = capturedLat,
        reportedLng = capturedLng,
        reportedAccuracy = accuracyMeters,
        geofenceResult = "PASSED",
        qrResult = "INVALID_TOKEN",
        isAccepted = false,
        reason = "QR code does not match authorized token for site ${site.name}."
      )
      return CheckInResult.InvalidQr("Scanned QR code does not match site ${site.name}. Please scan the designated official site barcode.")
    }

    // 4. Offline Handling
    val now = System.currentTimeMillis()
    if (!_isOnline.value) {
      // Store in offline queue preserving device timestamp as untrusted metadata
      val offlineRecord = AttendanceRecord(
        id = "OFFLINE-${UUID.randomUUID()}",
        shiftId = shift.id,
        guardId = guard.id,
        guardName = guard.fullName,
        siteId = site.id,
        siteName = site.name,
        shiftDate = shift.shiftDate,
        scheduledStartTime = shift.startTime,
        scheduledEndTime = shift.endTime,
        checkInTime = null, // Will be set authoritatively when synced
        checkInFormatted = "Pending Sync",
        checkInLat = capturedLat,
        checkInLng = capturedLng,
        checkInAccuracy = accuracyMeters,
        method = "OFFLINE_SYNC",
        status = AttendanceStatus.MANUAL,
        isOfflineQueued = true,
        deviceTimestamp = now
      )
      _offlineQueue.value = _offlineQueue.value + offlineRecord
      logSecurityAudit(
        guardId = guard.id,
        shiftId = shift.id,
        siteId = site.id,
        eventType = "CHECK_IN_OFFLINE_QUEUED",
        reportedLat = capturedLat,
        reportedLng = capturedLng,
        reportedAccuracy = accuracyMeters,
        geofenceResult = "PASSED",
        qrResult = "PASSED",
        isAccepted = true,
        reason = "Offline mode active. Submission queued with captured device metadata."
      )
      return CheckInResult.QueuedOffline(
        offlineRecord,
        "Offline submission queued. Captured GPS and QR are stored locally and will sync when network connectivity is restored."
      )
    }

    // 5. Authoritative Server Evaluation
    val calculatedStatus = DateTimeUtils.evaluateCheckInStatus(
      scheduledStartUtcMillis = shift.scheduledStartUtcMillis,
      actualCheckInUtcMillis = now,
      gracePeriodMinutes = 15L
    )

    val acceptedRecord = AttendanceRecord(
      id = "ATT-${UUID.randomUUID().toString().take(8).uppercase()}",
      shiftId = shift.id,
      guardId = guard.id,
      guardName = guard.fullName,
      siteId = site.id,
      siteName = site.name,
      shiftDate = shift.shiftDate,
      scheduledStartTime = shift.startTime,
      scheduledEndTime = shift.endTime,
      checkInTime = now,
      checkInFormatted = DateTimeUtils.formatToEatTime(now),
      checkInLat = capturedLat,
      checkInLng = capturedLng,
      checkInAccuracy = accuracyMeters,
      method = if (selfieUri != null) "GPS+QR+SELFIE" else "GPS+QR",
      status = calculatedStatus,
      isOfflineQueued = false
    )

    // Save to attendance state
    _attendanceRecords.value = listOf(acceptedRecord) + _attendanceRecords.value

    // Record audit log
    logSecurityAudit(
      guardId = guard.id,
      shiftId = shift.id,
      siteId = site.id,
      eventType = "CHECK_IN",
      reportedLat = capturedLat,
      reportedLng = capturedLng,
      reportedAccuracy = accuracyMeters,
      geofenceResult = "PASSED",
      qrResult = "PASSED",
      isAccepted = true,
      reason = "Check-in accepted. Status: ${calculatedStatus.label}. Server time: ${acceptedRecord.checkInFormatted}."
    )

    // Post notification
    val notif = NotificationItem(
      id = "NOTIF-${System.currentTimeMillis()}",
      guardId = guard.id,
      title = "Check-in Successful (${calculatedStatus.label})",
      message = "Your check-in at ${site.name} was verified and recorded at ${acceptedRecord.checkInFormatted}.",
      timestamp = now,
      timestampFormatted = "Just now",
      isRead = false,
      type = "ATTENDANCE_CONFIRMED"
    )
    _notifications.value = listOf(notif) + _notifications.value

    return CheckInResult.Success(
      acceptedRecord,
      "Check-in verified successfully at ${site.name}. Status: ${calculatedStatus.label}."
    )
  }

  // --- Checkout Workflow ---
  sealed class CheckOutResult {
    data class Success(val record: AttendanceRecord, val message: String) : CheckOutResult()
    data class OutsideGeofence(val distanceMeters: Double, val radiusMeters: Double) : CheckOutResult()
    data class InsufficientAccuracy(val accuracyMeters: Double) : CheckOutResult()
    data class Error(val message: String) : CheckOutResult()
  }

  fun submitCheckOut(
    record: AttendanceRecord,
    site: Site,
    capturedLat: Double,
    capturedLng: Double,
    accuracyMeters: Double,
    qrToken: String? = null
  ): CheckOutResult {
    val guard = _currentUser.value ?: return CheckOutResult.Error("Not authenticated")

    if (record.checkInTime == null) {
      return CheckOutResult.Error("Cannot check out without a valid check-in.")
    }
    if (record.checkOutTime != null) {
      return CheckOutResult.Error("This shift has already been checked out at ${record.checkOutFormatted}.")
    }

    // Geofence check
    val geofenceEvaluation = GeofenceUtils.validateGeofence(
      guardLat = capturedLat,
      guardLng = capturedLng,
      guardAccuracyMeters = accuracyMeters,
      siteLat = site.latitude,
      siteLng = site.longitude,
      siteRadiusMeters = site.geofenceRadiusMeters,
      requiredAccuracyMeters = 50.0
    )

    when (geofenceEvaluation) {
      is GeofenceUtils.GeofenceValidationResult.InsufficientAccuracy -> {
        logSecurityAudit(
          guardId = guard.id,
          shiftId = record.shiftId,
          siteId = site.id,
          eventType = "CHECK_OUT",
          reportedLat = capturedLat,
          reportedLng = capturedLng,
          reportedAccuracy = accuracyMeters,
          geofenceResult = "POOR_ACCURACY",
          qrResult = "SKIPPED",
          isAccepted = false,
          reason = "Checkout GPS accuracy ${accuracyMeters.toInt()}m exceeds threshold 50m."
        )
        return CheckOutResult.InsufficientAccuracy(accuracyMeters)
      }
      is GeofenceUtils.GeofenceValidationResult.OutsideGeofence -> {
        logSecurityAudit(
          guardId = guard.id,
          shiftId = record.shiftId,
          siteId = site.id,
          eventType = "CHECK_OUT",
          reportedLat = capturedLat,
          reportedLng = capturedLng,
          reportedAccuracy = accuracyMeters,
          geofenceResult = "FAILED_OUTSIDE_RADIUS",
          qrResult = "SKIPPED",
          isAccepted = false,
          reason = "Checkout outside site radius (${geofenceEvaluation.distanceMeters.toInt()}m > ${geofenceEvaluation.radiusMeters.toInt()}m)."
        )
        return CheckOutResult.OutsideGeofence(geofenceEvaluation.distanceMeters, geofenceEvaluation.radiusMeters)
      }
      is GeofenceUtils.GeofenceValidationResult.Success -> {}
    }

    val now = System.currentTimeMillis()
    val elapsed = now - record.checkInTime
    val elapsedStr = DateTimeUtils.formatDuration(elapsed)

    // Check early departure
    val matchingShift = _shifts.value.find { it.id == record.shiftId }
    val isEarly = matchingShift != null && DateTimeUtils.isEarlyDeparture(
      scheduledEndUtcMillis = matchingShift.scheduledEndUtcMillis,
      actualCheckOutUtcMillis = now,
      thresholdMinutes = 10L
    )

    val finalStatus = if (isEarly && record.status != AttendanceStatus.LATE) {
      AttendanceStatus.LEFT_EARLY
    } else {
      record.status
    }

    val updatedRecord = record.copy(
      checkOutTime = now,
      checkOutFormatted = DateTimeUtils.formatToEatTime(now),
      checkOutLat = capturedLat,
      checkOutLng = capturedLng,
      checkOutAccuracy = accuracyMeters,
      durationFormatted = elapsedStr,
      earlyDeparture = isEarly,
      status = finalStatus
    )

    // Update in records list
    _attendanceRecords.value = _attendanceRecords.value.map {
      if (it.id == record.id) updatedRecord else it
    }

    logSecurityAudit(
      guardId = guard.id,
      shiftId = record.shiftId,
      siteId = site.id,
      eventType = "CHECK_OUT",
      reportedLat = capturedLat,
      reportedLng = capturedLng,
      reportedAccuracy = accuracyMeters,
      geofenceResult = "PASSED",
      qrResult = if (qrToken != null) "PASSED" else "NOT_REQUIRED",
      isAccepted = true,
      reason = "Checkout verified. Elapsed: $elapsedStr. Early departure: $isEarly."
    )

    return CheckOutResult.Success(
      updatedRecord,
      "Checkout completed at ${updatedRecord.checkOutFormatted}. Shift duration: $elapsedStr."
    )
  }

  // --- Offline Queue Synchronization ---
  fun synchronizeOfflineQueue(): Int {
    val pending = _offlineQueue.value
    val offlineReports = _reports.value.filter { it.isOfflineQueued }

    if (pending.isEmpty() && offlineReports.isEmpty()) return 0

    val now = System.currentTimeMillis()
    val synchronizedRecords = pending.map { record ->
      record.copy(
        id = "ATT-SYNC-${UUID.randomUUID().toString().take(6).uppercase()}",
        checkInTime = now,
        checkInFormatted = "${DateTimeUtils.formatToEatTime(now)} (Synced)",
        status = AttendanceStatus.PRESENT,
        isOfflineQueued = false
      )
    }

    if (synchronizedRecords.isNotEmpty()) {
      _attendanceRecords.value = synchronizedRecords + _attendanceRecords.value
      _offlineQueue.value = emptyList()
    }

    // Sync any queued offline reports
    if (offlineReports.isNotEmpty()) {
      _reports.value = _reports.value.map {
        if (it.isOfflineQueued) it.copy(isOfflineQueued = false) else it
      }
    }

    logSecurityAudit(
      guardId = _currentUser.value?.id ?: "SYSTEM",
      shiftId = "BATCH",
      siteId = "BATCH",
      eventType = "OFFLINE_SYNC_COMPLETE",
      geofenceResult = "VERIFIED_POST",
      qrResult = "VERIFIED_POST",
      isAccepted = true,
      reason = "Synchronized ${synchronizedRecords.size} offline attendance and ${offlineReports.size} offline report submissions to server."
    )

    return synchronizedRecords.size + offlineReports.size
  }

  // --- Profile Photo Management ---
  fun updateProfilePicture(uri: String?) {
    val current = _currentUser.value ?: return
    val updated = current.copy(profilePictureUri = uri)
    _currentUser.value = updated
    _allGuards.value = _allGuards.value.map { if (it.id == current.id) updated else it }

    logSecurityAudit(
      guardId = current.id,
      shiftId = "PROFILE",
      siteId = current.baseSiteId,
      eventType = "PROFILE_PHOTO_UPDATED",
      geofenceResult = "N/A",
      qrResult = "N/A",
      isAccepted = true,
      reason = if (uri != null) "Officer profile photo updated." else "Officer profile photo reset to initials."
    )
  }

  // --- Attendance Review Request ---
  fun requestAttendanceReview(recordId: String, notes: String) {
    _attendanceRecords.value = _attendanceRecords.value.map {
      if (it.id == recordId) {
        it.copy(
          reviewRequested = true,
          reviewNotes = notes,
          reviewStatus = "PENDING"
        )
      } else it
    }
  }

  // --- Leave Requests ---
  fun submitLeaveRequest(type: String, startDate: String, endDate: String, reason: String): Boolean {
    val guard = _currentUser.value ?: return false
    val newRequest = LeaveRequest(
      id = "LEAVE-${System.currentTimeMillis()}",
      guardId = guard.id,
      guardName = guard.fullName,
      leaveType = type,
      startDate = startDate,
      endDate = endDate,
      reason = reason,
      status = "PENDING",
      submittedAt = System.currentTimeMillis(),
      submittedAtFormatted = DateTimeUtils.getCurrentEatDateString()
    )
    _leaveRequests.value = listOf(newRequest) + _leaveRequests.value

    logSecurityAudit(
      guardId = guard.id,
      shiftId = "N/A",
      siteId = "N/A",
      eventType = "LEAVE_SUBMITTED",
      geofenceResult = "N/A",
      qrResult = "N/A",
      isAccepted = true,
      reason = "Leave requested for $startDate to $endDate ($type)."
    )
    return true
  }

  // --- Shift Swap Requests ---
  fun submitShiftSwapRequest(shift: Shift, targetGuard: User, reason: String): Boolean {
    val guard = _currentUser.value ?: return false
    val newSwap = ShiftSwapRequest(
      id = "SWAP-${System.currentTimeMillis()}",
      requesterGuardId = guard.id,
      requesterGuardName = guard.fullName,
      shiftId = shift.id,
      shiftDate = shift.shiftDate,
      shiftTime = "${shift.startTime} - ${shift.endTime}",
      siteName = shift.siteName,
      targetGuardId = targetGuard.id,
      targetGuardName = targetGuard.fullName,
      reason = reason,
      status = "PENDING",
      submittedAt = System.currentTimeMillis(),
      submittedAtFormatted = DateTimeUtils.getCurrentEatDateString()
    )
    _shiftSwapRequests.value = listOf(newSwap) + _shiftSwapRequests.value

    logSecurityAudit(
      guardId = guard.id,
      shiftId = shift.id,
      siteId = shift.siteId,
      eventType = "SHIFT_SWAP_SUBMITTED",
      geofenceResult = "N/A",
      qrResult = "N/A",
      isAccepted = true,
      reason = "Shift swap requested with ${targetGuard.fullName} for ${shift.shiftDate}."
    )
    return true
  }

  // --- Notifications ---
  fun markNotificationAsRead(id: String) {
    _notifications.value = _notifications.value.map {
      if (it.id == id) it.copy(isRead = true) else it
    }
  }

  fun markAllNotificationsAsRead() {
    val currentGuardId = _currentUser.value?.id ?: return
    _notifications.value = _notifications.value.map {
      if (it.guardId == currentGuardId) it.copy(isRead = true) else it
    }
  }

  // --- Supervisor Simulation Actions (Approval & Sync verification) ---
  fun supervisorApproveLeave(leaveId: String, comment: String = "Approved per station roster requirements.") {
    _leaveRequests.value = _leaveRequests.value.map {
      if (it.id == leaveId) it.copy(status = "APPROVED", supervisorComment = comment) else it
    }
  }

  fun supervisorApproveSwap(swapId: String) {
    _shiftSwapRequests.value = _shiftSwapRequests.value.map {
      if (it.id == swapId) it.copy(status = "APPROVED", supervisorComment = "Swap approved by Operations Control.") else it
    }
  }

  fun supervisorResolveReview(recordId: String, approve: Boolean, comment: String) {
    _attendanceRecords.value = _attendanceRecords.value.map {
      if (it.id == recordId) {
        it.copy(
          reviewStatus = if (approve) "APPROVED" else "DECLINED",
          status = if (approve) AttendanceStatus.PRESENT else it.status
        )
      } else it
    }
  }

  // --- Security & Incident Reports ---
  fun generateCryptographicHash(content: String): String {
    return try {
      val digest = java.security.MessageDigest.getInstance("SHA-256")
      val hashBytes = digest.digest(content.toByteArray(Charsets.UTF_8))
      "SHA256:" + hashBytes.take(6).joinToString("") { "%02x".format(it) }
    } catch (_: Exception) {
      "SHA256:" + UUID.randomUUID().toString().take(12)
    }
  }

  fun submitSecurityReport(
    type: ReportType,
    severity: ReportSeverity,
    title: String,
    description: String,
    siteId: String,
    locationSpecific: String,
    actionTaken: String,
    witnessOrPersonnel: String? = null,
    latitude: Double? = null,
    longitude: Double? = null
  ): SecurityReport? {
    val guard = _currentUser.value ?: return null
    val site = _sites.value.find { it.id == siteId } ?: _sites.value.firstOrNull()
    val siteName = site?.name ?: guard.baseSiteName
    val now = System.currentTimeMillis()
    val reportId = "RPT-${now.toString().takeLast(6)}"
    val reportNum = "CSR-${(10000..99999).random()}"
    val rawSignature = "${guard.id}|$siteId|$now|$title|$actionTaken"
    val hash = generateCryptographicHash(rawSignature)

    val newReport = SecurityReport(
      id = reportId,
      reportNumber = reportNum,
      type = type,
      severity = severity,
      title = title.trim(),
      description = description.trim(),
      guardId = guard.id,
      guardName = guard.fullName,
      badgeNumber = guard.badgeNumber ?: guard.employeeId,
      siteId = siteId,
      siteName = siteName,
      locationSpecific = locationSpecific.trim(),
      timestamp = now,
      timestampFormatted = DateTimeUtils.formatToEatDateTime(now),
      status = ReportStatus.SUBMITTED,
      actionTaken = actionTaken.trim(),
      cryptographicHash = hash,
      witnessOrPersonnel = witnessOrPersonnel?.trim()?.takeIf { it.isNotBlank() },
      isOfflineQueued = !_isOnline.value,
      latitude = latitude,
      longitude = longitude
    )

    _reports.value = listOf(newReport) + _reports.value

    logSecurityAudit(
      guardId = guard.id,
      shiftId = "POST-LOG",
      siteId = siteId,
      eventType = "REPORT_FILED",
      reportedLat = latitude,
      reportedLng = longitude,
      geofenceResult = "LOGGED",
      qrResult = "SEALED",
      isAccepted = true,
      reason = "Report $reportNum filed: [${type.label}] $title (Severity: ${severity.label})."
    )

    val notif = NotificationItem(
      id = "NOTIF-RPT-${UUID.randomUUID().toString().take(6)}",
      guardId = guard.id,
      title = "Occurrence Report Sealed",
      message = "Post incident log $reportNum ($title) filed with cryptographic hash $hash.",
      timestamp = now,
      timestampFormatted = "Just now",
      isRead = false,
      type = "REPORT_CONFIRMATION"
    )
    _notifications.value = listOf(notif) + _notifications.value

    return newReport
  }

  fun resolveSecurityReport(reportId: String, notes: String): Boolean {
    val report = _reports.value.find { it.id == reportId } ?: return false
    val guard = _currentUser.value ?: return false
    val updated = report.copy(
      status = ReportStatus.RESOLVED,
      resolutionNotes = notes.trim()
    )
    _reports.value = _reports.value.map { if (it.id == reportId) updated else it }

    logSecurityAudit(
      guardId = guard.id,
      shiftId = "POST-LOG",
      siteId = report.siteId,
      eventType = "REPORT_RESOLVED",
      geofenceResult = "N/A",
      qrResult = "N/A",
      isAccepted = true,
      reason = "Report ${report.reportNumber} marked resolved: $notes"
    )
    return true
  }

  // --- Audit Logger ---
  private fun logSecurityAudit(
    guardId: String,
    shiftId: String,
    siteId: String,
    eventType: String,
    reportedLat: Double? = null,
    reportedLng: Double? = null,
    reportedAccuracy: Double? = null,
    geofenceResult: String,
    qrResult: String,
    isAccepted: Boolean,
    reason: String
  ) {
    val now = System.currentTimeMillis()
    val entry = AuditLogEntry(
      id = "AUD-${UUID.randomUUID().toString().take(8).uppercase()}",
      guardId = guardId,
      shiftId = shiftId,
      siteId = siteId,
      eventType = eventType,
      serverTimestamp = now,
      serverTimestampFormatted = DateTimeUtils.formatToEatDateTime(now),
      reportedLat = reportedLat,
      reportedLng = reportedLng,
      reportedAccuracy = reportedAccuracy,
      geofenceResult = geofenceResult,
      qrResult = qrResult,
      isAccepted = isAccepted,
      reason = reason
    )
    _auditLogs.value = listOf(entry) + _auditLogs.value
  }
}
