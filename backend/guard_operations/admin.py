from django.contrib import admin

from .models import (
    GuardLeaveRequest, GuardNotification, GuardSecurityReport, GuardShift,
    GuardShiftSwapRequest,
)


@admin.register(GuardShift)
class GuardShiftAdmin(admin.ModelAdmin):
    list_display = ('employee', 'site', 'starts_at', 'ends_at', 'status')
    list_filter = ('status', 'site')
    search_fields = ('employee__employee_no', 'employee__user__name', 'site__name')


@admin.register(GuardLeaveRequest)
class GuardLeaveRequestAdmin(admin.ModelAdmin):
    list_display = ('employee', 'leave_type', 'start_date', 'end_date', 'status', 'created_at')
    list_filter = ('status', 'leave_type')
    search_fields = ('employee__employee_no', 'employee__user__name')


@admin.register(GuardShiftSwapRequest)
class GuardShiftSwapRequestAdmin(admin.ModelAdmin):
    list_display = ('requester', 'target', 'shift', 'status', 'created_at')
    list_filter = ('status',)
    search_fields = ('requester__employee_no', 'target__employee_no')


@admin.register(GuardSecurityReport)
class GuardSecurityReportAdmin(admin.ModelAdmin):
    list_display = ('report_number', 'employee', 'site', 'severity', 'status', 'created_at')
    list_filter = ('severity', 'status', 'category')
    search_fields = ('report_number', 'employee__employee_no', 'title', 'description')


@admin.register(GuardNotification)
class GuardNotificationAdmin(admin.ModelAdmin):
    list_display = ('employee', 'title', 'category', 'read', 'created_at')
    list_filter = ('category', 'read')
    search_fields = ('employee__employee_no', 'title', 'message')
