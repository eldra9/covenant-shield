import uuid

from django.conf import settings
from django.db import models


class Employee(models.Model):
    class EmployeeStatus(models.TextChoices):
        ACTIVE = 'ACTIVE', 'Active'
        INACTIVE = 'INACTIVE', 'Inactive'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='employee_profile')
    employee_no = models.CharField(max_length=32, unique=True)
    phone = models.CharField(max_length=30, blank=True, default='')
    photo = models.URLField(blank=True, default='')
    hire_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=EmployeeStatus.choices, default=EmployeeStatus.ACTIVE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'employees'
        ordering = ['employee_no']

    def __str__(self):
        return f'{self.employee_no} - {self.user.email}'


class EmployeeSiteAssignment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='site_assignments')
    site = models.ForeignKey('sites.Site', on_delete=models.CASCADE, related_name='employee_assignments')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'employee_site_assignments'
        unique_together = ('employee', 'site')
