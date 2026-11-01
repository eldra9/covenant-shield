package com.example

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import com.example.ui.navigation.AppNavigation
import com.example.ui.theme.MyApplicationTheme
import com.example.ui.viewmodel.GuardViewModel

class MainActivity : ComponentActivity() {
  private val viewModel: GuardViewModel by viewModels()

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    enableEdgeToEdge()
    setContent {
      val isSystemDark = androidx.compose.foundation.isSystemInDarkTheme()
      androidx.compose.runtime.LaunchedEffect(isSystemDark) {
        viewModel.initSystemDarkTheme(isSystemDark)
      }
      val isDarkMode by viewModel.isDarkMode.collectAsState()
      MyApplicationTheme(darkTheme = isDarkMode) {
        Surface(
          modifier = Modifier.fillMaxSize(),
          color = androidx.compose.material3.MaterialTheme.colorScheme.background
        ) {
          AppNavigation(viewModel = viewModel)
        }
      }
    }
  }
}
