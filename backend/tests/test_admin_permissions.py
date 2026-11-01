from django.test import TestCase
from rest_framework.test import APIClient
from accounts.models import User, UserRole

class AdminPermissionsApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.super_admin = User.objects.create_user(
            username='superadmin_test',
            email='sa@test.co.ke',
            password='Password123!',
            role=UserRole.SUPER_ADMIN,
        )
        self.ops_user = User.objects.create_user(
            username='ops_test',
            email='ops@test.co.ke',
            password='Password123!',
            role=UserRole.OPERATIONS,
        )
        self.supervisor_user = User.objects.create_user(
            username='supervisor_test',
            email='sup@test.co.ke',
            password='Password123!',
            role=UserRole.SUPERVISOR,
        )
        self.guard_user = User.objects.create_user(
            username='guard_test',
            email='guard@test.co.ke',
            password='Password123!',
            role=UserRole.GUARD,
        )
        self.client_user = User.objects.create_user(
            username='client_test',
            email='client@test.co.ke',
            password='Password123!',
            role=UserRole.CLIENT,
        )

    def _get_token(self, user):
        res = self.client.post('/api/v1/auth/login/', {'email': user.email, 'password': 'Password123!'}, format='json')
        assert res.status_code == 200, res.content
        return res.json()['access']

    def test_unauthenticated_cannot_access_admin_sync(self):
        res = self.client.get('/api/v1/admin-portal/sync/')
        assert res.status_code in [401, 403], res.status_code

    def test_guard_cannot_access_admin_sync(self):
        token = self._get_token(self.guard_user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        res = self.client.get('/api/v1/admin-portal/sync/')
        assert res.status_code == 403, res.status_code

    def test_client_cannot_access_admin_sync(self):
        token = self._get_token(self.client_user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        res = self.client.get('/api/v1/admin-portal/sync/')
        assert res.status_code == 403, res.status_code

    def test_operations_can_access_admin_sync(self):
        token = self._get_token(self.ops_user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        res = self.client.get('/api/v1/admin-portal/sync/')
        assert res.status_code == 200, res.status_code

    def test_super_admin_can_access_admin_sync(self):
        token = self._get_token(self.super_admin)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        res = self.client.get('/api/v1/admin-portal/sync/')
        assert res.status_code == 200, res.status_code
