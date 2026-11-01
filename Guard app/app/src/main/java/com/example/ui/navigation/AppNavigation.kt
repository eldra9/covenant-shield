package com.example.ui.navigation

import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.navigationBars
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.NavType
import androidx.navigation.compose.*
import androidx.navigation.navArgument
import com.example.ui.screens.*
import com.example.ui.theme.*
import com.example.ui.viewmodel.GuardViewModel

data class BottomNavItem(
  val label: String,
  val route: String,
  val icon: ImageVector,
  val testTag: String
)

val bottomNavItems = listOf(
  BottomNavItem("Home", Screen.Dashboard.route, Icons.Default.Home, "bottom_nav_home"),
  BottomNavItem("Shifts", Screen.Shifts.route, Icons.Default.CalendarMonth, "bottom_nav_shifts"),
  BottomNavItem("Reports", Screen.Reports.route, Icons.Default.Assignment, "bottom_nav_reports"),
  BottomNavItem("Attendance", Screen.Attendance.route, Icons.Default.History, "bottom_nav_attendance"),
  BottomNavItem("Profile", Screen.Profile.route, Icons.Default.Person, "bottom_nav_profile")
)

@Composable
fun AppNavigation(viewModel: GuardViewModel) {
  val navController = rememberNavController()
  val currentUser by viewModel.currentUser.collectAsState()
  val navBackStackEntry by navController.currentBackStackEntryAsState()
  val currentRoute = navBackStackEntry?.destination?.route

  // Protected route check
  LaunchedEffect(currentUser) {
    if (currentUser == null && currentRoute != Screen.Login.route) {
      navController.navigate(Screen.Login.route) {
        popUpTo(0) { inclusive = true }
      }
    }
  }

  val showBottomBar = currentRoute in listOf(
    Screen.Dashboard.route,
    Screen.Shifts.route,
    Screen.Reports.route,
    Screen.Attendance.route,
    Screen.Leave.route,
    Screen.Profile.route
  )

  Scaffold(
    bottomBar = {
      if (showBottomBar) {
        NavigationBar(
          windowInsets = WindowInsets.navigationBars,
          containerColor = Forest,
          contentColor = Gold,
          tonalElevation = 0.dp
        ) {
          bottomNavItems.forEach { item ->
            val selected = currentRoute == item.route
            NavigationBarItem(
              icon = { Icon(item.icon, contentDescription = item.label) },
              label = { Text(item.label, fontFamily = InterFontFamily, fontSize = 11.sp) },
              selected = selected,
              onClick = {
                if (currentRoute != item.route) {
                  navController.navigate(item.route) {
                    popUpTo(navController.graph.findStartDestination().id) {
                      saveState = true
                    }
                    launchSingleTop = true
                    restoreState = true
                  }
                }
              },
              colors = NavigationBarItemDefaults.colors(
                selectedIconColor = Forest,
                selectedTextColor = Gold,
                indicatorColor = Gold,
                unselectedIconColor = Mist.copy(alpha = 0.65f),
                unselectedTextColor = Mist.copy(alpha = 0.65f)
              ),
              modifier = Modifier.testTag(item.testTag)
            )
          }
        }
      }
    }
  ) { paddingValues ->
    NavHost(
      navController = navController,
      startDestination = if (currentUser != null) Screen.Dashboard.route else Screen.Login.route,
      modifier = Modifier.padding(paddingValues)
    ) {
      composable(Screen.Login.route) {
        LoginScreen(
          viewModel = viewModel,
          onLoginSuccess = {
            navController.navigate(Screen.Dashboard.route) {
              popUpTo(Screen.Login.route) { inclusive = true }
            }
          }
        )
      }

      composable(Screen.Dashboard.route) {
        DashboardScreen(
          viewModel = viewModel,
          onNavigateToCheckIn = { shift ->
            navController.navigate(Screen.CheckIn.createRoute(shift.id))
          },
          onNavigateToCheckOut = { record ->
            navController.navigate(Screen.CheckOut.createRoute(record.id))
          },
          onNavigateToShifts = { navController.navigate(Screen.Shifts.route) },
          onNavigateToAttendance = { navController.navigate(Screen.Attendance.route) },
          onNavigateToLeave = { navController.navigate(Screen.Leave.route) },
          onNavigateToSwaps = { navController.navigate(Screen.ShiftSwaps.route) },
          onNavigateToNotifications = { navController.navigate(Screen.Notifications.route) },
          onNavigateToReports = { navController.navigate(Screen.Reports.route) },
          onLogout = {
            navController.navigate(Screen.Login.route) {
              popUpTo(0) { inclusive = true }
            }
          }
        )
      }

      composable(Screen.Shifts.route) {
        ShiftsScreen(
          viewModel = viewModel,
          onNavigateToCheckIn = { shift ->
            navController.navigate(Screen.CheckIn.createRoute(shift.id))
          },
          onNavigateBack = { navController.popBackStack() }
        )
      }

      composable(
        route = Screen.CheckIn.route,
        arguments = listOf(navArgument("shiftId") { type = NavType.StringType })
      ) { backStackEntry ->
        val shiftId = backStackEntry.arguments?.getString("shiftId") ?: ""
        val shifts by viewModel.shifts.collectAsState()
        val shift = shifts.find { it.id == shiftId } ?: shifts.firstOrNull()

        if (shift != null) {
          CheckInScreen(
            viewModel = viewModel,
            shift = shift,
            onNavigateBack = { navController.popBackStack() },
            onCheckInCompleted = {
              navController.navigate(Screen.Dashboard.route) {
                popUpTo(Screen.Dashboard.route) { inclusive = true }
              }
            }
          )
        }
      }

      composable(
        route = Screen.CheckOut.route,
        arguments = listOf(navArgument("recordId") { type = NavType.StringType })
      ) { backStackEntry ->
        val recordId = backStackEntry.arguments?.getString("recordId") ?: ""
        val records by viewModel.attendanceRecords.collectAsState()
        val record = records.find { it.id == recordId } ?: records.firstOrNull()

        if (record != null) {
          CheckOutScreen(
            viewModel = viewModel,
            record = record,
            onNavigateBack = { navController.popBackStack() },
            onCheckOutCompleted = {
              navController.navigate(Screen.Dashboard.route) {
                popUpTo(Screen.Dashboard.route) { inclusive = true }
              }
            }
          )
        }
      }

      composable(Screen.Attendance.route) {
        AttendanceHistoryScreen(
          viewModel = viewModel,
          onNavigateBack = { navController.popBackStack() }
        )
      }

      composable(Screen.Leave.route) {
        LeaveScreen(
          viewModel = viewModel,
          onNavigateBack = { navController.popBackStack() }
        )
      }

      composable(Screen.ShiftSwaps.route) {
        ShiftSwapScreen(
          viewModel = viewModel,
          onNavigateBack = { navController.popBackStack() }
        )
      }

      composable(Screen.Notifications.route) {
        NotificationsScreen(
          viewModel = viewModel,
          onNavigateBack = { navController.popBackStack() }
        )
      }

      composable(Screen.Reports.route) {
        ReportsScreen(
          viewModel = viewModel,
          onNavigateBack = { navController.popBackStack() }
        )
      }

      composable(Screen.Profile.route) {
        ProfileScreen(
          viewModel = viewModel,
          onLogout = {
            navController.navigate(Screen.Login.route) {
              popUpTo(0) { inclusive = true }
            }
          },
          onNavigateBack = { navController.popBackStack() }
        )
      }
    }
  }
}
