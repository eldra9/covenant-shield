from django.test import TestCase
from rest_framework.test import APIClient


class ClientPortalPersistenceFlowTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_signup_signin_profile_and_history_persistence(self):
        # 1. Sign up on Public Website
        reg_payload = {
            'name': 'Alice Walker',
            'organization_name': 'Walker Enterprises',
            'email': 'alice@walker.com',
            'phone': '+254711223344',
            'password': 'SecureP@ssword2026',
            'role': 'CLIENT',
        }
        reg_res = self.client.post('/api/v1/auth/register/', reg_payload, format='json')
        assert reg_res.status_code == 201, reg_res.content
        reg_user = reg_res.json()['user']
        assert reg_user['name'] == 'Alice Walker'
        assert reg_user['organization_name'] == 'Walker Enterprises'

        # 2. Sign in
        login_res = self.client.post(
            '/api/v1/auth/login/',
            {'email': 'alice@walker.com', 'password': 'SecureP@ssword2026'},
            format='json',
        )
        assert login_res.status_code == 200, login_res.content
        access_token = login_res.json()['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')

        # 3. Check profile in client portal
        prof_res = self.client.get('/api/v1/client/profile/')
        assert prof_res.status_code == 200, prof_res.content
        prof_data = prof_res.json()
        assert prof_data['client']['name'] == 'Walker Enterprises'
        assert prof_data['user']['fullName'] == 'Alice Walker'
        assert prof_data['user']['email'] == 'alice@walker.com'

        # 4. Update personal contact details in profile
        patch_res = self.client.patch(
            '/api/v1/client/profile/',
            {
                'jobTitle': 'Chief Security Officer',
                'directPhone': '+254799887766',
                'alertPhone': '+254799887755',
                'preferredChannel': 'SMS',
            },
            format='json',
        )
        assert patch_res.status_code == 200, patch_res.content
        patched_user = patch_res.json()['user']
        assert patched_user['jobTitle'] == 'Chief Security Officer'
        assert patched_user['directPhone'] == '+254799887766'

        # 5. Create a service request
        req_res = self.client.post(
            '/api/v1/client/service-requests/',
            {
                'serviceType': 'VIP_ESCORT',
                'description': 'Executive escort for upcoming conference.',
                'priority': 'Urgent',
            },
            format='json',
        )
        assert req_res.status_code == 201, req_res.content
        req_data = req_res.json()
        assert req_data['serviceType'] == 'VIP Escort'
        assert req_data['reference'].startswith('REQ-')

        # 6. Create a case/ticket
        case_res = self.client.post(
            '/api/v1/client/cases/',
            {
                'subject': 'Access Card Reconfiguration',
                'category': 'Equipment & Access',
                'description': 'Need 5 new biometric keycards.',
            },
            format='json',
        )
        assert case_res.status_code == 201, case_res.content
        case_data = case_res.json()
        assert case_data['reference'].startswith('CAS-')

        # 7. Add reply to case
        reply_res = self.client.post(
            f"/api/v1/client/cases/{case_data['id']}/replies/",
            {'content': 'Please also configure gate 2.'},
            format='json',
        )
        assert reply_res.status_code == 200, reply_res.content
        assert len(reply_res.json()['messages']) == 2

        # 8. Fetch dashboard to verify progress history
        dash_res = self.client.get('/api/v1/client/dashboard/')
        assert dash_res.status_code == 200, dash_res.content
        dash_data = dash_res.json()
        assert dash_data['clientName'] == 'Walker Enterprises'
        assert dash_data['openRequestsCount'] == 1
        assert dash_data['openCasesCount'] == 1
        assert len(dash_data['recentServiceRequests']) == 1
        assert len(dash_data['recentComplaints']) == 1

        # 9. Verify persistence across sessions (simulate relogin next time)
        self.client.logout()
        relogin_res = self.client.post(
            '/api/v1/auth/login/',
            {'email': 'alice@walker.com', 'password': 'SecureP@ssword2026'},
            format='json',
        )
        assert relogin_res.status_code == 200
        new_token = relogin_res.json()['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {new_token}')

        # Re-fetch profile and requests - everything is fully preserved in the database
        re_prof = self.client.get('/api/v1/client/profile/')
        assert re_prof.json()['user']['jobTitle'] == 'Chief Security Officer'
        assert re_prof.json()['client']['name'] == 'Walker Enterprises'

        re_requests = self.client.get('/api/v1/client/service-requests/')
        assert len(re_requests.json()['results']) == 1
        assert re_requests.json()['results'][0]['reference'] == req_data['reference']

        re_cases = self.client.get('/api/v1/client/cases/')
        assert len(re_cases.json()) == 1
        assert re_cases.json()[0]['reference'] == case_data['reference']
