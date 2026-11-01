package com.example.ui.screens

import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.PickVisualMediaRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.ui.res.painterResource
import com.example.R
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import coil.compose.AsyncImage
import com.example.ui.components.GuillocheSeal
import com.example.ui.theme.*
import com.example.ui.viewmodel.GuardViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProfileScreen(
  viewModel: GuardViewModel,
  onLogout: () -> Unit,
  onNavigateBack: () -> Unit
) {
  val user by viewModel.currentUser.collectAsState()
  val auditLogs by viewModel.auditLogs.collectAsState()
  val isDarkMode by viewModel.isDarkMode.collectAsState()

  val context = LocalContext.current
  var showPhotoOptionsDialog by remember { mutableStateOf(false) }

  val photoPickerLauncher = rememberLauncherForActivityResult(
    contract = ActivityResultContracts.PickVisualMedia()
  ) { uri ->
    if (uri != null) {
      viewModel.updateProfilePicture(uri.toString())
      Toast.makeText(context, "Profile picture updated successfully!", Toast.LENGTH_SHORT).show()
    }
  }

  var showAuditLogs by remember { mutableStateOf(false) }
  var useTapFallback by remember { mutableStateOf(false) }

  Scaffold(
    topBar = {
      TopAppBar(
        title = {
          Column {
            Text("Guard Profile & Security", fontFamily = FrauncesFontFamily, fontWeight = FontWeight.Bold, fontSize = 17.sp, color = White)
            Text("Covenant Shield Credentials", fontFamily = IbmPlexMonoFontFamily, fontSize = 10.sp, color = Gold300)
          }
        },
        navigationIcon = {
          IconButton(onClick = onNavigateBack) {
            Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = White)
          }
        },
        actions = {
          IconButton(
            onClick = { viewModel.toggleDarkMode() },
            modifier = Modifier.testTag("profile_dark_mode_button")
          ) {
            Icon(
              if (isDarkMode) Icons.Default.LightMode else Icons.Default.DarkMode,
              contentDescription = if (isDarkMode) "Switch to Light Mode" else "Switch to Night Watch Dark Mode",
              tint = Gold300
            )
          }
        },
        colors = covenantTopAppBarColors()
      )
    }
  ) { innerPadding ->
    LazyColumn(
      modifier = Modifier
        .fillMaxSize()
        .padding(innerPadding)
        .background(MaterialTheme.colorScheme.background),
      contentPadding = PaddingValues(16.dp),
      verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
      // 1. Guard Identity Card
      item {
        Card(
          shape = RoundedCornerShape(18.dp),
          colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface,
            contentColor = MaterialTheme.colorScheme.onSurface
          ),
          border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant),
          elevation = CardDefaults.cardElevation(0.dp),
          modifier = Modifier.fillMaxWidth()
        ) {
          Column(
            modifier = Modifier.padding(20.dp),
            horizontalAlignment = Alignment.CenterHorizontally
          ) {
            // Interactive Profile Picture Box
            Box(
              contentAlignment = Alignment.BottomEnd,
              modifier = Modifier
                .size(92.dp)
                .clickable { showPhotoOptionsDialog = true }
                .testTag("profile_picture_container")
            ) {
              Box(
                contentAlignment = Alignment.Center,
                modifier = Modifier
                  .size(92.dp)
                  .clip(CircleShape)
                  .background(Forest)
                  .border(2.dp, Gold, CircleShape)
              ) {
                if (!user?.profilePictureUri.isNullOrBlank()) {
                  AsyncImage(
                    model = user?.profilePictureUri,
                    contentDescription = "Profile Photo",
                    contentScale = ContentScale.Crop,
                    modifier = Modifier.fillMaxSize()
                  )
                } else {
                  GuillocheSeal(size = 92.dp, strokeColor = Gold.copy(alpha = 0.35f))
                  Text(
                    text = user?.avatarInitials ?: "CS",
                    color = Gold,
                    fontFamily = IbmPlexMonoFontFamily,
                    fontWeight = FontWeight.Black,
                    fontSize = 26.sp
                  )
                }
              }

              // Floating Camera Badge Button
              Box(
                contentAlignment = Alignment.Center,
                modifier = Modifier
                  .size(28.dp)
                  .clip(CircleShape)
                  .background(Gold)
                  .border(2.dp, if (isAppInDarkTheme()) Forest else White, CircleShape)
              ) {
                Icon(
                  Icons.Default.CameraAlt,
                  contentDescription = "Change Profile Picture",
                  tint = Forest,
                  modifier = Modifier.size(15.dp)
                )
              }
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Action Button: Add / Change Profile Picture
            OutlinedButton(
              onClick = { showPhotoOptionsDialog = true },
              shape = RoundedCornerShape(20.dp),
              colors = covenantOutlinedButtonColors(),
              contentPadding = PaddingValues(horizontal = 14.dp, vertical = 4.dp),
              modifier = Modifier.testTag("change_profile_photo_button")
            ) {
              Icon(Icons.Default.AddAPhoto, contentDescription = null, modifier = Modifier.size(14.dp))
              Spacer(modifier = Modifier.width(6.dp))
              Text(
                text = if (user?.profilePictureUri.isNullOrBlank()) "Add Profile Picture" else "Change Photo",
                fontFamily = InterFontFamily,
                fontWeight = FontWeight.SemiBold,
                fontSize = 12.sp
              )
            }

            Spacer(modifier = Modifier.height(10.dp))

            Text(
              text = user?.fullName ?: "Security Officer",
              fontFamily = FrauncesFontFamily,
              style = MaterialTheme.typography.titleMedium,
              fontWeight = FontWeight.Bold,
              fontSize = 18.sp,
              color = MaterialTheme.colorScheme.onSurface
            )

            Spacer(modifier = Modifier.height(6.dp))

            Surface(
              shape = RoundedCornerShape(8.dp),
              color = if (isAppInDarkTheme()) Forest3 else Emerald50,
              border = androidx.compose.foundation.BorderStroke(
                1.dp,
                if (isAppInDarkTheme()) Gold.copy(alpha = 0.5f) else Emerald.copy(alpha = 0.3f)
              ),
              modifier = Modifier.testTag("profile_guard_id_badge")
            ) {
              Row(
                modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp),
                verticalAlignment = Alignment.CenterVertically
              ) {
                Icon(
                  Icons.Default.Badge,
                  contentDescription = null,
                  tint = if (isAppInDarkTheme()) Gold else Emerald,
                  modifier = Modifier.size(14.dp)
                )
                Spacer(modifier = Modifier.width(6.dp))
                Text(
                  text = "GUARD ID: ${user?.id ?: "N/A"}",
                  fontFamily = IbmPlexMonoFontFamily,
                  fontWeight = FontWeight.Bold,
                  fontSize = 12.sp,
                  color = if (isAppInDarkTheme()) Gold else Emerald
                )
              }
            }

            Spacer(modifier = Modifier.height(6.dp))

            Text(
              text = "Badge: ${user?.badgeNumber ?: ""} · Employee ID: ${user?.employeeId ?: ""}",
              fontFamily = IbmPlexMonoFontFamily,
              fontSize = 12.sp,
              color = MaterialTheme.colorScheme.onSurfaceVariant
            )

            Spacer(modifier = Modifier.height(16.dp))
            HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)
            Spacer(modifier = Modifier.height(16.dp))

            Column(
              modifier = Modifier.fillMaxWidth(),
              verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
              ProfileDetailRow(label = "Guard ID", value = user?.id ?: "N/A")
              ProfileDetailRow(label = "Badge Number", value = user?.badgeNumber ?: "N/A")
              ProfileDetailRow(label = "Employee ID", value = user?.employeeId ?: "N/A")
              ProfileDetailRow(label = "Primary Station", value = user?.baseSiteName ?: "")
              ProfileDetailRow(label = "Official Phone", value = user?.phone ?: "")
              ProfileDetailRow(label = "Security Email", value = user?.email ?: "")
              ProfileDetailRow(label = "Role Clearance", value = user?.roleDisplayName ?: "Security Guard")
              ProfileDetailRow(label = "Official Username", value = user?.username ?: "")
            }

            Spacer(modifier = Modifier.height(14.dp))

            Text(
              text = "Qualified Certifications:",
              fontFamily = InterFontFamily,
              fontSize = 11.sp,
              fontWeight = FontWeight.Bold,
              color = MaterialTheme.colorScheme.onSurface,
              modifier = Modifier.align(Alignment.Start)
            )

            Spacer(modifier = Modifier.height(6.dp))

            Row(
              modifier = Modifier.fillMaxWidth(),
              horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
              user?.qualifications?.forEach { qual ->
                SuggestionChip(
                  onClick = {},
                  label = { Text(qual, fontFamily = IbmPlexMonoFontFamily, fontSize = 10.sp) }
                )
              }
            }
          }
        }
      }

      // 2. Accessibility & Terminal Preferences
      item {
        Card(
          shape = RoundedCornerShape(16.dp),
          colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface,
            contentColor = MaterialTheme.colorScheme.onSurface
          ),
          border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant),
          elevation = CardDefaults.cardElevation(0.dp),
          modifier = Modifier.fillMaxWidth()
        ) {
          Column(modifier = Modifier.padding(18.dp)) {
            Text(
              text = "Accessibility & Interaction",
              fontFamily = FrauncesFontFamily,
              style = MaterialTheme.typography.titleSmall,
              fontWeight = FontWeight.Bold,
              color = MaterialTheme.colorScheme.onSurface
            )

            Spacer(modifier = Modifier.height(12.dp))

            Row(
              modifier = Modifier.fillMaxWidth(),
              horizontalArrangement = Arrangement.SpaceBetween,
              verticalAlignment = Alignment.CenterVertically
            ) {
              Column(modifier = Modifier.weight(1f)) {
                Text(
                  text = "Use confirm tap instead of hold",
                  fontFamily = InterFontFamily,
                  fontWeight = FontWeight.Medium,
                  fontSize = 13.sp,
                  color = MaterialTheme.colorScheme.onSurface
                )
                Text(
                  text = "Shows a bottom confirmation dialog on tap for easier one-handed use",
                  fontFamily = InterFontFamily,
                  fontSize = 11.sp,
                  color = MaterialTheme.colorScheme.onSurfaceVariant
                )
              }
              Switch(
                checked = useTapFallback,
                onCheckedChange = { useTapFallback = it },
                colors = SwitchDefaults.colors(
                  checkedThumbColor = if (isAppInDarkTheme()) Gold else Emerald,
                  checkedTrackColor = if (isAppInDarkTheme()) Forest2 else Emerald50
                )
              )
            }

            HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant, modifier = Modifier.padding(vertical = 12.dp))

            Row(
              modifier = Modifier.fillMaxWidth(),
              horizontalArrangement = Arrangement.SpaceBetween,
              verticalAlignment = Alignment.CenterVertically
            ) {
              Column(modifier = Modifier.weight(1f)) {
                Text(
                  text = "Night Watch (Dark Mode)",
                  fontFamily = InterFontFamily,
                  fontWeight = FontWeight.Medium,
                  fontSize = 13.sp,
                  color = MaterialTheme.colorScheme.onSurface
                )
                Text(
                  text = if (isDarkMode) "Dark theme enabled for low-light night patrols" else "Ivory sunlight theme enabled for daytime posts",
                  fontFamily = InterFontFamily,
                  fontSize = 11.sp,
                  color = MaterialTheme.colorScheme.onSurfaceVariant
                )
              }
              Switch(
                checked = isDarkMode,
                onCheckedChange = { viewModel.toggleDarkMode() },
                colors = SwitchDefaults.colors(checkedThumbColor = Gold, checkedTrackColor = Forest2),
                modifier = Modifier.testTag("profile_dark_mode_switch")
              )
            }
          }
        }
      }

      // 3. Security Audit Log
      item {
        Card(
          shape = RoundedCornerShape(16.dp),
          colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface,
            contentColor = MaterialTheme.colorScheme.onSurface
          ),
          border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant),
          elevation = CardDefaults.cardElevation(0.dp),
          modifier = Modifier.fillMaxWidth()
        ) {
          Column(modifier = Modifier.padding(18.dp)) {
            Row(
              modifier = Modifier.fillMaxWidth(),
              horizontalArrangement = Arrangement.SpaceBetween,
              verticalAlignment = Alignment.CenterVertically
            ) {
              Text(
                text = "Tamper-Evident Audit Log (${auditLogs.size})",
                fontFamily = InterFontFamily,
                fontWeight = FontWeight.Bold,
                fontSize = 13.sp,
                color = MaterialTheme.colorScheme.onSurface
              )
              TextButton(onClick = { showAuditLogs = !showAuditLogs }) {
                Text(if (showAuditLogs) "Hide" else "View All", fontFamily = InterFontFamily, fontSize = 11.sp, color = if (isAppInDarkTheme()) Gold else Emerald)
              }
            }

            if (showAuditLogs) {
              Spacer(modifier = Modifier.height(8.dp))
              Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                auditLogs.take(8).forEach { log ->
                  val logBg = if (log.isAccepted) {
                    if (isAppInDarkTheme()) Forest3 else Emerald50.copy(alpha = 0.5f)
                  } else {
                    if (isAppInDarkTheme()) StatusDangerDarkTint else StatusDanger.copy(alpha = 0.08f)
                  }
                  val logEventColor = if (log.isAccepted) {
                    if (isAppInDarkTheme()) Gold else Emerald
                  } else {
                    if (isAppInDarkTheme()) StatusDangerDark else StatusDanger
                  }
                  val logStatusColor = if (log.isAccepted) {
                    if (isAppInDarkTheme()) StatusSuccessDark else StatusSuccess
                  } else {
                    if (isAppInDarkTheme()) StatusDangerDark else StatusDanger
                  }

                  Card(
                    shape = RoundedCornerShape(8.dp),
                    colors = CardDefaults.cardColors(containerColor = logBg),
                    modifier = Modifier.fillMaxWidth()
                  ) {
                    Column(modifier = Modifier.padding(10.dp)) {
                      Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                      ) {
                        Text(
                          text = "${log.eventType} · ${log.serverTimestampFormatted}",
                          fontFamily = IbmPlexMonoFontFamily,
                          fontWeight = FontWeight.Bold,
                          fontSize = 11.sp,
                          color = logEventColor
                        )
                        Text(
                          text = if (log.isAccepted) "ACCEPTED" else "REJECTED",
                          fontFamily = IbmPlexMonoFontFamily,
                          fontWeight = FontWeight.Black,
                          fontSize = 10.sp,
                          color = logStatusColor
                        )
                      }
                      Spacer(modifier = Modifier.height(2.dp))
                      Text(
                        text = log.reason,
                        fontFamily = InterFontFamily,
                        fontSize = 11.sp,
                        color = MaterialTheme.colorScheme.onSurface
                      )
                    }
                  }
                }
              }
            }
          }
        }
      }

      // 5. Sign Out Button
      item {
        Button(
          onClick = { viewModel.performLogout(onLogout) },
          colors = ButtonDefaults.buttonColors(containerColor = StatusDanger, contentColor = White),
          shape = RoundedCornerShape(12.dp),
          modifier = Modifier
            .fillMaxWidth()
            .height(50.dp)
            .testTag("profile_logout_button")
        ) {
          Icon(Icons.Default.Logout, contentDescription = null)
          Spacer(modifier = Modifier.width(8.dp))
          Text("LOG OUT OF TERMINAL", fontFamily = InterFontFamily, fontWeight = FontWeight.Bold)
        }
      }

      item {
        Column(
          modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 12.dp),
          horizontalAlignment = Alignment.CenterHorizontally
        ) {
          Image(
            painter = painterResource(id = R.drawable.app_logo),
            contentDescription = "Covenant Shield Crest",
            modifier = Modifier
              .size(42.dp)
              .clip(CircleShape)
              .border(1.5.dp, Gold, CircleShape)
          )
          Spacer(modifier = Modifier.height(6.dp))
          Text(
            text = "COVENANT SHIELD",
            fontFamily = FrauncesFontFamily,
            fontWeight = FontWeight.Bold,
            fontSize = 13.sp,
            color = MaterialTheme.colorScheme.onSurface
          )
          Text(
            text = "On Post Guard System · Official Terminal",
            fontFamily = IbmPlexMonoFontFamily,
            fontSize = 10.sp,
            color = MaterialTheme.colorScheme.onSurfaceVariant
          )
        }
      }
    }
  }

  // Profile Picture Adder & Options Dialog
  if (showPhotoOptionsDialog) {
    Dialog(onDismissRequest = { showPhotoOptionsDialog = false }) {
      Card(
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(
          containerColor = MaterialTheme.colorScheme.surface,
          contentColor = MaterialTheme.colorScheme.onSurface
        ),
        border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant),
        elevation = CardDefaults.cardElevation(0.dp),
        modifier = Modifier.fillMaxWidth()
      ) {
        Column(
          modifier = Modifier.padding(20.dp)
        ) {
          Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
          ) {
            Text(
              text = "Profile Picture",
              fontFamily = FrauncesFontFamily,
              fontWeight = FontWeight.Bold,
              fontSize = 18.sp,
              color = MaterialTheme.colorScheme.onSurface
            )
            IconButton(
              onClick = { showPhotoOptionsDialog = false },
              modifier = Modifier.size(28.dp)
            ) {
              Icon(Icons.Default.Close, contentDescription = "Close", tint = MaterialTheme.colorScheme.onSurfaceVariant)
            }
          }

          Spacer(modifier = Modifier.height(6.dp))
          Text(
            text = "Select a photo from your device gallery to personalize your security credentials.",
            fontFamily = InterFontFamily,
            fontSize = 12.sp,
            color = MaterialTheme.colorScheme.onSurfaceVariant
          )

          Spacer(modifier = Modifier.height(16.dp))
          HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)
          Spacer(modifier = Modifier.height(14.dp))

          // 1. Choose from Gallery / Photo Picker
          Card(
            shape = RoundedCornerShape(12.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
            modifier = Modifier
              .fillMaxWidth()
              .clickable {
                showPhotoOptionsDialog = false
                photoPickerLauncher.launch(
                  PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly)
                )
              }
              .testTag("pick_from_gallery_option")
          ) {
            Row(
              modifier = Modifier
                .fillMaxWidth()
                .padding(14.dp),
              verticalAlignment = Alignment.CenterVertically
            ) {
              Box(
                contentAlignment = Alignment.Center,
                modifier = Modifier
                  .size(40.dp)
                  .clip(CircleShape)
                  .background(if (isAppInDarkTheme()) Forest3 else Emerald)
              ) {
                Icon(Icons.Default.PhotoLibrary, contentDescription = null, tint = if (isAppInDarkTheme()) Gold else White, modifier = Modifier.size(20.dp))
              }
              Spacer(modifier = Modifier.width(12.dp))
              Column {
                Text(
                  text = "Choose from Gallery",
                  fontFamily = InterFontFamily,
                  fontWeight = FontWeight.Bold,
                  fontSize = 13.sp,
                  color = MaterialTheme.colorScheme.onSurface
                )
                Text(
                  text = "Upload a photo from your device storage",
                  fontFamily = InterFontFamily,
                  fontSize = 11.sp,
                  color = MaterialTheme.colorScheme.onSurfaceVariant
                )
              }
            }
          }

          if (!user?.profilePictureUri.isNullOrBlank()) {
            Spacer(modifier = Modifier.height(16.dp))
            HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)
            Spacer(modifier = Modifier.height(10.dp))

            TextButton(
              onClick = {
                viewModel.updateProfilePicture(null)
                showPhotoOptionsDialog = false
                Toast.makeText(context, "Profile picture removed", Toast.LENGTH_SHORT).show()
              },
              colors = ButtonDefaults.textButtonColors(contentColor = if (isAppInDarkTheme()) StatusDangerDark else StatusDanger),
              modifier = Modifier
                .fillMaxWidth()
                .testTag("remove_profile_photo_button")
            ) {
              Icon(Icons.Default.DeleteOutline, contentDescription = null, modifier = Modifier.size(16.dp))
              Spacer(modifier = Modifier.width(6.dp))
              Text("Remove Profile Picture", fontFamily = InterFontFamily, fontWeight = FontWeight.SemiBold, fontSize = 12.sp)
            }
          }
        }
      }
    }
  }
}


@Composable
private fun ProfileDetailRow(label: String, value: String) {
  Row(
    modifier = Modifier.fillMaxWidth(),
    horizontalArrangement = Arrangement.SpaceBetween
  ) {
    Text(text = label, fontFamily = InterFontFamily, fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
    Text(text = value, fontFamily = InterFontFamily, fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = MaterialTheme.colorScheme.onSurface)
  }
}
