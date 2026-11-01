from django.urls import path

from .views import (
    ClientCaseCloseView,
    ClientCaseDetailView,
    ClientCaseReopenView,
    ClientCaseReplyView,
    ClientCasesView,
    ClientDashboardView,
    ClientNotificationMarkAllReadView,
    ClientNotificationReadView,
    ClientNotificationsView,
    ClientProfileView,
    ClientServiceRequestApproveQuotationView,
    ClientServiceRequestCancelView,
    ClientServiceRequestDetailView,
    ClientServiceRequestListView,
    ClientSiteDetailView,
    ClientSitesView,
)

urlpatterns = [
    # Profile & Dashboard
    path('profile/', ClientProfileView.as_view(), name='client-profile'),
    path('dashboard/', ClientDashboardView.as_view(), name='client-dashboard'),

    # Sites
    path('sites/', ClientSitesView.as_view(), name='client-sites'),
    path('sites/<str:pk>/', ClientSiteDetailView.as_view(), name='client-site-detail'),

    # Service Requests
    path('service-requests/', ClientServiceRequestListView.as_view(), name='client-service-requests'),
    path('service-requests/<uuid:pk>/', ClientServiceRequestDetailView.as_view(), name='client-service-request-detail'),
    path('service-requests/<uuid:pk>/approve-quotation/', ClientServiceRequestApproveQuotationView.as_view(), name='client-service-request-approve-quotation'),
    path('service-requests/<uuid:pk>/cancel-request/', ClientServiceRequestCancelView.as_view(), name='client-service-request-cancel'),

    # Cases
    path('cases/', ClientCasesView.as_view(), name='client-cases'),
    path('cases/<uuid:pk>/', ClientCaseDetailView.as_view(), name='client-case-detail'),
    path('cases/<uuid:pk>/replies/', ClientCaseReplyView.as_view(), name='client-case-replies'),
    path('cases/<uuid:pk>/close/', ClientCaseCloseView.as_view(), name='client-case-close'),
    path('cases/<uuid:pk>/reopen/', ClientCaseReopenView.as_view(), name='client-case-reopen'),

    # Notifications
    path('notifications/', ClientNotificationsView.as_view(), name='client-notifications'),
    path('notifications/<uuid:pk>/read/', ClientNotificationReadView.as_view(), name='client-notification-read'),
    path('notifications/mark-all-read/', ClientNotificationMarkAllReadView.as_view(), name='client-notifications-mark-all-read'),
]
