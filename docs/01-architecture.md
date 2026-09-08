# Banking App Frontend — Architecture (v1)

> Status: **Proposed — pending approval** | Date: 2026-09-07
> Scope: Frontend-only. No backend, no Spring Boot, no PostgreSQL, no RabbitMQ, no Docker, no real banking API.

---

## 1. Technology Stack (Recommended)

| Concern         | Technology                       | Justification                                                           |
| --------------- | -------------------------------- | ----------------------------------------------------------------------- |
| Framework       | React 18 + TypeScript (via Vite) | Mature ecosystem, strong typing, fast dev server                        |
| Language        | TypeScript (strict)              | Type safety for financial domain models (money, accounts, transactions) |
| Build tool      | Vite                             | Fast HMR, modern defaults, simpler than CRA/Webpack                     |
| Routing         | React Router v6/v7               | Standard, declarative, lazy loading + nested routes                     |
| Server state    | TanStack Query (React Query)     | Caching/invalidation for accounts, txns                                 |
| Client/UI state | Zustand                          | Lightweight global store, no boilerplate                                |
| Forms           | React Hook Form + Zod            | Performant forms + schema validation                                    |
| Styling         | Tailwind CSS + shadcn/ui         | Consistent design system, accessible primitives                         |
| Icons           | lucide-react                     | Consistent, tree-shakeable icon set                                     |
| Charts          | Recharts                         | Lightweight charts for spending analytics                               |
| Mock API        | MSW (Mock Service Worker)        | Intercepts fetch in browser — realistic API layer, no backend           |
| Mock data       | Faker.js (@faker-js/faker)       | Deterministic seedable fake banking data                                |
| Mock auth       | Custom in-memory auth + MSW      | Simulates login/logout/JWT-ish tokens; swap later with real API         |
| i18n            | react-i18next                    | Locale-ready (en) — deferred to Phase 4                                 |
| Testing         | Vitest + RTL + MSW + Playwright  | Unit/integration + E2E                                                  |
| Lint/Format     | ESLint + Prettier                | Enforced via Husky + lint-staged                                        |
| Package mgr     | pnpm                             | Fast, deterministic installs                                            |

**Why this stack:** React+TS is the safest, most hireable choice for a production banking frontend. TanStack Query + Zustand cleanly separates server cache from UI state. MSW lets us build against a realistic API contract that can later be pointed at a real backend.

---

## 2. Architecture Principles

1. **Frontend-only, mock-first.** All data flows through an API abstraction layer backed by MSW. The API client is the single integration point to swap mock → real API later.
2. **Feature-based modularity.** Independent features (`accounts`, `transactions`, `transfers`, `settings`) that don't reach into each other.
3. **Strict separation of concerns:**
   - UI layer (components) — presentational.
   - Domain layer (types, validation, formatting) — pure logic, no React.
   - Data layer (api client, hooks) — async + caching.
4. **Money as a first-class citizen.** All monetary values stored as integer minor units (cents/pennies) in the domain model; formatted for display only. Never use floats for money.
5. **Route-level lazy loading.** Code-split each feature route to keep initial bundle small.
6. **Design system.** One source of truth for tokens (color, spacing, typography) via Tailwind theme + shadcn/ui primitives.
7. **Security-minded UI.** No sensitive data persisted to localStorage without explicit opt-in; session lives in memory by default; logout clears everything.
8. **Accessibility baked in.** WCAG 2.1 AA target (see a11y doc). Not an afterthought.
9. **Test pyramid.** Many unit tests, focused integration tests, few critical E2E flows.
10. **Configuration via environment variables** (`VITE_APP_*`), with sensible defaults so the app runs with zero config.

---

## 3. Folder Structure (Feature folders inside a single app)

```
banking-app/
├─ public/
├─ src/
│  ├─ app/                     # App shell, router, providers, error boundary
│  │  ├─ App.tsx
│  │  ├─ router.tsx
│  │  ├─ providers.tsx
│  │  ├─ ErrorBoundary.tsx
│  │  └─ routes.ts             # central route config (single source of truth)
│  ├─ components/
│  │  ├─ ui/                   # generic primitives (button, input, dialog… from shadcn)
│  │  ├─ layout/               # AppShell, Sidebar, Topbar, Footer
│  │  ├─ shared/               # cross-feature components (Money, Loading, EmptyState)
│  │  └─ auth/                 # LoginForm, RegisterForm, ProtectedRoute…
│  ├─ features/                # FEATURE MODULES (each self-contained)
│  │  ├─ accounts/
│  │  │  ├─ api/          # hooks + repo calls
│  │  │  ├─ components/   # feature-specific components
│  │  │  ├─ pages/        # route pages
│  │  │  ├─ types.ts      # domain types
│  │  │  └─ index.ts      # public exports
│  │  ├─ transactions/
│  │  ├─ transfers/
│  │  ├─ bills/           # (future)
│  │  ├─ cards/
│  │  ├─ investments/     # (future)
│  │  ├─ insights/        # analytics/spending
│  │  └─ settings/        # profile, security, preferences
│  ├─ hooks/                   # shared cross-feature hooks (useDebounce, useLocalStorage)
│  ├─ lib/
│  │  ├─ api/                  # API CLIENT
│  │  │  ├─ client.ts          # fetch wrapper (base URL, error normalization)
│  │  │  ├─ endpoints.ts       # endpoint map
│  │  │  ├─ types.ts           # API DTOs
│  │  │  └─ errors.ts          # ApiError, error mapping
│  │  ├─ money/                # Money lib (int minor-unit ops, formatting)
│  │  ├─ validation/           # zod schemas (shared with forms)
│  │  ├─ auth/                 # auth context, token store, protected-route guard
│  │  ├─ formatters/           # date, currency, number formatters
│  │  ├─ constants.ts
│  │  └─ utils.ts
│  ├─ mocks/                    # MSW + mock data (kept out of prod build)
│  │  ├─ data/                 # seed data generated by faker
│  │  ├─ handlers/             # per-domain request handlers
│  │  ├─ browser.ts            # MSW browser worker setup
│  │  ├─ server.ts             # MSW node server (for tests)
│  │  └─ index.ts
│  ├─ styles/
│  │  ├─ globals.css
│  │  └─ tokens.css
│  ├─ assets/
│  ├─ main.tsx
│  └─ vite-env.d.ts
├─ mocks/                       # MSW public worker script (mockServiceWorker.js)
├─ tests/
│  ├─ unit/
│  ├─ integration/
│  └─ e2e/                      # Playwright specs
├─ .env.example
├─ .eslintrc.cjs
├─ .prettierrc
├─ tsconfig.json
├─ tailwind.config.ts
├─ vite.config.ts
├─ playwright.config.ts
├─ vitest.config.ts
└─ index.html
```

**Key rule:** a feature folder may not import from another feature's internals — only from its public `index.ts` or from shared `lib`/`components`.
