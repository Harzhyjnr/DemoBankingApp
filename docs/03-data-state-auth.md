# Banking App — Data, State & Mock Auth (v1)

> Status: **Proposed — pending approval** | Date: 2026-09-07

---

## 1. Mock Data / API Architecture

### Layers

1. **UI components** → call
2. **Feature hooks** (`useAccounts`, `useTransactions`, `useTransfer`) → wrap
3. **API client** (`lib/api/client.ts`) → single fetch wrapper with base URL, JSON handling, error normalization. **This is the only place HTTP happens.**
4. **MSW** intercepts network at the service-worker level → returns mock responses from
5. **Mock data** (`mocks/data`) seeded with Faker (deterministic seed).

### Why MSW

- The app talks to `fetch` as if a real backend exists — same request/response shape a future API would use.
- To swap mock → real: change `VITE_APP_API_BASE_URL` and remove MSW setup. UI code never changes.
- MSW also runs in a Node server for tests, so tests exercise the same API contract.

### Mock API endpoints (REST-ish)

```
POST /api/auth/login        → 200 { token, user } | 401 invalid credentials
POST /api/auth/register     → 201 { token, user } | 409 email exists
POST /api/auth/logout       → 204
GET  /api/me                → 200 { user } | 401
GET  /api/users/:id         → 200 { user }
GET  /api/accounts          → 200 { accounts[] }
GET  /api/accounts/:id      → 200 { account } | 404
GET  /api/accounts/:id/transactions?page=&limit=&category=&type=&from=&to=&q=
                            → 200 { items[], page, total, totalPages }
GET  /api/transactions      → 200 { items[], page, total, totalPages }
POST /api/transfers         → 201 { transaction (credit), transaction (debit) } | 400 invalid amount/insufficient funds
POST /api/cards/:id/freeze  → 200 { card }
POST /api/cards/:id/unfreeze→ 200 { card }
GET  /api/cards             → 200 { cards[] }
GET  /api/insights/spending → 200 { byCategory[], monthly[] , topMerchants[] }
PATCH /api/settings/profile → 200 { user }
PATCH /api/settings/security→ 200 { ok }
```

All responses include `Content-Type: application/json`. Errors: `{ error: { code, message, details? } }`.

### Mock data design

- Deterministic seed (`VITE_APP_MOCK_SEED`, default fixed) so tests and demos are stable.
- 4–5 accounts per user: 2 checking, 1 savings, 1 credit, optional investment.
- 300–600 transactions per account spread over ~12 months for meaningful charts and pagination.
- Transactions have real-ish merchants/categories; amounts in minor units.

---

## 2. State Management

### Two stores, two concerns

1. **TanStack Query (server state)** — accounts, transactions, cards, insights.
   - Cache: `QUERY_KEY = ["accounts"]`, `["accounts", id]`, `["transactions", filters]`, `["me"]`, etc.
   - Invalidation: after a successful transfer → invalidate `["accounts"]` and the affected account's transactions.
   - Stale time ~30s; retry 1–2× on transient errors only.
2. **Zustand (client/UI state)** — things that live only on the client:
   - `authStore` — token + user (backed by in-memory session; see below).
   - `preferencesStore` — preferred currency, locale, density, sidebar collapsed.
   - `uiStore` — transient toasts/dialogs (or use sonner + local state where simpler).

### Rules

- Never store server data in Zustand. Query client owns it.
- Forms: local React Hook Form state (server state only on submit).
- Derived data → computed in queries/selectors, not duplicated.

---

## 3. Authentication UI & Mock Authentication

### Mock auth flow (mirrors real-world contract)

- `authStore` holds `{ token, user, status }` in memory (NOT persisted by default).
- Login: POST `/api/auth/login` via MSW → validates against seeded users (e.g. `demo@bank.com` / `demo1234`, documented on the login page) → returns fake JWT + user. `authStore` sets session; React Query prefetches `["me"]`.
- Register: POST `/api/auth/register` → adds user to in-memory mock DB (MSW handler state), returns token.
- Logout: POST `/api/auth/logout`, clear token + user, invalidate Query cache, redirect to `/login`.
- Session expiry: fake JWT has `exp`; on request, MSW returns 401 if expired → Query interceptor triggers logout.
- **ProtectedRoute** component: if no session → redirect to `/login` with `from` query param; after login, redirect back.
- Session persistence: default in-memory (refreshing the page logs you out — secure-by-default). Optional opt-in "remember me" persists the mock token to `sessionStorage`, cleared on logout. Sensitive data never touches localStorage.

### UI

- Login page: email + password + show/hide, submit, error states (`401 invalid credentials`), demo-credentials hint card, link to register.
- Register page: first/last name, email, password (+ confirm), terms checkbox, validation via zod.
- In-app topbar: user menu → profile, settings, logout. Profile shows avatar initials, name, email.

---

## 4. Security-Best-Practice Guards (frontend-only, still worth doing)

- All money formatted via the `Money` component / `formatMoney` — never raw numbers exposed to strings accidentally.
- Account/txn numbers masked (middle digits) by default; full number revealed only on explicit user action where applicable.
- Input validation (zod) on every money/amount field; mock server also rejects invalid/overdraft amounts so the contract is realistic.
- No secrets, no tokens in console.log; mock tokens are throwaway values anyway.
