from django.urls import path

from .views import (
    ServiceRequestAssignView,
    ServiceRequestDetailView,
    ServiceRequestListCreateView,
    ServiceRequestNoteView,
    ServiceRequestStatusView,
    ServiceRequestTrackView,
)

urlpatterns = [
    path('', ServiceRequestListCreateView.as_view(), name='service-request-list-create'),
    path('track/', ServiceRequestTrackView.as_view(), name='service-request-track'),
    path('<uuid:pk>/', ServiceRequestDetailView.as_view(), name='service-request-detail'),
    path('<uuid:pk>/status/', ServiceRequestStatusView.as_view(), name='service-request-status'),
    path('<uuid:pk>/notes/', ServiceRequestNoteView.as_view(), name='service-request-notes'),
    path('<uuid:pk>/assign/', ServiceRequestAssignView.as_view(), name='service-request-assign'),
]
