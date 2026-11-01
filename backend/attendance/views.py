from django.utils import timezone
from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import AttendanceRecord


class IsGuardEmployee(permissions.BasePermission):
    """Only authenticated users who have an employee_profile can access."""
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            hasattr(request.user, 'employee_profile')
        )


class GuardCheckInView(APIView):
    permission_classes = [IsGuardEmployee]

    def post(self, request):
        employee = request.user.employee_profile
        lat = request.data.get('lat')
        lng = request.data.get('lng')
        method = request.data.get('method', AttendanceRecord.Method.GPS)
        shift_reference = request.data.get('shift_reference', '')

        # Check if already checked in today (no check-out yet)
        today = timezone.now().date()
        existing = AttendanceRecord.objects.filter(
            employee=employee,
            check_in_at__date=today,
            check_out_at__isnull=True,
        ).first()
        if existing:
            return Response(
                {'error': 'Already checked in. Please check out first.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        record = AttendanceRecord.objects.create(
            employee=employee,
            shift_reference=shift_reference,
            check_in_at=timezone.now(),
            check_in_lat=lat,
            check_in_lng=lng,
            method=method,
            status=AttendanceRecord.Status.PRESENT,
        )

        return Response(_serialize_record(record), status=status.HTTP_201_CREATED)


class GuardCheckOutView(APIView):
    permission_classes = [IsGuardEmployee]

    def post(self, request):
        employee = request.user.employee_profile
        attendance_id = request.data.get('attendance_id')
        lat = request.data.get('lat')
        lng = request.data.get('lng')

        if not attendance_id:
            # Auto-find today's open record
            today = timezone.now().date()
            record = AttendanceRecord.objects.filter(
                employee=employee,
                check_in_at__date=today,
                check_out_at__isnull=True,
            ).first()
            if not record:
                return Response(
                    {'error': 'No active check-in found for today.'},
                    status=status.HTTP_404_NOT_FOUND,
                )
        else:
            try:
                record = AttendanceRecord.objects.get(id=attendance_id, employee=employee)
            except AttendanceRecord.DoesNotExist:
                return Response({'error': 'Attendance record not found.'}, status=status.HTTP_404_NOT_FOUND)

        if record.check_out_at:
            return Response({'error': 'Already checked out.'}, status=status.HTTP_400_BAD_REQUEST)

        record.check_out_at = timezone.now()
        record.check_out_lat = lat
        record.check_out_lng = lng
        record.save()

        return Response(_serialize_record(record))


class GuardAttendanceListView(APIView):
    permission_classes = [IsGuardEmployee]

    def get(self, request):
        employee = request.user.employee_profile
        records = AttendanceRecord.objects.filter(employee=employee).order_by('-check_in_at')[:50]
        return Response([_serialize_record(r) for r in records])


class GuardProfileView(APIView):
    permission_classes = [IsGuardEmployee]

    def get(self, request):
        user = request.user
        employee = user.employee_profile

        # Get assigned sites
        assignments = employee.site_assignments.select_related('site').all()
        sites = []
        for a in assignments:
            site = a.site
            sites.append({
                'id': str(site.id),
                'name': site.name,
                'address': site.address,
                'city': site.city,
                'latitude': site.latitude,
                'longitude': site.longitude,
                'geofence_radius_m': site.geofence_radius_m,
                'qr_code_token': site.qr_code_token_hash,
            })

        # Active check-in today
        today = timezone.now().date()
        active_record = AttendanceRecord.objects.filter(
            employee=employee,
            check_in_at__date=today,
            check_out_at__isnull=True,
        ).first()

        return Response({
            'id': str(employee.id),
            'employee_no': employee.employee_no,
            'name': user.name or user.email,
            'email': user.email,
            'phone': employee.phone,
            'photo': employee.photo,
            'status': employee.status,
            'hire_date': str(employee.hire_date) if employee.hire_date else None,
            'sites': sites,
            'active_check_in': _serialize_record(active_record) if active_record else None,
        })


class GuardShiftsView(APIView):
    """Returns the guard's site assignments as a schedule proxy (no Shift model exists yet)."""
    permission_classes = [IsGuardEmployee]

    def get(self, request):
        employee = request.user.employee_profile
        assignments = employee.site_assignments.select_related('site').all()

        shifts = []
        now = timezone.now()
        for a in assignments:
            site = a.site
            shifts.append({
                'id': str(a.id),
                'site_id': str(site.id),
                'site_name': site.name,
                'site_address': site.address,
                'date': now.strftime('%Y-%m-%d'),
                'start_time': '08:00',
                'end_time': '16:00',
                'role': 'Security Officer',
                'status': 'SCHEDULED',
                'qr_code_payload': site.qr_code_token_hash,
                'latitude': site.latitude,
                'longitude': site.longitude,
                'geofence_radius_m': site.geofence_radius_m,
            })

        return Response(shifts)


def _serialize_record(record):
    if record is None:
        return None
    return {
        'id': str(record.id),
        'shift_reference': record.shift_reference,
        'check_in_at': record.check_in_at.isoformat() if record.check_in_at else None,
        'check_in_lat': record.check_in_lat,
        'check_in_lng': record.check_in_lng,
        'check_out_at': record.check_out_at.isoformat() if record.check_out_at else None,
        'check_out_lat': record.check_out_lat,
        'check_out_lng': record.check_out_lng,
        'method': record.method,
        'status': record.status,
        'flagged': record.flagged,
        'flag_reason': record.flag_reason,
        'created_at': record.created_at.isoformat(),
    }
