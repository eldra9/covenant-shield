package com.example.ui.screens

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.R
import com.example.ui.components.GuillocheSeal
import com.example.ui.theme.*
import com.example.ui.viewmodel.GuardViewModel

@Composable
fun LoginScreen(
  viewModel: GuardViewModel,
  onLoginSuccess: () -> Unit
) {
  val loginState by viewModel.loginState.collectAsState()
  var passwordVisible by remember { mutableStateOf(false) }

  Box(
    modifier = Modifier
      .fillMaxSize()
      .background(if (isAppInDarkTheme()) MaterialTheme.colorScheme.background else Forest)
  ) {
    // Watermark Guilloche seal in background
    Box(
      modifier = Modifier
        .align(Alignment.TopCenter)
        .padding(top = 16.dp)
    ) {
      GuillocheSeal(size = 180.dp, strokeColor = Gold.copy(alpha = 0.12f), showInnerShield = true)
    }

    Column(
      modifier = Modifier
        .fillMaxSize()
        .verticalScroll(rememberScrollState())
        .padding(horizontal = 24.dp, vertical = 32.dp),
      horizontalAlignment = Alignment.CenterHorizontally,
      verticalArrangement = Arrangement.Center
    ) {
      // Official Security Shield Logo (Uploaded Lion Crest)
      Box(
        contentAlignment = Alignment.Center,
        modifier = Modifier
          .size(92.dp)
          .clip(CircleShape)
          .border(2.dp, Gold, CircleShape)
          .background(if (isAppInDarkTheme()) MaterialTheme.colorScheme.surface else Forest)
      ) {
        Image(
          painter = painterResource(id = R.drawable.app_logo),
          contentDescription = "Covenant Shield Official Logo",
          contentScale = ContentScale.Crop,
          modifier = Modifier
            .fillMaxSize()
            .clip(CircleShape)
        )
      }

      Spacer(modifier = Modifier.height(16.dp))

      Text(
        text = "COVENANT SHIELD",
        fontFamily = FrauncesFontFamily,
        color = White,
        fontSize = 24.sp,
        fontWeight = FontWeight.Bold,
        letterSpacing = 1.5.sp
      )

      Text(
        text = "ON POST · GUARD OPERATIONS",
        fontFamily = IbmPlexMonoFontFamily,
        color = Gold300,
        fontSize = 11.sp,
        fontWeight = FontWeight.Medium,
        letterSpacing = 2.sp
      )

      Spacer(modifier = Modifier.height(4.dp))

      Text(
        text = "Field Attendance & Post Verification Terminal\nStrict Server Timestamps · Low-Bandwidth Optimized",
        fontFamily = InterFontFamily,
        color = Mist.copy(alpha = 0.75f),
        fontSize = 12.sp,
        textAlign = TextAlign.Center,
        lineHeight = 17.sp
      )

      Spacer(modifier = Modifier.height(26.dp))

      // Main Login Card
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
          modifier = Modifier
            .fillMaxWidth()
            .padding(22.dp),
          horizontalAlignment = Alignment.CenterHorizontally
        ) {
          Text(
            text = "Guard Sign In",
            fontFamily = FrauncesFontFamily,
            style = MaterialTheme.typography.titleLarge,
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.onSurface
          )
          Text(
            text = "Enter your official Guard credentials issued by Operations Staff, Station Supervisor, or Super Admin.",
            fontFamily = InterFontFamily,
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            textAlign = TextAlign.Center,
            modifier = Modifier.padding(top = 6.dp, bottom = 18.dp)
          )

          // Error Banner
          loginState.errorMessage?.let { errorMsg ->
            Card(
              shape = RoundedCornerShape(10.dp),
              colors = CardDefaults.cardColors(
                containerColor = if (isAppInDarkTheme()) StatusDangerDarkTint else StatusDangerTint
              ),
              border = androidx.compose.foundation.BorderStroke(1.dp, if (isAppInDarkTheme()) StatusDangerDark else StatusDanger.copy(alpha = 0.3f)),
              modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 16.dp)
            ) {
              Row(
                modifier = Modifier.padding(12.dp),
                verticalAlignment = Alignment.CenterVertically
              ) {
                Icon(
                  imageVector = Icons.Default.ErrorOutline,
                  contentDescription = "Error",
                  tint = if (isAppInDarkTheme()) StatusDangerDark else StatusDanger,
                  modifier = Modifier.size(20.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                  text = errorMsg,
                  color = if (isAppInDarkTheme()) StatusDangerDark else StatusDanger,
                  fontFamily = InterFontFamily,
                  fontSize = 12.sp,
                  lineHeight = 16.sp
                )
              }
            }
          }

          // Guard Username or Employee ID Field
          OutlinedTextField(
            value = loginState.employeeId,
            onValueChange = { viewModel.onEmployeeIdChanged(it) },
            label = { Text("Guard Username or Employee ID", fontFamily = InterFontFamily) },
            placeholder = { Text("e.g. dawit, abebe, or EMP-1042", fontFamily = InterFontFamily) },
            leadingIcon = {
              Icon(Icons.Default.Badge, contentDescription = "Guard ID", tint = if (isAppInDarkTheme()) Gold else Emerald)
            },
            singleLine = true,
            colors = covenantTextFieldColors(),
            keyboardOptions = KeyboardOptions(
              keyboardType = KeyboardType.Text,
              imeAction = ImeAction.Next
            ),
            modifier = Modifier
              .fillMaxWidth()
              .testTag("employee_id_input")
          )

          Spacer(modifier = Modifier.height(14.dp))

          // Password Field
          OutlinedTextField(
            value = loginState.pin,
            onValueChange = { viewModel.onPinChanged(it) },
            label = { Text("Password or Security PIN", fontFamily = InterFontFamily) },
            placeholder = { Text("Enter password", fontFamily = InterFontFamily) },
            leadingIcon = {
              Icon(Icons.Default.Lock, contentDescription = "Password", tint = if (isAppInDarkTheme()) Gold else Emerald)
            },
            trailingIcon = {
              IconButton(onClick = { passwordVisible = !passwordVisible }) {
                Icon(
                  imageVector = if (passwordVisible) Icons.Default.Visibility else Icons.Default.VisibilityOff,
                  contentDescription = if (passwordVisible) "Hide password" else "Show password",
                  tint = MaterialTheme.colorScheme.onSurfaceVariant
                )
              }
            },
            singleLine = true,
            visualTransformation = if (passwordVisible) VisualTransformation.None else PasswordVisualTransformation(),
            colors = covenantTextFieldColors(),
            keyboardOptions = KeyboardOptions(
              keyboardType = KeyboardType.Password,
              imeAction = ImeAction.Done
            ),
            keyboardActions = KeyboardActions(
              onDone = { viewModel.performLogin(onLoginSuccess) }
            ),
            modifier = Modifier
              .fillMaxWidth()
              .testTag("password_input")
          )

          Spacer(modifier = Modifier.height(20.dp))

          // Sign In Button
          Button(
            onClick = { viewModel.performLogin(onLoginSuccess) },
            enabled = !loginState.isLoading && loginState.lockoutMinutes == null,
            shape = RoundedCornerShape(12.dp),
            colors = covenantButtonColors(),
            modifier = Modifier
              .fillMaxWidth()
              .height(50.dp)
              .testTag("login_button")
          ) {
            if (loginState.isLoading) {
              CircularProgressIndicator(
                color = Gold,
                modifier = Modifier.size(24.dp),
                strokeWidth = 2.dp
              )
            } else {
              Icon(Icons.Default.Login, contentDescription = null, tint = if (isAppInDarkTheme()) Forest else Gold)
              Spacer(modifier = Modifier.width(8.dp))
              Text(
                text = "SIGN IN TO GUARD APP",
                fontFamily = InterFontFamily,
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = 1.sp,
                color = if (isAppInDarkTheme()) Forest else White
              )
            }
          }
        }
      }

      Spacer(modifier = Modifier.height(20.dp))

      Text(
        text = "Operations Dispatch Hotline: +251-11-662-8000\nLockout policy: 5 consecutive invalid attempts triggers a 15-minute lock.",
        fontFamily = InterFontFamily,
        color = if (isAppInDarkTheme()) MaterialTheme.colorScheme.onSurfaceVariant else Mist.copy(alpha = 0.65f),
        fontSize = 11.sp,
        textAlign = TextAlign.Center,
        lineHeight = 16.sp
      )
    }
  }
}
