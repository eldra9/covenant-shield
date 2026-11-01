import uuid

from django.conf import settings
from django.db import models


class GuardShift(models.Model):
    class Status(models.TextChoices):
        CONFIRMED = 'CONFIRMED', 'Confirmed'
        CANCELLED = 'CANCELLED', 'Cancelled'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    employee = models.ForeignKey('employees.Employee', on_delete=models.CASCADE, related_name='guard_shifts')
    site = models.ForeignKey('sites.Site', on_delete=models.PROTECT, related_name='guard_shifts')
    starts_at = models.DateTimeField()
    ends_at = models.DateTimeField()
    instructions = models.TextField(blank=True, default='')
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.CONFIRMED)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'guard_shifts'
        ordering = ['starts_at']
        indexes = [models.Index(fields=['employee', 'starts_at'])]


class GuardLeaveRequest(models.Model):
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        APPROVED = 'APPROVED', 'Approved'
        REJECTED = 'REJECTED', 'Rejected'
        CANCELLED = 'CANCELLED', 'Cancelled'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    employee = models.ForeignKey('employees.Employee', on_delete=models.CASCADE, related_name='guard_leave_requests')
    leave_type = models.CharField(max_length=30)
    start_date = models.DateField()
    end_date = models.DateField()
    reason = models.TextField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    supervisor_comment = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'guard_leave_requests'
        ordering = ['-created_at']


class GuardShiftSwapRequest(models.Model):
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        APPROVED = 'APPROVED', 'Approved'
        REJECTED = 'REJECTED', 'Rejected'
        CANCELLED = 'CANCELLED', 'Cancelled'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    requester = models.ForeignKey('employees.Employee', on_delete=models.CASCADE, related_name='swap_requests')
    target = models.ForeignKey('employees.Employee', on_delete=models.PROTECT, related_name='targeted_swap_requests')
    shift = models.ForeignKey(GuardShift, on_delete=models.PROTECT, related_name='swap_requests')
    reason = models.TextField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    supervisor_comment = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'guard_shift_swap_requests'
        ordering = ['-created_at']
        constraints = [
            models.UniqueConstraint(
                fields=['requester', 'shift'],
                condition=models.Q(status='PENDING'),
                name='unique_pending_guard_shift_swap',
            ),
        ]


class GuardSecurityReport(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    report_number = models.CharField(max_length=32, unique=True)
    employee = models.ForeignKey('employees.Employee', on_delete=models.CASCADE, related_name='security_reports')
    site = models.ForeignKey('sites.Site', on_delete=models.PROTECT, related_name='security_reports')
    category = models.CharField(max_length=40)
    severity = models.CharField(max_length=20)
    title = models.CharField(max_length=255)
    description = models.TextField()
    location = models.CharField(max_length=255, blank=True, default='')
    action_taken = models.TextField(blank=True, default='')
    witness = models.CharField(max_length=255, blank=True, default='')
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    status = models.CharField(max_length=24, default='SUBMITTED')
    resolution_notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'guard_security_reports'
        ordering = ['-created_at']


class GuardNotification(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    employee = models.ForeignKey('employees.Employee', on_delete=models.CASCADE, related_name='guard_notifications')
    title = models.CharField(max_length=255)
    message = models.TextField()
    category = models.CharField(max_length=40, default='INFO')
    reference_id = models.CharField(max_length=100, blank=True, default='')
    read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'guard_notifications'
        ordering = ['-created_at']
