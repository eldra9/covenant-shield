# Covenant Shield Django Backend

This backend is a Django REST Framework implementation that exposes the public service request and case APIs required by the existing React frontend.

## Quick start

1. Create and activate a Python virtual environment.
2. Install dependencies:
   `pip install -r requirements.txt`
3. Copy `.env.example` to `.env` and adjust secrets.
4. Run migrations:
   `python manage.py migrate`
5. Create a superuser:
   `python manage.py createsuperuser`
6. Start the API:
   `python manage.py runserver 0.0.0.0:8000`

## Public API routes

- `GET /api/v1/health/`
- `POST /api/v1/auth/login/`
- `POST /api/v1/auth/register/`
- `GET /api/v1/auth/me/`
- `POST /api/v1/service-requests/`
- `POST /api/v1/service-requests/track/`
- `GET /api/v1/service-requests/`
- `PATCH /api/v1/service-requests/<id>/status/`
- `POST /api/v1/service-requests/<id>/notes/`
- `POST /api/v1/cases/`
- `POST /api/v1/cases/track/`
- `GET /api/v1/cases/`

## Notes

- The current implementation uses SQLite by default when `DATABASE_URL` is not configured. For production, set a PostgreSQL `DATABASE_URL` and run PostgreSQL migrations there.
- Frontend requests should point to `http://localhost:8000/api/v1` via `VITE_API_BASE_URL`.
