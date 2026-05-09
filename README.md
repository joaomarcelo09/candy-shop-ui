# Candy Shop UI

Mobile-first frontend dashboard for candy shop sales management, designed for fast live selling and lightweight POS-like interactions.

## Stack

- React + Vite + TypeScript
- Zustand (state)
- Zod (validation)
- Axios (API)
- React Router (navigation)
- Tailwind CSS (styling)
- jsPDF (session report)

## Core Features

- Authentication with JWT persistence
- Dashboard with active session summary and totals
- Candy management (list, create, edit)
- Session selling screen optimized for mobile touch interactions
- Optimistic sale registration (`POST /sessions/:id/sales`)
- Session close flow (`PATCH /sessions/:id/close`) with PDF generation
- Responsive navigation:
  - mobile: bottom navigation
  - desktop: sidebar layout

## Mobile-First UX

- Large touch targets and quick actions
- Minimal typing during sales
- Mobile candy cards for live selling
- Desktop table fallback for dense workflows

## Folder Structure

```text
src/
  api/
  components/
  pages/
  stores/
  hooks/
  schemas/
  layouts/
  types/
  utils/
```

## Environment

Create `.env` from `.env.example`:

```env
VITE_API_URL=http://localhost:3000
```

If not provided, the app falls back to `/api`.

## Run Locally

```bash
pnpm install
pnpm dev
```

App runs with Vite dev server (default `http://localhost:5173`).

## Production Build

```bash
pnpm build
pnpm preview
```

## Docker

Build and run with Docker Compose:

```bash
docker compose up --build
```

Frontend is served by Nginx on `http://localhost:4173`.

## API Integration Contract

- JWT header: `Authorization: Bearer <token>`
- 401 behavior: clear auth and redirect to `/login`
- Centralized Axios instance with global toast error handling

Main endpoints used by the UI:

- `POST /auth/login`
- `GET /candies`
- `POST /candies`
- `PATCH /candies/:id`
- `GET /sessions/current`
- `POST /sessions`
- `POST /sessions/:id/sales`
- `PATCH /sessions/:id/close`

## Session Rules

- Candies start visually with `quantity = 0` on frontend
- Backend session-candy relation is expected only after first sale
- Closed sessions are treated as immutable in UI

## Full Flow

1. User logs in
2. User creates/updates candies
3. User starts a session
4. User registers sales quickly from session screen
5. User finishes session
6. Frontend generates PDF summary via jsPDF

## Notes

- No frontend tests are required for this project.
- Linting is available with `pnpm lint`.
