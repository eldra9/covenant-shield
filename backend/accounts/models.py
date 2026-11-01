from __future__ import annotations

import uuid

from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models


class UserRole(models.TextChoices):
    VISITOR = 'VISITOR', 'Visitor'
    CLIENT = 'CLIENT', 'Client'
    GUARD = 'GUARD', 'Guard'
    SUPERVISOR = 'SUPERVISOR', 'Supervisor'
    OPERATIONS = 'OPERATIONS', 'Operations Staff'
    SUPER_ADMIN = 'SUPER_ADMIN', 'Super Admin'


class UserStatus(models.TextChoices):
    ACTIVE = 'ACTIVE', 'Active'
    INACTIVE = 'INACTIVE', 'Inactive'
    LOCKED = 'LOCKED', 'Locked'
    PENDING = 'PENDING', 'Pending'


class UserManager(BaseUserManager):
    use_in_migrations = True

    def _create_user(self, email: str, password: str | None, **extra_fields):
        if not email:
            raise ValueError('Users must have an email address.')

        email = self.normalize_email(email)
        extra_fields.setdefault('username', email)

        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email: str, password: str | None = None, **extra_fields):
        extra_fields.setdefault('is_staff', False)
        extra_fields.setdefault('is_superuser', False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email: str, password: str | None = None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', UserRole.SUPER_ADMIN)
        extra_fields.setdefault('status', UserStatus.ACTIVE)
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        return self._create_user(email, password, **extra_fields)


class User(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    username = models.CharField(max_length=150, unique=True, blank=True, null=True)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=30, blank=True, default='')
    name = models.CharField(max_length=255, blank=True, default='')
    job_title = models.CharField(max_length=120, blank=True, default='Authorized Client Representative')
    direct_phone = models.CharField(max_length=30, blank=True, default='')
    alert_phone = models.CharField(max_length=30, blank=True, default='')
    preferred_channel = models.CharField(max_length=20, default='Both')
    role = models.CharField(max_length=30, choices=UserRole.choices, default=UserRole.VISITOR)
    status = models.CharField(max_length=20, choices=UserStatus.choices, default=UserStatus.ACTIVE)
    must_change_password = models.BooleanField(default=False)
    failed_login_attempts = models.IntegerField(default=0)
    locked_until = models.DateTimeField(null=True, blank=True)
    last_login_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'name']

    objects = UserManager()

    class Meta:
        db_table = 'users'
        ordering = ['-created_at']

    def __str__(self) -> str:
        return self.name or self.email
