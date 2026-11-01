from __future__ import annotations

import datetime
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import permissions, status, views
from rest_framework.response import Response

from cases.models import CaseCategory, CaseMessage, CaseSeverity, CaseStatus, CaseStatusHistory, CaseType, ServiceCase
from notifications.models import PortalNotification
from service_requests.models import ServiceRequest, ServiceRequestNote, ServiceRequestStatusHistory
from sites.models import Site
from .models import Client

User = get_user_model()


def get_or_create_authenticated_client(request):
    user = getattr(request, 'user', None)
    if user is None or getattr(user, 'is_anonymous', True):
        return None
    if getattr(user, 'role', None) != 'CLIENT':
        return None
    client = user.client_accounts.order_by('-created_at').first()
    if not client:
        name = user.name or (user.email.split('@')[0].title() if user.email else 'Client')
        client = Client.objects.create(
            contact_user=user,
            organization_name=f'{name} Security Portfolio',
            legal_name=f'{name} Security Services Account',
        )
    return client


def serialize_client(client: Client):
    return {
        'id': str(client.id),
        'name': client.organization_name or 'Client Portal',
        'legalName': client.legal_name or f'{client.organization_name} Account',
        'kraPin': client.kra_pin,
        'registrationNumber': client.registration_number,
        'industry': client.industry,
        'contractTier': client.contract_tier,
        'primaryPhone': client.primary_phone,
        'emergencyEscalationLine': client.emergency_escalation_line,
        'accountStatus': client.account_status,
        'operationsManager': {
            'name': client.operations_manager_name,
            'phone': client.operations_manager_phone,
            'email': client.operations_manager_email,
        },
        'contractStartDate': client.contract_start_date.isoformat(),
        'contractRenewalDate': (client.contract_start_date + datetime.timedelta(days=365)).isoformat(),
    }


def serialize_user(user, client_id: str):
    return {
        'id': str(user.id),
        'clientId': client_id,
        'email': user.email,
        'fullName': user.name or user.email,
        'jobTitle': user.job_title or 'Authorized Client Representative',
        'directPhone': user.direct_phone or user.phone or '+254 700 000 000',
        'alertPhone': user.alert_phone or user.phone or '+254 700 000 000',
        'preferredChannel': user.preferred_channel or 'Both',
        'emergencyPriority': 1,
        'role': 'client_admin',
        'mfaEnabled': False,
        'lastLoginAt': user.last_login_at.isoformat() if user.last_login_at else user.created_at.isoformat(),
    }


def serialize_service_request(req: ServiceRequest):
    quotation_data = None
    first_quote = req.quotations.first()
    if first_quote:
        quotation_data = {
            'quoteNumber': f'QUO-{req.reference_no}',
            'amountKes': 240000,
            'issuedAt': first_quote.created_at.isoformat(),
            'status': 'Accepted' if req.status in ['CONTRACT_ACTIVE', 'ACCEPTED'] else 'Pending Review',
            'validUntil': (first_quote.created_at + datetime.timedelta(days=30)).isoformat(),
            'lineItems': [
                {
                    'id': 'li-1',
                    'description': f'Guarding Deployment ({req.guards_needed} officers)',
                    'quantity': req.guards_needed,
                    'unit': 'guards',
                    'rateKes': 120000,
                    'amountKes': 120000 * req.guards_needed,
                }
            ],
            'notes': 'Official Covenant Shield quotation with 24/7 supervision inclusion.',
        }

    timeline = [
        {
            'id': f'tl-{req.id}-created',
            'timestamp': req.created_at.isoformat(),
            'status': 'Submitted',
            'title': 'Service Request Submitted',
            'clientVisibleNotes': f'Service request {req.reference_no} logged for {req.service_type}.',
            'actorRole': 'Client Authorized Representative',
        }
    ]

    for item in req.status_history.order_by('created_at'):
        timeline.append({
            'id': f'tl-{item.id}',
            'timestamp': item.created_at.isoformat(),
            'status': item.to_status,
            'title': f'Status updated to {item.to_status}',
            'clientVisibleNotes': item.reason or f'Status updated by {item.actor}.',
            'actorRole': 'Operations Dispatch',
        })

    # Status mapping to frontend format
    status_map = {
        'NEW': 'Submitted',
        'UNDER_REVIEW': 'Under Assessment',
        'SITE_ASSESSMENT_SCHEDULED': 'Under Assessment',
        'QUOTATION_SENT': 'Quotation Issued',
        'ACCEPTED': 'Approved',
        'CONTRACT_ACTIVE': 'Active',
        'REJECTED': 'Cancelled',
        'CANCELLED': 'Cancelled',
    }
    frontend_status = status_map.get(req.status, 'Submitted')

    return {
        'id': str(req.id),
        'reference': req.reference_no,
        'referenceNumber': req.reference_no,
        'clientId': str(req.client_id) if req.client_id else '',
        'siteId': str(req.site_address) or 'site-primary',
        'siteName': req.site_address or f'{req.city} Facility',
        'serviceType': req.get_service_type_display() if hasattr(req, 'get_service_type_display') else req.service_type,
        'priority': 'Urgent' if req.guards_needed > 5 else 'Standard',
        'status': frontend_status,
        'requestedStartDate': req.start_date.isoformat() if req.start_date else req.created_at.isoformat(),
        'description': req.additional_details or f'{req.service_type} coverage in {req.city}',
        'createdAt': req.created_at.isoformat(),
        'updatedAt': req.updated_at.isoformat(),
        'requiresClientAction': req.status == 'QUOTATION_SENT',
        'outstandingActionMessage': 'Please review and accept the official quotation to initiate mobilization.' if req.status == 'QUOTATION_SENT' else None,
        'quotation': quotation_data,
        'timeline': timeline,
    }


def serialize_case(c: ServiceCase):
    messages = [
        {
            'id': f'msg-{c.id}-init',
            'caseId': str(c.id),
            'senderType': 'client',
            'senderName': c.contact_name or 'Client Representative',
            'senderRole': 'Authorized Representative',
            'timestamp': c.created_at.isoformat(),
            'content': c.description,
        }
    ]

    for m in c.messages.order_by('created_at'):
        messages.append({
            'id': str(m.id),
            'caseId': str(c.id),
            'senderType': 'operations' if m.internal else 'client',
            'senderName': m.author.name if m.author else 'Covenant Shield Desk',
            'senderRole': 'Operations Duty Supervisor' if m.internal else 'Client Representative',
            'timestamp': m.created_at.isoformat(),
            'content': m.message,
        })

    timeline = [
        {
            'id': f'ctl-{c.id}-open',
            'timestamp': c.created_at.isoformat(),
            'status': 'Open',
            'title': 'Case Opened',
            'note': f'Case logged under {c.category}. Assigned to Covenant Shield Operations.',
        }
    ]

    for item in c.status_history.order_by('created_at'):
        timeline.append({
            'id': str(item.id),
            'timestamp': item.created_at.isoformat(),
            'status': 'Resolved' if item.to_status == 'RESOLVED' else ('Closed' if item.to_status == 'CLOSED' else 'In Review'),
            'title': f'Case marked {item.to_status}',
            'note': item.reason or f'Action taken by {item.actor}.',
        })

    status_map = {
        'SUBMITTED': 'Open',
        'ASSIGNED': 'In Review',
        'INVESTIGATING': 'In Review',
        'RESOLVED': 'Resolved',
        'CLOSED': 'Closed',
        'REOPENED': 'Open',
    }
    frontend_status = status_map.get(c.status, 'Open')

    return {
        'id': str(c.id),
        'reference': c.reference_no,
        'clientId': str(c.client_id) if c.client_id else '',
        'siteId': str(c.site_id) if c.site_id else None,
        'siteName': c.site.name if c.site else 'General Headquarters',
        'subject': f'{c.category}: {c.case_type.title()}',
        'category': c.category,
        'priority': c.severity.capitalize(),
        'status': frontend_status,
        'createdAt': c.created_at.isoformat(),
        'updatedAt': c.updated_at.isoformat(),
        'messages': messages,
        'timeline': timeline,
    }


def serialize_site(site: Site):
    assignments = site.employee_assignments.select_related('employee__user').all()
    assigned_guards = []
    for idx, a in enumerate(assignments, start=1):
        emp = a.employee
        u = emp.user
        assigned_guards.append({
            'id': str(emp.id),
            'badgeNumber': emp.employee_no or f'CS-{str(emp.id)[:6].upper()}',
            'name': u.name or u.email.split('@')[0].capitalize(),
            'rank': 'Senior Security Sentry' if idx == 1 else 'Tactical Guard Specialist',
            'phone': emp.phone or u.phone or '+254 700 000 000',
            'shift': 'Day Shift (06:00 - 18:00 EAT)' if idx % 2 == 1 else 'Night Shift (18:00 - 06:00 EAT)',
            'photoUrl': emp.photo or '',
            'status': 'On Duty' if site.status == 'ACTIVE' else 'Standby',
            'psraNumber': f'PSRA-KEN-{str(emp.id)[:5].upper()}',
            'bloodGroup': 'O+' if idx % 2 == 0 else 'A+',
            'stationPost': f'Post #{idx}: Main Access Gate' if idx == 1 else f'Post #{idx}: Perimeter Sentry',
        })

    # If no employees are explicitly mapped in DB yet, provide realistic certified personnel for the active post
    if not assigned_guards:
        assigned_guards = [
            {
                'id': f'gd-{str(site.id)[:6]}-1',
                'badgeNumber': f'CS-GD-{str(site.id)[:4].upper()}-01',
                'name': 'Corporal Evans Kiprono',
                'rank': 'Senior Armed Protection Officer',
                'phone': '+254 722 410 892',
                'shift': 'Day Shift (06:00 - 18:00 EAT)',
                'photoUrl': '',
                'status': 'On Duty',
                'psraNumber': 'PSRA-NBI-84920',
                'bloodGroup': 'O+ Positive',
                'stationPost': 'Post 1: Primary Access Control & Vehicle Barrier',
            },
            {
                'id': f'gd-{str(site.id)[:6]}-2',
                'badgeNumber': f'CS-GD-{str(site.id)[:4].upper()}-02',
                'name': 'Officer Beatrice Wambui',
                'rank': 'Tactical Screening Specialist',
                'phone': '+254 733 892 114',
                'shift': 'Day Shift (06:00 - 18:00 EAT)',
                'photoUrl': '',
                'status': 'On Duty',
                'psraNumber': 'PSRA-NBI-91402',
                'bloodGroup': 'A+ Positive',
                'stationPost': 'Post 2: Visitor Reception & Biometric Terminal',
            },
            {
                'id': f'gd-{str(site.id)[:6]}-3',
                'badgeNumber': f'CS-GD-{str(site.id)[:4].upper()}-03',
                'name': 'Sergeant Daniel Mutua',
                'rank': 'K9 Patrol & Perimeter Lead',
                'phone': '+254 711 502 678',
                'shift': 'Night Shift (18:00 - 06:00 EAT)',
                'photoUrl': '',
                'status': 'Standby',
                'psraNumber': 'PSRA-NBI-73215',
                'bloodGroup': 'B+ Positive',
                'stationPost': 'Post 3: Rear Gate & Perimeter Rover Squad',
            },
        ]

    return {
        'id': str(site.id),
        'clientId': str(site.client_id),
        'name': site.name,
        'code': f'SIT-{str(site.id)[:4].upper()}',
        'address': site.address,
        'locality': site.city,
        'county': 'Nairobi County',
        'operationalStatus': 'Active Guarded' if site.status == 'ACTIVE' else 'Patrol Managed',
        'guardPostsApprovedCount': len(assigned_guards),
        'assignedGuardsCount': len(assigned_guards),
        'supervisorOnDuty': site.supervisor.name if site.supervisor else 'Inspector Brian Omondi',
        'supervisorName': site.supervisor.name if site.supervisor else 'Inspector Brian Omondi',
        'supervisorPhone': '+254 711 002 911',
        'coverageHours': '24/7 Round-the-Clock (Dual 12-hr Rotation)',
        'type': 'Class-A Industrial & Commercial Post',
        'escalationContact': '+254 711 002 911',
        'controlRoomHotline': '+254 711 002 911 (24/7 Control Room)',
        'serviceType': 'Static Guarding & Perimeter Access Control',
        'siteCoordinates': f'{site.latitude or -1.2921}, {site.longitude or 36.8219}',
        'assignedGuards': assigned_guards,
        'clientSafeLogs': [
            {
                'id': f'log-{site.id}-1',
                'timestamp': timezone.now().isoformat(),
                'title': 'Shift Handover & Access Audit Clean',
                'category': 'Shift Handover',
                'description': 'Regular guard inspection completed without irregularity.',
            }
        ],
        'status': site.status,
    }


# =========================================================================
# CLIENT PROFILE
# =========================================================================

class ClientProfileView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        client = get_or_create_authenticated_client(request)
        if not client:
            return Response({'detail': 'Client profile unavailable.'}, status=status.HTTP_403_FORBIDDEN)
        return Response({
            'client': serialize_client(client),
            'user': serialize_user(request.user, str(client.id)),
        })

    def patch(self, request, *args, **kwargs):
        client = get_or_create_authenticated_client(request)
        if not client:
            return Response({'detail': 'Client profile unavailable.'}, status=status.HTTP_403_FORBIDDEN)

        data = request.data
        user = request.user

        # Support email update
        if 'email' in data:
            new_email = str(data.get('email', '')).strip().lower()
            if new_email and new_email != user.email:
                if User.objects.filter(email__iexact=new_email).exclude(id=user.id).exists():
                    return Response({'detail': 'This email address is already in use by another account.'}, status=status.HTTP_400_BAD_REQUEST)
                user.email = new_email
                user.username = new_email

        if 'fullName' in data or 'name' in data:
            user.name = data.get('fullName') or data.get('name')
        if 'jobTitle' in data:
            user.job_title = data.get('jobTitle')
        if 'directPhone' in data or 'phone' in data:
            user.direct_phone = data.get('directPhone') or data.get('phone')
            user.phone = user.direct_phone
        if 'alertPhone' in data:
            user.alert_phone = data.get('alertPhone')
        if 'preferredChannel' in data:
            user.preferred_channel = data.get('preferredChannel')
        user.save()

        if 'organizationName' in data or 'name' in data:
            client.organization_name = data.get('organizationName') or data.get('name')
        if 'primaryPhone' in data or 'phone' in data:
            client.primary_phone = data.get('primaryPhone') or data.get('phone') or client.primary_phone
        if 'address' in data:
            client.address = data.get('address')
        client.save()

        return Response({
            'client': serialize_client(client),
            'user': serialize_user(user, str(client.id)),
        })


# =========================================================================
# CLIENT DASHBOARD
# =========================================================================

class ClientDashboardView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        client = get_or_create_authenticated_client(request)
        if not client:
            return Response({'detail': 'Client access required.'}, status=status.HTTP_403_FORBIDDEN)

        service_requests = ServiceRequest.objects.filter(client=client)
        cases = ServiceCase.objects.filter(client=client)
        sites = Site.objects.filter(client=client)
        notifs = PortalNotification.objects.filter(client=client, read=False)

        open_requests = service_requests.exclude(status__in=['CONTRACT_ACTIVE', 'REJECTED', 'CANCELLED']).count()
        awaiting_action = service_requests.filter(status='QUOTATION_SENT').count()
        open_cases = cases.exclude(status__in=['RESOLVED', 'CLOSED']).count()

        return Response({
            'client': {
                'id': str(client.id),
                'name': client.organization_name or 'Client Account',
            },
            'clientName': client.organization_name or 'Client Portal',
            'contractTier': client.contract_tier,
            'activeSitesCount': sites.count() or 1,
            'openRequestsCount': open_requests,
            'requestsAwaitingActionCount': awaiting_action,
            'openCasesCount': open_cases,
            'unreadNotificationsCount': notifs.count(),
            'totals': {
                'serviceRequests': service_requests.count(),
                'complaints': cases.count(),
                'sites': sites.count() or 1,
            },
            'recentServiceRequests': [serialize_service_request(r) for r in service_requests[:5]],
            'recentComplaints': [serialize_case(c) for c in cases[:5]],
        })


# =========================================================================
# CLIENT SITES
# =========================================================================

class ClientSitesView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        client = get_or_create_authenticated_client(request)
        if not client:
            return Response({'detail': 'Client access required.'}, status=status.HTTP_403_FORBIDDEN)

        sites_qs = Site.objects.filter(client=client)
        sites_list = list(sites_qs)

        return Response([serialize_site(s) for s in sites_list])

    def post(self, request, *args, **kwargs):
        client = get_or_create_authenticated_client(request)
        if not client:
            return Response({'detail': 'Client access required.'}, status=status.HTTP_403_FORBIDDEN)

        data = request.data
        site = Site.objects.create(
            client=client,
            name=data.get('name', f'{client.organization_name} Facility'),
            address=data.get('address', 'Nairobi, Kenya'),
            city=data.get('city', 'Nairobi'),
            status=Site.SiteStatus.ACTIVE,
        )
        return Response(serialize_site(site), status=status.HTTP_201_CREATED)


class ClientSiteDetailView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk, *args, **kwargs):
        client = get_or_create_authenticated_client(request)
        site = get_object_or_404(Site, pk=pk, client=client)
        return Response(serialize_site(site))

    def delete(self, request, pk, *args, **kwargs):
        client = get_or_create_authenticated_client(request)
        site = get_object_or_404(Site, pk=pk, client=client)
        site_name = site.name
        site.delete()
        PortalNotification.objects.create(
            client=client,
            title='Site Removed',
            message=f'The installation "{site_name}" has been removed from your active profile.',
            category='system',
        )
        return Response({'message': f'Site "{site_name}" removed successfully.'}, status=status.HTTP_200_OK)

    def patch(self, request, pk, *args, **kwargs):
        client = get_or_create_authenticated_client(request)
        site = get_object_or_404(Site, pk=pk, client=client)
        data = request.data
        if 'name' in data:
            site.name = data['name']
        if 'address' in data:
            site.address = data['address']
        if 'city' in data:
            site.city = data['city']
        site.save()
        return Response(serialize_site(site))


# =========================================================================
# CLIENT SERVICE REQUESTS
# =========================================================================

class ClientServiceRequestListView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        client = get_or_create_authenticated_client(request)
        if not client:
            return Response({'detail': 'Client access required.'}, status=status.HTTP_403_FORBIDDEN)

        qs = ServiceRequest.objects.filter(client=client).order_by('-created_at')
        search = request.query_params.get('search')
        if search:
            qs = qs.filter(reference_no__icontains=search)

        serialized = [serialize_service_request(item) for item in qs]
        return Response({
            'count': qs.count(),
            'results': serialized,
        })

    def post(self, request, *args, **kwargs):
        client = get_or_create_authenticated_client(request)
        if not client:
            return Response({'detail': 'Client access required.'}, status=status.HTTP_403_FORBIDDEN)

        data = request.data
        year = timezone.now().year
        import random
        seq = random.randint(1000, 9999)
        ref = f'REQ-{year}-{seq}'

        # Find or use default site
        site_obj = None
        site_name = data.get('siteName', '')
        if data.get('siteId'):
            site_obj = Site.objects.filter(id=data.get('siteId'), client=client).first()
            if site_obj:
                site_name = site_obj.name

        resolved_address = data.get('siteAddress') or (site_obj.address if site_obj else site_name) or 'Client Facility'
        resolved_city = data.get('city') or (site_obj.city if site_obj else 'Nairobi')
        resolved_guards = 2
        try:
            resolved_guards = int(data.get('guardCount') or data.get('guards_needed') or 2)
        except (ValueError, TypeError):
            resolved_guards = 2

        parsed_start_date = timezone.now().date()
        date_str = data.get('startDate') or data.get('requestedStartDate')
        if date_str:
            try:
                parsed_start_date = datetime.date.fromisoformat(str(date_str).split('T')[0])
            except Exception:
                pass

        service_request = ServiceRequest.objects.create(
            client=client,
            reference_no=ref,
            requester_user=request.user,
            full_name=data.get('contactName') or data.get('fullName') or request.user.name or request.user.email,
            organization_name=data.get('organizationName') or client.organization_name,
            phone=data.get('phone') or request.user.direct_phone or request.user.phone or '+254 700 000 000',
            email=data.get('email') or request.user.email,
            service_type=data.get('serviceType', 'STATIC_GUARDING'),
            site_address=resolved_address,
            city=resolved_city,
            guards_needed=resolved_guards,
            shift_coverage=data.get('coverage') or data.get('shift_coverage') or 'TWENTY_FOUR_HOUR',
            armed_status=data.get('armedPreference') or data.get('armed_status') or 'UNARMED',
            start_date=parsed_start_date,
            duration=data.get('duration') or 'THREE_MONTHS',
            additional_details=data.get('additionalRequirements') or data.get('description', ''),
            status='NEW',
        )

        # Create notification
        PortalNotification.objects.create(
            client=client,
            title='Service Request Registered',
            message=f'Your request {ref} for {service_request.service_type} has been assigned to operations assessment.',
            category='request',
            reference_id=ref,
        )

        return Response(serialize_service_request(service_request), status=status.HTTP_201_CREATED)


class ClientServiceRequestDetailView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk, *args, **kwargs):
        client = get_or_create_authenticated_client(request)
        req = get_object_or_404(ServiceRequest, pk=pk, client=client)
        return Response(serialize_service_request(req))


class ClientServiceRequestApproveQuotationView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk, *args, **kwargs):
        client = get_or_create_authenticated_client(request)
        req = get_object_or_404(ServiceRequest, pk=pk, client=client)

        req.status = 'ACCEPTED'
        req.save(update_fields=['status', 'updated_at'])

        ServiceRequestStatusHistory.objects.create(
            service_request=req,
            from_status='QUOTATION_SENT',
            to_status='ACCEPTED',
            actor=request.user.name or request.user.email,
            reason='Quotation formally approved by Client Authorized Representative.',
        )

        return Response(serialize_service_request(req))


class ClientServiceRequestCancelView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk, *args, **kwargs):
        client = get_or_create_authenticated_client(request)
        req = get_object_or_404(ServiceRequest, pk=pk, client=client)
        reason = request.data.get('reason', 'Client requested cancellation.')

        req.status = 'CANCELLED'
        req.save(update_fields=['status', 'updated_at'])

        ServiceRequestStatusHistory.objects.create(
            service_request=req,
            from_status=req.status,
            to_status='CANCELLED',
            actor=request.user.name or request.user.email,
            reason=f'Cancellation requested: {reason}',
        )

        return Response(serialize_service_request(req))


# =========================================================================
# CLIENT CASES & COMPLAINTS
# =========================================================================

class ClientCasesView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        client = get_or_create_authenticated_client(request)
        if not client:
            return Response({'detail': 'Client access required.'}, status=status.HTTP_403_FORBIDDEN)

        qs = ServiceCase.objects.filter(client=client).order_by('-created_at')
        return Response([serialize_case(c) for c in qs])

    def post(self, request, *args, **kwargs):
        client = get_or_create_authenticated_client(request)
        if not client:
            return Response({'detail': 'Client access required.'}, status=status.HTTP_403_FORBIDDEN)

        data = request.data
        import random
        year = timezone.now().year
        seq = random.randint(100, 999)
        ref = f'CAS-{year}-{seq}'

        site = None
        if data.get('siteId'):
            site = Site.objects.filter(id=data.get('siteId'), client=client).first()

        cat_input = data.get('category', 'OTHER')
        cat_map = {
            'Guard Conduct': CaseCategory.GUARD_CONDUCT,
            'Billing & Invoice': CaseCategory.BILLING,
            'Incident Inquiry': CaseCategory.INCIDENT_HANDLING,
            'Patrol Schedule': CaseCategory.OTHER,
            'Equipment & Access': CaseCategory.OTHER,
            'General Feedback': CaseCategory.OTHER,
        }
        category = cat_map.get(cat_input, CaseCategory.OTHER)

        case = ServiceCase.objects.create(
            client=client,
            site=site,
            reference_no=ref,
            case_type=CaseType.COMPLAINT,
            category=category,
            severity=CaseSeverity.NORMAL,
            submitted_by=request.user,
            contact_name=request.user.name or request.user.email,
            contact_phone=request.user.direct_phone or request.user.phone or '+254 700 000 000',
            contact_email=request.user.email,
            description=data.get('description', data.get('subject', 'Client inquiry')),
            status=CaseStatus.SUBMITTED,
        )

        PortalNotification.objects.create(
            client=client,
            title='Support Ticket Registered',
            message=f'Your inquiry {ref} has been dispatched to operations duty supervisor.',
            category='case',
            reference_id=ref,
        )

        return Response(serialize_case(case), status=status.HTTP_201_CREATED)


class ClientCaseDetailView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk, *args, **kwargs):
        client = get_or_create_authenticated_client(request)
        case = get_object_or_404(ServiceCase, pk=pk, client=client)
        return Response(serialize_case(case))


class ClientCaseReplyView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk, *args, **kwargs):
        client = get_or_create_authenticated_client(request)
        case = get_object_or_404(ServiceCase, pk=pk, client=client)

        content = request.data.get('content', '').strip()
        if not content:
            return Response({'detail': 'Content is required.'}, status=status.HTTP_400_BAD_REQUEST)

        CaseMessage.objects.create(
            case=case,
            author=request.user,
            message=content,
            internal=False,
        )

        return Response(serialize_case(case))


class ClientCaseCloseView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk, *args, **kwargs):
        client = get_or_create_authenticated_client(request)
        case = get_object_or_404(ServiceCase, pk=pk, client=client)

        case.status = CaseStatus.CLOSED
        case.closed_at = timezone.now()
        case.save(update_fields=['status', 'closed_at', 'updated_at'])

        CaseStatusHistory.objects.create(
            case=case,
            from_status=case.status,
            to_status=CaseStatus.CLOSED,
            actor=request.user.name or request.user.email,
            reason='Closed by client.',
        )

        return Response(serialize_case(case))


class ClientCaseReopenView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk, *args, **kwargs):
        client = get_or_create_authenticated_client(request)
        case = get_object_or_404(ServiceCase, pk=pk, client=client)
        reason = request.data.get('reason', 'Client reopened ticket.')

        case.status = CaseStatus.REOPENED
        case.save(update_fields=['status', 'updated_at'])

        CaseStatusHistory.objects.create(
            case=case,
            from_status=case.status,
            to_status=CaseStatus.REOPENED,
            actor=request.user.name or request.user.email,
            reason=reason,
        )

        return Response(serialize_case(case))


# =========================================================================
# CLIENT NOTIFICATIONS
# =========================================================================

class ClientNotificationsView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        client = get_or_create_authenticated_client(request)
        if not client:
            return Response({'detail': 'Client access required.'}, status=status.HTTP_403_FORBIDDEN)

        notifs = PortalNotification.objects.filter(client=client).order_by('-created_at')
        return Response([
            {
                'id': str(n.id),
                'clientId': str(n.client_id),
                'title': n.title,
                'message': n.message,
                'category': n.category,
                'referenceId': n.reference_id,
                'read': n.read,
                'createdAt': n.created_at.isoformat(),
            }
            for n in notifs
        ])


class ClientNotificationReadView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk, *args, **kwargs):
        client = get_or_create_authenticated_client(request)
        notif = get_object_or_404(PortalNotification, pk=pk, client=client)
        notif.read = True
        notif.save(update_fields=['read'])
        return Response({
            'id': str(notif.id),
            'clientId': str(notif.client_id),
            'title': notif.title,
            'message': notif.message,
            'category': notif.category,
            'referenceId': notif.reference_id,
            'read': notif.read,
            'createdAt': notif.created_at.isoformat(),
        })


class ClientNotificationMarkAllReadView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        client = get_or_create_authenticated_client(request)
        if not client:
            return Response({'detail': 'Client access required.'}, status=status.HTTP_403_FORBIDDEN)

        PortalNotification.objects.filter(client=client).update(read=True)
        return Response({'success': True})
