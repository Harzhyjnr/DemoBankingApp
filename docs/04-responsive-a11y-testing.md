# Banking App — Responsive, Accessibility, Testing (v1)

> Status: **Proposed — pending approval** | Date: 2026-09-07

---

## 1. Responsive / Mobile Behavior

### Breakpoints (Tailwind defaults, customized)

| Prefix | Min-width | Typical target                 |
| ------ | --------- | ------------------------------ |
| `sm`   | 640px     | large phones                   |
| `md`   | 768px     | tablets                        |
| `lg`   | 1024px    | small laptops / sidebar stable |
| `xl`   | 1280px    | desktop                        |

### Layout behavior

- **Mobile (< lg)**: sidebar hidden → hamburger in topbar opens an overlay drawer; content is single-column; cards stack vertically; tables become card lists; primary actions bottom-sheet or inline (no floating action buttons → better a11y).
- **Desktop (≥ lg)**: persistent collapsible sidebar; content max-width container (`max-w-7xl`) centered; tables show all columns; multi-column dashboard grid with responsive grid templates (`grid-cols-1 md:grid-cols-2 xl:grid-cols-3`).
- **Transactions**: on mobile, collapse detail columns; date grouped, amount right-aligned and prominent.
- **Numbers/money**: don't shrink below readable size; amounts never wrap awkwardly — use `tabular-nums` and nowrap on money cells.
- **Touch targets** ≥ 44px (WCAG 2.5.8 target size); interactive elements have visible focus on touch.
- **Viewport**: `meta viewport` set; use `rem`-based sizing; test at 320px, 375px, 768px, 1024px, 1440px.

---

## 2. Accessibility Requirements (WCAG 2.1 AA target)

### Global

- Semantic landmarks: `header`, `nav`, `main`, `footer`; skip-to-content link.
- Page titles update per route (`document.title` via route loader or effect).
- Focus management: dialogs trap focus and restore on close; route changes reset focus to `main` (or the page-title heading).
- Keyboard: full app operable by keyboard — tab order logical, no keyboard traps, `Enter`/`Space` activate controls.
- Forms: labels associated with inputs (visible labels, `htmlFor`/`id`); errors announced (`aria-describedby` + `role="alert"`); required marked.
- Live regions: toasts and async status use `role="status"` / `aria-live="polite"`, never interruptive.
- Color contrast ≥ 4.5:1 for text (3:1 for large text / UI components); never color-only meaning — pair with text/icon. Support a high-contrast-friendly palette.
- Components (library-backed): Radix UI primitives (already focus/kbd/aria-tested) power the shadcn components.
- Reduced motion: respect `prefers-reduced-motion` — disable non-essential animations/transitions.
- Images/avatars: `alt` text; decorative icons `aria-hidden`, interactive icons get accessible names.

### Testing for a11y

- `jest-axe` assertions on rendered pages/components in unit/component tests.
- Manual keyboard-only pass checklist before each phase sign-off.

---

## 3. Testing Strategy

### Layers & tools

| Layer     | Tool                           | Scope                                                                                |
| --------- | ------------------------------ | ------------------------------------------------------------------------------------ |
| Unit      | Vitest + React Testing Library | Pure logic: money formatting, validators, date grouping, store reducers              |
| Component | Vitest + RTL + jsdom           | Components with mocked hooks/props; interaction tests                                |
| API/mock  | Vitest + MSW server            | Endpoint handlers: shapes, error codes, pagination, auth 401 flows                   |
| E2E       | Playwright                     | Critical user journeys against the running app + MSW (Chromium, and mobile viewport) |
| A11y      | jest-axe                       | Component-level axe checks                                                           |

### What we test

- **Unit**: `formatMoney` (minor units ↔ display, currency, locale), `validateTransfer` (zero/negative/overdraft), transaction date grouping, session expiry logic, pagination math.
- **Component**: Login form (validation errors, submit, error display), Transfer wizard (insufficient funds path), transaction filters, sidebar drawer open/close, ProtectedRoute redirect.
- **E2E (critical journeys)**: login → dashboard loads; login → transfer → confirmation + balance updates; register → onboard; frozen-card state persists visually; 404 fallback.
- **Contract**: MSW handlers return documented shapes; a `smoke` test asserts every endpoint 200/shape for a fresh seeded user.

### Coverage targets

- Unit/component: ≥ 80% line coverage on `lib/`, `components/`, `stores/`.
- E2E: 5–6 critical journeys, not exhaustive.

### CI (when we add it)

- `vitest run` → `playwright test` → typecheck → lint → build. (Single command via `npm run ci` placeholder.)

---

## 4. Coding Conventions

### TypeScript

- Strict mode on; no `any` (eslint `no-explicit-any` error). Type everything at the module boundary; infer internally.
- Domain types centralized in `core/types.ts` and reused across lib, mocks, components — single source of truth.

### Style

- Path alias `@/*` → `src/*`.
- File naming: kebab-case for files; components PascalCase inside.
- Barrel exports where it reduces import noise (`components/ui`).
- Tailwind utility classes for styling; design tokens via CSS variables (light/dark theme). No styling libs beyond Tailwind + Radix + shadcn tokens.
- Dark mode via class strategy; default light, respects system preference, toggleable.

### Conventions

- Functional components only; hooks for logic; custom hooks named `useX` and co-located with their feature.
- Prefer small, focused components; one feature slice per route folder since shared code lives in `components/`.
- Fetching in hooks: features do NOT call `fetch` directly — always through `lib/api/client.ts`.
- React Hook Form + zod for all forms; zod schemas shared between form validation and mock-server validation where possible.
- ESLint: `typescript-eslint` (recommended) + `react-hooks` + `jsx-a11y` + `import/order`. Prettier for formatting. Enforced via git pre-commit (husky + lint-staged).
- Commit convention: Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`, `test:`, `refactor:`).

---

## 5. Performance (frontend good practice)

- Code-splitting at route level (`React.lazy`/`Suspense`) — dashboard/login eager, feature routes lazy.
- Large lists paginated (transactions) — never render 600 rows at once.
- TanStack Query caching prevents refetch storms; staleTime tuned.
- Bundle watch: target `dist` < ~220KB gzip (route-split, no heavy chart lib in initial bundle — lazy-load charts).
- `prefers-reduced-motion` + requestAnimationFrame for animated counters if we add them.
