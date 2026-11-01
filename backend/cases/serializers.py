import hashlib
import secrets

from django.db import transaction
from rest_framework import serializers

from .models import CaseMessage, CaseStatusHistory, ServiceCase


class CaseCreateSerializer(serializers.ModelSerializer):
    idempotency_key = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = ServiceCase
        fields = (
            'case_type', 'category', 'severity', 'contact_name', 'contact_phone', 'contact_email',
            'incident_at', 'description', 'rating', 'idempotency_key'
        )

    def generate_reference_number(self):
        import datetime
        year = datetime.datetime.now().year
        while True:
            candidate = f'CS-{year}-{secrets.randbelow(900000) + 100000}'
            if not ServiceCase.objects.filter(reference_no=candidate).exists():
                return candidate

    def create(self, validated_data):
        validated_data.pop('idempotency_key', None)
        salt = secrets.token_hex(8)
        raw_code = str(secrets.randbelow(900000) + 100000)
        hash_value = hashlib.sha256(f'{salt}:{raw_code}'.encode()).hexdigest()
        with transaction.atomic():
            case = ServiceCase.objects.create(
                reference_no=self.generate_reference_number(),
                verification_code_salt=salt,
                verification_code_hash=hash_value,
                **validated_data,
            )
            CaseStatusHistory.objects.create(case=case, to_status=case.status, actor='public_portal_client', reason='Case submitted via public intake portal')
        return case, raw_code


class CaseTrackSerializer(serializers.Serializer):
    reference_no = serializers.CharField()
    phone = serializers.CharField(required=False, allow_blank=True)
    verification_code = serializers.CharField(required=False, allow_blank=True)


class CaseMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = CaseMessage
        fields = ('message', 'internal')


class CaseStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceCase
        fields = ('status', 'resolution')
