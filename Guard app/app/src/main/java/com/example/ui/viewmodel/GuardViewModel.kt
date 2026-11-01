package com.example.ui.viewmodel

import android.app.Application
import android.content.Context
import android.graphics.Bitmap
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.data.model.*
import com.example.data.repository.SecurityRepository
import com.example.util.DateTimeUtils
import com.example.util.GeofenceUtils
import com.example.util.NetworkConnectivityMonitor
import com.example.util.RealLocationHelper
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

class GuardViewModel @JvmOverloads constructor(
  application: Application = Application(),
  private val repository: SecurityRepository = SecurityRepository()
) : AndroidViewModel(application) {

  // Secondary constructor for testing when repository is provided
  constructor(repository: SecurityRepository) : this(
    application = Application(),
    repository = repository
  )

  val currentUser = repository.currentUser
  val isOnline = repository.isOnline
  val sites = repository.sites
  val shifts = repository.shifts
  val attendanceRecords = repository.attendanceRecords
  val offlineQueue = repository.offlineQueue
  val leaveRequests = repository.leaveRequests
  val shiftSwapRequests = repository.shiftSwapRequests
  val notifications = repository.notifications
  val auditLogs = repository.auditLogs
  val allGuards = repository.allGuards
  val reports = repository.reports

  init {
    // Monitor real device network connectivity
    try {
      viewModelScope.launch {
        NetworkConnectivityMonitor(application).isOnlineFlow.collect { online ->
          repository.setOnlineStatus(online)
        }
      }
    } catch (_: Exception) {
    }
  }

  // Filtered shifts exclusively for currently logged-in guard
  val guardShifts = combine(shifts, currentUser) { allShifts, user ->
    if (user == null) emptyList()
    else allShifts.filter { it.guardId == user.id }
  }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

  val todayShift = combine(guardShifts, currentUser) { shiftsList, user ->
    val today = DateTimeUtils.getCurrentEatDateString()
    if (user == null) null
    else shiftsList.find { it.shiftDate == today && it.guardId == user.id }
      ?: shiftsList.firstOrNull { it.guardId == user.id }
  }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), null)

  val activeAttendance = combine(attendanceRecords, todayShift, currentUser) { records, shift, user ->
    if (shift == null || user == null) null
    else records.find { it.shiftId == shift.id && it.guardId == user.id && it.checkInTime != null && it.checkOutTime == null }
  }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), null)

  val unreadNotificationsCount = notifications.map { list ->
    list.count { !it.isRead }
  }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0)

  // Security & Occurrence Reports filtered for current guard
  val guardReports = combine(reports, currentUser) { allReports, user ->
    if (user == null) emptyList()
    else allReports.filter { it.guardId == user.id }
  }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

  private val _reportSearchQuery = MutableStateFlow("")
  val reportSearchQuery: StateFlow<String> = _reportSearchQuery.asStateFlow()

  private val _reportCategoryFilter = MutableStateFlow("ALL")
  val reportCategoryFilter: StateFlow<String> = _reportCategoryFilter.asStateFlow()

  private val _reportStatusFilter = MutableStateFlow("ALL")
  val reportStatusFilter: StateFlow<String> = _reportStatusFilter.asStateFlow()

  val filteredGuardReports = combine(
    guardReports,
    _reportSearchQuery,
    _reportCategoryFilter,
    _reportStatusFilter
  ) { list, query, category, status ->
    list.filter { report ->
      val matchesQuery = query.isBlank() ||
        report.title.contains(query, ignoreCase = true) ||
        report.reportNumber.contains(query, ignoreCase = true) ||
        report.siteName.contains(query, ignoreCase = true) ||
        report.locationSpecific.contains(query, ignoreCase = true) ||
        report.description.contains(query, ignoreCase = true)

      val matchesCategory = category == "ALL" || report.type.name == category || report.type.category == category
      val matchesStatus = status == "ALL" || report.status.name == status

      matchesQuery && matchesCategory && matchesStatus
    }
  }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

  // --- Login State ---
  private val _loginState = MutableStateFlow(LoginUiState())
  val loginState: StateFlow<LoginUiState> = _loginState.asStateFlow()

  data class LoginUiState(
    val employeeId: String = "",
    val pin: String = "",
    val isLoading: Boolean = false,
    val errorMessage: String? = null,
    val lockoutMinutes: Long? = null
  )

  fun onEmployeeIdChanged(id: String) {
    _loginState.update { it.copy(employeeId = id, errorMessage = null) }
  }

  fun onPinChanged(pin: String) {
    _loginState.update { it.copy(pin = pin, errorMessage = null) }
  }

  fun fillCredentials(usernameOrId: String, passwordOrPin: String) {
    _loginState.update { it.copy(employeeId = usernameOrId, pin = passwordOrPin, errorMessage = null) }
  }

  fun performLogin(onSuccess: () -> Unit) {
    val id = _loginState.value.employeeId.trim()
    val pin = _loginState.value.pin.trim()

    if (id.isEmpty()) {
      _loginState.update { it.copy(errorMessage = "Please enter your username or Employee ID") }
      return
    }
    if (pin.isEmpty()) {
      _loginState.update { it.copy(errorMessage = "Please enter your password or PIN") }
      return
    }

    _loginState.update { it.copy(isLoading = true, errorMessage = null) }

    when (val result = repository.login(id, pin)) {
      is SecurityRepository.AuthResult.Success -> {
        _loginState.update { it.copy(isLoading = false, errorMessage = null, lockoutMinutes = null) }
        onSuccess()
      }
      is SecurityRepository.AuthResult.AccountLocked -> {
        _loginState.update {
          it.copy(
            isLoading = false,
            lockoutMinutes = result.remainingMinutes,
            errorMessage = "Account locked for security: 5 failed attempts. Please retry in ${result.remainingMinutes} minutes."
          )
        }
      }
      is SecurityRepository.AuthResult.InvalidCredentials -> {
        _loginState.update {
          it.copy(
            isLoading = false,
            errorMessage = "Invalid username or password. ${result.remainingAttempts} attempts remaining."
          )
        }
      }
      is SecurityRepository.AuthResult.InactiveAccount -> {
        _loginState.update { it.copy(isLoading = false, errorMessage = result.message) }
      }
    }
  }

  fun performLogout(onLoggedOut: () -> Unit) {
    repository.logout()
    _loginState.update { it.copy(employeeId = "", pin = "", errorMessage = null) }
    onLoggedOut()
  }

  // --- Network Toggle ---
  fun toggleNetwork() {
    repository.toggleNetworkConnectivity()
  }

  fun syncOfflineQueue(): Int {
    return repository.synchronizeOfflineQueue()
  }

  // --- Check-In Flow State ---
  private val _checkInState = MutableStateFlow(CheckInUiState())
  val checkInState: StateFlow<CheckInUiState> = _checkInState.asStateFlow()

  data class CheckInUiState(
    val currentStep: Int = 1,
    val selectedShift: Shift? = null,
    val selectedSite: Site? = null,
    val isGpsCapturing: Boolean = false,
    val capturedLat: Double? = null,
    val capturedLng: Double? = null,
    val capturedAccuracyMeters: Double = 12.0,
    val isGeofenceVerified: Boolean = true,
    val geofenceDistanceMeters: Double? = 8.0,
    val isInsideRadius: Boolean = true,
    val qrTokenInput: String = "",
    val isQrVerified: Boolean = true,
    val selfieCaptured: Boolean = false,
    val selfieBitmap: Bitmap? = null,
    val isSubmitting: Boolean = false,
    val errorBanner: String? = null,
    val confirmedRecord: AttendanceRecord? = null,
    val successMessage: String? = null
  )

  fun startCheckIn(shift: Shift) {
    val site = sites.value.find { it.id == shift.siteId }
    val lat = site?.latitude ?: 9.01050
    val lng = site?.longitude ?: 38.76100
    val token = site?.qrCodeToken ?: "AEGIS-QR-SITE-001-HQ"

    _checkInState.value = CheckInUiState(
      currentStep = 1,
      selectedShift = shift,
      selectedSite = site,
      capturedLat = lat,
      capturedLng = lng,
      capturedAccuracyMeters = 10.0,
      geofenceDistanceMeters = 5.0,
      isInsideRadius = true,
      isGeofenceVerified = true,
      qrTokenInput = token,
      isQrVerified = true,
      selfieCaptured = false,
      selfieBitmap = null,
      errorBanner = null,
      confirmedRecord = null,
      successMessage = null
    )
  }

  fun setCheckInStep(step: Int) {
    _checkInState.update { it.copy(currentStep = step, errorBanner = null) }
  }

  fun refreshRealLocation(context: Context) {
    viewModelScope.launch {
      _checkInState.update { it.copy(isGpsCapturing = true) }
      val realLoc = RealLocationHelper.getCurrentLocation(context)
      if (realLoc != null) {
        val site = _checkInState.value.selectedSite
        val dist = if (site != null) {
          GeofenceUtils.calculateDistanceMeters(realLoc.latitude, realLoc.longitude, site.latitude, site.longitude)
        } else 0.0
        val isInside = site != null && dist <= site.geofenceRadiusMeters && realLoc.accuracyMeters <= 50.0

        _checkInState.update {
          it.copy(
            isGpsCapturing = false,
            capturedLat = realLoc.latitude,
            capturedLng = realLoc.longitude,
            capturedAccuracyMeters = realLoc.accuracyMeters,
            geofenceDistanceMeters = dist,
            isInsideRadius = isInside,
            isGeofenceVerified = isInside,
            errorBanner = if (!isInside) "GPS indicates you are ${dist.toInt()}m away from site. Tap 'Match Site GPS' to calibrate if working here." else null
          )
        }
      } else {
        _checkInState.update {
          it.copy(
            isGpsCapturing = false,
            errorBanner = "Could not fetch GPS fix. Check location permissions."
          )
        }
      }
    }
  }

  fun calibrateSiteToCurrentLocation() {
    val state = _checkInState.value
    val site = state.selectedSite ?: return
    val lat = state.capturedLat ?: site.latitude
    val lng = state.capturedLng ?: site.longitude

    repository.calibrateSiteLocation(site.id, lat, lng)
    _checkInState.update {
      it.copy(
        geofenceDistanceMeters = 0.0,
        isInsideRadius = true,
        isGeofenceVerified = true,
        errorBanner = null
      )
    }
  }

  fun setSimulatedLocation(lat: Double, lng: Double, accuracy: Double) {
    val site = _checkInState.value.selectedSite
    val dist = if (site != null) {
      GeofenceUtils.calculateDistanceMeters(lat, lng, site.latitude, site.longitude)
    } else 0.0

    val isInside = site != null && dist <= site.geofenceRadiusMeters && accuracy <= 50.0

    _checkInState.update {
      it.copy(
        capturedLat = lat,
        capturedLng = lng,
        capturedAccuracyMeters = accuracy,
        geofenceDistanceMeters = dist,
        isInsideRadius = isInside,
        isGeofenceVerified = isInside,
        errorBanner = null
      )
    }
  }

  fun setQrCode(token: String) {
    val site = _checkInState.value.selectedSite
    val isValid = site != null && token.trim() == site.qrCodeToken.trim()
    _checkInState.update {
      it.copy(
        qrTokenInput = token,
        isQrVerified = isValid,
        errorBanner = if (!isValid && token.isNotEmpty()) "QR does not match ${site?.name} site token" else null
      )
    }
  }

  fun setSelfieCaptured(bitmap: Bitmap?) {
    _checkInState.update {
      it.copy(
        selfieCaptured = bitmap != null,
        selfieBitmap = bitmap
      )
    }
  }

  fun toggleSelfie() {
    _checkInState.update { it.copy(selfieCaptured = !it.selfieCaptured) }
  }

  fun submitCheckIn() {
    val state = _checkInState.value
    val shift = state.selectedShift ?: return
    val site = state.selectedSite ?: return
    val lat = state.capturedLat ?: site.latitude
    val lng = state.capturedLng ?: site.longitude
    val acc = state.capturedAccuracyMeters
    val qr = state.qrTokenInput.ifEmpty { site.qrCodeToken }

    _checkInState.update { it.copy(isSubmitting = true, errorBanner = null) }

    when (val result = repository.submitCheckIn(
      shift = shift,
      site = site,
      capturedLat = lat,
      capturedLng = lng,
      accuracyMeters = acc,
      qrToken = qr,
      selfieUri = if (state.selfieCaptured) "duty_selfie_captured.jpg" else null
    )) {
      is SecurityRepository.CheckInResult.Success -> {
        _checkInState.update {
          it.copy(
            isSubmitting = false,
            currentStep = 9,
            confirmedRecord = result.record,
            successMessage = result.message
          )
        }
      }
      is SecurityRepository.CheckInResult.QueuedOffline -> {
        _checkInState.update {
          it.copy(
            isSubmitting = false,
            currentStep = 9,
            confirmedRecord = result.record,
            successMessage = result.message
          )
        }
      }
      is SecurityRepository.CheckInResult.OutsideGeofence -> {
        _checkInState.update {
          it.copy(
            isSubmitting = false,
            errorBanner = "You are outside the site perimeter (${result.distanceMeters.toInt()}m away; allowed: ${result.radiusMeters.toInt()}m). Tap 'Calibrate Site to GPS' if you are at post."
          )
        }
      }
      is SecurityRepository.CheckInResult.InsufficientAccuracy -> {
        _checkInState.update {
          it.copy(
            isSubmitting = false,
            errorBanner = "GPS accuracy (${result.accuracyMeters.toInt()}m) is insufficient. Minimum 50m required."
          )
        }
      }
      is SecurityRepository.CheckInResult.InvalidQr -> {
        _checkInState.update { it.copy(isSubmitting = false, errorBanner = result.message) }
      }
      is SecurityRepository.CheckInResult.DuplicateAttendance -> {
        _checkInState.update { it.copy(isSubmitting = false, errorBanner = result.message) }
      }
      is SecurityRepository.CheckInResult.Error -> {
        _checkInState.update { it.copy(isSubmitting = false, errorBanner = result.message) }
      }
    }
  }

  // --- Checkout Flow State ---
  private val _checkOutState = MutableStateFlow(CheckOutUiState())
  val checkOutState: StateFlow<CheckOutUiState> = _checkOutState.asStateFlow()

  data class CheckOutUiState(
    val activeRecord: AttendanceRecord? = null,
    val site: Site? = null,
    val isSubmitting: Boolean = false,
    val errorBanner: String? = null,
    val completedRecord: AttendanceRecord? = null,
    val successMessage: String? = null,
    val qrTokenInput: String = "",
    val isQrVerified: Boolean = false
  )

  fun startCheckOut(record: AttendanceRecord) {
    val site = sites.value.find { it.id == record.siteId }
    val token = site?.qrCodeToken ?: ""
    _checkOutState.value = CheckOutUiState(
      activeRecord = record,
      site = site,
      qrTokenInput = token,
      isQrVerified = token.isNotEmpty()
    )
  }

  fun setCheckOutQrCode(token: String) {
    val site = _checkOutState.value.site
    val isValid = site != null && token.trim() == site.qrCodeToken.trim()
    _checkOutState.update {
      it.copy(
        qrTokenInput = token,
        isQrVerified = isValid,
        errorBanner = if (!isValid && token.isNotEmpty()) "Scanned QR code does not match ${site?.name} departure token" else null
      )
    }
  }

  fun submitCheckOut() {
    val state = _checkOutState.value
    val record = state.activeRecord ?: return
    val site = state.site ?: return
    val qr = state.qrTokenInput.ifEmpty { site.qrCodeToken }

    _checkOutState.update { it.copy(isSubmitting = true, errorBanner = null) }

    when (val result = repository.submitCheckOut(
      record = record,
      site = site,
      capturedLat = site.latitude,
      capturedLng = site.longitude,
      accuracyMeters = 15.0,
      qrToken = qr
    )) {
      is SecurityRepository.CheckOutResult.Success -> {
        _checkOutState.update {
          it.copy(
            isSubmitting = false,
            completedRecord = result.record,
            successMessage = result.message
          )
        }
      }
      is SecurityRepository.CheckOutResult.OutsideGeofence -> {
        _checkOutState.update {
          it.copy(
            isSubmitting = false,
            errorBanner = "Outside site perimeter: ${result.distanceMeters.toInt()}m away from ${site.name}."
          )
        }
      }
      is SecurityRepository.CheckOutResult.InsufficientAccuracy -> {
        _checkOutState.update {
          it.copy(isSubmitting = false, errorBanner = "GPS accuracy ${result.accuracyMeters.toInt()}m exceeds 50m limit.")
        }
      }
      is SecurityRepository.CheckOutResult.Error -> {
        _checkOutState.update { it.copy(isSubmitting = false, errorBanner = result.message) }
      }
    }
  }

  // --- Leave Request ---
  fun submitLeave(type: String, startDate: String, endDate: String, reason: String): Boolean {
    return repository.submitLeaveRequest(type, startDate, endDate, reason)
  }

  // --- Shift Swap Request ---
  fun submitShiftSwap(shift: Shift, targetGuard: User, reason: String): Boolean {
    return repository.submitShiftSwapRequest(shift, targetGuard, reason)
  }

  // --- Attendance Review Request ---
  fun requestAttendanceReview(recordId: String, notes: String) {
    repository.requestAttendanceReview(recordId, notes)
  }

  // --- Notifications ---
  fun markNotificationRead(id: String) {
    repository.markNotificationAsRead(id)
  }

  fun markAllNotificationsRead() {
    repository.markAllNotificationsAsRead()
  }

  // --- Security & Occurrence Reports ---
  fun setReportSearchQuery(query: String) {
    _reportSearchQuery.value = query
  }

  fun setReportCategoryFilter(category: String) {
    _reportCategoryFilter.value = category
  }

  fun setReportStatusFilter(status: String) {
    _reportStatusFilter.value = status
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
    return repository.submitSecurityReport(
      type = type,
      severity = severity,
      title = title,
      description = description,
      siteId = siteId,
      locationSpecific = locationSpecific,
      actionTaken = actionTaken,
      witnessOrPersonnel = witnessOrPersonnel,
      latitude = latitude,
      longitude = longitude
    )
  }

  fun resolveSecurityReport(reportId: String, notes: String): Boolean {
    return repository.resolveSecurityReport(reportId, notes)
  }

  // --- Profile Photo ---
  fun updateProfilePicture(uri: String?) {
    repository.updateProfilePicture(uri)
  }

  // --- Dark Mode State ---
  private var userToggledDarkMode = false
  private val _isDarkMode = MutableStateFlow(false)
  val isDarkMode: StateFlow<Boolean> = _isDarkMode.asStateFlow()

  fun initSystemDarkTheme(systemDark: Boolean) {
    if (!userToggledDarkMode) {
      _isDarkMode.value = systemDark
    }
  }

  fun toggleDarkMode() {
    userToggledDarkMode = true
    _isDarkMode.value = !_isDarkMode.value
  }

  fun setDarkMode(enabled: Boolean) {
    userToggledDarkMode = true
    _isDarkMode.value = enabled
  }

  // --- Supervisor & Operations Staff Actions ---
  fun supervisorApproveLeave(leaveId: String) {
    repository.supervisorApproveLeave(leaveId)
  }

  fun supervisorApproveSwap(swapId: String) {
    repository.supervisorApproveSwap(swapId)
  }
}
