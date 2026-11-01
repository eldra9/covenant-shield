from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from clients.models import Client
from .models import User


class UserSerializer(serializers.ModelSerializer):
    client_id = serializers.SerializerMethodField()
    organization_name = serializers.SerializerMethodField()
    fullName = serializers.CharField(source='name', read_only=True)
    directPhone = serializers.CharField(source='direct_phone', required=False)
    alertPhone = serializers.CharField(source='alert_phone', required=False)
    jobTitle = serializers.CharField(source='job_title', required=False)
    preferredChannel = serializers.CharField(source='preferred_channel', required=False)
    mustChangePassword = serializers.BooleanField(source='must_change_password', read_only=True)

    class Meta:
        model = User
        fields = (
            'id', 'username', 'name', 'fullName', 'email', 'phone', 'role', 'status',
            'must_change_password', 'mustChangePassword',
            'last_login_at', 'created_at', 'updated_at', 'client_id',
            'organization_name', 'job_title', 'jobTitle',
            'direct_phone', 'directPhone', 'alert_phone', 'alertPhone',
            'preferred_channel', 'preferredChannel'
        )
        read_only_fields = ('id', 'role', 'status', 'must_change_password', 'mustChangePassword', 'last_login_at', 'created_at', 'updated_at', 'client_id', 'organization_name', 'fullName')

    def get_client_id(self, obj):
        client = obj.client_accounts.order_by('-created_at').first()
        return str(client.id) if client else None

    def get_organization_name(self, obj):
        client = obj.client_accounts.order_by('-created_at').first()
        return client.organization_name if client else ''


class RegisterUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, trim_whitespace=False)
    organization_name = serializers.CharField(write_only=True, required=False, allow_blank=True)
    preferred_channel = serializers.CharField(required=False, default='Both', allow_blank=True)
    phone = serializers.CharField(required=False, allow_blank=True, default='')

    class Meta:
        model = User
        fields = ('id', 'name', 'email', 'phone', 'preferred_channel', 'password', 'role', 'organization_name')

    def validate_email(self, value):
        normalized = value.strip().lower()
        if User.objects.filter(email__iexact=normalized).exists():
            raise serializers.ValidationError('An account with this email already exists.')
        return normalized

    def validate_password(self, value):
        try:
            validate_password(value)
        except DjangoValidationError as exc:
            raise serializers.ValidationError(
                'Your password is weak. Use at least 8 characters with uppercase, lowercase, numbers, and symbols.'
            ) from exc
        return value

    def create(self, validated_data):
        password = validated_data.pop('password')
        email = validated_data.pop('email')
        org_name = validated_data.pop('organization_name', None)
        phone = validated_data.pop('phone', '')
        preferred_channel = validated_data.pop('preferred_channel', 'Both')
        validated_data.setdefault('username', email)
        user = User.objects.create_user(
            email=email,
            password=password,
            phone=phone,
            direct_phone=phone,
            alert_phone=phone,
            preferred_channel=preferred_channel,
            **validated_data
        )

        if user.role == 'CLIENT':
            display_org = org_name or user.name or user.email.split('@')[0].title()
            Client.objects.get_or_create(
                contact_user=user,
                defaults={
                    'organization_name': display_org,
                    'legal_name': f'{display_org} Security Portfolio',
                    'primary_phone': phone or '+254 700 000 000',
                },
            )

        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    email = serializers.CharField(required=False, allow_blank=True)
    username = serializers.CharField(required=False, allow_blank=True)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if self.username_field in self.fields:
            self.fields[self.username_field].required = False
            self.fields[self.username_field].allow_blank = True
        self.fields['username'] = serializers.CharField(required=False, allow_blank=True)
        self.fields['email'] = serializers.CharField(required=False, allow_blank=True)

    def validate(self, attrs):
        from django.db.models import Q
        identifier = attrs.get('email') or attrs.get('username')
        password = attrs.get('password')
        if identifier and password:
            identifier = identifier.strip()
            user = User.objects.filter(Q(email__iexact=identifier) | Q(username__iexact=identifier)).first()
            if user is None:
                raise serializers.ValidationError({'detail': 'Invalid credentials.'})
            if not user.check_password(password):
                raise serializers.ValidationError({'detail': 'Invalid credentials.'})
            if user.status != 'ACTIVE':
                raise serializers.ValidationError({'detail': 'Account is not active.'})
            refresh = self.get_token(user)
            return {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': UserSerializer(user).data,
            }
        raise serializers.ValidationError({'detail': 'Username/email and password are required.'})
