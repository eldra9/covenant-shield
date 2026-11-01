package com.example.ui.screens

import android.widget.Toast
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.example.data.model.*
import com.example.ui.components.NetworkBanner
import com.example.ui.theme.*
import com.example.ui.viewmodel.GuardViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ReportsScreen(
  viewModel: GuardViewModel,
  onNavigateBack: () -> Unit
) {
  val context = LocalContext.current
  val currentUser by viewModel.currentUser.collectAsState()
  val isOnline by viewModel.isOnline.collectAsState()
  val offlineQueue by viewModel.offlineQueue.collectAsState()
  val sites by viewModel.sites.collectAsState()
  val todayShift by viewModel.todayShift.collectAsState()
  val guardReports by viewModel.guardReports.collectAsState()
  val filteredReports by viewModel.filteredGuardReports.collectAsState()
  val searchQuery by viewModel.reportSearchQuery.collectAsState()
  val selectedCategory by viewModel.reportCategoryFilter.collectAsState()

  // Dialog and inspection states
  var showCreateDialog by remember { mutableStateOf(false) }
  var defaultCreateType by remember { mutableStateOf(ReportType.INCIDENT) }
  var inspectingReport by remember { mutableStateOf<SecurityReport?>(null) }

  // Quick stats
  val openReportsCount = remember(guardReports) {
    guardReports.count { it.status == ReportStatus.SUBMITTED || it.status == ReportStatus.UNDER_REVIEW }
  }

  Scaffold(
    topBar = {
      Column {
        NetworkBanner(
          isOnline = isOnline,
          pendingSyncCount = offlineQueue.size,
          onToggleNetwork = { viewModel.toggleNetwork() },
          onSyncClick = { viewModel.syncOfflineQueue() }
        )

        TopAppBar(
          title = {
            Column {
              Text(
                text = "Reports",
                fontFamily = FrauncesFontFamily,
                fontWeight = FontWeight.Bold,
                fontSize = 20.sp,
                color = White
              )
              Text(
                text = "${currentUser?.baseSiteName ?: "Guard Post"} · $openReportsCount Active",
                fontFamily = InterFontFamily,
                fontSize = 11.sp,
                color = Gold300
              )
            }
          },
          navigationIcon = {
            IconButton(
              onClick = onNavigateBack,
              modifier = Modifier.testTag("reports_back_button")
            ) {
              Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = White)
            }
          },
          actions = {
            Button(
              onClick = {
                defaultCreateType = ReportType.INCIDENT
                showCreateDialog = true
              },
              colors = ButtonDefaults.buttonColors(containerColor = Gold, contentColor = Forest),
              shape = RoundedCornerShape(20.dp),
              contentPadding = PaddingValues(horizontal = 14.dp, vertical = 6.dp),
              modifier = Modifier
                .padding(end = 8.dp)
                .testTag("header_add_report_button")
            ) {
              Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(16.dp))
              Spacer(modifier = Modifier.width(4.dp))
              Text("New Report", fontFamily = InterFontFamily, fontWeight = FontWeight.Bold, fontSize = 12.sp)
            }
          },
          colors = covenantTopAppBarColors()
        )
      }
    },
    floatingActionButton = {
      FloatingActionButton(
        onClick = {
          defaultCreateType = ReportType.INCIDENT
          showCreateDialog = true
        },
        containerColor = Gold,
        contentColor = Forest,
        elevation = FloatingActionButtonDefaults.elevation(0.dp, 0.dp, 0.dp, 0.dp),
        modifier = Modifier.testTag("create_report_fab")
      ) {
        Row(
          modifier = Modifier.padding(horizontal = 16.dp),
          verticalAlignment = Alignment.CenterVertically
        ) {
          Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(20.dp))
          Spacer(modifier = Modifier.width(6.dp))
          Text("File Report", fontFamily = InterFontFamily, fontWeight = FontWeight.Bold, fontSize = 14.sp)
        }
      }
    }
  ) { innerPadding ->
    val isDark = isAppInDarkTheme()
    LazyColumn(
      modifier = Modifier
        .fillMaxSize()
        .padding(innerPadding)
        .background(MaterialTheme.colorScheme.background),
      contentPadding = PaddingValues(16.dp),
      verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
      // 1. FAST 1-TAP QUICK REPORT BUTTONS
      item {
        Text(
          text = "QUICK REPORT",
          fontFamily = IbmPlexMonoFontFamily,
          fontSize = 11.sp,
          fontWeight = FontWeight.Bold,
          letterSpacing = 1.sp,
          color = MaterialTheme.colorScheme.onSurfaceVariant
        )
        Spacer(modifier = Modifier.height(8.dp))

        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
          QuickReportTile(
            title = "Incident",
            subtitle = "Security event",
            icon = Icons.Default.Warning,
            iconTint = if (isDark) StatusDangerDark else StatusDanger,
            bgColor = if (isDark) StatusDangerDarkTint else StatusDangerTint,
            modifier = Modifier.weight(1f),
            onClick = {
              defaultCreateType = ReportType.INCIDENT
              showCreateDialog = true
            }
          )
          QuickReportTile(
            title = "Patrol",
            subtitle = "Sector check",
            icon = Icons.Default.Shield,
            iconTint = if (isDark) StatusSuccessDark else Emerald,
            bgColor = if (isDark) StatusSuccessDarkTint else Emerald50,
            modifier = Modifier.weight(1f),
            onClick = {
              defaultCreateType = ReportType.PATROL_LOG
              showCreateDialog = true
            }
          )
          QuickReportTile(
            title = "Hazard",
            subtitle = "Facility issue",
            icon = Icons.Default.Build,
            iconTint = if (isDark) StatusWarningDark else StatusWarning,
            bgColor = if (isDark) StatusWarningDarkTint else StatusWarningTint,
            modifier = Modifier.weight(1f),
            onClick = {
              defaultCreateType = ReportType.MAINTENANCE_HAZARD
              showCreateDialog = true
            }
          )
          QuickReportTile(
            title = "Handover",
            subtitle = "Shift log",
            icon = Icons.Default.SwapHoriz,
            iconTint = if (isDark) Gold else Forest3,
            bgColor = MaterialTheme.colorScheme.surfaceVariant,
            modifier = Modifier.weight(1f),
            onClick = {
              defaultCreateType = ReportType.SHIFT_HANDOVER
              showCreateDialog = true
            }
          )
        }
      }

      // 2. SIMPLE SEARCH & FILTER BAR
      item {
        Card(
          shape = RoundedCornerShape(14.dp),
          colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface,
            contentColor = MaterialTheme.colorScheme.onSurface
          ),
          border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant),
          modifier = Modifier.fillMaxWidth()
        ) {
          Column(modifier = Modifier.padding(12.dp)) {
            // Search field
            OutlinedTextField(
              value = searchQuery,
              onValueChange = { viewModel.setReportSearchQuery(it) },
              placeholder = { Text("Search reports or locations...", fontSize = 13.sp, color = MaterialTheme.colorScheme.onSurfaceVariant) },
              leadingIcon = {
                Icon(Icons.Default.Search, contentDescription = null, tint = MaterialTheme.colorScheme.primary, modifier = Modifier.size(18.dp))
              },
              trailingIcon = {
                if (searchQuery.isNotEmpty()) {
                  IconButton(onClick = { viewModel.setReportSearchQuery("") }) {
                    Icon(Icons.Default.Clear, contentDescription = "Clear", modifier = Modifier.size(16.dp))
                  }
                }
              },
              singleLine = true,
              shape = RoundedCornerShape(10.dp),
              colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = MaterialTheme.colorScheme.primary,
                unfocusedBorderColor = MaterialTheme.colorScheme.outlineVariant,
                focusedContainerColor = MaterialTheme.colorScheme.surfaceVariant,
                unfocusedContainerColor = MaterialTheme.colorScheme.surfaceVariant,
                focusedTextColor = MaterialTheme.colorScheme.onSurface,
                unfocusedTextColor = MaterialTheme.colorScheme.onSurface
              ),
              modifier = Modifier
                .fillMaxWidth()
                .testTag("report_search_input")
            )

            Spacer(modifier = Modifier.height(10.dp))

            // Easy Filter chips
            Row(
              modifier = Modifier
                .fillMaxWidth()
                .horizontalScroll(rememberScrollState()),
              horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
              listOf(
                "ALL" to "All",
                "INCIDENT" to "🚨 Incidents",
                "PATROL" to "🚶 Patrols",
                "HAZARD" to "⚠️ Hazards",
                "HANDOVER" to "📋 Handovers"
              ).forEach { (catKey, catLabel) ->
                val isSelected = selectedCategory == catKey
                FilterChip(
                  selected = isSelected,
                  onClick = { viewModel.setReportCategoryFilter(catKey) },
                  label = {
                    Text(
                      catLabel,
                      fontFamily = InterFontFamily,
                      fontSize = 11.sp,
                      fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal
                    )
                  },
                  colors = FilterChipDefaults.filterChipColors(
                    selectedContainerColor = MaterialTheme.colorScheme.primary,
                    selectedLabelColor = MaterialTheme.colorScheme.onPrimary,
                    containerColor = MaterialTheme.colorScheme.surfaceVariant,
                    labelColor = MaterialTheme.colorScheme.onSurface
                  ),
                  border = FilterChipDefaults.filterChipBorder(
                    enabled = true,
                    selected = isSelected,
                    borderColor = if (isSelected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.outlineVariant
                  ),
                  modifier = Modifier.testTag("filter_cat_$catKey")
                )
              }
            }
          }
        }
      }

      // 3. RECENT REPORTS HEADER
      item {
        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.SpaceBetween,
          verticalAlignment = Alignment.CenterVertically
        ) {
          Text(
            text = "LOGGED REPORTS (${filteredReports.size})",
            fontFamily = IbmPlexMonoFontFamily,
            fontSize = 11.sp,
            fontWeight = FontWeight.Bold,
            letterSpacing = 1.sp,
            color = MaterialTheme.colorScheme.onSurfaceVariant
          )
          if (filteredReports.isNotEmpty()) {
            Text(
              text = "Tap any card to view or resolve",
              fontFamily = InterFontFamily,
              fontSize = 11.sp,
              color = MaterialTheme.colorScheme.onSurfaceVariant
            )
          }
        }
      }

      // 4. REPORT LIST
      if (filteredReports.isEmpty()) {
        item {
          Card(
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(
              containerColor = MaterialTheme.colorScheme.surface,
              contentColor = MaterialTheme.colorScheme.onSurface
            ),
            border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant),
            modifier = Modifier.fillMaxWidth()
          ) {
            Column(
              modifier = Modifier
                .fillMaxWidth()
                .padding(32.dp),
              horizontalAlignment = Alignment.CenterHorizontally
            ) {
              Box(
                contentAlignment = Alignment.Center,
                modifier = Modifier
                  .size(54.dp)
                  .clip(CircleShape)
                  .background(MaterialTheme.colorScheme.surfaceVariant)
              ) {
                Icon(
                  Icons.Default.CheckCircle,
                  contentDescription = null,
                  tint = if (isAppInDarkTheme()) StatusSuccessDark else StatusSuccess,
                  modifier = Modifier.size(28.dp)
                )
              }
              Spacer(modifier = Modifier.height(12.dp))
              Text(
                text = "No Reports Found",
                fontFamily = FrauncesFontFamily,
                fontWeight = FontWeight.Bold,
                fontSize = 16.sp,
                color = MaterialTheme.colorScheme.onSurface
              )
              Spacer(modifier = Modifier.height(4.dp))
              Text(
                text = if (searchQuery.isNotEmpty()) "Try changing your search keywords."
                else "Everything is quiet! Tap '+ New Report' to log an occurrence or patrol check.",
                fontFamily = InterFontFamily,
                fontSize = 12.sp,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                textAlign = TextAlign.Center
              )
            }
          }
        }
      } else {
        items(filteredReports, key = { it.id }) { report ->
          SimpleReportCard(
            report = report,
            onClick = { inspectingReport = report }
          )
        }
      }

      // Spacer so FAB doesn't obscure last card
      item {
        Spacer(modifier = Modifier.height(48.dp))
      }
    }
  }

  // DIALOG: SIMPLE REPORT FILING
  if (showCreateDialog) {
    SimpleCreateReportDialog(
      sites = sites,
      defaultType = defaultCreateType,
      currentSiteId = todayShift?.siteId ?: currentUser?.baseSiteId ?: sites.firstOrNull()?.id ?: "SITE-001",
      currentSiteName = todayShift?.siteName ?: currentUser?.baseSiteName ?: "Assigned Post",
      onDismiss = { showCreateDialog = false },
      onSubmit = { type, isUrgent, title, desc, siteId, location ->
        val severity = if (isUrgent) ReportSeverity.PRIORITY else ReportSeverity.ROUTINE
        val actionTaken = "Recorded on post and logged in station ledger."
        val report = viewModel.submitSecurityReport(
          type = type,
          severity = severity,
          title = title,
          description = desc,
          siteId = siteId,
          locationSpecific = location,
          actionTaken = actionTaken
        )
        showCreateDialog = false
        if (report != null) {
          Toast.makeText(context, "Report filed successfully!", Toast.LENGTH_SHORT).show()
        }
      }
    )
  }

  // DIALOG: SIMPLE REPORT INSPECTION
  inspectingReport?.let { report ->
    SimpleReportDetailDialog(
      report = report,
      onDismiss = { inspectingReport = null },
      onResolve = { notes ->
        viewModel.resolveSecurityReport(report.id, notes)
        inspectingReport = report.copy(status = ReportStatus.RESOLVED, resolutionNotes = notes)
        Toast.makeText(context, "Report marked as resolved.", Toast.LENGTH_SHORT).show()
      }
    )
  }
}

// -------------------------------------------------------------
// Component: Fast 1-Tap Quick Report Tile
// -------------------------------------------------------------
@Composable
private fun QuickReportTile(
  title: String,
  subtitle: String,
  icon: ImageVector,
  iconTint: Color,
  bgColor: Color,
  modifier: Modifier = Modifier,
  onClick: () -> Unit
) {
  Card(
    shape = RoundedCornerShape(12.dp),
    colors = CardDefaults.cardColors(
      containerColor = MaterialTheme.colorScheme.surface,
      contentColor = MaterialTheme.colorScheme.onSurface
    ),
    border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant),
    modifier = modifier.clickable(onClick = onClick)
  ) {
    Column(
      modifier = Modifier
        .fillMaxWidth()
        .padding(vertical = 12.dp, horizontal = 6.dp),
      horizontalAlignment = Alignment.CenterHorizontally
    ) {
      Box(
        contentAlignment = Alignment.Center,
        modifier = Modifier
          .size(36.dp)
          .clip(CircleShape)
          .background(bgColor)
      ) {
        Icon(icon, contentDescription = null, tint = iconTint, modifier = Modifier.size(18.dp))
      }
      Spacer(modifier = Modifier.height(6.dp))
      Text(
        text = title,
        fontFamily = InterFontFamily,
        fontWeight = FontWeight.Bold,
        fontSize = 11.sp,
        color = MaterialTheme.colorScheme.onSurface
      )
      Text(
        text = subtitle,
        fontFamily = InterFontFamily,
        fontSize = 9.sp,
        color = MaterialTheme.colorScheme.onSurfaceVariant,
        maxLines = 1,
        overflow = TextOverflow.Ellipsis
      )
    }
  }
}

// -------------------------------------------------------------
// Component: Simple, Clean Report Card
// -------------------------------------------------------------
@Composable
private fun SimpleReportCard(
  report: SecurityReport,
  onClick: () -> Unit
) {
  val isResolved = report.status == ReportStatus.RESOLVED
  val isUrgent = report.severity == ReportSeverity.CRITICAL || report.severity == ReportSeverity.PRIORITY
  val isDark = isAppInDarkTheme()

  val typeIcon = when (report.type) {
    ReportType.INCIDENT -> Icons.Default.Warning
    ReportType.PATROL_LOG -> Icons.Default.Shield
    ReportType.MAINTENANCE_HAZARD -> Icons.Default.Build
    ReportType.SHIFT_HANDOVER -> Icons.Default.SwapHoriz
    ReportType.VISITOR_EXCEPTION -> Icons.Default.Badge
    ReportType.ATTENDANCE_DISPUTE -> Icons.Default.HelpOutline
  }

  val typeColor = when (report.type) {
    ReportType.INCIDENT -> if (isDark) (if (isUrgent) StatusDangerDark else StatusWarningDark) else (if (isUrgent) StatusDanger else StatusWarning)
    ReportType.PATROL_LOG -> if (isDark) StatusSuccessDark else Emerald
    ReportType.MAINTENANCE_HAZARD -> if (isDark) StatusWarningDark else StatusWarning
    ReportType.SHIFT_HANDOVER -> if (isDark) Gold else Forest3
    else -> MaterialTheme.colorScheme.onSurface
  }

  val typeBg = when (report.type) {
    ReportType.INCIDENT -> if (isDark) (if (isUrgent) StatusDangerDarkTint else StatusWarningDarkTint) else (if (isUrgent) StatusDangerTint else StatusWarningTint)
    ReportType.PATROL_LOG -> if (isDark) StatusSuccessDarkTint else Emerald50
    ReportType.MAINTENANCE_HAZARD -> if (isDark) StatusWarningDarkTint else StatusWarningTint
    ReportType.SHIFT_HANDOVER -> MaterialTheme.colorScheme.surfaceVariant
    else -> MaterialTheme.colorScheme.surfaceVariant
  }

  Card(
    shape = RoundedCornerShape(14.dp),
    colors = CardDefaults.cardColors(
      containerColor = MaterialTheme.colorScheme.surface,
      contentColor = MaterialTheme.colorScheme.onSurface
    ),
    border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant),
    elevation = CardDefaults.cardElevation(0.dp),
    modifier = Modifier
      .fillMaxWidth()
      .clickable(onClick = onClick)
      .testTag("report_card_${report.id}")
  ) {
    Row(
      modifier = Modifier
        .fillMaxWidth()
        .padding(14.dp),
      verticalAlignment = Alignment.Top
    ) {
      // Category Icon Badge
      Box(
        contentAlignment = Alignment.Center,
        modifier = Modifier
          .size(40.dp)
          .clip(RoundedCornerShape(10.dp))
          .background(typeBg)
      ) {
        Icon(typeIcon, contentDescription = null, tint = typeColor, modifier = Modifier.size(20.dp))
      }

      Spacer(modifier = Modifier.width(12.dp))

      // Middle content
      Column(modifier = Modifier.weight(1f)) {
        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.SpaceBetween,
          verticalAlignment = Alignment.CenterVertically
        ) {
          Text(
            text = report.type.label,
            fontFamily = InterFontFamily,
            fontWeight = FontWeight.SemiBold,
            fontSize = 11.sp,
            color = typeColor
          )

          // Status Badge
          val badgeBg = if (isResolved) (if (isDark) StatusSuccessDarkTint else StatusSuccessTint)
                        else (if (isDark) StatusWarningDarkTint else StatusWarningTint)
          val badgeTextColor = if (isResolved) (if (isDark) StatusSuccessDark else StatusSuccess)
                               else (if (isDark) StatusWarningDark else StatusWarning)

          Box(
            modifier = Modifier
              .clip(RoundedCornerShape(12.dp))
              .background(badgeBg)
              .padding(horizontal = 8.dp, vertical = 2.dp)
          ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
              if (isResolved) {
                Icon(Icons.Default.Check, contentDescription = null, tint = badgeTextColor, modifier = Modifier.size(10.dp))
                Spacer(modifier = Modifier.width(2.dp))
              }
              Text(
                text = if (isResolved) "Resolved" else "Active",
                fontFamily = InterFontFamily,
                fontWeight = FontWeight.Bold,
                fontSize = 10.sp,
                color = badgeTextColor
              )
            }
          }
        }

        Spacer(modifier = Modifier.height(3.dp))

        Text(
          text = report.title,
          fontFamily = FrauncesFontFamily,
          fontWeight = FontWeight.Bold,
          fontSize = 15.sp,
          color = MaterialTheme.colorScheme.onSurface
        )

        Spacer(modifier = Modifier.height(4.dp))

        Text(
          text = report.description,
          fontFamily = InterFontFamily,
          fontSize = 12.sp,
          color = MaterialTheme.colorScheme.onSurfaceVariant,
          maxLines = 2,
          overflow = TextOverflow.Ellipsis,
          lineHeight = 16.sp
        )

        Spacer(modifier = Modifier.height(8.dp))

        Row(
          verticalAlignment = Alignment.CenterVertically,
          modifier = Modifier.fillMaxWidth()
        ) {
          Icon(Icons.Default.Place, contentDescription = null, tint = MaterialTheme.colorScheme.onSurfaceVariant, modifier = Modifier.size(12.dp))
          Spacer(modifier = Modifier.width(4.dp))
          Text(
            text = "${report.siteName} · ${report.locationSpecific}",
            fontFamily = InterFontFamily,
            fontSize = 11.sp,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            maxLines = 1,
            overflow = TextOverflow.Ellipsis,
            modifier = Modifier.weight(1f)
          )

          Text(
            text = report.timestampFormatted,
            fontFamily = IbmPlexMonoFontFamily,
            fontSize = 10.sp,
            color = MaterialTheme.colorScheme.onSurfaceVariant
          )
        }
      }
    }
  }
}

// -------------------------------------------------------------
// Dialog: Simple 3-Step Report Creation
// -------------------------------------------------------------
@Composable
private fun SimpleCreateReportDialog(
  sites: List<Site>,
  defaultType: ReportType,
  currentSiteId: String,
  currentSiteName: String,
  onDismiss: () -> Unit,
  onSubmit: (ReportType, Boolean, String, String, String, String) -> Unit
) {
  var selectedType by remember { mutableStateOf(defaultType) }
  var isUrgent by remember { mutableStateOf(false) }
  var title by remember { mutableStateOf("") }
  var description by remember { mutableStateOf("") }
  var location by remember { mutableStateOf("") }
  var selectedSiteId by remember { mutableStateOf(currentSiteId) }
  var errorMessage by remember { mutableStateOf<String?>(null) }

  // Quick title suggestions for guards
  val quickTitleSuggestions = when (selectedType) {
    ReportType.INCIDENT -> listOf("Suspicious Person", "Perimeter Breach Alert", "Door Found Unlocked", "False Alarm")
    ReportType.PATROL_LOG -> listOf("Perimeter All Clear", "Hourly Post Check", "Gates & Locks Secured")
    ReportType.MAINTENANCE_HAZARD -> listOf("Water Leak", "Broken Door Lock", "Light / Bulb Out", "Tripping Hazard")
    ReportType.SHIFT_HANDOVER -> listOf("Shift Handover Complete", "Equipment Inspected & Signed", "All Posts Secure")
    else -> listOf("Routine Update", "Visitor Check")
  }

  val isDark = isAppInDarkTheme()
  Dialog(onDismissRequest = onDismiss) {
    Card(
      shape = RoundedCornerShape(20.dp),
      colors = CardDefaults.cardColors(
        containerColor = MaterialTheme.colorScheme.surface,
        contentColor = MaterialTheme.colorScheme.onSurface
      ),
      border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant),
      elevation = CardDefaults.cardElevation(0.dp),
      modifier = Modifier
        .fillMaxWidth()
        .wrapContentHeight()
    ) {
      Column(
        modifier = Modifier
          .padding(20.dp)
          .verticalScroll(rememberScrollState())
      ) {
        // Header
        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.SpaceBetween,
          verticalAlignment = Alignment.CenterVertically
        ) {
          Column {
            Text("New Report", fontFamily = FrauncesFontFamily, fontWeight = FontWeight.Bold, fontSize = 18.sp, color = MaterialTheme.colorScheme.onSurface)
            Text("File an occurrence on duty", fontFamily = InterFontFamily, fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
          }

          IconButton(onClick = onDismiss, modifier = Modifier.size(28.dp)) {
            Icon(Icons.Default.Close, contentDescription = "Close", tint = MaterialTheme.colorScheme.onSurfaceVariant)
          }
        }

        Spacer(modifier = Modifier.height(14.dp))
        HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)
        Spacer(modifier = Modifier.height(14.dp))

        // 1. Pick Report Category (4 large icons)
        Text("1. Select Type", fontFamily = InterFontFamily, fontWeight = FontWeight.Bold, fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurface)
        Spacer(modifier = Modifier.height(8.dp))

        Row(
          modifier = Modifier
            .fillMaxWidth()
            .horizontalScroll(rememberScrollState()),
          horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
          listOf(
            ReportType.INCIDENT to "🚨 Incident",
            ReportType.PATROL_LOG to "🚶 Patrol",
            ReportType.MAINTENANCE_HAZARD to "⚠️ Hazard",
            ReportType.SHIFT_HANDOVER to "📋 Handover"
          ).forEach { (type, label) ->
            val isSelected = selectedType == type
            FilterChip(
              selected = isSelected,
              onClick = { selectedType = type },
              label = {
                Text(
                  label,
                  fontFamily = InterFontFamily,
                  fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                  fontSize = 12.sp
                )
              },
              colors = FilterChipDefaults.filterChipColors(
                selectedContainerColor = MaterialTheme.colorScheme.primary,
                selectedLabelColor = MaterialTheme.colorScheme.onPrimary,
                containerColor = MaterialTheme.colorScheme.surfaceVariant,
                labelColor = MaterialTheme.colorScheme.onSurface
              ),
              border = FilterChipDefaults.filterChipBorder(
                enabled = true,
                selected = isSelected,
                borderColor = if (isSelected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.outlineVariant
              )
            )
          }
        }

        Spacer(modifier = Modifier.height(14.dp))

        // 2. What Happened? (Title + Quick Tap suggestions)
        Text("2. What Happened?", fontFamily = InterFontFamily, fontWeight = FontWeight.Bold, fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurface)
        Spacer(modifier = Modifier.height(6.dp))

        OutlinedTextField(
          value = title,
          onValueChange = { title = it },
          placeholder = { Text("Brief headline (e.g. Broken lock on Gate 2)", fontSize = 12.sp) },
          singleLine = true,
          shape = RoundedCornerShape(10.dp),
          colors = covenantTextFieldColors(),
          modifier = Modifier
            .fillMaxWidth()
            .testTag("report_title_input")
        )

        Spacer(modifier = Modifier.height(6.dp))

        // Quick suggestions
        Row(
          modifier = Modifier
            .fillMaxWidth()
            .horizontalScroll(rememberScrollState()),
          horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
          quickTitleSuggestions.forEach { suggestion ->
            SuggestionChip(
              onClick = { title = suggestion },
              label = { Text(suggestion, fontSize = 10.sp, fontFamily = InterFontFamily, color = MaterialTheme.colorScheme.onSurfaceVariant) },
              colors = SuggestionChipDefaults.suggestionChipColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
            )
          }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // 3. Location / Sector
        Text("3. Location", fontFamily = InterFontFamily, fontWeight = FontWeight.Bold, fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurface)
        Spacer(modifier = Modifier.height(6.dp))

        OutlinedTextField(
          value = location,
          onValueChange = { location = it },
          placeholder = { Text("Checkpoint or area (e.g. Gate 1, East Parking, Server Room)", fontSize = 12.sp) },
          singleLine = true,
          shape = RoundedCornerShape(10.dp),
          colors = covenantTextFieldColors(),
          modifier = Modifier
            .fillMaxWidth()
            .testTag("report_location_input")
        )

        Spacer(modifier = Modifier.height(12.dp))

        // 4. Notes / Details
        Text("4. Description & Action Taken", fontFamily = InterFontFamily, fontWeight = FontWeight.Bold, fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurface)
        Spacer(modifier = Modifier.height(6.dp))

        OutlinedTextField(
          value = description,
          onValueChange = { description = it },
          placeholder = { Text("Briefly explain what you saw and any action you took...", fontSize = 12.sp) },
          minLines = 3,
          maxLines = 5,
          shape = RoundedCornerShape(10.dp),
          colors = covenantTextFieldColors(),
          modifier = Modifier
            .fillMaxWidth()
            .testTag("report_description_input")
        )

        Spacer(modifier = Modifier.height(10.dp))

        // Urgent Checkbox toggle
        val dangerColor = if (isDark) StatusDangerDark else StatusDanger
        Row(
          verticalAlignment = Alignment.CenterVertically,
          modifier = Modifier.clickable { isUrgent = !isUrgent }
        ) {
          Checkbox(
            checked = isUrgent,
            onCheckedChange = { isUrgent = it },
            colors = CheckboxDefaults.colors(checkedColor = dangerColor)
          )
          Spacer(modifier = Modifier.width(4.dp))
          Text(
            text = "Mark as High Priority / Urgent Alert",
            fontFamily = InterFontFamily,
            fontSize = 12.sp,
            fontWeight = if (isUrgent) FontWeight.Bold else FontWeight.Normal,
            color = if (isUrgent) dangerColor else MaterialTheme.colorScheme.onSurface
          )
        }

        errorMessage?.let { err ->
          Spacer(modifier = Modifier.height(8.dp))
          Text(err, color = dangerColor, fontSize = 12.sp, fontFamily = InterFontFamily)
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Submit Button
        Button(
          onClick = {
            if (title.isBlank()) {
              errorMessage = "Please enter what happened."
              return@Button
            }
            if (location.isBlank()) {
              errorMessage = "Please enter the location/checkpoint."
              return@Button
            }
            val desc = if (description.isBlank()) title else description
            onSubmit(selectedType, isUrgent, title.trim(), desc.trim(), selectedSiteId, location.trim())
          },
          colors = covenantButtonColors(),
          shape = RoundedCornerShape(10.dp),
          modifier = Modifier
            .fillMaxWidth()
            .height(48.dp)
            .testTag("submit_report_button")
        ) {
          Icon(Icons.Default.Send, contentDescription = null, modifier = Modifier.size(16.dp))
          Spacer(modifier = Modifier.width(8.dp))
          Text("Submit Report", fontFamily = InterFontFamily, fontWeight = FontWeight.Bold, fontSize = 14.sp)
        }
      }
    }
  }
}

// -------------------------------------------------------------
// Dialog: Simple Report Detail & Resolution
// -------------------------------------------------------------
@Composable
private fun SimpleReportDetailDialog(
  report: SecurityReport,
  onDismiss: () -> Unit,
  onResolve: (String) -> Unit
) {
  var showResolveInput by remember { mutableStateOf(false) }
  var resolveNote by remember { mutableStateOf("") }
  val isResolved = report.status == ReportStatus.RESOLVED

  val isDark = isAppInDarkTheme()

  Dialog(onDismissRequest = onDismiss) {
    Card(
      shape = RoundedCornerShape(20.dp),
      colors = CardDefaults.cardColors(
        containerColor = MaterialTheme.colorScheme.surface,
        contentColor = MaterialTheme.colorScheme.onSurface
      ),
      border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant),
      elevation = CardDefaults.cardElevation(0.dp),
      modifier = Modifier
        .fillMaxWidth()
        .wrapContentHeight()
    ) {
      Column(
        modifier = Modifier
          .padding(20.dp)
          .verticalScroll(rememberScrollState())
      ) {
        // Header
        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.SpaceBetween,
          verticalAlignment = Alignment.CenterVertically
        ) {
          Column {
            Text(
              text = report.type.label,
              fontFamily = InterFontFamily,
              fontWeight = FontWeight.SemiBold,
              fontSize = 12.sp,
              color = MaterialTheme.colorScheme.primary
            )
            Text(
              text = report.reportNumber,
              fontFamily = IbmPlexMonoFontFamily,
              fontSize = 11.sp,
              color = MaterialTheme.colorScheme.onSurfaceVariant
            )
          }

          IconButton(onClick = onDismiss, modifier = Modifier.size(28.dp)) {
            Icon(Icons.Default.Close, contentDescription = "Close", tint = MaterialTheme.colorScheme.onSurfaceVariant)
          }
        }

        Spacer(modifier = Modifier.height(10.dp))
        HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)
        Spacer(modifier = Modifier.height(12.dp))

        // Title
        Text(
          text = report.title,
          fontFamily = FrauncesFontFamily,
          fontWeight = FontWeight.Bold,
          fontSize = 17.sp,
          color = MaterialTheme.colorScheme.onSurface
        )

        Spacer(modifier = Modifier.height(8.dp))

        // Metadata pill
        Row(
          modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(8.dp))
            .background(MaterialTheme.colorScheme.surfaceVariant)
            .padding(10.dp),
          horizontalArrangement = Arrangement.SpaceBetween,
          verticalAlignment = Alignment.CenterVertically
        ) {
          Column {
            Text("Location", fontFamily = InterFontFamily, fontSize = 10.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
            Text(
              "${report.siteName} (${report.locationSpecific})",
              fontFamily = InterFontFamily,
              fontWeight = FontWeight.SemiBold,
              fontSize = 11.sp,
              color = MaterialTheme.colorScheme.onSurface
            )
          }

          Column(horizontalAlignment = Alignment.End) {
            Text("Reported At", fontFamily = InterFontFamily, fontSize = 10.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
            Text(report.timestampFormatted, fontFamily = IbmPlexMonoFontFamily, fontSize = 10.sp, color = MaterialTheme.colorScheme.onSurface)
          }
        }

        Spacer(modifier = Modifier.height(14.dp))

        // Description
        Text("What Happened", fontFamily = InterFontFamily, fontWeight = FontWeight.Bold, fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
        Spacer(modifier = Modifier.height(4.dp))
        Text(
          text = report.description,
          fontFamily = InterFontFamily,
          fontSize = 13.sp,
          color = MaterialTheme.colorScheme.onSurface,
          lineHeight = 18.sp
        )

        if (report.actionTaken.isNotBlank()) {
          Spacer(modifier = Modifier.height(12.dp))
          Text("Action Taken", fontFamily = InterFontFamily, fontWeight = FontWeight.Bold, fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
          Spacer(modifier = Modifier.height(4.dp))
          Text(
            text = report.actionTaken,
            fontFamily = InterFontFamily,
            fontSize = 13.sp,
            color = MaterialTheme.colorScheme.onSurface,
            lineHeight = 18.sp
          )
        }

        if (isResolved && report.resolutionNotes != null) {
          val successTint = if (isDark) StatusSuccessDarkTint else StatusSuccessTint
          val successText = if (isDark) StatusSuccessDark else StatusSuccess
          Spacer(modifier = Modifier.height(12.dp))
          Box(
            modifier = Modifier
              .fillMaxWidth()
              .clip(RoundedCornerShape(8.dp))
              .background(successTint)
              .padding(10.dp)
          ) {
            Column {
              Text("✓ Resolved", fontFamily = InterFontFamily, fontWeight = FontWeight.Bold, fontSize = 11.sp, color = successText)
              Text(report.resolutionNotes, fontFamily = InterFontFamily, fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurface)
            }
          }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Resolve Button
        val successColor = if (isDark) StatusSuccessDark else StatusSuccess
        val successOnColor = if (isDark) Forest else White
        if (!isResolved) {
          if (!showResolveInput) {
            Button(
              onClick = { showResolveInput = true },
              colors = ButtonDefaults.buttonColors(containerColor = successColor, contentColor = successOnColor),
              shape = RoundedCornerShape(10.dp),
              modifier = Modifier
                .fillMaxWidth()
                .height(44.dp)
            ) {
              Icon(Icons.Default.CheckCircle, contentDescription = null, modifier = Modifier.size(16.dp))
              Spacer(modifier = Modifier.width(6.dp))
              Text("Mark as Resolved", fontFamily = InterFontFamily, fontWeight = FontWeight.Bold, fontSize = 13.sp)
            }
          } else {
            Column {
              OutlinedTextField(
                value = resolveNote,
                onValueChange = { resolveNote = it },
                placeholder = { Text("Quick note (e.g. Checked with supervisor, fixed)", fontSize = 12.sp) },
                singleLine = true,
                colors = covenantTextFieldColors(),
                modifier = Modifier.fillMaxWidth()
              )
              Spacer(modifier = Modifier.height(8.dp))
              Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Button(
                  onClick = {
                    onResolve(if (resolveNote.isBlank()) "Handled on duty" else resolveNote.trim())
                    showResolveInput = false
                  },
                  colors = ButtonDefaults.buttonColors(containerColor = successColor, contentColor = successOnColor),
                  shape = RoundedCornerShape(8.dp),
                  modifier = Modifier.weight(1f)
                ) {
                  Text("Confirm", fontSize = 12.sp)
                }
                TextButton(onClick = { showResolveInput = false }) {
                  Text("Cancel", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
              }
            }
          }
        } else {
          OutlinedButton(
            onClick = onDismiss,
            shape = RoundedCornerShape(10.dp),
            colors = covenantOutlinedButtonColors(),
            modifier = Modifier.fillMaxWidth()
          ) {
            Text("Done", fontFamily = InterFontFamily, fontSize = 13.sp)
          }
        }
      }
    }
  }
}
