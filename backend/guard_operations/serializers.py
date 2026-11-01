from rest_framework import serializers

from django.utils import timezone
from zoneinfo import ZoneInfo
import uuid

from attendance.models import AttendanceRecord
from employees.models import Employee
from sites.models import Site
from .models import GuardLeaveRequest, GuardNotification, GuardSecurityReport, GuardShift, GuardShiftSwapRequest


class GuardSiteSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source='client.organization_name', read_only=True)
    geofence_radius_meters = serializers.IntegerField(source='geofence_radius_m', read_only=True)

    class Meta:
        model = Site
        fields = (
            'id', 'name', 'address', 'city', 'latitude', 'longitude',
            'geofence_radius_meters', 'client_name',
        )


class GuardShiftSerializer(serializers.ModelSerializer):
    guard_id = serializers.CharField(source='employee.id', read_only=True)
    site_id = serializers.CharField(source='site.id', read_only=True)
    site_name = serializers.CharField(source='site.name', read_only=True)
    site_address = serializers.CharField(source='site.address', read_only=True)
    shift_date = serializers.SerializerMethodField()
    start_time = serializers.SerializerMethodField()
    end_time = serializers.SerializerMethodField()
    scheduled_start_at = serializers.DateTimeField(source='starts_at', read_only=True)
    scheduled_end_at = serializers.DateTimeField(source='ends_at', read_only=True)
    scheduled_start_utc_millis = serializers.SerializerMethodField()
    scheduled_end_utc_millis = serializers.SerializerMethodField()
    assignment_status = serializers.CharField(source='status', read_only=True)

    class Meta:
        model = GuardShift
        fields = (
            'id', 'guard_id', 'site_id', 'site_name', 'site_address',
            'shift_date', 'start_time', 'end_time', 'scheduled_start_at',
            'scheduled_end_at', 'scheduled_start_utc_millis',
            'scheduled_end_utc_millis', 'instructions', 'assignment_status',
        )

    def get_local_start(self, obj):
        return timezone.localtime(obj.starts_at, ZoneInfo('Africa/Addis_Ababa'))

    def get_shift_date(self, obj):
        return self.get_local_start(obj).date()

    def get_start_time(self, obj):
        return self.get_local_start(obj).strftime('%H:%M')

    def get_end_time(self, obj):
        return timezone.localtime(obj.ends_at, ZoneInfo('Africa/Addis_Ababa')).strftime('%H:%M')

    def get_scheduled_start_utc_millis(self, obj):
        return int(obj.starts_at.timestamp() * 1000)

    def get_scheduled_end_utc_millis(self, obj):
        return int(obj.ends_at.timestamp() * 1000)


class GuardAttendanceSerializer(serializers.ModelSerializer):
    guard_id = serializers.CharField(source='employee.id', read_only=True)
    guard_name = serializers.CharField(source='employee.user.name', read_only=True)
    employee_no = serializers.CharField(source='employee.employee_no', read_only=True)
    shift_id = serializers.CharField(source='shift_reference', read_only=True)
    site_id = serializers.SerializerMethodField()
    site_name = serializers.SerializerMethodField()
    shift_date = serializers.SerializerMethodField()
    scheduled_start_time = serializers.SerializerMethodField()
    scheduled_end_time = serializers.SerializerMethodField()
    check_in_time = serializers.DateTimeField(source='check_in_at', read_only=True)
    check_out_time = serializers.DateTimeField(source='check_out_at', read_only=True)
    check_in_accuracy = serializers.FloatField(source='check_in_accuracy_m', read_only=True)
    check_out_accuracy = serializers.FloatField(source='check_out_accuracy_m', read_only=True)

    class Meta:
        model = AttendanceRecord
        fields = (
            'id', 'guard_id', 'guard_name', 'employee_no', 'shift_id',
            'site_id', 'site_name', 'shift_date', 'scheduled_start_time',
            'scheduled_end_time', 'check_in_time', 'check_in_lat', 'check_in_lng',
            'check_in_accuracy', 'check_out_time', 'check_out_lat', 'check_out_lng',
            'check_out_accuracy', 'method', 'status', 'flagged', 'flag_reason',
        )

    def get_shift(self, obj):
        try:
            shift_id = uuid.UUID(obj.shift_reference)
        except (ValueError, TypeError, AttributeError):
            return None
        return GuardShift.objects.select_related('site').filter(pk=shift_id).first()

    def get_site_id(self, obj):
        shift = self.get_shift(obj)
        return str(shift.site_id) if shift else ''

    def get_site_name(self, obj):
        shift = self.get_shift(obj)
        return shift.site.name if shift else ''

    def get_shift_date(self, obj):
        shift = self.get_shift(obj)
        if shift:
            return timezone.localtime(shift.starts_at, ZoneInfo('Africa/Addis_Ababa')).date()
        return timezone.localtime(obj.check_in_at, ZoneInfo('Africa/Addis_Ababa')).date() if obj.check_in_at else None

    def get_scheduled_start_time(self, obj):
        shift = self.get_shift(obj)
        return timezone.localtime(shift.starts_at, ZoneInfo('Africa/Addis_Ababa')).strftime('%H:%M') if shift else ''

    def get_scheduled_end_time(self, obj):
        shift = self.get_shift(obj)
        return timezone.localtime(shift.ends_at, ZoneInfo('Africa/Addis_Ababa')).strftime('%H:%M') if shift else ''


class GuardLeaveSerializer(serializers.ModelSerializer):
    guard_id = serializers.CharField(source='employee.id', read_only=True)
    guard_name = serializers.CharField(source='employee.user.name', read_only=True)
    leave_type = serializers.CharField()
    submitted_at = serializers.DateTimeField(source='created_at', read_only=True)

    class Meta:
        model = GuardLeaveRequest
        fields = (
            'id', 'guard_id', 'guard_name', 'leave_type', 'start_date',
            'end_date', 'reason', 'status', 'supervisor_comment', 'submitted_at',
        )
        read_only_fields = ('status', 'supervisor_comment')


class GuardSwapSerializer(serializers.ModelSerializer):
    requester_guard_id = serializers.CharField(source='requester.id', read_only=True)
    requester_guard_name = serializers.CharField(source='requester.user.name', read_only=True)
    target_guard_id = serializers.CharField(source='target.id', read_only=True)
    target_guard_name = serializers.CharField(source='target.user.name', read_only=True)
    shift_id = serializers.CharField(source='shift.id', read_only=True)
    shift_date = serializers.SerializerMethodField()
    shift_time = serializers.SerializerMethodField()
    site_name = serializers.CharField(source='shift.site.name', read_only=True)
    submitted_at = serializers.DateTimeField(source='created_at', read_only=True)

    class Meta:
        model = GuardShiftSwapRequest
        fields = (
            'id', 'requester_guard_id', 'requester_guard_name', 'target_guard_id',
            'target_guard_name', 'shift_id', 'shift_date', 'shift_time',
            'site_name', 'reason', 'status', 'supervisor_comment', 'submitted_at',
        )
        read_only_fields = ('status', 'supervisor_comment')

    def get_shift_time(self, obj):
        start = timezone.localtime(obj.shift.starts_at, ZoneInfo('Africa/Addis_Ababa'))
        end = timezone.localtime(obj.shift.ends_at, ZoneInfo('Africa/Addis_Ababa'))
        return f'{start:%H:%M} - {end:%H:%M}'

    def get_shift_date(self, obj):
        return timezone.localtime(obj.shift.starts_at, ZoneInfo('Africa/Addis_Ababa')).date()


class GuardReportSerializer(serializers.ModelSerializer):
    guard_id = serializers.CharField(source='employee.id', read_only=True)
    guard_name = serializers.CharField(source='employee.user.name', read_only=True)
    badge_number = serializers.CharField(source='employee.employee_no', read_only=True)
    site_id = serializers.CharField(source='site.id', read_only=True)
    site_name = serializers.CharField(source='site.name', read_only=True)
    location_specific = serializers.CharField(source='location', required=False, allow_blank=True)
    witness_or_personnel = serializers.CharField(source='witness', required=False, allow_blank=True)
    timestamp = serializers.DateTimeField(source='created_at', read_only=True)

    class Meta:
        model = GuardSecurityReport
        fields = (
            'id', 'report_number', 'guard_id', 'guard_name', 'badge_number',
            'site_id', 'site_name', 'category', 'severity', 'title',
            'description', 'location_specific', 'action_taken',
            'witness_or_personnel', 'latitude', 'longitude', 'status',
            'resolution_notes', 'timestamp',
        )
        read_only_fields = ('report_number', 'status', 'resolution_notes')


class GuardNotificationSerializer(serializers.ModelSerializer):
    guard_id = serializers.CharField(source='employee.id', read_only=True)
    timestamp = serializers.DateTimeField(source='created_at', read_only=True)
    is_read = serializers.BooleanField(source='read', read_only=True)
    type = serializers.CharField(source='category', read_only=True)

    class Meta:
        model = GuardNotification
        fields = ('id', 'guard_id', 'title', 'message', 'timestamp', 'is_read', 'type', 'reference_id')
        read_only_fields = fields


class CheckInSerializer(serializers.Serializer):
    shift_id = serializers.UUIDField()
    latitude = serializers.FloatField(min_value=-90, max_value=90)
    longitude = serializers.FloatField(min_value=-180, max_value=180)
    accuracy_m = serializers.FloatField(min_value=0)
    qr_token = serializers.CharField(trim_whitespace=False)


class CheckOutSerializer(serializers.Serializer):
    latitude = serializers.FloatField(min_value=-90, max_value=90)
    longitude = serializers.FloatField(min_value=-180, max_value=180)
    accuracy_m = serializers.FloatField(min_value=0)
    qr_token = serializers.CharField(trim_whitespace=False)


class LeaveCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = GuardLeaveRequest
        fields = ('leave_type', 'start_date', 'end_date', 'reason')

    def validate(self, attrs):
        if attrs['end_date'] < attrs['start_date']:
            raise serializers.ValidationError({'end_date': 'End date cannot be before start date.'})
        if not attrs['reason'].strip():
            raise serializers.ValidationError({'reason': 'A reason is required.'})
        return attrs


class SwapCreateSerializer(serializers.Serializer):
    shift_id = serializers.UUIDField()
    target_guard_id = serializers.UUIDField()
    reason = serializers.CharField()


class AttendanceReviewSerializer(serializers.Serializer):
    notes = serializers.CharField()

    def validate_notes(self, value):
        if not value.strip():
            raise serializers.ValidationError('Please explain the attendance discrepancy.')
        return value


class GuardProfileSerializer(serializers.Serializer):
    name = serializers.CharField(required=False, max_length=255)
    phone = serializers.CharField(required=False, allow_blank=True, max_length=30)


class ReportCreateSerializer(serializers.ModelSerializer):
    location_specific = serializers.CharField(source='location', required=False, allow_blank=True)
    witness_or_personnel = serializers.CharField(source='witness', required=False, allow_blank=True)

    class Meta:
        model = GuardSecurityReport
        fields = (
            'site', 'category', 'severity', 'title', 'description',
            'location_specific', 'action_taken', 'witness_or_personnel',
            'latitude', 'longitude',
        )

    def validate(self, attrs):
        if not attrs.get('title', '').strip() or not attrs.get('description', '').strip():
            raise serializers.ValidationError('A title and description are required.')
        return attrs


def employee_for_user(user) -> Employee:
    try:
        employee = Employee.objects.select_related('user').get(user=user, status=Employee.EmployeeStatus.ACTIVE)
    except Employee.DoesNotExist as exc:
        raise serializers.ValidationError('Active employee profile is not configured for this account.') from exc
    return employee
