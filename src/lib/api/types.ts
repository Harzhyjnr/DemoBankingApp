export type Currency = 'NGN' | 'USD' | 'EUR' | 'GBP'

export type AssetSymbol = 'BTC' | 'ETH' | 'USDT'

export interface CryptoHolding {
  symbol: AssetSymbol
  /** Human-readable coin amount, e.g. 0.2415 BTC. Stored as a number for simplicity. */
  balance: number
  /** Value of the holding in minor units of the preferred currency (NGN default). */
  value: number
}

export interface MarketPrice {
  symbol: AssetSymbol
  name: string
  /** Price per coin in minor units of the preferred currency (kobo for NGN). */
  price: number
  /** Signed 24h change as a percentage, e.g. 3.42 or -1.2. */
  change24h: number
  sparkline: number[]
}

export interface PortfolioSummary {
  /** Total value of naira cash + crypto, in minor units of the preferred currency. */
  totalValue: number
  /** Value of naira bank balances, in minor units. */
  cashValue: number
  /** Value of crypto holdings, in minor units. */
  cryptoValue: number
  /** Signed 24h change of the portfolio percentage. */
  change24h: number
  currency: Currency
}

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
  /** 4-digit confirmation PIN. */
  pin: string
}

export interface TransferResult {
  debit: Transaction
  credit: Transaction
}

export interface RecentTransfer {
  id: string
  reference: string
  fromAccountId: string
  toAccountId: string
  amount: Money
  description: string
  date: string
}

export interface TransferRecipient {
  accountId: string
  accountName: string
  lastTransferAt: string
  transferCount: number
}

export interface RecentTransfersResponse {
  transfers: RecentTransfer[]
  recipients: TransferRecipient[]
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

export interface NotificationPreferences {
  transferAlerts: boolean
  securityAlerts: boolean
  promotions: boolean
}

export interface ApiErrorBody {
  error: {
    code: string
    message: string
    details?: unknown
  }
}
