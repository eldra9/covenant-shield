from django.urls import path

from .views import CaseDetailView, CaseListCreateView, CaseMessageView, CaseStatusView, CaseTrackView

urlpatterns = [
    path('', CaseListCreateView.as_view(), name='case-list-create'),
    path('track/', CaseTrackView.as_view(), name='case-track'),
    path('<uuid:pk>/', CaseDetailView.as_view(), name='case-detail'),
    path('<uuid:pk>/messages/', CaseMessageView.as_view(), name='case-messages'),
    path('<uuid:pk>/status/', CaseStatusView.as_view(), name='case-status'),
]
