# AGENTS.md

## Purpose

This file defines implementation guidance for humans and coding agents working on `candy-shop-ui`.

## Product Intent

Build and maintain a mobile-first candy sales dashboard that behaves like a lightweight POS, with fast interactions during live selling sessions.

## Non-Negotiable Requirements

- Prioritize mobile UX over desktop UX.
- Keep the session page as the highest-priority workflow.
- Minimize typing and modal-heavy flows during sales.
- Use touch-friendly controls with large hit areas.
- Preserve optimistic feedback for sale actions.

## Tech Constraints

Use and keep consistency with:

- React + Vite + TypeScript
- Zustand for state
- Zod for validation
- Axios for API calls
- React Router for routing
- Tailwind CSS for styling
- jsPDF for report generation

Do not introduce alternative state managers, form validators, or CSS frameworks unless explicitly requested.

## Architecture Rules

- Keep API logic centralized in `src/api/`.
- Keep global state in Zustand stores under `src/stores/`.
- Keep validation schemas in `src/schemas/`.
- Keep domain and API types in `src/types/`.
- Keep presentational/shared UI in `src/components/`.

## Store Responsibilities

- `authStore`: token, user, login, logout
- `candyStore`: candies, fetch/create/update actions
- `sessionStore`: activeSession, loading, totals, fetch/create/register/close actions

When extending behavior, update the responsible store instead of scattering state across pages.

## Session Page Rules

- If no open session exists, show `Start Session` and call `POST /sessions`.
- For active session, show date, status, and live estimated total.
- Mobile layout should use candy cards with clear plus/minus controls.
- Desktop may use table layout for higher information density.
- Register sale via `POST /sessions/:id/sales` with `{ candy_id, quantity }`.
- Start all candy quantities visually at `0`.
- Treat closed sessions as immutable in UI.

## API and Auth Rules

- Always send `Authorization: Bearer TOKEN` when authenticated.
- On `401`, clear local auth and redirect to `/login`.
- Keep global error handling centralized in Axios interceptors.

## UX Rules

- Show loading and disabled states during requests.
- Use toast notifications for request outcomes.
- Prefer skeleton loaders where content delay is expected.
- Avoid complex forms in live selling flow.

## PDF Rules

When closing a session, generate PDF with:

- session id and date
- sold candies
- quantities
- unit prices
- subtotals
- total sold

Include table columns: `Candy | Qty | Unit Price | Subtotal`.

## Responsive Navigation Rules

- Mobile: bottom nav or hamburger pattern
- Desktop: sidebar layout

Do not regress these patterns when refactoring layouts.

## Docker and Delivery

- Keep `Dockerfile` production-ready with Nginx serving built assets.
- Keep `compose.yaml` compatible with `docker compose up --build`.
- Ensure environment variables remain configurable through `.env`.

## Change Checklist (for every significant change)

- Mobile-first behavior preserved
- Session flow still fast and low-friction
- Store boundaries respected
- Validation updated when payloads/forms change
- Loading and error states covered
- Desktop + mobile layouts verified
- Docker build still works
