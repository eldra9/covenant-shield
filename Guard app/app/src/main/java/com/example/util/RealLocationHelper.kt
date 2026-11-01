package com.example.util

import android.Manifest
import android.annotation.SuppressLint
import android.content.Context
import android.content.pm.PackageManager
import android.location.Location
import android.location.LocationManager
import androidx.core.content.ContextCompat
import com.google.android.gms.location.LocationServices
import com.google.android.gms.location.Priority
import com.google.android.gms.tasks.CancellationTokenSource
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlin.coroutines.resume

data class DeviceLocation(
  val latitude: Double,
  val longitude: Double,
  val accuracyMeters: Double,
  val isRealGps: Boolean = true
)

object RealLocationHelper {

  fun hasLocationPermission(context: Context): Boolean {
    val fine = ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED
    val coarse = ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED
    return fine || coarse
  }

  @SuppressLint("MissingPermission")
  suspend fun getCurrentLocation(context: Context): DeviceLocation? {
    if (!hasLocationPermission(context)) return null

    try {
      // 1. Try Google Play Services FusedLocationProviderClient first
      val fusedClient = LocationServices.getFusedLocationProviderClient(context)
      val cts = CancellationTokenSource()

      val location: Location? = suspendCancellableCoroutine { cont ->
        fusedClient.getCurrentLocation(Priority.PRIORITY_HIGH_ACCURACY, cts.token)
          .addOnSuccessListener { loc ->
            if (loc != null) {
              cont.resume(loc)
            } else {
              // Try last location
              fusedClient.lastLocation.addOnSuccessListener { lastLoc ->
                cont.resume(lastLoc)
              }.addOnFailureListener {
                cont.resume(null)
              }
            }
          }
          .addOnFailureListener {
            cont.resume(null)
          }
      }

      if (location != null) {
        return DeviceLocation(
          latitude = location.latitude,
          longitude = location.longitude,
          accuracyMeters = if (location.hasAccuracy()) location.accuracy.toDouble() else 15.0,
          isRealGps = true
        )
      }
    } catch (_: Exception) {
      // Fallback to system LocationManager
    }

    try {
      // 2. Fallback to system LocationManager
      val locationManager = context.getSystemService(Context.LOCATION_SERVICE) as? LocationManager
      if (locationManager != null) {
        val gpsLoc = locationManager.getLastKnownLocation(LocationManager.GPS_PROVIDER)
        val networkLoc = locationManager.getLastKnownLocation(LocationManager.NETWORK_PROVIDER)
        val best = gpsLoc ?: networkLoc
        if (best != null) {
          return DeviceLocation(
            latitude = best.latitude,
            longitude = best.longitude,
            accuracyMeters = if (best.hasAccuracy()) best.accuracy.toDouble() else 20.0,
            isRealGps = true
          )
        }
      }
    } catch (_: Exception) {
    }

    return null
  }
}
