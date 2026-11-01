import hashlib
import secrets

from django.db import transaction
from rest_framework import serializers

from .models import ServiceRequest, ServiceRequestNote, ServiceRequestQuotation, ServiceRequestStatusHistory


class ServiceRequestCreateSerializer(serializers.ModelSerializer):
    idempotency_key = serializers.CharField(required=False, allow_blank=True)
    client = serializers.UUIDField(read_only=True)
    requester_user = serializers.UUIDField(read_only=True)

    class Meta:
        model = ServiceRequest
        fields = (
            'client', 'requester_user', 'full_name', 'organization_name', 'phone', 'email', 'service_type', 'site_address', 'city',
            'latitude', 'longitude', 'guards_needed', 'shift_coverage', 'armed_status', 'start_date',
            'duration', 'additional_details', 'preferred_contact_method', 'idempotency_key'
        )

    def validate_guards_needed(self, value):
        if value <= 0:
            raise serializers.ValidationError('Guard count must be greater than zero.')
        return value

    def generate_reference_number(self):
        year = __import__('datetime').datetime.now().year
        while True:
            candidate = f'SR-{year}-{secrets.randbelow(900000) + 100000}'
            if not ServiceRequest.objects.filter(reference_no=candidate).exists():
                return candidate

    def create(self, validated_data):
        idempotency_key = validated_data.pop('idempotency_key', None)
        salt = secrets.token_hex(8)
        raw_code = str(secrets.randbelow(900000) + 100000)
        hash_value = hashlib.sha256(f'{salt}:{raw_code}'.encode()).hexdigest()
        with transaction.atomic():
            request_obj = ServiceRequest.objects.create(
                reference_no=self.generate_reference_number(),
                verification_code_salt=salt,
                verification_code_hash=hash_value,
                **validated_data,
            )
            ServiceRequestStatusHistory.objects.create(
                service_request=request_obj,
                to_status=request_obj.status,
                actor='public_portal_client',
                reason='Service request created via public intake portal',
            )
        return request_obj, raw_code


class ServiceRequestTrackSerializer(serializers.Serializer):
    reference_no = serializers.CharField()
    phone = serializers.CharField(required=False, allow_blank=True)
    verification_code = serializers.CharField(required=False, allow_blank=True)

    def validate(self, attrs):
        if not attrs.get('phone') and not attrs.get('verification_code'):
            raise serializers.ValidationError('Provide either a phone number or verification code.')
        return attrs


class ServiceRequestStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceRequest
        fields = ('status',)


class ServiceRequestNoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceRequestNote
        fields = ('note', 'internal')


class ServiceRequestQuotationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceRequestQuotation
        fields = ('file_name', 'storage_key')
