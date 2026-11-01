package com.example.data.model

data class Shift(
  val id: String,
  val guardId: String,
  val siteId: String,
  val siteName: String,
  val siteAddress: String,
  val shiftDate: String, // YYYY-MM-DD
  val startTime: String, // HH:mm EAT
  val endTime: String,   // HH:mm EAT
  val isOvernight: Boolean = false,
  val instructions: String = "Monitor main gates, log incoming visitors, and inspect CCTV feeds.",
  val assignmentStatus: String = "CONFIRMED", // "CONFIRMED", "CANCELLED", "PENDING_SWAP"
  val scheduledStartUtcMillis: Long,
  val scheduledEndUtcMillis: Long
)
