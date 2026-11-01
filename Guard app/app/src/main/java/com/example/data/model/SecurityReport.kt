package com.example.data.model

enum class ReportType(val label: String, val category: String) {
  INCIDENT("Security Incident", "INCIDENT"),
  PATROL_LOG("Patrol & Checkpoint", "PATROL"),
  MAINTENANCE_HAZARD("Maintenance & Hazard", "HAZARD"),
  SHIFT_HANDOVER("Shift Handover Log", "HANDOVER"),
  VISITOR_EXCEPTION("Visitor & Access Exception", "VISITOR"),
  ATTENDANCE_DISPUTE("Attendance Discrepancy", "ATTENDANCE")
}

enum class ReportSeverity(val label: String, val level: Int) {
  ROUTINE("Routine", 1),
  MINOR("Minor", 2),
  PRIORITY("Priority", 3),
  CRITICAL("Critical", 4)
}

enum class ReportStatus(val label: String) {
  SUBMITTED("Submitted"),
  UNDER_REVIEW("Under Review"),
  RESOLVED("Resolved"),
  ARCHIVED("Archived")
}

data class SecurityReport(
  val id: String,
  val reportNumber: String,
  val type: ReportType,
  val severity: ReportSeverity,
  val title: String,
  val description: String,
  val guardId: String,
  val guardName: String,
  val badgeNumber: String,
  val siteId: String,
  val siteName: String,
  val locationSpecific: String,
  val timestamp: Long,
  val timestampFormatted: String,
  val status: ReportStatus = ReportStatus.SUBMITTED,
  val actionTaken: String,
  val cryptographicHash: String,
  val witnessOrPersonnel: String? = null,
  val resolutionNotes: String? = null,
  val isOfflineQueued: Boolean = false,
  val latitude: Double? = null,
  val longitude: Double? = null
)
