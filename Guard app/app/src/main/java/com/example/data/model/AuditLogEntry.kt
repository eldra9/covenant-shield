package com.example.data.model

data class AuditLogEntry(
  val id: String,
  val guardId: String,
  val shiftId: String,
  val siteId: String,
  val eventType: String, // "CHECK_IN", "CHECK_OUT", "AUTH_FAILURE", "LOCKOUT"
  val serverTimestamp: Long = System.currentTimeMillis(),
  val serverTimestampFormatted: String = "",
  val reportedLat: Double? = null,
  val reportedLng: Double? = null,
  val reportedAccuracy: Double? = null,
  val geofenceResult: String, // "PASSED", "FAILED_OUTSIDE_RADIUS", "POOR_ACCURACY", "SKIPPED"
  val qrResult: String,       // "PASSED", "INVALID_TOKEN", "SITE_MISMATCH", "SKIPPED"
  val isAccepted: Boolean,
  val reason: String
)
