package com.example.util

import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.TimeZone

object DateTimeUtils {
  // Use device local timezone so clocks and dates accurately match the user's environment
  val LOCAL_TIMEZONE: TimeZone = TimeZone.getDefault()
  val EAT_TIMEZONE: TimeZone = TimeZone.getTimeZone("GMT+3")
  val UTC_TIMEZONE: TimeZone = TimeZone.getTimeZone("UTC")

  fun getTimeZoneDisplayName(): String {
    return LOCAL_TIMEZONE.getDisplayName(false, TimeZone.SHORT, Locale.getDefault())
  }

  /**
   * Real-time live clock ticking with hours, minutes, seconds and AM/PM
   */
  fun formatLiveClock(timestampMillis: Long): String {
    val sdf = SimpleDateFormat("hh:mm:ss a", Locale.getDefault())
    sdf.timeZone = LOCAL_TIMEZONE
    return sdf.format(Date(timestampMillis))
  }

  /**
   * Running stopwatch timer for active shifts in 00:00:00 format
   */
  fun formatElapsedTimer(durationMillis: Long): String {
    if (durationMillis <= 0) return "00:00:00"
    val seconds = (durationMillis / 1000) % 60
    val minutes = (durationMillis / (1000 * 60)) % 60
    val hours = durationMillis / (1000 * 60 * 60)
    return String.format(Locale.US, "%02d:%02d:%02d", hours, minutes, seconds)
  }

  fun formatTimeShort(timestampMillis: Long): String {
    val sdf = SimpleDateFormat("hh:mm a", Locale.getDefault())
    sdf.timeZone = LOCAL_TIMEZONE
    return sdf.format(Date(timestampMillis))
  }

  fun formatDateTime(timestampMillis: Long): String {
    val sdf = SimpleDateFormat("MMM dd, yyyy · hh:mm a", Locale.getDefault())
    sdf.timeZone = LOCAL_TIMEZONE
    return sdf.format(Date(timestampMillis))
  }

  fun formatDate(timestampMillis: Long): String {
    val sdf = SimpleDateFormat("EEE, MMM dd, yyyy", Locale.getDefault())
    sdf.timeZone = LOCAL_TIMEZONE
    return sdf.format(Date(timestampMillis))
  }

  fun getCurrentDateString(): String {
    val sdf = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
    sdf.timeZone = LOCAL_TIMEZONE
    return sdf.format(Date())
  }

  // --- Backwards compatible functions ---
  fun formatToEatTime(timestampMillis: Long): String {
    val sdf = SimpleDateFormat("hh:mm a", Locale.getDefault())
    sdf.timeZone = LOCAL_TIMEZONE
    return sdf.format(Date(timestampMillis))
  }

  fun formatTimeOnly(timestampMillis: Long): String {
    val sdf = SimpleDateFormat("hh:mm:ss a", Locale.getDefault())
    sdf.timeZone = LOCAL_TIMEZONE
    return sdf.format(Date(timestampMillis))
  }

  fun formatToEatDateTime(timestampMillis: Long): String {
    val sdf = SimpleDateFormat("MMM dd, yyyy · hh:mm a", Locale.getDefault())
    sdf.timeZone = LOCAL_TIMEZONE
    return sdf.format(Date(timestampMillis))
  }

  fun formatToEatDate(timestampMillis: Long): String {
    val sdf = SimpleDateFormat("EEE, MMM dd, yyyy", Locale.getDefault())
    sdf.timeZone = LOCAL_TIMEZONE
    return sdf.format(Date(timestampMillis))
  }

  fun getCurrentEatDateString(): String {
    return getCurrentDateString()
  }

  fun formatDuration(durationMillis: Long): String {
    return formatElapsedTimer(durationMillis)
  }

  fun evaluateCheckInStatus(
    scheduledStartUtcMillis: Long,
    actualCheckInUtcMillis: Long,
    gracePeriodMinutes: Long = 15L
  ): com.example.data.model.AttendanceStatus {
    val graceCutoff = scheduledStartUtcMillis + (gracePeriodMinutes * 60 * 1000)
    return if (actualCheckInUtcMillis <= graceCutoff) {
      com.example.data.model.AttendanceStatus.PRESENT
    } else {
      com.example.data.model.AttendanceStatus.LATE
    }
  }

  fun isEarlyDeparture(
    scheduledEndUtcMillis: Long,
    actualCheckOutUtcMillis: Long,
    thresholdMinutes: Long = 5L
  ): Boolean {
    val earlyCutoff = scheduledEndUtcMillis - (thresholdMinutes * 60 * 1000)
    return actualCheckOutUtcMillis < earlyCutoff
  }
}
