package com.example.util

import kotlin.math.*

object GeofenceUtils {
  private const val EARTH_RADIUS_METERS = 6371000.0

  /**
   * Calculates geodesic distance between two points using the Haversine formula.
   */
  fun calculateDistanceMeters(
    lat1: Double,
    lon1: Double,
    lat2: Double,
    lon2: Double
  ): Double {
    val dLat = Math.toRadians(lat2 - lat1)
    val dLon = Math.toRadians(lon2 - lon1)
    val rLat1 = Math.toRadians(lat1)
    val rLat2 = Math.toRadians(lat2)

    val a = sin(dLat / 2).pow(2) + cos(rLat1) * cos(rLat2) * sin(dLon / 2).pow(2)
    val c = 2 * atan2(sqrt(a), sqrt(1 - a))
    return EARTH_RADIUS_METERS * c
  }

  sealed class GeofenceValidationResult {
    data class Success(val distanceMeters: Double, val accuracyMeters: Double) : GeofenceValidationResult()
    data class OutsideGeofence(val distanceMeters: Double, val radiusMeters: Double) : GeofenceValidationResult()
    data class InsufficientAccuracy(val accuracyMeters: Double, val maxAllowedAccuracyMeters: Double = 50.0) : GeofenceValidationResult()
  }

  /**
   * Authoritative validation comparing coordinates against site radius and required accuracy.
   */
  fun validateGeofence(
    guardLat: Double,
    guardLng: Double,
    guardAccuracyMeters: Double,
    siteLat: Double,
    siteLng: Double,
    siteRadiusMeters: Double = 100.0,
    requiredAccuracyMeters: Double = 50.0
  ): GeofenceValidationResult {
    if (guardAccuracyMeters > requiredAccuracyMeters) {
      return GeofenceValidationResult.InsufficientAccuracy(guardAccuracyMeters, requiredAccuracyMeters)
    }

    val distance = calculateDistanceMeters(guardLat, guardLng, siteLat, siteLng)
    return if (distance <= siteRadiusMeters) {
      GeofenceValidationResult.Success(distance, guardAccuracyMeters)
    } else {
      GeofenceValidationResult.OutsideGeofence(distance, siteRadiusMeters)
    }
  }
}
