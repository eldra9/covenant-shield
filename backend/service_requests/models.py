import uuid

from django.conf import settings
from django.db import models


class ServiceRequest(models.Model):
    class ServiceType(models.TextChoices):
        STATIC_GUARDING = 'STATIC_GUARDING', 'Static Guarding'
        PATROL_SERVICES = 'PATROL_SERVICES', 'Patrol Services'
        VIP_ESCORT = 'VIP_ESCORT', 'VIP Escort'
        EVENT_SECURITY = 'EVENT_SECURITY', 'Event Security'
        CCTV_MONITORING = 'CCTV_MONITORING', 'CCTV Monitoring'

    class Coverage(models.TextChoices):
        DAY = 'DAY', 'Day'
        NIGHT = 'NIGHT', 'Night'
        TWENTY_FOUR_HOUR = 'TWENTY_FOUR_HOUR', '24 Hour'

    class ArmedStatus(models.TextChoices):
        ARMED = 'ARMED', 'Armed'
        UNARMED = 'UNARMED', 'Unarmed'
        ARMED_IF_PERMITTED = 'ARMED_IF_PERMITTED', 'Armed if permitted'

    class RequestStatus(models.TextChoices):
        NEW = 'NEW', 'New'
        UNDER_REVIEW = 'UNDER_REVIEW', 'Under review'
        SITE_ASSESSMENT_SCHEDULED = 'SITE_ASSESSMENT_SCHEDULED', 'Site assessment scheduled'
        QUOTATION_SENT = 'QUOTATION_SENT', 'Quotation sent'
        ACCEPTED = 'ACCEPTED', 'Accepted'
        CONTRACT_ACTIVE = 'CONTRACT_ACTIVE', 'Contract active'
        REJECTED = 'REJECTED', 'Rejected'
        CANCELLED = 'CANCELLED', 'Cancelled'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    client = models.ForeignKey('clients.Client', on_delete=models.SET_NULL, null=True, blank=True, related_name='service_requests')
    reference_no = models.CharField(max_length=32, unique=True)
    requester_user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='service_requests')
    full_name = models.CharField(max_length=255)
    organization_name = models.CharField(max_length=255, null=True, blank=True)
    phone = models.CharField(max_length=30)
    email = models.EmailField(null=True, blank=True)
    service_type = models.CharField(max_length=40, choices=ServiceType.choices)
    site_address = models.CharField(max_length=255)
    city = models.CharField(max_length=120)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    guards_needed = models.PositiveIntegerField()
    shift_coverage = models.CharField(max_length=30, choices=Coverage.choices)
    armed_status = models.CharField(max_length=28, choices=ArmedStatus.choices)
    start_date = models.DateField()
    duration = models.CharField(max_length=80)
    additional_details = models.TextField(blank=True, default='')
    preferred_contact_method = models.CharField(max_length=20, default='EMAIL')
    status = models.CharField(max_length=40, choices=RequestStatus.choices, default=RequestStatus.NEW)
    assigned_to = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_service_requests')
    assigned_guards_json = models.TextField(blank=True, default='[]')
    verification_code_hash = models.CharField(max_length=128)
    verification_code_salt = models.CharField(max_length=64)
    failed_verification_attempts = models.IntegerField(default=0)
    is_locked_out = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'service_requests'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.reference_no} - {self.full_name}'


class ServiceRequestStatusHistory(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    service_request = models.ForeignKey(ServiceRequest, on_delete=models.CASCADE, related_name='status_history')
    from_status = models.CharField(max_length=40, null=True, blank=True)
    to_status = models.CharField(max_length=40)
    actor = models.CharField(max_length=120, default='system')
    reason = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'service_request_status_history'
        ordering = ['created_at']


class ServiceRequestNote(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    service_request = models.ForeignKey(ServiceRequest, on_delete=models.CASCADE, related_name='notes')
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='service_request_notes')
    note = models.TextField()
    internal = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'service_request_notes'
        ordering = ['created_at']


class ServiceRequestQuotation(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    service_request = models.ForeignKey(ServiceRequest, on_delete=models.CASCADE, related_name='quotations')
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='uploaded_quotations')
    file_name = models.CharField(max_length=255)
    storage_key = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'service_request_quotations'
