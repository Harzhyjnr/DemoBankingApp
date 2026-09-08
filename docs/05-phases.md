# Banking App — Implementation Phases, Milestones & Acceptance Criteria (v1)

> Status: **Proposed — pending approval** | Date: 2026-09-07
> Each phase ends with a demonstrable, testable slice. No phase depends on a backend.

---

## Phase 0 — Foundations (setup)

**Scope**

- Vite + React + TS scaffold, Tailwind config with design tokens, path alias, ESLint + Prettier + husky + lint-staged, folder structure, MSW dev harness, Vitest + RTL + Playwright + jest-axe wired.

**DoD / Acceptance**

- `npm run dev` boots a blank app with theme + page shell (header, sidebar, main).
- `npm run build` passes typecheck + lint + build with zero errors.
- `npm run test` runs a trivial placeholder suite green.
- Folder structure from the architecture doc exists.
- MSW is wired so a sample route (`GET /api/me` with seeded user) returns mock JSON in dev.

---

## Phase 1 — Design System & UI Primitives

**Scope**

- shadcn/ui base (button, input, card, dialog, select, table, tabs, dropdown, skeleton, toast, badge, tooltip), avatar, money formatting (`Money` component + `formatMoney`), theme tokens, dark mode, responsive breakpoints.

**DoD / Acceptance**

- All primitives available and used by at least one consumer.
- `formatMoney` unit-tested (minor units, currency, locale) — renders `$1,234.56`.
- Keyboard + focus + `role` behavior verified on dialog/select/dropdown (Radix-provided).
- jest-axe passes on a representative form + dialog.
- Mobile viewport shell (drawer nav) renders correctly at 375px.

---

## Phase 2 — Mock API Layer + Auth

**Scope**

- `lib/api/client.ts`, MSW handlers for all endpoints, seeded mock data (Faker, deterministic), error/401/session-expiry handling, TanStack Query + Zustand wiring, `authStore`, ProtectedRoute, Login/Register pages (UI + validation), demo-credentials hint, logout, profile menu.

**DoD / Acceptance**

- MSW-only; zero real HTTP to any external host.
- Login with seeded creds succeeds → dashboard; wrong creds → 401 error on the form.
- Register creates a user in the mock DB and lands on dashboard.
- Logout clears session + redirects to `/login`; refreshing redirects logged-out users to `/login`; "remember me" restores session (sessionStorage) across refresh.
- ProtectedRoute redirects with `from` and returns after login.
- jest-axe + RTL tests for both forms (validation, error, submit).
- Contract smoke test: every MSW endpoint returns documented shape.

---

## Phase 3 — Dashboard & Accounts

**Scope**

- Dashboard: accounts summary cards, balance overview, mini spending chart (lazy-loaded), recent transactions, quick actions.
- Accounts list page + account detail (balance, header actions, transactions list).
- Transactions table with filters (category, type, date range) + search + pagination.

**DoD / Acceptance**

- Data comes from TanStack Query; loading skeletons and empty states present.
- Transactions paginated + filterable; tests cover filter logic and pagination.
- Accounts detail shows correct balance and transactions for the account.
- Playwright: dashboard loads with logged-in user; navigating to account detail works.
- No flicker/refetch on tab re-focus (Query cache).

---

## Phase 4 — Transfers & Payments

**Scope**

- Transfer wizard (step 1: account → recipient; step 2: amount + note; step 3: review + PIN/confirm; success screen). Validation: amount > 0, sufficient balance, account ownership.
- Recent recipients, recent transfers on confirmation page.
- Invalidation of account balances + transactions after success.

**DoD / Acceptance**

- Unit tests: amount validation (zero, negative, overdraft) — mock server also rejects and surfaces the error.
- Component test: full happy path; insufficient-funds path shows error and lets the user correct.
- E2E: transfer → confirmation → dashboard balance decreased by correct amount; transactions list shows the new debit.
- Empty/success states of the wizard covered.

---

## Phase 5 — Cards, Insights & Settings

**Scope**

- Cards: list with masked numbers, virtual-card design, freeze/unfreeze toggle, per-card actions.
- Insights: category breakdown + monthly trend charts (lazy-loaded), top merchants, period selector.
- Settings: profile edit (name, email, currency, theme), security (password change mock, 2FA toggle mock, sessions list mock), notification preferences mock.

**DoD / Acceptance**

- Freeze/unfreeze updates card state immediately (optimistic) and persists in mock DB; correct empty/error states.
- Charts render from `/api/insights` data and respond to period selector.
- Profile changes reflect in the topbar after save; theme toggle works and persists preference.
- Unit tests for chart data transforms (percentages, grouping), component test for freeze toggle.
- jest-axe + keyboard pass on settings forms.

---

## Phase 6 — Hardening & Polish

**Scope**

- Code-splitting audit (route-level lazy), bundle-size check, loading/empty/error state audit across all routes, reduced-motion support, final a11y pass (keyboard-only walkthrough), final Playwright suite, 404 + global error boundary, final docs review.

**DoD / Acceptance**

- `npm run ci` (typecheck → lint → unit → e2e → build) green end-to-end.
- 404 route and error boundary tested.
- Keyboard-only walkthrough recorded checklist completed (no traps, logical order).
- Bundle `dist` ≤ ~220KB gzip (route-split) verified via `vite build --report`.
- README updated: run/dev instructions, demo credentials, architecture links, test commands.

---

## Out of Scope (by design)

Backend, Spring Boot, PostgreSQL, RabbitMQ, Docker, real banking APIs, real auth, real card/payment processing, production deployment. All mocked or stubbed behind the client layer so a real backend can be swapped in later without UI changes.
