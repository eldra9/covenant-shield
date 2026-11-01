import uuid

from django.conf import settings
from django.db import models


class AttendanceRecord(models.Model):
    class Method(models.TextChoices):
        GPS = 'GPS', 'GPS'
        QR = 'QR', 'QR'
        MANUAL = 'MANUAL', 'Manual'

    class Status(models.TextChoices):
        SCHEDULED = 'SCHEDULED', 'Scheduled'
        PRESENT = 'PRESENT', 'Present'
        LATE = 'LATE', 'Late'
        ABSENT = 'ABSENT', 'Absent'
        ON_LEAVE = 'ON_LEAVE', 'On leave'
        MANUAL_PENDING = 'MANUAL_PENDING', 'Manual pending review'
        LEFT_EARLY = 'LEFT_EARLY', 'Left early'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    employee = models.ForeignKey('employees.Employee', on_delete=models.CASCADE, related_name='attendance_records')
    shift_reference = models.CharField(max_length=120, blank=True, default='')
    check_in_at = models.DateTimeField(null=True, blank=True)
    check_in_lat = models.FloatField(null=True, blank=True)
    check_in_lng = models.FloatField(null=True, blank=True)
    check_out_at = models.DateTimeField(null=True, blank=True)
    check_out_lat = models.FloatField(null=True, blank=True)
    check_out_lng = models.FloatField(null=True, blank=True)
    method = models.CharField(max_length=20, choices=Method.choices, default=Method.GPS)
    status = models.CharField(max_length=24, choices=Status.choices, default=Status.SCHEDULED)
    flagged = models.BooleanField(default=False)
    flag_reason = models.CharField(max_length=200, blank=True, default='')
    approved_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_attendance_records')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'attendance_records'
        ordering = ['-check_in_at']


class AttendanceAttempt(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    employee = models.ForeignKey('employees.Employee', on_delete=models.CASCADE, related_name='attendance_attempts')
    shift_reference = models.CharField(max_length=120, blank=True, default='')
    submitted_at = models.DateTimeField(auto_now_add=True)
    submitted_lat = models.FloatField(null=True, blank=True)
    submitted_lng = models.FloatField(null=True, blank=True)
    server_distance_m = models.FloatField(null=True, blank=True)
    gps_accuracy_m = models.FloatField(null=True, blank=True)
    qr_valid = models.BooleanField(default=False)
    accepted = models.BooleanField(default=False)
    rejection_reason = models.CharField(max_length=200, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'attendance_attempts'
        ordering = ['-submitted_at']
