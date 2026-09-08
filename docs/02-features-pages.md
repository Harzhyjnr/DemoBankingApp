# Banking App — Features & Pages (v1)

> Status: **Proposed — pending approval** | Date: 2026-09-07

---

## 1. Major Pages (Routes)

| Route                        | Page             | Auth | Purpose                                                 |
| ---------------------------- | ---------------- | ---- | ------------------------------------------------------- |
| `/`                          | Dashboard        | Yes  | Financial snapshot: balance, recent txns, quick actions |
| `/login`                     | Login            | No   | Sign in                                                 |
| `/register`                  | Register         | No   | Create account                                          |
| `/accounts`                  | Accounts list    | Yes  | All banking accounts with balances                      |
| `/accounts/:id`              | Account detail   | Yes  | Transactions, balance, account info                     |
| `/accounts/:id/transactions` | Transactions     | Yes  | Filtered/searchable txn history for an account          |
| `/transactions`              | All transactions | Yes  | Cross-account transaction history                       |
| `/transfers`                 | Transfer         | Yes  | Internal/external transfer wizard                       |
| `/cards`                     | Cards            | Yes  | List of cards, freeze/unfreeze                          |
| `/insights`                  | Insights         | Yes  | Spending analytics + charts                             |
| `/settings`                  | Settings         | Yes  | Profile, security, preferences                          |
| `/settings/security`         | Security         | Yes  | Change password, 2FA (mock), sessions                   |
| `/settings/notifications`    | Notifications    | Yes  | Notification preferences                                |
| `/404`                       | Not found        | —    | Fallback                                                |

Future (deferred, not built now): `/bills` (payments), `/investments`.

---

## 2. Major Banking Features

### Phase 1 — Core (MVP)

1. **Authentication (mock)** — login, register, logout, session in memory, protected routes. Reuses the same API contract a real backend would use.
2. **Dashboard** — aggregate balance across accounts, recent transactions, quick actions.
3. **Accounts** — list multiple account types (checking, savings, credit), balances in minor units, detail view.
4. **Transactions** — list, filter by date/category/type, search, pagination; grouping by day.
5. **Transfers** — between own accounts (instant, mock), amount validation (non-zero, balance check), confirmation step.

### Phase 2 — Enhancement

6. **Cards** — virtual card list, freeze/unfreeze toggle (mock), card masked display.
7. **Insights** — spending by category (donut/bar charts), monthly trend, top merchants.
8. **Pagination & filtering refinements** — server-style query params against MSW.

### Phase 3 — Polish & Scale

9. **Settings** — profile edit, security (change password, mock 2FA), notification preferences, currency/locale preference.
10. **Export** — CSV export of transactions (client-generated, mock).
11. **Print-friendly statements** — accessible, printable account statement.

### Deferred (not in scope until later phases)

- Bill pay, investments, marketplace, multi-currency support.

---

## 3. Reusable Components (Component Library)

### Primitives (`components/ui`) — from shadcn/ui, styled by design tokens

- `Button`, `Input`, `Label`, `Select`, `Dialog`, `Modal`
- `Table`, `Tabs`, `Badge`, `Tooltip`, `Alert`
- `Skeleton`, `Spinner`, `Toast/Sonner`, `Form` primitives

### Layout (`components/layout`)

- `AppShell` — authenticated layout with sidebar + topbar
- `Sidebar` — responsive nav (collapses on mobile → drawer)
- `Topbar` — user menu, notifications, search
- `UnauthenticatedLayout` — centered auth pages
- `Footer`

### Shared (`components/shared`)

- `Money` — renders a Money value with proper currency formatting (respects locale/preferred currency)
- `CurrencySelect`
- `AmountInput` — accepts decimals, converts to minor units; money-aware
- `TransactionRow` — reusable txn row (also used in lists and detail)
- `Pagination`
- `EmptyState`
- `PageHeader`
- `StatusBadge`
- `ConfirmDialog`
- `SearchInput`
- `DateRangeFilter`

### Auth (`components/auth`)

- `LoginForm`, `RegisterForm`, `ProtectedRoute`, `ProfileMenu`

---

## 4. Domain Types (core model, all money in minor units)

```ts
type Currency = 'USD' | 'EUR' | 'GBP'

interface Money {
  amount: number // integer minor units (cents), e.g. 12345 = 123.45
  currency: Currency
}

type AccountType = 'checking' | 'savings' | 'credit' | 'investment'

interface Account {
  id: string
  name: string
  type: AccountType
  number: string // masked, e.g. "•••• 4821"
  balance: Money
  availableBalance: Money
  currency: Currency
  status: 'active' | 'frozen' | 'closed'
  createdAt: string // ISO
}

type TransactionType = 'debit' | 'credit' | 'transfer'

interface Transaction {
  id: string
  accountId: string
  type: TransactionType
  amount: Money // signed? keep positive + type flag for clarity
  category: string
  merchant?: string
  description: string
  date: string // ISO datetime
  status: 'pending' | 'completed' | 'failed' | 'reversed'
  reference?: string
}

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  preferredCurrency: Currency
  avatarUrl?: string
}

interface Session {
  token: string // mock JWT-ish token
  user: User
  expiresAt: string
}

interface TransferRequest {
  amount: Money
  fromAccountId: string
  toAccountId: string // internal; "external" deferred
  description?: string
}
```
