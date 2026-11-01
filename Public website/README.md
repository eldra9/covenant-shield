# Covenant Shield Public Security Portal

This project is the public-facing Covenant Shield website with an integrated Express API for service requests, complaint submission, external tracking, and secure file handling.

## Project structure

- `apps/web/src` — React frontend and public pages
- `apps/api/src` — service layer for service requests, complaints, and uploads
- `packages/shared/src` — shared schemas, types, and validation contracts
- `server.ts` — Express server that serves the frontend in dev mode and exposes the backend API

## Local setup

1. Install dependencies:
   `npm install`
2. Copy `.env.example` to `.env` and adjust the variables for your environment.
3. Start the app:
   `npm run dev`
4. Open the site at:
   `http://localhost:3000`

## Environment variables

The app reads runtime configuration from environment variables. A reference file is included at `.env.example`.

Required variables:

- `NODE_ENV` — `development` or `production`
- `PORT` — Express listen port, default `3000`
- `VITE_API_BASE_URL` — frontend API base URL, usually `http://localhost:3000/api/v1`
- `TRACKING_SECRET` — server-side secret for signed public tracking links and verification tokens

Optional variables:

- `DISABLE_HMR` — set to `true` when Vite HMR should be disabled

## Developer workflow

- Frontend is served through Vite in development mode.
- The Express server exposes `/api/v1/*` endpoints and serves static assets in production.
- Public forms and tracking endpoints are validated using shared schemas under `packages/shared/src`.

## Validation and checks

Run the project checks with:

- `npm run lint`
- `npm run build`
- `npx tsx --test apps/web/src/tests/*.test.tsx`

## Notes

- The current implementation is a secure in-memory service layer intended for local and demo deployment.
- Production-grade persistence should be replaced with PostgreSQL/Prisma or another durable backend before production rollout.
- No sensitive server stack traces are exposed to public clients; validation and sanitization are enforced in the API layer.
