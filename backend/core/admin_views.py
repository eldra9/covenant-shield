from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import permissions, status, views
from rest_framework.response import Response

from accounts.models import UserRole


class IsAdminRole(permissions.BasePermission):
    """
    Allows access only to authenticated users whose role is one of
    SUPER_ADMIN, OPERATIONS, or SUPERVISOR (i.e. admin-portal staff).
    Guards and Clients must not be able to reach admin endpoints.
    """
    ADMIN_ROLES = {UserRole.SUPER_ADMIN, UserRole.OPERATIONS, UserRole.SUPERVISOR}

    message = 'You do not have permission to access this admin endpoint.'

    def has_permission(self, request, view):
        return (
            request.user is not None
            and request.user.is_authenticated
            and request.user.role in self.ADMIN_ROLES
        )
from clients.models import Client
from sites.models import Site
from employees.models import Employee, EmployeeSiteAssignment
from attendance.models import AttendanceRecord
from service_requests.models import ServiceRequest
from cases.models import ServiceCase

User = get_user_model()


def serialize_admin_user(user: User):
    role_map = {
        UserRole.SUPER_ADMIN: 'super_admin',
        UserRole.OPERATIONS: 'operations_staff',
        UserRole.SUPERVISOR: 'supervisor',
        UserRole.GUARD: 'guard',
        UserRole.CLIENT: 'client',
        UserRole.VISITOR: 'operations_staff',
    }
    return {
        'id': str(user.id),
        'name': user.name or (user.username if user.username else user.email.split('@')[0].capitalize()),
        'email': user.email,
        'username': user.username or user.email,
        'role': role_map.get(user.role, 'super_admin'),
        'phone': user.phone or user.direct_phone or '+254 711 002 911',
        'isActive': user.is_active,
        'mustChangePassword': getattr(user, 'must_change_password', False),
        'createdAt': user.created_at.isoformat() if hasattr(user, 'created_at') and user.created_at else timezone.now().isoformat(),
        'lastLoginAt': user.last_login.isoformat() if user.last_login else None,
    }


def serialize_admin_client(client: Client):
    user = client.contact_user
    return {
        'id': str(client.id),
        'companyName': client.organization_name,
        'accountReference': f'CLI-{str(client.id)[:6].upper()}',
        'clientCode': f'CLI-{str(client.id)[:6].upper()}',
        'tier': client.contract_tier,
        'contactPerson': user.name if user and user.name else (user.email.split('@')[0].capitalize() if user else 'Authorized Representative'),
        'email': user.email if user else 'client@covenantshield.co.ke',
        'phone': client.primary_phone or (user.phone if user else '+254 700 000 000'),
        'industry': client.industry or 'Corporate & Commercial',
        'billingAddress': client.address or 'Nairobi, Kenya',
        'city': 'Nairobi',
        'activeContractsCount': 1,
        'status': 'active' if client.account_status == 'Active' else 'pending',
        'notes': f'Legal Name: {client.legal_name or client.organization_name}',
        'createdAt': client.created_at.isoformat() if client.created_at else timezone.now().isoformat(),
        'updatedAt': client.updated_at.isoformat() if client.updated_at else timezone.now().isoformat(),
    }


def serialize_admin_site(site: Site):
    return {
        'id': str(site.id),
        'siteCode': f'SIT-{str(site.id)[:4].upper()}',
        'name': site.name,
        'clientId': str(site.client_id),
        'clientName': site.client.organization_name if site.client else 'Commercial Facility',
        'address': site.address,
        'city': site.city or 'Nairobi',
        'coordinates': {
            'lat': site.latitude or -1.2921,
            'lng': site.longitude or 36.8219,
        },
        'contactPerson': site.supervisor.name if site.supervisor else 'Tactical Duty Officer',
        'contactPhone': site.supervisor.phone if site.supervisor and site.supervisor.phone else '+254 711 002 911',
        'status': 'active' if site.status == 'ACTIVE' else 'inactive',
        'operationalNotes': f'Geofence radius: {site.geofence_radius_m}m. Station code: SIT-{str(site.id)[:4].upper()}',
        'assignedSupervisorIds': [str(site.supervisor_id)] if site.supervisor_id else [],
        'requiredGuardCount': 3,
        'createdAt': site.created_at.isoformat() if site.created_at else timezone.now().isoformat(),
        'updatedAt': site.updated_at.isoformat() if site.updated_at else timezone.now().isoformat(),
    }


def serialize_admin_request(req: ServiceRequest):
    status_map = {
        'NEW': 'new',
        'UNDER_REVIEW': 'under_review',
        'ASSESSMENT_SCHEDULED': 'site_assessment_scheduled',
        'SITE_ASSESSMENT_SCHEDULED': 'site_assessment_scheduled',
        'QUOTATION_ISSUED': 'quotation_sent',
        'QUOTATION_SENT': 'quotation_sent',
        'ACCEPTED': 'accepted',
        'CONTRACT_ACTIVE': 'contract_active',
        'CANCELLED': 'cancelled',
        'REJECTED': 'rejected',
    }

    type_map = {
        'STATIC_GUARDING': 'armed_guarding',
        'Armed Static Guarding': 'armed_guarding',
        'MOBILE_PATROL': 'corporate_patrol',
        'ESCORT': 'vip_close_protection',
        'EVENT_SECURITY': 'event_security',
        'CLOSE_PROTECTION': 'vip_close_protection',
        'CCTV_MONITORING': 'cctv_monitoring',
    }

    latest_quote = req.quotations.order_by('-created_at').first()
    quote_amount = float(latest_quote.amount_kes) if latest_quote else None

    import json
    assigned_guards = []
    assigned_guard_ids = []
    if hasattr(req, 'assigned_guards_json') and req.assigned_guards_json:
        try:
            assigned_guards = json.loads(req.assigned_guards_json)
            assigned_guard_ids = [g.get('id') for g in assigned_guards if isinstance(g, dict) and g.get('id')]
        except Exception:
            assigned_guards = []
            assigned_guard_ids = []

    return {
        'id': str(req.id),
        'referenceNumber': req.reference_no,
        'requestCode': req.reference_no,
        'clientId': str(req.client_id) if req.client_id else None,
        'clientName': req.organization_name or (req.client.organization_name if req.client else 'Direct Commission'),
        'siteName': req.site_address,
        'contactName': req.full_name,
        'contactEmail': req.email,
        'contactPhone': req.phone,
        'serviceType': type_map.get(req.service_type, 'armed_guarding'),
        'siteAddress': req.site_address,
        'city': req.city,
        'requiredGuards': req.guards_needed or 2,
        'assignedGuardIds': assigned_guard_ids,
        'assignedGuards': assigned_guards,
        'startDate': req.start_date.isoformat() if req.start_date else timezone.now().date().isoformat(),
        'status': status_map.get(req.status, 'new'),
        'urgency': 'Urgent' if req.guards_needed and req.guards_needed > 5 else 'Standard',
        'quotationAmountKES': quote_amount,
        'statusHistory': [
            {
                'id': f'hist-{req.id}-0',
                'fromStatus': 'intake',
                'toStatus': status_map.get(req.status, 'new'),
                'reason': 'Commission intake received via client registry',
                'actorId': str(req.requester_user_id) if req.requester_user_id else 'system',
                'actorName': req.full_name or 'Intake System',
                'actorRole': 'client',
                'timestamp': req.created_at.isoformat() if req.created_at else timezone.now().isoformat(),
            }
        ],
        'internalNotes': [
            {
                'id': str(n.id),
                'authorId': str(n.author_id) if n.author_id else 'system',
                'authorName': n.author.name if n.author else 'Operations Desk',
                'authorRole': 'operations_staff',
                'content': n.note,
                'createdAt': n.created_at.isoformat(),
            }
            for n in req.notes.all()
        ],
        'clientMessages': [],
        'createdAt': req.created_at.isoformat() if req.created_at else timezone.now().isoformat(),
        'updatedAt': req.updated_at.isoformat() if req.updated_at else timezone.now().isoformat(),
    }


def serialize_admin_case(case: ServiceCase):
    status_map = {
        'NEW': 'submitted',
        'IN_PROGRESS': 'in_progress',
        'PENDING_CLIENT': 'in_progress',
        'RESOLVED': 'resolution_proposed',
        'CLOSED': 'closed',
    }

    severity_map = {
        'LOW': 'low',
        'MEDIUM': 'medium',
        'HIGH': 'high',
        'CRITICAL': 'critical',
    }

    type_map = {
        'GUARD_CONDUCT': 'guard_conduct',
        'PATROL_SCHEDULE': 'patrol_dispute',
        'INCIDENT_INQUIRY': 'security_incident',
        'BILLING_INVOICE': 'client_complaint',
        'EQUIPMENT_ACCESS': 'equipment_failure',
        'GENERAL_FEEDBACK': 'client_complaint',
    }

    return {
        'id': str(case.id),
        'caseNumber': case.reference_no,
        'caseCode': case.reference_no,
        'title': case.title,
        'type': type_map.get(case.case_type, 'security_incident'),
        'severity': severity_map.get(case.severity, 'medium'),
        'status': status_map.get(case.status, 'submitted'),
        'siteId': str(case.site_id) if case.site_id else '',
        'siteName': case.site.name if case.site else 'General Account Facility',
        'clientId': str(case.client_id) if case.client_id else '',
        'clientName': case.client.organization_name if case.client else 'Corporate Client',
        'reportedBy': case.contact_name or 'Client Representative',
        'dueDate': (case.created_at + timezone.timedelta(days=3)).date().isoformat() if case.created_at else timezone.now().date().isoformat(),
        'description': case.description,
        'internalNotes': [],
        'clientMessages': [
            {
                'id': str(m.id),
                'senderId': str(m.sender_id) if m.sender_id else 'client',
                'senderName': m.sender.name if m.sender else case.contact_name or 'Reporter',
                'senderRole': 'client' if not m.is_internal else 'operations_staff',
                'content': m.message,
                'isClientFacing': True,
                'createdAt': m.created_at.isoformat(),
            }
            for m in case.messages.filter(is_internal=False)
        ],
        'statusHistory': [],
        'createdAt': case.created_at.isoformat() if case.created_at else timezone.now().isoformat(),
        'updatedAt': case.updated_at.isoformat() if case.updated_at else timezone.now().isoformat(),
    }


# =========================================================================
# ADMIN API VIEWS
# =========================================================================

class AdminSyncView(views.APIView):
    """
    Returns full state directly from the database for the Admin Portal.
    Requires authenticated admin-portal staff (Super Admin, Operations, Supervisor).
    """
    permission_classes = [IsAdminRole]

    def get(self, request, *args, **kwargs):
        users_qs = User.objects.all().order_by('-created_at')
        clients_qs = Client.objects.all().order_by('-created_at')
        sites_qs = Site.objects.all().order_by('-created_at')
        requests_qs = ServiceRequest.objects.all().order_by('-created_at')
        cases_qs = ServiceCase.objects.all().order_by('-created_at')
        employees_qs = Employee.objects.select_related('user').all()

        employees_list = [
            {
                'id': str(emp.id),
                'employeeNumber': emp.employee_no,
                'badgeNumber': f'CS-BADGE-{str(emp.id)[:4].upper()}',
                'name': emp.user.name or emp.user.email.split('@')[0].capitalize(),
                'fullName': emp.user.name,
                'rank': 'Senior Tactical Sentry',
                'email': emp.user.email,
                'phone': emp.phone or emp.user.phone,
                'nationalIdMasked': '•••• ' + str(emp.employee_no)[-4:],
                'role': 'guard',
                'employmentStatus': 'active' if emp.status == 'ACTIVE' else 'suspended',
                'isAvailable': True if emp.status == 'ACTIVE' else False,
                'qualifications': ['PSRA Certified', 'Armed Escort', 'First Aid L2'],
                'assignedSiteIds': [str(a.site_id) for a in emp.site_assignments.all()],
                'dateHired': emp.hire_date.isoformat() if emp.hire_date else timezone.now().date().isoformat(),
                'emergencyContact': '+254 711 002 911 (CS Operations Desk)',
                'avatarUrl': emp.photo or '',
                'createdAt': emp.created_at.isoformat() if emp.created_at else timezone.now().isoformat(),
                'updatedAt': emp.updated_at.isoformat() if emp.updated_at else timezone.now().isoformat(),
            }
            for emp in employees_qs
        ]

        return Response({
            'users': [serialize_admin_user(u) for u in users_qs],
            'clients': [serialize_admin_client(c) for c in clients_qs],
            'sites': [serialize_admin_site(s) for s in sites_qs],
            'employees': employees_list,
            'shifts': [],
            'attendance': [],
            'requests': [serialize_admin_request(r) for r in requests_qs],
            'cases': [serialize_admin_case(c) for c in cases_qs],
            'auditLogs': [],
        })


class AdminRequestActionView(views.APIView):
    """
    Update request status or quotation directly in the database.
    Requires authenticated admin-portal staff.
    """
    permission_classes = [IsAdminRole]

    def patch(self, request, pk, *args, **kwargs):
        import json
        req = get_object_or_404(ServiceRequest, pk=pk)
        data = request.data
        if 'status' in data:
            status_map_rev = {
                'new': 'NEW',
                'under_review': 'UNDER_REVIEW',
                'site_assessment_scheduled': 'SITE_ASSESSMENT_SCHEDULED',
                'quotation_sent': 'QUOTATION_SENT',
                'accepted': 'ACCEPTED',
                'contract_active': 'CONTRACT_ACTIVE',
                'cancelled': 'CANCELLED',
                'rejected': 'REJECTED',
            }
            new_status = status_map_rev.get(data['status'], req.status)
            req.status = new_status
        if 'quotationAmountKES' in data:
            req.quote_amount = data['quotationAmountKES']
        if 'assignedGuards' in data:
            req.assigned_guards_json = json.dumps(data['assignedGuards'])
        elif 'assignedGuardIds' in data:
            # resolve guard details from Employee model
            from employees.models import Employee
            emps = Employee.objects.filter(id__in=data['assignedGuardIds']).select_related('user')
            guards_payload = [
                {
                    'id': str(emp.id),
                    'name': emp.user.name or emp.user.email.split('@')[0].capitalize(),
                    'badgeNumber': f'CS-BADGE-{str(emp.id)[:4].upper()}',
                    'phone': emp.phone or emp.user.phone,
                    'rank': 'Tactical Sentry',
                }
                for emp in emps
            ]
            req.assigned_guards_json = json.dumps(guards_payload)
        req.save()
        return Response(serialize_admin_request(req))


class AdminCaseActionView(views.APIView):
    """
    Update case status or notes directly in the database.
    Requires authenticated admin-portal staff.
    """
    permission_classes = [IsAdminRole]

    def patch(self, request, pk, *args, **kwargs):
        case = get_object_or_404(ServiceCase, pk=pk)
        data = request.data
        if 'status' in data:
            status_map_rev = {
                'submitted': 'NEW',
                'in_progress': 'IN_PROGRESS',
                'resolution_proposed': 'RESOLVED',
                'closed': 'CLOSED',
            }
            new_status = status_map_rev.get(data['status'], case.status)
            case.status = new_status
        case.save()
        return Response(serialize_admin_case(case))


class AdminProvisionStaffView(views.APIView):
    """
    Provision a new Operations Staff or Supervisor user with a username and temporary password.
    Only Super Admin may call this endpoint.
    """
    permission_classes = [IsAdminRole]

    def post(self, request, *args, **kwargs):
        import secrets
        import string
        data = request.data
        name = (data.get('name') or '').strip()
        role_input = (data.get('role') or 'operations_staff').strip().lower()
        custom_username = (data.get('username') or '').strip()
        custom_password = (data.get('temporaryPassword') or data.get('password') or '').strip()
        phone = (data.get('phone') or '').strip()
        email = (data.get('email') or '').strip()

        if not name:
            return Response({'detail': 'Full Name is required.'}, status=status.HTTP_400_BAD_REQUEST)

        # Generate username if not provided
        if not custom_username:
            base_slug = ''.join(c for c in name.lower().replace(' ', '.') if c.isalnum() or c == '.')
            rnd_num = secrets.randbelow(900) + 100
            custom_username = f"{base_slug}{rnd_num}"

        # Generate temporary password if not provided
        if not custom_password:
            alphabet = string.ascii_letters + string.digits
            rand_chars = ''.join(secrets.choice(alphabet) for _ in range(6))
            custom_password = f"CS-{rand_chars}!"

        # Generate corporate email if not provided
        if not email:
            email_slug = ''.join(c for c in custom_username if c.isalnum() or c in '._-')
            email = f"{email_slug}@covenantshield.co.ke"

        # Check existing username or email
        if User.objects.filter(username__iexact=custom_username).exists():
            custom_username = f"{custom_username}{secrets.randbelow(90) + 10}"

        if User.objects.filter(email__iexact=email).exists():
            email_parts = email.split('@')
            email = f"{email_parts[0]}_{secrets.randbelow(90) + 10}@{email_parts[1]}"

        # Map role
        target_role = UserRole.OPERATIONS
        if 'supervisor' in role_input:
            target_role = UserRole.SUPERVISOR

        user = User(
            name=name,
            username=custom_username,
            email=email,
            phone=phone,
            role=target_role,
            must_change_password=True,
            is_staff=True,
            status='ACTIVE',
        )
        user.set_password(custom_password)
        user.save()

        # If supervisor, ensure Employee record is created
        if target_role == UserRole.SUPERVISOR:
            Employee.objects.get_or_create(
                user=user,
                defaults={
                    'phone': phone or '+254 711 002 911',
                    'status': 'ACTIVE',
                }
            )

        return Response({
            'message': 'Staff user provisioned successfully.',
            'user': serialize_admin_user(user),
            'username': custom_username,
            'temporaryPassword': custom_password,
            'email': email,
            'role': role_input,
        }, status=status.HTTP_201_CREATED)

