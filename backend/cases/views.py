import hashlib

from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from rest_framework import permissions, serializers, status, views
from rest_framework.response import Response

from .models import CaseMessage, CaseStatusHistory, ServiceCase
from .serializers import CaseCreateSerializer, CaseMessageSerializer, CaseStatusUpdateSerializer, CaseTrackSerializer

User = get_user_model()


class CaseListCreateView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, *args, **kwargs):
        cases = ServiceCase.objects.all()[:50]
        return Response([
            {
                'id': str(item.id),
                'referenceNumber': item.reference_no,
                'status': item.status,
                'severity': item.severity,
                'caseType': item.case_type,
                'contactName': item.contact_name,
                'createdAt': item.created_at.isoformat(),
            }
            for item in cases
        ])

    def post(self, request, *args, **kwargs):
        payload = dict(request.data)
        if 'contactName' in payload and 'contact_name' not in payload:
            payload['contact_name'] = payload.pop('contactName')
        if 'contactPhone' in payload and 'contact_phone' not in payload:
            payload['contact_phone'] = payload.pop('contactPhone')
        if 'contactEmail' in payload and 'contact_email' not in payload:
            payload['contact_email'] = payload.pop('contactEmail')
        if 'caseType' in payload and 'case_type' not in payload:
            payload['case_type'] = payload.pop('caseType')
        if 'relatedSite' in payload and 'site' not in payload:
            payload['site'] = payload.pop('relatedSite')
        if 'personnelRef' in payload and 'employee' not in payload:
            payload['employee'] = payload.pop('personnelRef')
        if 'idempotencyKey' in payload and 'idempotency_key' not in payload:
            payload['idempotency_key'] = payload.pop('idempotencyKey')
        serializer = CaseCreateSerializer(data=payload)
        serializer.is_valid(raise_exception=True)
        case, raw_code = serializer.save()
        return Response(
            {
                'referenceNumber': case.reference_no,
                'verificationCode': raw_code,
                'status': case.status,
                'category': case.category,
                'createdAt': case.created_at.isoformat(),
                'instructions': 'Keep your case reference number and verification code for secure updates.',
            },
            status=status.HTTP_201_CREATED,
        )


class CaseTrackView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        payload = dict(request.data)
        if 'referenceNumber' in payload and 'reference_no' not in payload:
            payload['reference_no'] = payload.pop('referenceNumber')
        if 'verificationCode' in payload and 'verification_code' not in payload:
            payload['verification_code'] = payload.pop('verificationCode')
        serializer = CaseTrackSerializer(data=payload)
        serializer.is_valid(raise_exception=True)
        ref = serializer.validated_data['reference_no'].upper().strip()
        phone = (serializer.validated_data.get('phone') or '').strip()
        verification_code = (serializer.validated_data.get('verification_code') or '').strip()

        try:
            case = ServiceCase.objects.get(reference_no=ref)
        except ServiceCase.DoesNotExist:
            raise serializers.ValidationError({'detail': 'No matching case was found.'})

        if phone:
            input_phone = ''.join(ch for ch in phone if ch.isdigit())
            stored_phone = ''.join(ch for ch in case.contact_phone if ch.isdigit())
            if not stored_phone or not (stored_phone.endswith(input_phone) or input_phone.endswith(stored_phone)):
                raise serializers.ValidationError({'detail': 'No matching case was found.'})

        if verification_code:
            digest = hashlib.sha256(f'{case.verification_code_salt}:{verification_code}'.encode()).hexdigest()
            if digest != case.verification_code_hash:
                raise serializers.ValidationError({'detail': 'No matching case was found.'})

        history = [
            {
                'id': str(item.id),
                'fromState': item.from_status,
                'toState': item.to_status,
                'reason': item.reason,
                'changedAt': item.created_at.isoformat(),
                'actor': item.actor,
            }
            for item in case.status_history.all()
        ]

        return Response({
            'referenceNumber': case.reference_no,
            'status': case.status,
            'latestPublicUpdate': 'Your case has been received and is being reviewed.',
            'nextStep': 'Operations team will review and respond as needed.',
            'history': history,
            'createdAt': case.created_at.isoformat(),
        })


class CaseDetailView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk, *args, **kwargs):
        if request.user.is_authenticated and getattr(request.user, 'role', None) == 'CLIENT':
            client = request.user.client_accounts.order_by('-created_at').first()
            if client is None:
                return Response({'detail': 'Client access required.'}, status=status.HTTP_403_FORBIDDEN)
            case = get_object_or_404(ServiceCase.objects.filter(client=client), pk=pk)
        else:
            case = get_object_or_404(ServiceCase, pk=pk)
        return Response({
            'id': str(case.id),
            'referenceNumber': case.reference_no,
            'status': case.status,
            'category': case.category,
            'caseType': case.case_type,
            'severity': case.severity,
            'contactName': case.contact_name,
            'contactPhone': case.contact_phone,
            'description': case.description,
            'resolution': case.resolution,
            'createdAt': case.created_at.isoformat(),
        })


class CaseMessageView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk, *args, **kwargs):
        case = ServiceCase.objects.get(pk=pk)
        serializer = CaseMessageSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        message = serializer.save(case=case, author=request.user)
        return Response({
            'id': str(message.id),
            'message': message.message,
            'internal': message.internal,
            'createdAt': message.created_at.isoformat(),
        }, status=status.HTTP_201_CREATED)


class CaseStatusView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk, *args, **kwargs):
        if request.user.is_authenticated and getattr(request.user, 'role', None) == 'CLIENT':
            client = request.user.client_accounts.order_by('-created_at').first()
            if client is None:
                return Response({'detail': 'Client access required.'}, status=status.HTTP_403_FORBIDDEN)
            case = get_object_or_404(ServiceCase.objects.filter(client=client), pk=pk)
        else:
            case = get_object_or_404(ServiceCase, pk=pk)
        serializer = CaseStatusUpdateSerializer(case, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        old_status = case.status
        serializer.save()
        CaseStatusHistory.objects.create(
            case=case,
            from_status=old_status,
            to_status=case.status,
            actor=getattr(request.user, 'email', 'staff'),
            reason=request.data.get('reason', 'Status updated'),
        )
        return Response({'status': case.status})
