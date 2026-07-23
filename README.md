# Candy Shop UI

Mobile-first frontend dashboard for candy shop sales management, built to support fast live selling with a lightweight POS-style session flow.

## Stack

- React + Vite + TypeScript
- TanStack Query for server state and requests
- Zustand for persisted authentication state
- Zod for validation
- Axios for API calls
- React Router for navigation
- Tailwind CSS for styling
- jsPDF for session reports

## Core Features

- Authentication with JWT persistence
- Dashboard with active session summary and live totals
- Candy management for creating and editing catalog items
- Session screen for composing multi-item orders
- Draft order editing with quantity controls and line subtotals
- Session order history with delete support while the session is open
- Session close flow with PDF generation
- Responsive navigation:
  - mobile: bottom navigation
  - desktop: sidebar layout

## Session Workflow

1. Start a session from the session screen.
2. Add candies from the catalog into the current draft order.
3. Adjust quantities before submission.
4. Register the full order in one request.
5. Review submitted orders in reverse chronological order.
6. Delete an incorrect order while the session is still open.
7. Close the session and generate the PDF summary.

## Session UX Rules

- Mobile-first selling flow is the primary priority.
- Session summary stays visible while building orders.
- Draft orders must reject empty submissions.
- Draft quantities must stay at `1` or higher.
- Closed sessions are treated as immutable in the UI.
- The frontend should prefer candy ids from API responses instead of matching by candy name.

## Folder Structure

```text
src/
  api/
  components/
  hooks/
  layouts/
  pages/
  queries/
  schemas/
  stores/
  test/
  types/
  utils/
```

## Environment

Create `.env` with:

```env
VITE_API_URL=http://localhost:3000
```

If not provided, the app falls back to `/api`.

## Run Locally

```bash
pnpm install
pnpm dev
```

Vite runs by default at `http://localhost:5173`.

## Production Build

```bash
pnpm build
pnpm preview
```

## Tests

Run the automated test suite once:

```bash
pnpm test
```

Run tests in watch mode while developing:

```bash
pnpm test:watch
```

## Docker

Build and run with Docker Compose:

```bash
docker compose up --build
```

The production image serves the built frontend with Nginx on `http://localhost:4173`.

## API Integration Contract

- JWT header: `Authorization: Bearer <token>`
- `401` behavior: clear local auth and redirect to `/login`
- Axios interceptors centralize auth headers and toast-based error handling

Main endpoints used by the UI:

- `POST /auth/login`
- `GET /candies`
- `POST /candies`
- `PATCH /candies/:id`
- `GET /sessions/open/current`
- `GET /sessions/:id`
- `POST /sessions`
- `POST /sessions/:id/orders`
- `GET /sessions/:id/orders`
- `DELETE /sessions/:sessionId/orders/:orderId`
- `PATCH /sessions/:id/close`

## Order and Session Data Expectations

- Session summary responses should provide aggregate totals for the active session.
- Order history responses should provide stable order ids.
- Candy references should include ids whenever possible.
- The frontend will tolerate missing order history by keeping the session summary visible, but correction UI depends on the order endpoints working correctly.

## PDF Output

Closing a session generates a PDF report including:

- session id and date
- sold candies
- quantities
- unit prices
- subtotals
- total sold

Table columns:

- `Candy`
- `Qty`
- `Unit Price`
- `Subtotal`

## Notes

- Linting is available with `pnpm lint`.
- TanStack Query keeps API data in memory, invalidates related session data after mutations, and refetches on focus or reconnect.
- The Zustand store is limited to the persisted authentication token and decoded user.
- Automated tests cover authentication, query invalidation, draft behavior, order submission/deletion, and session closing.
- Manual QA remains important for responsive layouts, PDF downloads, and the complete live-selling flow against the backend.
