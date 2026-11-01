import uuid

from django.conf import settings
from django.db import models


class Site(models.Model):
    class SiteStatus(models.TextChoices):
        ACTIVE = 'ACTIVE', 'Active'
        INACTIVE = 'INACTIVE', 'Inactive'
        ARCHIVED = 'ARCHIVED', 'Archived'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    client = models.ForeignKey('clients.Client', on_delete=models.CASCADE, related_name='sites')
    name = models.CharField(max_length=255)
    address = models.CharField(max_length=255)
    city = models.CharField(max_length=120)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    geofence_radius_m = models.PositiveIntegerField(default=100)
    qr_code_token_hash = models.CharField(max_length=128, blank=True, default='')
    supervisor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='supervised_sites')
    status = models.CharField(max_length=20, choices=SiteStatus.choices, default=SiteStatus.ACTIVE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'sites'
        ordering = ['-created_at']

    def __str__(self):
        return self.name
