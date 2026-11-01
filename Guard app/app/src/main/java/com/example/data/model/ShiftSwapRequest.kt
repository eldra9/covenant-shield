package com.example.data.model

data class ShiftSwapRequest(
  val id: String,
  val requesterGuardId: String,
  val requesterGuardName: String,
  val shiftId: String,
  val shiftDate: String,
  val shiftTime: String,
  val siteName: String,
  val targetGuardId: String,
  val targetGuardName: String,
  val reason: String,
  val status: String = "PENDING", // "PENDING", "APPROVED", "REJECTED", "CANCELLED"
  val submittedAt: Long = System.currentTimeMillis(),
  val submittedAtFormatted: String = "",
  val supervisorComment: String? = null
)
