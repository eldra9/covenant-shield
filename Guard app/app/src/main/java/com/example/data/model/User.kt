package com.example.data.model

data class User(
  val id: String,
  val employeeId: String,
  val fullName: String,
  val role: String = "GUARD", // "GUARD", "SUPERVISOR", "OPERATION_STAFF", "SUPER_ADMIN"
  val phone: String,
  val email: String,
  val pin: String, // Stored hashed/verified PIN
  val baseSiteId: String,
  val baseSiteName: String,
  val isActive: Boolean = true,
  val badgeNumber: String,
  val username: String = employeeId.lowercase(),
  val password: String = pin,
  val avatarInitials: String = fullName.split(" ").mapNotNull { it.firstOrNull()?.toString() }.take(2).joinToString(""),
  val qualifications: List<String> = listOf("CCTV Certified", "First Aid L2", "Physical Security"),
  val profilePictureUri: String? = null
) {
  val isSuperAdmin: Boolean get() = role == "SUPER_ADMIN"
  val isOperationStaff: Boolean get() = role == "OPERATION_STAFF" || role == "SUPER_ADMIN"
  val isSupervisor: Boolean get() = role == "SUPERVISOR" || role == "OPERATION_STAFF" || role == "SUPER_ADMIN"

  val roleDisplayName: String get() = when (role) {
    "SUPER_ADMIN" -> "Super Admin"
    "OPERATION_STAFF" -> "Operations Staff"
    "SUPERVISOR" -> "Station Supervisor"
    else -> "Security Guard"
  }
}
