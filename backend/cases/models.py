import uuid

from django.conf import settings
from django.db import models


class CaseType(models.TextChoices):
    COMPLAINT = 'COMPLAINT', 'Complaint'
    COMPLIMENT = 'COMPLIMENT', 'Compliment'
    SUGGESTION = 'SUGGESTION', 'Suggestion'
    GENERAL_FEEDBACK = 'GENERAL_FEEDBACK', 'General feedback'


class CaseCategory(models.TextChoices):
    GUARD_CONDUCT = 'GUARD_CONDUCT', 'Guard conduct'
    ABSENCE_OR_LATENESS = 'ABSENCE_OR_LATENESS', 'Absence or lateness'
    SLEEPING_ON_DUTY = 'SLEEPING_ON_DUTY', 'Sleeping on duty'
    UNIFORM = 'UNIFORM', 'Uniform or appearance'
    INCIDENT_HANDLING = 'INCIDENT_HANDLING', 'Incident handling'
    BILLING = 'BILLING', 'Billing'
    OTHER = 'OTHER', 'Other'


class CaseSeverity(models.TextChoices):
    CRITICAL = 'CRITICAL', 'Critical'
    HIGH = 'HIGH', 'High'
    NORMAL = 'NORMAL', 'Normal'
    LOW = 'LOW', 'Low'


class CaseStatus(models.TextChoices):
    SUBMITTED = 'SUBMITTED', 'Submitted'
    ASSIGNED = 'ASSIGNED', 'Assigned'
    INVESTIGATING = 'INVESTIGATING', 'Investigating'
    RESOLVED = 'RESOLVED', 'Resolved'
    CLOSED = 'CLOSED', 'Closed'
    REOPENED = 'REOPENED', 'Reopened'


class ServiceCase(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    reference_no = models.CharField(max_length=32, unique=True)
    case_type = models.CharField(max_length=30, choices=CaseType.choices)
    category = models.CharField(max_length=30, choices=CaseCategory.choices)
    severity = models.CharField(max_length=20, choices=CaseSeverity.choices, default=CaseSeverity.NORMAL)
    client = models.ForeignKey('clients.Client', on_delete=models.SET_NULL, null=True, blank=True, related_name='cases')
    site = models.ForeignKey('sites.Site', on_delete=models.SET_NULL, null=True, blank=True, related_name='cases')
    employee = models.ForeignKey('employees.Employee', on_delete=models.SET_NULL, null=True, blank=True, related_name='cases')
    submitted_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='submitted_cases')
    contact_name = models.CharField(max_length=255)
    contact_phone = models.CharField(max_length=30)
    contact_email = models.EmailField(null=True, blank=True)
    incident_at = models.DateTimeField(null=True, blank=True)
    description = models.TextField()
    rating = models.PositiveSmallIntegerField(null=True, blank=True)
    status = models.CharField(max_length=24, choices=CaseStatus.choices, default=CaseStatus.SUBMITTED)
    assigned_to = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_cases')
    due_at = models.DateTimeField(null=True, blank=True)
    first_response_at = models.DateTimeField(null=True, blank=True)
    resolution = models.TextField(blank=True, default='')
    resolved_at = models.DateTimeField(null=True, blank=True)
    closed_at = models.DateTimeField(null=True, blank=True)
    verification_code_hash = models.CharField(max_length=128)
    verification_code_salt = models.CharField(max_length=64)
    failed_verification_attempts = models.IntegerField(default=0)
    is_locked_out = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'cases'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.reference_no} - {self.case_type}'


class CaseMessage(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    case = models.ForeignKey(ServiceCase, on_delete=models.CASCADE, related_name='messages')
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='case_messages')
    message = models.TextField()
    internal = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'case_messages'
        ordering = ['created_at']


class CaseStatusHistory(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    case = models.ForeignKey(ServiceCase, on_delete=models.CASCADE, related_name='status_history')
    from_status = models.CharField(max_length=24, null=True, blank=True)
    to_status = models.CharField(max_length=24)
    actor = models.CharField(max_length=120, default='system')
    reason = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'case_status_history'
        ordering = ['created_at']


class CaseAttachment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    case = models.ForeignKey(ServiceCase, on_delete=models.CASCADE, related_name='attachments')
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='uploaded_case_files')
    storage_key = models.CharField(max_length=255)
    original_filename = models.CharField(max_length=255)
    mime_type = models.CharField(max_length=80)
    file_size = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'case_attachments'
