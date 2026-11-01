package com.example.data.model

data class NotificationItem(
  val id: String,
  val guardId: String,
  val title: String,
  val message: String,
  val timestamp: Long = System.currentTimeMillis(),
  val timestampFormatted: String = "",
  val isRead: Boolean = false,
  val type: String = "INFO", // "SHIFT_REMINDER", "ATTENDANCE_CONFIRMED", "LEAVE_STATUS", "SWAP_STATUS", "SUPERVISOR_NOTE"
  val referenceId: String? = null
)
