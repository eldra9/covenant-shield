import hashlib
import hmac
import math
import uuid
from datetime import timedelta

from django.db import transaction
from django.utils import timezone
from rest_framework import permissions, status, views
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response

from attendance.models import AttendanceAttempt, AttendanceRecord
from employees.models import Employee, EmployeeSiteAssignment
from sites.models import Site
from .models import (
    GuardLeaveRequest, GuardNotification, GuardSecurityReport, GuardShift,
    GuardShiftSwapRequest,
)
from .serializers import (
    CheckInSerializer, CheckOutSerializer, GuardAttendanceSerializer,
    AttendanceReviewSerializer,
    GuardLeaveSerializer, GuardNotificationSerializer,
    GuardReportSerializer, GuardShiftSerializer, GuardSiteSerializer,
    GuardSwapSerializer, GuardProfileSerializer, LeaveCreateSerializer, ReportCreateSerializer,
    SwapCreateSerializer, employee_for_user,
)


class GuardApiView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_employee(self, request):
        if request.user.role != 'GUARD':
            return None, Response({'detail': 'Guard access is required.'}, status=status.HTTP_403_FORBIDDEN)
        try:
            return employee_for_user(request.user), None
        except ValidationError as exc:
            return None, Response({'detail': exc.detail}, status=status.HTTP_403_FORBIDDEN)


def employee_sites(employee):
    assigned = Site.objects.filter(
        employee_assignments__employee=employee,
        status=Site.SiteStatus.ACTIVE,
    )
    scheduled = Site.objects.filter(guard_shifts__employee=employee, guard_shifts__status=GuardShift.Status.CONFIRMED)
    return (assigned | scheduled).distinct()


def distance_meters(lat1, lng1, lat2, lng2):
    radius = 6_371_000
    lat1, lng1, lat2, lng2 = map(math.radians, (lat1, lng1, lat2, lng2))
    delta_lat = lat2 - lat1
    delta_lng = lng2 - lng1
    value = math.sin(delta_lat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(delta_lng / 2) ** 2
    return radius * 2 * math.atan2(math.sqrt(value), math.sqrt(1 - value))


def qr_matches(site, token):
    stored = site.qr_code_token_hash
    if not stored:
        return False
    digest = hashlib.sha256(token.encode()).hexdigest()
    return hmac.compare_digest(stored, digest)


def create_guard_notification(employee, title, message, category, reference_id=''):
    return GuardNotification.objects.create(
        employee=employee,
        title=title,
        message=message,
        category=category,
        reference_id=str(reference_id),
    )


class GuardProfileView(GuardApiView):
    def get(self, request):
        employee, error = self.get_employee(request)
        if error:
            return error
        return Response({
            'id': str(employee.id),
            'employee_id': employee.employee_no,
            'name': request.user.name or request.user.email,
            'email': request.user.email,
            'phone': employee.phone or request.user.phone,
            'role': request.user.role,
            'status': request.user.status,
        })

    def patch(self, request):
        employee, error = self.get_employee(request)
        if error:
            return error
        serializer = GuardProfileSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        if 'name' in serializer.validated_data:
            request.user.name = serializer.validated_data['name']
            request.user.save(update_fields=['name', 'updated_at'])
        if 'phone' in serializer.validated_data:
            employee.phone = serializer.validated_data['phone']
            employee.save(update_fields=['phone', 'updated_at'])
            request.user.phone = serializer.validated_data['phone']
            request.user.save(update_fields=['phone', 'updated_at'])
        return self.get(request)


class GuardDashboardView(GuardApiView):
    def get(self, request):
        employee, error = self.get_employee(request)
        if error:
            return error

        shifts = GuardShift.objects.filter(employee=employee, status=GuardShift.Status.CONFIRMED).select_related('site')
        attendance = AttendanceRecord.objects.filter(employee=employee).select_related('employee__user')
        leaves = GuardLeaveRequest.objects.filter(employee=employee)
        swaps = GuardShiftSwapRequest.objects.filter(requester=employee).select_related(
            'requester__user', 'target__user', 'shift__site', 'shift',
        )
        reports = GuardSecurityReport.objects.filter(employee=employee).select_related('employee__user', 'site')
        notifications = GuardNotification.objects.filter(employee=employee)
        sites = employee_sites(employee)

        return Response({
            'employee': {
                'id': str(employee.id),
                'employee_id': employee.employee_no,
                'name': request.user.name or request.user.email,
                'email': request.user.email,
                'phone': employee.phone or request.user.phone,
                'role': request.user.role,
                'status': request.user.status,
            },
            'shifts': GuardShiftSerializer(shifts, many=True).data,
            'sites': GuardSiteSerializer(sites, many=True).data,
            'attendance': GuardAttendanceSerializer(attendance, many=True).data,
            'leave_requests': GuardLeaveSerializer(leaves, many=True).data,
            'shift_swaps': GuardSwapSerializer(swaps, many=True).data,
            'reports': GuardReportSerializer(reports, many=True).data,
            'notifications': GuardNotificationSerializer(notifications, many=True).data,
            'peer_guards': [
                {
                    'id': str(peer.id),
                    'employee_no': peer.employee_no,
                    'name': peer.user.name or peer.user.email,
                    'email': peer.user.email,
                    'phone': peer.phone or peer.user.phone,
                }
                for peer in Employee.objects.filter(
                    status=Employee.EmployeeStatus.ACTIVE,
                    user__role='GUARD',
                    user__status='ACTIVE',
                ).select_related('user').exclude(pk=employee.pk)
            ],
        })


class GuardShiftsView(GuardApiView):
    def get(self, request):
        employee, error = self.get_employee(request)
        if error:
            return error
        shifts = GuardShift.objects.filter(employee=employee).exclude(
            status=GuardShift.Status.CANCELLED,
        ).select_related('site')
        return Response(GuardShiftSerializer(shifts, many=True).data)


class GuardAttendanceView(GuardApiView):
    def get(self, request):
        employee, error = self.get_employee(request)
        if error:
            return error
        records = AttendanceRecord.objects.filter(employee=employee).select_related('employee__user')
        return Response(GuardAttendanceSerializer(records, many=True).data)


class GuardCheckInView(GuardApiView):
    def post(self, request):
        employee, error = self.get_employee(request)
        if error:
            return error
        serializer = CheckInSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payload = serializer.validated_data

        try:
            shift = GuardShift.objects.select_related('site').get(
                pk=payload['shift_id'],
                employee=employee,
                status=GuardShift.Status.CONFIRMED,
            )
        except GuardShift.DoesNotExist:
            return Response({'detail': 'Assigned shift was not found or is no longer active.'}, status=status.HTTP_404_NOT_FOUND)

        site = shift.site
        if site.latitude is None or site.longitude is None:
            return Response({'detail': 'Site location is not configured. Contact Operations.'}, status=status.HTTP_409_CONFLICT)
        if payload['accuracy_m'] > 50:
            reason = 'GPS accuracy exceeds the allowed 50 meter limit.'
            accepted = False
            distance = None
        else:
            distance = distance_meters(payload['latitude'], payload['longitude'], site.latitude, site.longitude)
            accepted = distance <= site.geofence_radius_m and qr_matches(site, payload['qr_token'])
            reason = '' if accepted else (
                'You are outside the site geofence.' if distance > site.geofence_radius_m
                else 'QR code is not valid for this site.'
            )

        existing_record = AttendanceRecord.objects.filter(
            employee=employee,
            shift_reference=str(shift.id),
        ).first()
        duplicate = existing_record is not None
        if existing_record:
            accepted = False
            reason = 'Attendance for this shift has already been checked in.'

        AttendanceAttempt.objects.create(
            employee=employee,
            shift_reference=str(shift.id),
            submitted_lat=payload['latitude'],
            submitted_lng=payload['longitude'],
            server_distance_m=distance,
            gps_accuracy_m=payload['accuracy_m'],
            qr_valid=qr_matches(site, payload['qr_token']),
            accepted=accepted,
            rejection_reason=reason,
        )
        if not accepted:
            return Response({
                'detail': reason,
                'distance_m': distance,
                'allowed_radius_m': site.geofence_radius_m,
                'accuracy_m': payload['accuracy_m'],
            }, status=status.HTTP_409_CONFLICT if duplicate else status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            record = AttendanceRecord.objects.create(
                employee=employee,
                shift_reference=str(shift.id),
                check_in_at=timezone.now(),
                check_in_lat=payload['latitude'],
                check_in_lng=payload['longitude'],
                check_in_accuracy_m=payload['accuracy_m'],
                method=AttendanceRecord.Method.GPS,
                status=AttendanceRecord.Status.PRESENT,
            )
            if record.check_in_at > shift.starts_at + timedelta(minutes=15):
                record.status = AttendanceRecord.Status.LATE
                record.save(update_fields=['status', 'updated_at'])

        create_guard_notification(
            employee,
            'Check-in recorded',
            f'Your check-in at {site.name} was recorded by the server.',
            'ATTENDANCE_CONFIRMED',
            record.pk,
        )
        return Response(GuardAttendanceSerializer(record).data, status=status.HTTP_201_CREATED)


class GuardCheckOutView(GuardApiView):
    def post(self, request, record_id):
        employee, error = self.get_employee(request)
        if error:
            return error
        serializer = CheckOutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payload = serializer.validated_data
        try:
            record = AttendanceRecord.objects.select_related('employee__user').get(
                pk=record_id,
                employee=employee,
                check_in_at__isnull=False,
                check_out_at__isnull=True,
            )
            shift = GuardShift.objects.select_related('site').get(pk=record.shift_reference, employee=employee)
        except (AttendanceRecord.DoesNotExist, GuardShift.DoesNotExist):
            return Response({'detail': 'An active attendance record was not found.'}, status=status.HTTP_404_NOT_FOUND)

        site = shift.site
        if site.latitude is None or site.longitude is None:
            return Response({'detail': 'Site location is not configured. Contact Operations.'}, status=status.HTTP_409_CONFLICT)
        distance = distance_meters(payload['latitude'], payload['longitude'], site.latitude, site.longitude)
        if payload['accuracy_m'] > 50:
            reason = 'GPS accuracy exceeds the allowed 50 meter limit.'
        elif distance > site.geofence_radius_m:
            reason = 'You are outside the site geofence.'
        elif not qr_matches(site, payload['qr_token']):
            reason = 'QR code is not valid for this site.'
        else:
            reason = ''
        if reason:
            return Response({'detail': reason, 'distance_m': distance, 'allowed_radius_m': site.geofence_radius_m}, status=status.HTTP_400_BAD_REQUEST)

        record.check_out_at = timezone.now()
        record.check_out_lat = payload['latitude']
        record.check_out_lng = payload['longitude']
        record.check_out_accuracy_m = payload['accuracy_m']
        record.save(update_fields=['check_out_at', 'check_out_lat', 'check_out_lng', 'check_out_accuracy_m', 'updated_at'])
        if record.check_out_at < shift.ends_at:
            record.status = AttendanceRecord.Status.LEFT_EARLY
            record.flagged = True
            record.flag_reason = 'Checked out before scheduled shift end.'
            record.save(update_fields=['status', 'flagged', 'flag_reason', 'updated_at'])
        create_guard_notification(
            employee,
            'Check-out recorded',
            f'Your check-out at {site.name} was recorded by the server.',
            'ATTENDANCE_CONFIRMED',
            record.pk,
        )
        return Response(GuardAttendanceSerializer(record).data)


class GuardAttendanceReviewView(GuardApiView):
    def post(self, request, record_id):
        employee, error = self.get_employee(request)
        if error:
            return error
        serializer = AttendanceReviewSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            record = AttendanceRecord.objects.get(pk=record_id, employee=employee)
        except AttendanceRecord.DoesNotExist:
            return Response({'detail': 'Attendance record not found.'}, status=status.HTTP_404_NOT_FOUND)
        record.flagged = True
        record.flag_reason = serializer.validated_data['notes']
        record.save(update_fields=['flagged', 'flag_reason', 'updated_at'])
        return Response(GuardAttendanceSerializer(record).data)


class GuardLeaveRequestsView(GuardApiView):
    def get(self, request):
        employee, error = self.get_employee(request)
        if error:
            return error
        return Response(GuardLeaveSerializer(
            GuardLeaveRequest.objects.filter(employee=employee), many=True,
        ).data)

    def post(self, request):
        employee, error = self.get_employee(request)
        if error:
            return error
        serializer = LeaveCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        leave = serializer.save(employee=employee)
        create_guard_notification(employee, 'Leave request submitted', 'Your leave request is awaiting review.', 'LEAVE_STATUS', leave.pk)
        return Response(GuardLeaveSerializer(leave).data, status=status.HTTP_201_CREATED)


class GuardShiftSwapsView(GuardApiView):
    def get(self, request):
        employee, error = self.get_employee(request)
        if error:
            return error
        swaps = GuardShiftSwapRequest.objects.filter(requester=employee).select_related(
            'requester__user', 'target__user', 'shift__site', 'shift',
        )
        return Response(GuardSwapSerializer(swaps, many=True).data)

    def post(self, request):
        employee, error = self.get_employee(request)
        if error:
            return error
        serializer = SwapCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payload = serializer.validated_data
        try:
            shift = GuardShift.objects.get(pk=payload['shift_id'], employee=employee, status=GuardShift.Status.CONFIRMED)
            target = Employee.objects.select_related('user').get(
                pk=payload['target_guard_id'],
                status=Employee.EmployeeStatus.ACTIVE,
                user__role='GUARD',
            )
        except (GuardShift.DoesNotExist, Employee.DoesNotExist):
            return Response({'detail': 'The shift or target guard is unavailable.'}, status=status.HTTP_404_NOT_FOUND)
        if target == employee:
            return Response({'detail': 'You cannot request a shift swap with yourself.'}, status=status.HTTP_400_BAD_REQUEST)
        swap = GuardShiftSwapRequest.objects.create(
            requester=employee,
            target=target,
            shift=shift,
            reason=payload['reason'],
        )
        create_guard_notification(target, 'Shift swap request', f'{employee.user.name} requested a shift swap.', 'SWAP_STATUS', swap.pk)
        return Response(GuardSwapSerializer(swap).data, status=status.HTTP_201_CREATED)


class GuardReportsView(GuardApiView):
    def get(self, request):
        employee, error = self.get_employee(request)
        if error:
            return error
        reports = GuardSecurityReport.objects.filter(employee=employee).select_related('employee__user', 'site')
        return Response(GuardReportSerializer(reports, many=True).data)

    def post(self, request):
        employee, error = self.get_employee(request)
        if error:
            return error
        serializer = ReportCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        site = serializer.validated_data['site']
        if not employee_sites(employee).filter(pk=site.pk).exists():
            return Response({'detail': 'You are not assigned to this site.'}, status=status.HTTP_403_FORBIDDEN)
        report_number = f'CSR-{uuid.uuid4().hex[:10].upper()}'
        report = serializer.save(employee=employee, report_number=report_number)
        create_guard_notification(employee, 'Occurrence report submitted', f'Report {report_number} was submitted.', 'REPORT_CONFIRMATION', report.pk)
        return Response(GuardReportSerializer(report).data, status=status.HTTP_201_CREATED)


class GuardNotificationsView(GuardApiView):
    def get(self, request):
        employee, error = self.get_employee(request)
        if error:
            return error
        notifications = GuardNotification.objects.filter(employee=employee)
        return Response(GuardNotificationSerializer(notifications, many=True).data)

    def patch(self, request):
        employee, error = self.get_employee(request)
        if error:
            return error
        GuardNotification.objects.filter(employee=employee, read=False).update(read=True)
        return Response({'updated': True})


class GuardNotificationReadView(GuardApiView):
    def post(self, request, notification_id):
        employee, error = self.get_employee(request)
        if error:
            return error
        updated = GuardNotification.objects.filter(employee=employee, pk=notification_id).update(read=True)
        if not updated:
            return Response({'detail': 'Notification not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response({'updated': True})
