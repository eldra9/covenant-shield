import hashlib

from django.contrib.auth import get_user_model
from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework import permissions, serializers, status, views
from rest_framework.response import Response

from clients.models import Client
from .models import ServiceRequest, ServiceRequestNote, ServiceRequestStatusHistory
from .serializers import (
    ServiceRequestCreateSerializer,
    ServiceRequestNoteSerializer,
    ServiceRequestStatusUpdateSerializer,
    ServiceRequestTrackSerializer,
)

User = get_user_model()


def get_authenticated_client_for_request(request):
    user = getattr(request, 'user', None)
    if user is None or getattr(user, 'is_anonymous', True):
        return None
    if getattr(user, 'role', None) != 'CLIENT':
        return None
    return user.client_accounts.order_by('-created_at').first()


class ServiceRequestListCreateView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, *args, **kwargs):
        if request.user.is_authenticated and getattr(request.user, 'role', None) == 'CLIENT':
            client = get_authenticated_client_for_request(request)
            if client is None:
                return Response({'detail': 'Client account not found.'}, status=status.HTTP_403_FORBIDDEN)
            qs = ServiceRequest.objects.filter(client=client)
        else:
            qs = ServiceRequest.objects.all()
        return Response([
            {
                'id': str(item.id),
                'referenceNumber': item.reference_no,
                'status': item.status,
                'serviceType': item.service_type,
                'siteAddress': item.site_address,
                'city': item.city,
                'createdAt': item.created_at.isoformat(),
            }
            for item in qs[:50]
        ])

    def post(self, request, *args, **kwargs):
        payload = dict(request.data)
        client = get_authenticated_client_for_request(request)
        if request.user.is_authenticated and getattr(request.user, 'role', None) == 'CLIENT':
            if client is None:
                return Response({'detail': 'Client account not found.'}, status=status.HTTP_403_FORBIDDEN)
            payload.pop('client', None)
            payload.pop('requester_user', None)
            payload['client'] = str(client.id)
            payload['requester_user'] = str(request.user.id)
        if 'contactName' in payload and 'full_name' not in payload:
            payload['full_name'] = payload.pop('contactName')
        if 'organizationName' in payload and 'organization_name' not in payload:
            payload['organization_name'] = payload.pop('organizationName')
        if 'serviceType' in payload and 'service_type' not in payload:
            payload['service_type'] = payload.pop('serviceType')
        if 'siteAddress' in payload and 'site_address' not in payload:
            payload['site_address'] = payload.pop('siteAddress')
        if 'guardCount' in payload and 'guards_needed' not in payload:
            payload['guards_needed'] = payload.pop('guardCount')
        if 'coverage' in payload and 'shift_coverage' not in payload:
            payload['shift_coverage'] = payload.pop('coverage')
        if 'armedPreference' in payload and 'armed_status' not in payload:
            payload['armed_status'] = payload.pop('armedPreference')
        if 'startDate' in payload and 'start_date' not in payload:
            payload['start_date'] = payload.pop('startDate')
        if 'additionalRequirements' in payload and 'additional_details' not in payload:
            payload['additional_details'] = payload.pop('additionalRequirements')
        if 'preferredContactMethod' in payload and 'preferred_contact_method' not in payload:
            payload['preferred_contact_method'] = payload.pop('preferredContactMethod')
        if 'privacyConsent' in payload:
            payload.pop('privacyConsent')
        if 'idempotencyKey' in payload and 'idempotency_key' not in payload:
            payload['idempotency_key'] = payload.pop('idempotencyKey')
        if 'coordinates' in payload and isinstance(payload['coordinates'], str):
            coords = payload.pop('coordinates')
            if coords and ',' in coords:
                lat, lon = coords.split(',', 1)
                payload['latitude'] = float(lat.strip())
                payload['longitude'] = float(lon.strip())
        serializer = ServiceRequestCreateSerializer(data=payload)
        serializer.is_valid(raise_exception=True)
        request_obj, raw_code = serializer.save()
        if request.user.is_authenticated and getattr(request.user, 'role', None) == 'CLIENT':
            client = get_authenticated_client_for_request(request)
            if client is not None:
                request_obj.client = client
                request_obj.requester_user = request.user
                request_obj.save(update_fields=['client', 'requester_user'])
        return Response(
            {
                'referenceNumber': request_obj.reference_no,
                'verificationCode': raw_code,
                'status': request_obj.status,
                'createdAt': request_obj.created_at.isoformat(),
                'requiresManualReview': False,
                'instructions': 'Keep your reference number and verification code for secure tracking.',
            },
            status=status.HTTP_201_CREATED,
        )


class ServiceRequestTrackView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        payload = dict(request.data)
        if 'referenceNumber' in payload and 'reference_no' not in payload:
            payload['reference_no'] = payload.pop('referenceNumber')
        if 'verificationCode' in payload and 'verification_code' not in payload:
            payload['verification_code'] = payload.pop('verificationCode')
        serializer = ServiceRequestTrackSerializer(data=payload)
        serializer.is_valid(raise_exception=True)
        ref = serializer.validated_data['reference_no'].upper().strip()
        phone = (serializer.validated_data.get('phone') or '').strip()
        verification_code = (serializer.validated_data.get('verification_code') or '').strip()

        try:
            service_request = ServiceRequest.objects.get(reference_no=ref)
        except ServiceRequest.DoesNotExist:
            raise serializers.ValidationError({'detail': 'No matching service request was found.'})

        if phone:
            input_phone = ''.join(ch for ch in phone if ch.isdigit())
            stored_phone = ''.join(ch for ch in service_request.phone if ch.isdigit())
            if not stored_phone or not (stored_phone.endswith(input_phone) or input_phone.endswith(stored_phone)):
                raise serializers.ValidationError({'detail': 'No matching service request was found.'})

        if verification_code:
            digest = hashlib.sha256(f'{service_request.verification_code_salt}:{verification_code}'.encode()).hexdigest()
            if digest != service_request.verification_code_hash:
                raise serializers.ValidationError({'detail': 'No matching service request was found.'})

        history = [
            {
                'id': str(item.id),
                'fromState': item.from_status,
                'toState': item.to_status,
                'reason': item.reason,
                'changedAt': item.created_at.isoformat(),
                'actor': item.actor,
            }
            for item in service_request.status_history.all()
        ]

        latest_public_update = next(
            (item.reason for item in service_request.status_history.all() if item.to_status == service_request.status),
            'Request received and is being reviewed.',
        )

        return Response(
            {
                'referenceNumber': service_request.reference_no,
                'status': service_request.status,
                'latestPublicUpdate': latest_public_update,
                'nextStep': 'Operations review is in progress.',
                'history': history,
                'createdAt': service_request.created_at.isoformat(),
            }
        )


class ServiceRequestDetailView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk, *args, **kwargs):
        if request.user.is_authenticated and getattr(request.user, 'role', None) == 'CLIENT':
            client = get_authenticated_client_for_request(request)
            if client is None:
                return Response({'detail': 'Client access required.'}, status=status.HTTP_403_FORBIDDEN)
            service_request = get_object_or_404(ServiceRequest.objects.filter(client=client), pk=pk)
        else:
            service_request = get_object_or_404(ServiceRequest, pk=pk)
        return Response({
            'id': str(service_request.id),
            'referenceNumber': service_request.reference_no,
            'status': service_request.status,
            'fullName': service_request.full_name,
            'organizationName': service_request.organization_name,
            'phone': service_request.phone,
            'email': service_request.email,
            'serviceType': service_request.service_type,
            'siteAddress': service_request.site_address,
            'city': service_request.city,
            'guardCount': service_request.guards_needed,
            'coverage': service_request.shift_coverage,
            'armedPreference': service_request.armed_status,
            'startDate': service_request.start_date.isoformat(),
            'duration': service_request.duration,
            'additionalRequirements': service_request.additional_details,
            'preferredContactMethod': service_request.preferred_contact_method,
        })


class ServiceRequestStatusView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk, *args, **kwargs):
        if request.user.is_authenticated and getattr(request.user, 'role', None) == 'CLIENT':
            client = get_authenticated_client_for_request(request)
            if client is None:
                return Response({'detail': 'Client access required.'}, status=status.HTTP_403_FORBIDDEN)
            service_request = get_object_or_404(ServiceRequest.objects.filter(client=client), pk=pk)
        else:
            service_request = get_object_or_404(ServiceRequest, pk=pk)
        serializer = ServiceRequestStatusUpdateSerializer(service_request, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        old_status = service_request.status
        serializer.save()
        ServiceRequestStatusHistory.objects.create(
            service_request=service_request,
            from_status=old_status,
            to_status=service_request.status,
            actor=getattr(request.user, 'email', 'staff'),
            reason=request.data.get('reason', 'Status updated'),
        )
        return Response({'status': service_request.status})


class ServiceRequestNoteView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk, *args, **kwargs):
        if request.user.is_authenticated and getattr(request.user, 'role', None) == 'CLIENT':
            client = get_authenticated_client_for_request(request)
            if client is None:
                return Response({'detail': 'Client access required.'}, status=status.HTTP_403_FORBIDDEN)
            service_request = get_object_or_404(ServiceRequest.objects.filter(client=client), pk=pk)
        else:
            service_request = get_object_or_404(ServiceRequest, pk=pk)
        serializer = ServiceRequestNoteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        note = serializer.save(service_request=service_request, author=request.user)
        return Response({
            'id': str(note.id),
            'note': note.note,
            'internal': note.internal,
            'createdAt': note.created_at.isoformat(),
        }, status=status.HTTP_201_CREATED)


class ServiceRequestAssignView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk, *args, **kwargs):
        if request.user.is_authenticated and getattr(request.user, 'role', None) == 'CLIENT':
            client = get_authenticated_client_for_request(request)
            if client is None:
                return Response({'detail': 'Client access required.'}, status=status.HTTP_403_FORBIDDEN)
            service_request = get_object_or_404(ServiceRequest.objects.filter(client=client), pk=pk)
        else:
            service_request = get_object_or_404(ServiceRequest, pk=pk)
        assigned_to = User.objects.filter(pk=request.data.get('assigned_to')).first()
        if assigned_to is None:
            return Response({'detail': 'Assigned user was not found.'}, status=status.HTTP_400_BAD_REQUEST)
        service_request.assigned_to = assigned_to
        service_request.save(update_fields=['assigned_to', 'updated_at'])
        return Response({'assignedTo': str(assigned_to.id)})
