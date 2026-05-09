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
- Keep session totals visible while building and reviewing orders.
- Support correcting mistakes by deleting orders from an open session.

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
- `sessionStore`: activeSession, orders, draftOrder, loading, totals, fetch/create/order/delete/close actions

When extending behavior, update the responsible store instead of scattering state across pages.

## Session Page Rules

- If no open session exists, show `Start Session` and call `POST /sessions`.
- For active session, show date, status, order count, and live session total.
- The page should have three clear areas: candy catalog, draft order, and order history.
- Mobile layout should keep session summary first, draft order second, catalog third, and order history last.
- Desktop may use a two-column layout with catalog on the left and draft/history on the right.
- Add candies to a draft order before submission.
- Register orders via `POST /sessions/:id/orders` with a multi-line payload.
- Load order history via `GET /sessions/:id/orders`.
- Allow correction via `DELETE /sessions/:sessionId/orders/:orderId` while the session is open.
- Start all candy quantities visually at `0`.
- Treat closed sessions as immutable in UI.
- Do not show order deletion for closed sessions.

## API and Auth Rules

- Always send `Authorization: Bearer TOKEN` when authenticated.
- On `401`, clear local auth and redirect to `/login`.
- Keep global error handling centralized in Axios interceptors.
- Prefer candy ids from API responses; do not rely on candy names as the primary join key.

## UX Rules

- Show loading and disabled states during requests.
- Use toast notifications for request outcomes.
- Prefer skeleton loaders where content delay is expected.
- Avoid complex forms in live selling flow.
- Prevent submitting an empty draft order.
- Prevent quantities below `1` in the draft order.
- Keep the draft intact if order submission fails.
- Leave order history unchanged if order deletion fails.

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
- Order composition, submission, and deletion still work
- Store boundaries respected
- Validation updated when payloads/forms change
- Loading and error states covered
- Desktop + mobile layouts verified
- Docker build still works
