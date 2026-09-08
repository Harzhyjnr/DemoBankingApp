# Banking App (Frontend)

Frontend-only banking application demo. All data is mocked via MSW — no backend required.

## Prerequisites

- Node.js 20+
- npm

## Getting started

```bash
npm install   # also generates the MSW service worker
npm run dev   # start dev server (http://localhost:5173)
```

## Scripts

| Script             | Description                                      |
| ------------------ | ------------------------------------------------ |
| `npm run dev`      | Start the Vite dev server                        |
| `npm run build`    | Typecheck + lint + build (`dist`)                |
| `npm run preview`  | Preview the production build                     |
| `npm run lint`     | ESLint                                           |
| `npm run format`   | Prettier write                                   |
| `npm run test`     | Vitest unit/integration tests                    |
| `npm run test:e2e` | Playwright e2e tests                             |
| `npm run ci`       | Full pipeline (typecheck → lint → tests → build) |

## Architecture

See [`docs/`](docs/) for the architecture, phases, features, data/state model, and a11y/test strategy.

Key layout: feature modules live in `src/features/*`, shared logic in `src/lib/*`, MSW mocks in `src/mocks/*`. The API client (`src/lib/api/client.ts`) is the single HTTP integration point.

## Demo credentials

- `demo@bank.com` / `demo1234` (seeded, via MSW — auth lands in Phase 2)
