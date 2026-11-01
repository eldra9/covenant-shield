from django.test import TestCase
from rest_framework.test import APIClient

from accounts.models import User
from cases.models import ServiceCase
from clients.models import Client
from service_requests.models import ServiceRequest


class ServiceAndCaseApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='opsuser',
            email='ops@example.com',
            password='StrongPass123',
            name='Operations Manager',
            role='OPERATIONS',
        )

    def test_public_service_request_creation_and_tracking(self):
        response = self.client.post(
            '/api/v1/service-requests/',
            {
                'full_name': 'Jane Doe',
                'phone': '+254712345678',
                'email': 'jane@example.com',
                'service_type': 'STATIC_GUARDING',
                'site_address': '123 Main Road',
                'city': 'Nairobi',
                'guards_needed': 3,
                'shift_coverage': 'NIGHT',
                'armed_status': 'UNARMED',
                'start_date': '2026-11-20',
                'duration': 'ONE_MONTH',
                'preferred_contact_method': 'EMAIL',
                'additional_details': 'Need gate coverage',
                'organization_name': 'Gateway Holdings',
            },
            format='json',
        )
        assert response.status_code == 201, response.content
        payload = response.json()
        assert payload['referenceNumber'].startswith('SR-')
        assert len(payload['verificationCode']) == 6

        track = self.client.post(
            '/api/v1/service-requests/track/',
            {'reference_no': payload['referenceNumber'], 'verification_code': payload['verificationCode']},
            format='json',
        )
        assert track.status_code == 200, track.content
        assert track.json()['referenceNumber'] == payload['referenceNumber']

    def test_public_case_creation_and_tracking(self):
        response = self.client.post(
            '/api/v1/cases/',
            {
                'case_type': 'COMPLAINT',
                'category': 'UNIFORM',
                'severity': 'HIGH',
                'contact_name': 'John Smith',
                'contact_phone': '+254712345678',
                'contact_email': 'john@example.com',
                'description': 'Uniform was not correct on site.',
                'rating': 4,
            },
            format='json',
        )
        assert response.status_code == 201, response.content
        payload = response.json()
        assert payload['referenceNumber'].startswith('CS-')
        assert len(payload['verificationCode']) == 6

        track = self.client.post(
            '/api/v1/cases/track/',
            {'reference_no': payload['referenceNumber'], 'verification_code': payload['verificationCode']},
            format='json',
        )
        assert track.status_code == 200, track.content
        assert track.json()['referenceNumber'] == payload['referenceNumber']

    def test_user_registration_requires_strong_password_and_login_checks_database(self):
        weak_response = self.client.post(
            '/api/v1/auth/register/',
            {
                'name': 'Weak User',
                'email': 'weak@example.com',
                'password': 'weak',
                'role': 'CLIENT',
            },
            format='json',
        )
        assert weak_response.status_code == 400, weak_response.content
        assert 'weak' in weak_response.json()['password'][0].lower()

        strong_response = self.client.post(
            '/api/v1/auth/register/',
            {
                'name': 'Strong User',
                'email': 'strong@example.com',
                'password': 'StrongPass!2026',
                'role': 'CLIENT',
            },
            format='json',
        )
        assert strong_response.status_code == 201, strong_response.content
        assert User.objects.filter(email='strong@example.com').exists()

        second_response = self.client.post(
            '/api/v1/auth/register/',
            {
                'name': 'Second User',
                'email': 'second@example.com',
                'password': 'StrongPass!2026',
                'role': 'CLIENT',
            },
            format='json',
        )
        assert second_response.status_code == 201, second_response.content
        assert User.objects.filter(email='second@example.com').exists()

        login_response = self.client.post(
            '/api/v1/auth/login/',
            {'email': 'strong@example.com', 'password': 'StrongPass!2026'},
            format='json',
        )
        assert login_response.status_code == 200, login_response.content
        assert 'access' in login_response.json()

        bad_login = self.client.post(
            '/api/v1/auth/login/',
            {'email': 'strong@example.com', 'password': 'wrong-password'},
            format='json',
        )
        assert bad_login.status_code == 400, bad_login.content

    def test_signup_creates_client_record_and_auth_payload_includes_client_identity(self):
        response = self.client.post(
            '/api/v1/auth/register/',
            {
                'name': 'Alicia Otieno',
                'email': 'alicia@example.com',
                'password': 'StrongPass!2026',
                'role': 'CLIENT',
            },
            format='json',
        )
        assert response.status_code == 201, response.content
        client_record = Client.objects.get(contact_user__email='alicia@example.com')
        assert client_record.organization_name == 'Alicia Otieno'

        login_response = self.client.post(
            '/api/v1/auth/login/',
            {'email': 'alicia@example.com', 'password': 'StrongPass!2026'},
            format='json',
        )
        assert login_response.status_code == 200, login_response.content
        payload = login_response.json()['user']
        assert payload['client_id'] == str(client_record.id)
        assert payload['organization_name'] == 'Alicia Otieno'

    def test_client_dashboard_and_data_scope_are_enforced(self):
        client_a = Client.objects.create(organization_name='Alpha Security', contact_user=self.user)
        self.user.role = 'CLIENT'
        self.user.save(update_fields=['role'])

        client_b = Client.objects.create(organization_name='Bravo Security')
        other_user = User.objects.create_user(
            username='client-b',
            email='clientb@example.com',
            password='StrongPass!2026',
            name='Bravo Client',
            role='CLIENT',
        )
        client_b.contact_user = other_user
        client_b.save(update_fields=['contact_user'])

        service_request_a = ServiceRequest.objects.create(
            reference_no='SR-ALPHA-1',
            requester_user=self.user,
            client=client_a,
            full_name='Alpha Contact',
            phone='+254700000001',
            email='alpha@example.com',
            service_type='STATIC_GUARDING',
            site_address='Alpha Site',
            city='Nairobi',
            guards_needed=2,
            shift_coverage='DAY',
            armed_status='UNARMED',
            start_date='2026-11-20',
            duration='30_DAYS',
            verification_code_hash='dummy',
            verification_code_salt='salt',
            organization_name='Alpha Security',
        )
        service_request_b = ServiceRequest.objects.create(
            reference_no='SR-BRAVO-1',
            requester_user=other_user,
            client=client_b,
            full_name='Bravo Contact',
            phone='+254700000002',
            email='bravo@example.com',
            service_type='PATROL_SERVICES',
            site_address='Bravo Site',
            city='Mombasa',
            guards_needed=1,
            shift_coverage='NIGHT',
            armed_status='ARMED',
            start_date='2026-11-21',
            duration='14_DAYS',
            verification_code_hash='dummy',
            verification_code_salt='salt',
            organization_name='Bravo Security',
        )
        ServiceCase.objects.create(
            reference_no='CS-ALPHA-1',
            case_type='COMPLAINT',
            category='UNIFORM',
            severity='HIGH',
            client=client_a,
            contact_name='Alpha Contact',
            contact_phone='+254700000001',
            contact_email='alpha@example.com',
            description='Issue noted',
            verification_code_hash='dummy',
            verification_code_salt='salt',
            submitted_by=self.user,
        )
        ServiceCase.objects.create(
            reference_no='CS-BRAVO-1',
            case_type='COMPLAINT',
            category='BILLING',
            severity='NORMAL',
            client=client_b,
            contact_name='Bravo Contact',
            contact_phone='+254700000002',
            contact_email='bravo@example.com',
            description='Other issue',
            verification_code_hash='dummy',
            verification_code_salt='salt',
            submitted_by=other_user,
        )

        login_response = self.client.post(
            '/api/v1/auth/login/',
            {'email': self.user.email, 'password': 'StrongPass123'},
            format='json',
        )
        assert login_response.status_code == 200, login_response.content
        access_token = login_response.json()['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')

        dashboard = self.client.get('/api/v1/client/dashboard/')
        assert dashboard.status_code == 200, dashboard.content
        payload = dashboard.json()
        assert payload['client']['name'] == 'Alpha Security'
        assert payload['totals']['serviceRequests'] == 1
        assert payload['totals']['complaints'] == 1

        req_detail = self.client.get(f'/api/v1/client/service-requests/{service_request_a.id}/')
        assert req_detail.status_code == 200, req_detail.content
        assert req_detail.json()['referenceNumber'] == 'SR-ALPHA-1'

        other_req = self.client.get(f'/api/v1/client/service-requests/{service_request_b.id}/')
        assert other_req.status_code == 404, other_req.content

        client_list = self.client.get('/api/v1/client/service-requests/')
        assert client_list.status_code == 200, client_list.content
        assert len(client_list.json()['results']) == 1
        assert client_list.json()['results'][0]['referenceNumber'] == 'SR-ALPHA-1'

        self.client.logout()
