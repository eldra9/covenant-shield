from django.contrib.auth import get_user_model
from rest_framework import permissions, status, views
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView

from .serializers import CustomTokenObtainPairSerializer, RegisterUserSerializer, UserSerializer

User = get_user_model()


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class RegisterUserView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = RegisterUserSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            {
                'message': 'User created successfully.',
                'user': UserSerializer(user).data,
            },
            status=status.HTTP_201_CREATED,
        )


class UserMeView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        return Response(UserSerializer(request.user).data)

    def patch(self, request, *args, **kwargs):
        user = request.user
        data = request.data

        # Update contact / profile fields
        if 'fullName' in data or 'name' in data:
            user.name = data.get('fullName') or data.get('name')
        if 'phone' in data:
            user.phone = data.get('phone')
        if 'jobTitle' in data or 'job_title' in data:
            user.job_title = data.get('jobTitle') or data.get('job_title')
        if 'directPhone' in data or 'direct_phone' in data:
            user.direct_phone = data.get('directPhone') or data.get('direct_phone')
        if 'alertPhone' in data or 'alert_phone' in data:
            user.alert_phone = data.get('alertPhone') or data.get('alert_phone')
        if 'preferredChannel' in data or 'preferred_channel' in data:
            user.preferred_channel = data.get('preferredChannel') or data.get('preferred_channel')

        user.save()

        # Update organization name if client and specified
        org_name = data.get('organizationName') or data.get('organization_name')
        if org_name and user.role == 'CLIENT':
            client = user.client_accounts.order_by('-created_at').first()
            if client:
                client.organization_name = org_name
                client.legal_name = f'{org_name} Security Services Account'
                client.save()

        return Response(UserSerializer(user).data)


class ChangePasswordView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        data = request.data
        identifier = data.get('username') or data.get('email')
        current_password = data.get('current_password') or data.get('old_password')
        new_password = data.get('new_password') or data.get('password')

        if not new_password:
            return Response({'detail': 'New password is required.'}, status=status.HTTP_400_BAD_REQUEST)
        if len(new_password) < 6:
            return Response({'detail': 'Password must be at least 6 characters.'}, status=status.HTTP_400_BAD_REQUEST)

        user = None
        if request.user and request.user.is_authenticated:
            user = request.user
        elif identifier:
            from django.db.models import Q
            user = User.objects.filter(Q(email__iexact=identifier) | Q(username__iexact=identifier)).first()
            if user and current_password and not user.check_password(current_password):
                return Response({'detail': 'Invalid current password.'}, status=status.HTTP_400_BAD_REQUEST)

        if not user:
            return Response({'detail': 'User not found or unauthenticated.'}, status=status.HTTP_401_UNAUTHORIZED)

        user.set_password(new_password)
        user.must_change_password = False
        user.save()

        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(user)

        return Response({
            'message': 'Password updated successfully.',
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data,
        })

