package com.example.ui.navigation

sealed class Screen(val route: String) {
  data object Login : Screen("login")
  data object Dashboard : Screen("dashboard")
  data object Shifts : Screen("shifts")
  data object CheckIn : Screen("check_in/{shiftId}") {
    fun createRoute(shiftId: String) = "check_in/$shiftId"
  }
  data object CheckOut : Screen("check_out/{recordId}") {
    fun createRoute(recordId: String) = "check_out/$recordId"
  }
  data object Attendance : Screen("attendance")
  data object Leave : Screen("leave")
  data object ShiftSwaps : Screen("shift_swaps")
  data object Notifications : Screen("notifications")
  data object Reports : Screen("reports")
  data object Profile : Screen("profile")
  data object SupervisorMonitor : Screen("supervisor_monitor")
}
