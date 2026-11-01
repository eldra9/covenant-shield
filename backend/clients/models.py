import uuid

from django.conf import settings
from django.db import models
from django.utils import timezone


class Client(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization_name = models.CharField(max_length=255, blank=True, default='')
    legal_name = models.CharField(max_length=255, blank=True, default='')
    kra_pin = models.CharField(max_length=64, blank=True, default='Pending verification')
    registration_number = models.CharField(max_length=64, blank=True, default='Pending registration')
    industry = models.CharField(max_length=120, blank=True, default='Commercial & Private Security Portfolio')
    contract_tier = models.CharField(max_length=60, default='Standard Managed')
    account_status = models.CharField(max_length=30, default='Active')
    primary_phone = models.CharField(max_length=30, blank=True, default='+254 700 000 000')
    emergency_escalation_line = models.CharField(max_length=60, default='+254 711 002 911 (24/7 Control Room)')
    operations_manager_name = models.CharField(max_length=120, default='Covenant Shield Support Desk')
    operations_manager_phone = models.CharField(max_length=30, default='+254 711 002 911')
    operations_manager_email = models.CharField(max_length=120, default='support@covenantshield.co.ke')
    contact_user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='client_accounts')
    address = models.TextField(blank=True, default='')
    contract_start_date = models.DateTimeField(default=timezone.now)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'clients'
        ordering = ['-created_at']

    def __str__(self):
        return self.organization_name or 'Individual Client'
