package com.example.data.model

data class AttendanceRecord(
  val id: String,
  val shiftId: String,
  val guardId: String,
  val guardName: String,
  val siteId: String,
  val siteName: String,
  val shiftDate: String,
  val scheduledStartTime: String,
  val scheduledEndTime: String,
  val checkInTime: Long? = null,
  val checkInFormatted: String? = null,
  val checkInLat: Double? = null,
  val checkInLng: Double? = null,
  val checkInAccuracy: Double? = null,
  val checkOutTime: Long? = null,
  val checkOutFormatted: String? = null,
  val checkOutLat: Double? = null,
  val checkOutLng: Double? = null,
  val checkOutAccuracy: Double? = null,
  val method: String = "GPS+QR",
  val status: AttendanceStatus = AttendanceStatus.SCHEDULED,
  val earlyDeparture: Boolean = false,
  val isOfflineQueued: Boolean = false,
  val deviceTimestamp: Long? = null,
  val reviewRequested: Boolean = false,
  val reviewNotes: String? = null,
  val reviewStatus: String? = null, // "PENDING", "APPROVED", "DECLINED"
  val durationFormatted: String? = null
)
