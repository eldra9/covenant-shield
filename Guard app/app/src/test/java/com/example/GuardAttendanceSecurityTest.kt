package com.example

import com.example.data.model.AttendanceStatus
import com.example.data.model.ReportSeverity
import com.example.data.model.ReportStatus
import com.example.data.model.ReportType
import com.example.data.repository.SecurityRepository
import com.example.util.DateTimeUtils
import com.example.util.GeofenceUtils
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test

class GuardAttendanceSecurityTest {

  private lateinit var repository: SecurityRepository

  @Before
  fun setUp() {
    repository = SecurityRepository()
  }

  @Test
  fun validGuardLogin_succeeds() {
    val result = repository.login("EMP-1042", "1234")
    assertTrue(result is SecurityRepository.AuthResult.Success)
    val user = (result as SecurityRepository.AuthResult.Success).user
    assertEquals("EMP-1042", user.employeeId)
    assertEquals("Dawit Tadesse", user.fullName)
  }

  @Test
  fun invalidCredentials_tracksRemainingAttempts() {
    val result = repository.login("EMP-1042", "wrong_pin")
    assertTrue(result is SecurityRepository.AuthResult.InvalidCredentials)
    assertEquals(4, (result as SecurityRepository.AuthResult.InvalidCredentials).remainingAttempts)
  }

  @Test
  fun fiveFailedAttempts_triggersSecurityLockout() {
    // Attempt 5 incorrect logins
    repeat(4) {
      repository.login("EMP-1042", "bad_pin_$it")
    }
    val finalAttempt = repository.login("EMP-1042", "bad_pin_5")
    assertTrue(finalAttempt is SecurityRepository.AuthResult.AccountLocked)
    assertEquals(15L, (finalAttempt as SecurityRepository.AuthResult.AccountLocked).remainingMinutes)

    // Sixth attempt should also be blocked by lockout policy
    val blockedAttempt = repository.login("EMP-1042", "1234")
    assertTrue(blockedAttempt is SecurityRepository.AuthResult.AccountLocked)
  }

  @Test
  fun geofence_validatesCorrectPerimeterAndAccuracy() {
    // Site center (9.01050, 38.76100), guard ~15m away, accuracy 12m, radius 100m
    val result = GeofenceUtils.validateGeofence(
      guardLat = 9.01052,
      guardLng = 9.01052, // wait, test distance
      guardAccuracyMeters = 12.0,
      siteLat = 9.01050,
      siteLng = 9.01050,
      siteRadiusMeters = 100.0,
      requiredAccuracyMeters = 50.0
    )
    assertTrue(result is GeofenceUtils.GeofenceValidationResult.Success)
  }

  @Test
  fun geofence_rejectsWhenOutsideRadius() {
    // Site at 9.0105, 38.7610; Guard far away at 9.0305, 38.7910
    val result = GeofenceUtils.validateGeofence(
      guardLat = 9.0305,
      guardLng = 38.7910,
      guardAccuracyMeters = 15.0,
      siteLat = 9.0105,
      siteLng = 38.7610,
      siteRadiusMeters = 100.0,
      requiredAccuracyMeters = 50.0
    )
    assertTrue(result is GeofenceUtils.GeofenceValidationResult.OutsideGeofence)
    val outside = result as GeofenceUtils.GeofenceValidationResult.OutsideGeofence
    assertTrue(outside.distanceMeters > 100.0)
  }

  @Test
  fun geofence_rejectsPoorGpsAccuracy() {
    val result = GeofenceUtils.validateGeofence(
      guardLat = 9.01050,
      guardLng = 38.76100,
      guardAccuracyMeters = 85.0, // Exceeds 50m
      siteLat = 9.01050,
      siteLng = 38.76100,
      siteRadiusMeters = 100.0,
      requiredAccuracyMeters = 50.0
    )
    assertTrue(result is GeofenceUtils.GeofenceValidationResult.InsufficientAccuracy)
  }

  @Test
  fun checkIn_rejectsInvalidQrToken() {
    repository.login("EMP-1042", "1234")
    val shift = repository.shifts.value.first()
    val site = repository.sites.value.find { it.id == shift.siteId }!!

    val result = repository.submitCheckIn(
      shift = shift,
      site = site,
      capturedLat = site.latitude,
      capturedLng = site.longitude,
      accuracyMeters = 10.0,
      qrToken = "FORGED_QR_TOKEN_ABC"
    )
    assertTrue(result is SecurityRepository.CheckInResult.InvalidQr)
  }

  @Test
  fun checkIn_evaluatesGracePeriodStatus() {
    val scheduledStart = 1000000L
    // Check-in at 10 minutes into shift (within 15 min grace period)
    val onTimeStatus = DateTimeUtils.evaluateCheckInStatus(
      scheduledStartUtcMillis = scheduledStart,
      actualCheckInUtcMillis = scheduledStart + (10 * 60 * 1000)
    )
    assertEquals(AttendanceStatus.PRESENT, onTimeStatus)

    // Check-in at 25 minutes into shift (after 15 min grace period)
    val lateStatus = DateTimeUtils.evaluateCheckInStatus(
      scheduledStartUtcMillis = scheduledStart,
      actualCheckInUtcMillis = scheduledStart + (25 * 60 * 1000)
    )
    assertEquals(AttendanceStatus.LATE, lateStatus)
  }

  @Test
  fun checkIn_preventsDuplicateAttendanceRecords() {
    repository.login("EMP-1042", "1234")
    val shift = repository.shifts.value.first()
    val site = repository.sites.value.find { it.id == shift.siteId }!!

    // First check-in succeeds
    val first = repository.submitCheckIn(
      shift = shift,
      site = site,
      capturedLat = site.latitude,
      capturedLng = site.longitude,
      accuracyMeters = 10.0,
      qrToken = site.qrCodeToken
    )
    assertTrue(first is SecurityRepository.CheckInResult.Success)

    // Second check-in for the same shift must be rejected
    val duplicate = repository.submitCheckIn(
      shift = shift,
      site = site,
      capturedLat = site.latitude,
      capturedLng = site.longitude,
      accuracyMeters = 10.0,
      qrToken = site.qrCodeToken
    )
    assertTrue(duplicate is SecurityRepository.CheckInResult.DuplicateAttendance)
  }

  @Test
  fun offlineQueue_queuesAndSyncsWhenOnline() {
    repository.login("EMP-1042", "1234")
    val shift = repository.shifts.value.first()
    val site = repository.sites.value.find { it.id == shift.siteId }!!

    // Set offline
    repository.toggleNetworkConnectivity()
    assertFalse(repository.isOnline.value)

    val offlineResult = repository.submitCheckIn(
      shift = shift,
      site = site,
      capturedLat = site.latitude,
      capturedLng = site.longitude,
      accuracyMeters = 15.0,
      qrToken = site.qrCodeToken
    )
    assertTrue(offlineResult is SecurityRepository.CheckInResult.QueuedOffline)
    assertEquals(1, repository.offlineQueue.value.size)

    // Go back online and synchronize
    val syncedCount = repository.synchronizeOfflineQueue()
    assertEquals(1, syncedCount)
    assertEquals(0, repository.offlineQueue.value.size)
  }

  @Test
  fun submitSecurityReport_createsReportWithCryptographicHashAndAuditEntry() {
    repository.login("EMP-1042", "1234")
    val initialReportsCount = repository.reports.value.size

    val report = repository.submitSecurityReport(
      type = ReportType.INCIDENT,
      severity = ReportSeverity.CRITICAL,
      title = "Unauthorized Perimeter Intrusion Attempt",
      description = "Suspect attempted to scale west boundary fence. Post guard intercepted.",
      siteId = "SITE-001",
      locationSpecific = "West Boundary Fence Gate 4",
      actionTaken = "Detained suspect, confiscated bolt cutters, handed over to police.",
      witnessOrPersonnel = "Officer Solomon G."
    )

    assertNotNull(report)
    assertEquals(initialReportsCount + 1, repository.reports.value.size)
    assertTrue(report!!.cryptographicHash.startsWith("SHA256:"))
    assertEquals(ReportStatus.SUBMITTED, report.status)
    assertEquals("Unauthorized Perimeter Intrusion Attempt", report.title)

    // Verify audit log has entry
    val lastAudit = repository.auditLogs.value.first()
    assertEquals("REPORT_FILED", lastAudit.eventType)
    assertTrue(lastAudit.isAccepted)
  }

  @Test
  fun resolveSecurityReport_updatesStatusAndNotes() {
    repository.login("EMP-1042", "1234")
    val report = repository.submitSecurityReport(
      type = ReportType.MAINTENANCE_HAZARD,
      severity = ReportSeverity.MINOR,
      title = "Broken stair lamp",
      description = "Lamp flickering on emergency stairs",
      siteId = "SITE-001",
      locationSpecific = "Stairs B",
      actionTaken = "Marked with hazard sign"
    )
    assertNotNull(report)

    val resolved = repository.resolveSecurityReport(report!!.id, "Bulb replaced by maintenance crew.")
    assertTrue(resolved)

    val updated = repository.reports.value.find { it.id == report.id }
    assertNotNull(updated)
    assertEquals(ReportStatus.RESOLVED, updated!!.status)
    assertEquals("Bulb replaced by maintenance crew.", updated.resolutionNotes)

    // Verify audit log entry
    val lastAudit = repository.auditLogs.value.first()
    assertEquals("REPORT_RESOLVED", lastAudit.eventType)
  }

  @Test
  fun offlineReport_marksOfflineQueuedAndClearsOnSync() {
    repository.login("EMP-1042", "1234")
    repository.toggleNetworkConnectivity()
    assertFalse(repository.isOnline.value)

    val report = repository.submitSecurityReport(
      type = ReportType.PATROL_LOG,
      severity = ReportSeverity.ROUTINE,
      title = "Routine Checkpoint Alpha",
      description = "Perimeter checked, all seals secure.",
      siteId = "SITE-001",
      locationSpecific = "Checkpoint Alpha",
      actionTaken = "Logged status in local DOB"
    )
    assertNotNull(report)
    assertTrue(report!!.isOfflineQueued)

    // Sync online
    repository.toggleNetworkConnectivity()
    assertTrue(repository.isOnline.value)

    val updatedReport = repository.reports.value.find { it.id == report.id }
    assertNotNull(updatedReport)
    assertFalse(updatedReport!!.isOfflineQueued)
  }

  @Test
  fun updateProfilePicture_updatesUserAndLogsAudit() {
    repository.login("EMP-1042", "1234")
    assertNull(repository.currentUser.value?.profilePictureUri)

    val sampleUri = "content://media/external/images/media/42"
    repository.updateProfilePicture(sampleUri)

    assertEquals(sampleUri, repository.currentUser.value?.profilePictureUri)
    val audit = repository.auditLogs.value.first()
    assertEquals("PROFILE_PHOTO_UPDATED", audit.eventType)
    assertTrue(audit.isAccepted)

    // Clear photo
    repository.updateProfilePicture(null)
    assertNull(repository.currentUser.value?.profilePictureUri)
  }

  @Test
  fun checkIn_withValidPostQrCode_recordsSuccessfulAttendance() {
    repository.login("EMP-1042", "1234")
    val shift = repository.shifts.value.first()
    val site = repository.sites.value.find { it.id == shift.siteId }!!

    val result = repository.submitCheckIn(
      shift = shift,
      site = site,
      capturedLat = site.latitude,
      capturedLng = site.longitude,
      accuracyMeters = 10.0,
      qrToken = site.qrCodeToken
    )

    assertTrue(result is SecurityRepository.CheckInResult.Success)
    val success = result as SecurityRepository.CheckInResult.Success
    assertEquals(site.name, success.record.siteName)
    assertNotNull(success.record.checkInTime)

    // Audit log should confirm QR passed
    val audit = repository.auditLogs.value.first { it.eventType == "CHECK_IN" }
    assertEquals("PASSED", audit.qrResult)
    assertTrue(audit.isAccepted)
  }

  @Test
  fun checkOut_withValidPostQrCode_finalizesDepartureAndDuration() {
    repository.login("EMP-1042", "1234")
    val shift = repository.shifts.value.first()
    val site = repository.sites.value.find { it.id == shift.siteId }!!

    // Perform check-in first
    val inResult = repository.submitCheckIn(
      shift = shift,
      site = site,
      capturedLat = site.latitude,
      capturedLng = site.longitude,
      accuracyMeters = 10.0,
      qrToken = site.qrCodeToken
    )
    assertTrue(inResult is SecurityRepository.CheckInResult.Success)
    val record = (inResult as SecurityRepository.CheckInResult.Success).record

    // Perform check-out with station QR code
    val outResult = repository.submitCheckOut(
      record = record,
      site = site,
      capturedLat = site.latitude,
      capturedLng = site.longitude,
      accuracyMeters = 12.0,
      qrToken = site.qrCodeToken
    )

    assertTrue(outResult is SecurityRepository.CheckOutResult.Success)
    val outSuccess = outResult as SecurityRepository.CheckOutResult.Success
    assertNotNull(outSuccess.record.checkOutTime)
    assertNotNull(outSuccess.record.durationFormatted)

    // Audit log should record check-out with QR passed
    val outAudit = repository.auditLogs.value.first { it.eventType == "CHECK_OUT" }
    assertEquals("PASSED", outAudit.qrResult)
    assertTrue(outAudit.isAccepted)
  }
}
