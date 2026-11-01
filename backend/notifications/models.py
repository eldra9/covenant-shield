import uuid

from django.db import models


class PortalNotification(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    client = models.ForeignKey('clients.Client', on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=255)
    message = models.TextField()
    category = models.CharField(max_length=30, default='request')
    reference_id = models.CharField(max_length=100, blank=True, default='')
    read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'portal_notifications'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.title} ({self.client.organization_name})'
