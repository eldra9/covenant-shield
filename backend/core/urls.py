from django.urls import include, path

from .views import HealthView, DownloadApkView, AppDownloadInfoView
from .admin_views import AdminSyncView, AdminRequestActionView, AdminCaseActionView, AdminProvisionStaffView
from attendance.views import (
    GuardCheckInView, GuardCheckOutView,
    GuardAttendanceListView, GuardProfileView, GuardShiftsView,
)

urlpatterns = [
    path('health/', HealthView.as_view(), name='health'),
    path('auth/', include('accounts.urls')),
    path('client/', include('clients.urls')),
    path('service-requests/', include('service_requests.urls')),
    path('cases/', include('cases.urls')),
    # Admin Portal endpoints
    path('admin-portal/sync/', AdminSyncView.as_view(), name='admin-sync'),
    path('admin-portal/requests/<uuid:pk>/', AdminRequestActionView.as_view(), name='admin-request-action'),
    path('admin-portal/cases/<uuid:pk>/', AdminCaseActionView.as_view(), name='admin-case-action'),
    path('admin-portal/provision-staff/', AdminProvisionStaffView.as_view(), name='admin-provision-staff'),
    # Guard App endpoints
    path('guard/check-in/', GuardCheckInView.as_view(), name='guard-check-in'),
    path('guard/check-out/', GuardCheckOutView.as_view(), name='guard-check-out'),
    path('guard/attendance/', GuardAttendanceListView.as_view(), name='guard-attendance'),
    path('guard/profile/', GuardProfileView.as_view(), name='guard-profile'),
    path('guard/shifts/', GuardShiftsView.as_view(), name='guard-shifts'),
    # Downloadable App endpoints
    path('downloads/aegisguard.apk', DownloadApkView.as_view(), name='download-apk'),
    path('downloads/info/', AppDownloadInfoView.as_view(), name='download-info'),
]
