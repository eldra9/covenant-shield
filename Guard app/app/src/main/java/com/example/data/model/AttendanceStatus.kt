package com.example.data.model

import androidx.compose.ui.graphics.Color
import com.example.ui.theme.*

enum class AttendanceStatus(val label: String, val description: String) {
  SCHEDULED("Scheduled", "Shift assigned, awaiting check-in"),
  PRESENT("Present", "Checked in on-time within grace period"),
  LATE("Late", "Checked in after 15-minute grace period"),
  ABSENT("Absent", "No check-in recorded before absence deadline"),
  ON_LEAVE("On Leave", "Covered by approved leave request"),
  MANUAL("Manual (Pending Review)", "Recorded by supervisor, pending review"),
  LEFT_EARLY("Left Early", "Checked out before scheduled shift end");

  fun getChipColors(): Pair<Color, Color> {
    return when (this) {
      SCHEDULED -> Pair(StatusScheduled, StatusScheduledContainer)
      PRESENT -> Pair(StatusPresent, StatusPresentContainer)
      LATE -> Pair(StatusLate, StatusLateContainer)
      ABSENT -> Pair(StatusAbsent, StatusAbsentContainer)
      ON_LEAVE -> Pair(StatusOnLeave, StatusOnLeaveContainer)
      MANUAL -> Pair(StatusManual, StatusManualContainer)
      LEFT_EARLY -> Pair(StatusLeftEarly, StatusLeftEarlyContainer)
    }
  }
}
