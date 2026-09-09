export type Currency = 'USD' | 'EUR' | 'GBP'

export interface Money {
  /** Integer minor units (cents/pence), e.g. 12345 = $123.45. Signed for transactions. */
  amount: number
  currency: Currency
}

export type AccountType = 'checking' | 'savings' | 'credit' | 'investment'

export interface Account {
  id: string
  name: string
  type: AccountType
  number: string
  balance: Money
  availableBalance: Money
  currency: Currency
  status: 'active' | 'frozen' | 'closed'
  createdAt: string
}

export type TransactionType = 'debit' | 'credit' | 'transfer'
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'reversed'

export interface Transaction {
  id: string
  accountId: string
  type: TransactionType
  /** Signed minor units: negative for money out, positive for money in. */
  amount: Money
  category: string
  merchant?: string
  description: string
  date: string
  status: TransactionStatus
  reference?: string
}

export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  preferredCurrency: Currency
  avatarUrl?: string
}

export interface AuthResponse {
  token: string
  user: User
}

export interface Session {
  token: string
  user: User
  expiresAt: string
}

export interface TransferRequest {
  amount: Money
  fromAccountId: string
  toAccountId: string
  description?: string
}

export interface TransferResult {
  debit: Transaction
  credit: Transaction
}

export type CardBrand = 'Visa' | 'Mastercard'
export type CardStatus = 'active' | 'frozen' | 'closed'

export interface Card {
  id: string
  accountId: string
  name: string
  brand: CardBrand
  last4: string
  maskedNumber: string
  expiry: string
  status: CardStatus
}

export interface Paginated<T> {
  items: T[]
  page: number
  total: number
  totalPages: number
}

export type PaginationParams = {
  page?: number
  limit?: number
  category?: string
  type?: TransactionType
  from?: string
  to?: string
  q?: string
}

export interface SpendingBucket {
  category: string
  amount: number
  currency: Currency
}

export interface MonthlySpend {
  month: string
  amount: number
  currency: Currency
}

export interface TopMerchant {
  merchant: string
  amount: number
  count: number
  currency: Currency
}

export interface SpendingInsights {
  byCategory: SpendingBucket[]
  monthly: MonthlySpend[]
  topMerchants: TopMerchant[]
}

export interface ProfileUpdate {
  firstName?: string
  lastName?: string
  preferredCurrency?: Currency
}

export interface ApiErrorBody {
  error: {
    code: string
    message: string
    details?: unknown
  }
}
