package com.example.data.model

data class Site(
  val id: String,
  val name: String,
  val clientName: String,
  val address: String,
  val latitude: Double,
  val longitude: Double,
  val geofenceRadiusMeters: Double = 100.0,
  val qrCodeToken: String,
  val contactPhone: String = "+251-11-662-8000",
  val instructions: String = "Perform perimeter walk every 2 hours. Keep entry log updated."
)
