from django.urls import path

from .views import (
    GuardAttendanceReviewView, GuardAttendanceView, GuardCheckInView, GuardCheckOutView, GuardDashboardView,
    GuardProfileView,
    GuardLeaveRequestsView, GuardNotificationsView, GuardNotificationReadView,
    GuardReportsView, GuardShiftsView, GuardShiftSwapsView,
)

urlpatterns = [
    path('dashboard/', GuardDashboardView.as_view(), name='guard-dashboard'),
    path('profile/', GuardProfileView.as_view(), name='guard-profile'),
    path('shifts/', GuardShiftsView.as_view(), name='guard-shifts'),
    path('attendance/', GuardAttendanceView.as_view(), name='guard-attendance'),
    path('attendance/check-in/', GuardCheckInView.as_view(), name='guard-check-in'),
    path('attendance/<uuid:record_id>/check-out/', GuardCheckOutView.as_view(), name='guard-check-out'),
    path('attendance/<uuid:record_id>/review-request/', GuardAttendanceReviewView.as_view(), name='guard-attendance-review'),
    path('leave-requests/', GuardLeaveRequestsView.as_view(), name='guard-leave-requests'),
    path('shift-swaps/', GuardShiftSwapsView.as_view(), name='guard-shift-swaps'),
    path('reports/', GuardReportsView.as_view(), name='guard-reports'),
    path('notifications/', GuardNotificationsView.as_view(), name='guard-notifications'),
    path('notifications/<uuid:notification_id>/read/', GuardNotificationReadView.as_view(), name='guard-notification-read'),
]
