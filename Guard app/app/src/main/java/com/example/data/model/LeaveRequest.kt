package com.example.data.model

data class LeaveRequest(
  val id: String,
  val guardId: String,
  val guardName: String,
  val leaveType: String, // "ANNUAL", "SICK", "EMERGENCY", "COMPASSIONATE"
  val startDate: String, // YYYY-MM-DD
  val endDate: String,   // YYYY-MM-DD
  val reason: String,
  val status: String = "PENDING", // "PENDING", "APPROVED", "REJECTED", "CANCELLED"
  val submittedAt: Long = System.currentTimeMillis(),
  val submittedAtFormatted: String = "",
  val supervisorComment: String? = null
)
