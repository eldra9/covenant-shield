import hashlib
from datetime import timedelta

from django.utils import timezone
from rest_framework.test import APIClient, APITestCase

from accounts.models import User
from clients.models import Client
from employees.models import Employee, EmployeeSiteAssignment
from guard_operations.models import GuardShift
from sites.models import Site


class GuardApiTests(APITestCase):
    def setUp(self):
        self.api = APIClient()
        self.guard_user = User.objects.create_user(
            username='guard@example.com',
            email='guard@example.com',
            password='StrongPass!2026',
            name='Test Guard',
            role='GUARD',
        )
        self.guard = Employee.objects.create(
            user=self.guard_user,
            employee_no='EMP-1042',
            phone='+251900000001',
        )
        self.peer_user = User.objects.create_user(
            username='peer@example.com',
            email='peer@example.com',
            password='StrongPass!2026',
            name='Peer Guard',
            role='GUARD',
        )
        self.peer = Employee.objects.create(user=self.peer_user, employee_no='EMP-1043')
        self.client_record = Client.objects.create(organization_name='Test Client')
        self.token = 'station-qr-secret'
        self.site = Site.objects.create(
            client=self.client_record,
            name='Main Post',
            address='1 Main Road',
            city='Addis Ababa',
            latitude=9.0105,
            longitude=38.761,
            geofence_radius_m=100,
            qr_code_token_hash=hashlib.sha256(self.token.encode()).hexdigest(),
        )
        EmployeeSiteAssignment.objects.create(employee=self.guard, site=self.site)
        now = timezone.now()
        self.shift = GuardShift.objects.create(
            employee=self.guard,
            site=self.site,
            starts_at=now - timedelta(minutes=5),
            ends_at=now + timedelta(hours=8),
        )
        self.api.force_authenticate(self.guard_user)

    def test_dashboard_returns_only_persisted_employee_data(self):
        response = self.api.get('/api/v1/guard/dashboard/')

        self.assertEqual(response.status_code, 200, response.content)
        payload = response.json()
        self.assertEqual(payload['employee']['employee_id'], 'EMP-1042')
        self.assertEqual(payload['shifts'][0]['id'], str(self.shift.id))
        self.assertEqual(payload['sites'][0]['id'], str(self.site.id))
        self.assertEqual(payload['peer_guards'][0]['id'], str(self.peer.id))
        self.assertNotIn('qr_code_token_hash', payload['sites'][0])

    def test_employee_number_login_and_guard_profile_are_available(self):
        response = self.api.post(
            '/api/v1/auth/login/',
            {'identifier': 'EMP-1042', 'password': 'StrongPass!2026'},
            format='json',
        )
        self.assertEqual(response.status_code, 200, response.content)
        self.assertEqual(response.json()['user']['employeeId'], 'EMP-1042')

        updated = self.api.patch(
            '/api/v1/guard/profile/',
            {'name': 'Updated Guard', 'phone': '+251900000002'},
            format='json',
        )
        self.assertEqual(updated.status_code, 200, updated.content)
        self.assertEqual(updated.json()['name'], 'Updated Guard')
        self.assertEqual(updated.json()['phone'], '+251900000002')

    def test_check_in_validates_site_qr_geofence_and_duplicate(self):
        payload = {
            'shift_id': str(self.shift.id),
            'latitude': self.site.latitude,
            'longitude': self.site.longitude,
            'accuracy_m': 8,
            'qr_token': self.token,
        }
        response = self.api.post('/api/v1/guard/attendance/check-in/', payload, format='json')
        self.assertEqual(response.status_code, 201, response.content)
        self.assertEqual(response.json()['guard_id'], str(self.guard.id))

        duplicate = self.api.post('/api/v1/guard/attendance/check-in/', payload, format='json')
        self.assertEqual(duplicate.status_code, 409, duplicate.content)

    def test_check_in_rejects_bad_qr_and_out_of_range_gps(self):
        payload = {
            'shift_id': str(self.shift.id),
            'latitude': self.site.latitude,
            'longitude': self.site.longitude,
            'accuracy_m': 8,
            'qr_token': 'not-the-site-token',
        }
        response = self.api.post('/api/v1/guard/attendance/check-in/', payload, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertIn('QR', response.json()['detail'])

        payload.update({'latitude': 9.5, 'qr_token': self.token})
        outside = self.api.post('/api/v1/guard/attendance/check-in/', payload, format='json')
        self.assertEqual(outside.status_code, 400)
        self.assertIn('outside', outside.json()['detail'].lower())

    def test_leave_and_swap_requests_are_persisted_under_guard(self):
        leave = self.api.post(
            '/api/v1/guard/leave-requests/',
            {
                'leave_type': 'ANNUAL',
                'start_date': '2026-11-10',
                'end_date': '2026-11-12',
                'reason': 'Annual leave.',
            },
            format='json',
        )
        self.assertEqual(leave.status_code, 201, leave.content)
        self.assertEqual(leave.json()['guard_id'], str(self.guard.id))

        swap = self.api.post(
            '/api/v1/guard/shift-swaps/',
            {
                'shift_id': str(self.shift.id),
                'target_guard_id': str(self.peer.id),
                'reason': 'Family commitment.',
            },
            format='json',
        )
        self.assertEqual(swap.status_code, 201, swap.content)
        self.assertEqual(swap.json()['target_guard_id'], str(self.peer.id))

    def test_check_out_and_report_are_saved_to_shared_backend(self):
        check_in = self.api.post(
            '/api/v1/guard/attendance/check-in/',
            {
                'shift_id': str(self.shift.id),
                'latitude': self.site.latitude,
                'longitude': self.site.longitude,
                'accuracy_m': 8,
                'qr_token': self.token,
            },
            format='json',
        )
        self.assertEqual(check_in.status_code, 201, check_in.content)

        check_out = self.api.post(
            f"/api/v1/guard/attendance/{check_in.json()['id']}/check-out/",
            {
                'latitude': self.site.latitude,
                'longitude': self.site.longitude,
                'accuracy_m': 8,
                'qr_token': self.token,
            },
            format='json',
        )
        self.assertEqual(check_out.status_code, 200, check_out.content)
        self.assertIsNotNone(check_out.json()['check_out_time'])

        report = self.api.post(
            '/api/v1/guard/reports/',
            {
                'site': str(self.site.id),
                'category': 'INCIDENT',
                'severity': 'PRIORITY',
                'title': 'Perimeter alarm',
                'description': 'Sensor detected activity.',
                'location_specific': 'North gate',
                'action_taken': 'Notified supervisor',
                'latitude': self.site.latitude,
                'longitude': self.site.longitude,
            },
            format='json',
        )
        self.assertEqual(report.status_code, 201, report.content)
        self.assertTrue(report.json()['report_number'].startswith('CSR-'))

    def test_non_guard_role_cannot_access_guard_data(self):
        client_user = User.objects.create_user(
            username='client@example.com',
            email='client@example.com',
            password='StrongPass!2026',
            role='CLIENT',
        )
        self.api.force_authenticate(client_user)

        response = self.api.get('/api/v1/guard/dashboard/')

        self.assertEqual(response.status_code, 403)
