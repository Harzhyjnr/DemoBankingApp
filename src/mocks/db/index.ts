import seedData, { DEFAULT_MOCK_SEED, type MockUserRecord } from '@/mocks/db/seed'
import { activeTokenUserId, createToken } from '@/mocks/db/tokens'
import type {
  Account,
  Card,
  Currency,
  NotificationPreferences,
  Paginated,
  PaginationParams,
  RecentTransfer,
  RecentTransfersResponse,
  SpendingInsights,
  Transaction,
  TransferRecipient,
  TransferResult,
  User,
} from '@/lib/api/types'

const CURRENCIES: Currency[] = ['NGN', 'USD', 'EUR', 'GBP']

const DEFAULT_NOTIFICATION_PREFS: NotificationPreferences = {
  transferAlerts: true,
  securityAlerts: true,
  promotions: false,
}

interface TransferInput {
  fromAccountId: string
  toAccountId: string
  amount: number
  currency: Currency
  description?: string
}

interface ProfilePatch {
  firstName?: string
  lastName?: string
  preferredCurrency?: Currency
}

let users: MockUserRecord[]
let accounts: Account[]
let transactions: Transaction[]
let cards: Card[]
let userSeq: number
let txnSeq: number
let transferCounter: number
let notificationPrefs: Record<string, NotificationPreferences>

function init() {
  const seed = Number(import.meta.env.VITE_APP_MOCK_SEED ?? DEFAULT_MOCK_SEED)
  const bundle = seedData(seed)
  users = [bundle.user]
  accounts = bundle.accounts
  transactions = bundle.transactions
  cards = bundle.cards
  userSeq = 1
  txnSeq = transactions.length
  transferCounter = 0
  notificationPrefs = {}
}

init()

export const db = {
  reset: init,

  toPublicUser(record: MockUserRecord): User {
    return {
      id: record.id,
      firstName: record.firstName,
      lastName: record.lastName,
      email: record.email,
      preferredCurrency: record.preferredCurrency,
    }
  },

  findUserByEmail(email: string): MockUserRecord | null {
    return users.find((record) => record.email.toLowerCase() === email.toLowerCase()) ?? null
  },

  findUserByBvn(bvn: string): MockUserRecord | null {
    return users.find((record) => record.bvn === bvn) ?? null
  },

  findUserByNin(nin: string): MockUserRecord | null {
    return users.find((record) => record.nin === nin) ?? null
  },

  findUserById(id: string): MockUserRecord | null {
    return users.find((record) => record.id === id) ?? null
  },

  createUser(input: {
    firstName: string
    lastName: string
    email: string
    password: string
    bvn: string
    nin: string
  }): MockUserRecord | null {
    if (this.findUserByEmail(input.email)) return null
    if (users.some((record) => record.bvn === input.bvn)) return null
    if (users.some((record) => record.nin === input.nin)) return null
    const record: MockUserRecord = {
      id: `usr_${userSeq++}`,
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      password: input.password,
      pin: '1234',
      preferredCurrency: 'NGN',
      bvn: input.bvn,
      nin: input.nin,
      createdAt: new Date().toISOString(),
    }
    users.push(record)
    return record
  },

  issueToken(userId: string): string {
    return createToken(userId)
  },

  requireAuth(request: Request): string | null {
    const header = request.headers.get('authorization')
    if (!header?.startsWith('Bearer ')) return null
    const userId = activeTokenUserId(header.slice('Bearer '.length))
    if (!userId) return null
    return this.findUserById(userId) ? userId : null
  },

  getUserAccounts(userId: string): Account[] {
    return this.findUserById(userId) ? accounts : []
  },

  getAccountForUser(userId: string, accountId: string): Account | null {
    if (!this.findUserById(userId)) return null
    return accounts.find((account) => account.id === accountId) ?? null
  },

  getUserAccountIds(userId: string): string[] {
    return this.getUserAccounts(userId).map((account) => account.id)
  },

  getAccountTransactions(
    userId: string,
    accountId: string,
    params: PaginationParams,
  ): Paginated<Transaction> {
    if (!this.getAccountForUser(userId, accountId)) {
      return { items: [], page: 1, total: 0, totalPages: 1 }
    }
    const scoped = transactions.filter((txn) => txn.accountId === accountId)
    return this.paginate(this.filterTransactions(scoped, params), params)
  },

  getAllTransactions(userId: string, params: PaginationParams): Paginated<Transaction> {
    const accountIds = this.getUserAccountIds(userId)
    const scoped = transactions.filter((txn) => accountIds.includes(txn.accountId))
    return this.paginate(this.filterTransactions(scoped, params), params)
  },

  filterTransactions(list: Transaction[], params: PaginationParams): Transaction[] {
    let result = list
    if (params.category) {
      result = result.filter((txn) => txn.category === params.category)
    }
    if (params.type) {
      result = result.filter((txn) => txn.type === params.type)
    }
    if (params.from) {
      result = result.filter((txn) => txn.date.slice(0, 10) >= params.from!)
    }
    if (params.to) {
      result = result.filter((txn) => txn.date.slice(0, 10) <= params.to!)
    }
    if (params.q) {
      const query = params.q.toLowerCase()
      result = result.filter((txn) =>
        [txn.description, txn.merchant, txn.reference, txn.category].some((value) =>
          value?.toLowerCase().includes(query),
        ),
      )
    }
    return result
  },

  paginate<T>(list: T[], params: PaginationParams): Paginated<T> {
    const limit = Math.min(Math.max(Number(params.limit) || 25, 1), 100)
    const page = Math.max(Number(params.page) || 1, 1)
    const total = list.length
    const start = (page - 1) * limit
    return {
      items: list.slice(start, start + limit),
      page,
      total,
      totalPages: Math.max(Math.ceil(total / limit), 1),
    }
  },

  executeTransfer(input: TransferInput): TransferResult {
    const now = new Date().toISOString()
    const reference = `TRF-${Date.now().toString(36).toUpperCase()}-${transferCounter++}`
    const debit: Transaction = {
      id: `txn_${txnSeq++}`,
      accountId: input.fromAccountId,
      type: 'transfer',
      amount: { amount: -input.amount, currency: input.currency },
      category: 'Transfer',
      description: input.description ?? 'Internal transfer',
      date: now,
      status: 'completed',
      reference,
    }
    const credit: Transaction = {
      ...debit,
      id: `txn_${txnSeq++}`,
      accountId: input.toAccountId,
      amount: { amount: input.amount, currency: input.currency },
    }

    transactions.push(debit, credit)

    const fromAccount = accounts.find((account) => account.id === input.fromAccountId)
    const toAccount = accounts.find((account) => account.id === input.toAccountId)
    if (fromAccount) {
      fromAccount.balance.amount -= input.amount
      fromAccount.availableBalance.amount = fromAccount.balance.amount
    }
    if (toAccount) {
      toAccount.balance.amount += input.amount
      toAccount.availableBalance.amount = toAccount.balance.amount
    }

    return { debit, credit }
  },

  getRecentTransfers(userId: string, limit = 5): RecentTransfer[] {
    const accountIds = this.getUserAccountIds(userId)
    const transfersByReference = new Map<string, Transaction[]>()
    for (const txn of transactions) {
      if (!accountIds.includes(txn.accountId) || txn.type !== 'transfer' || !txn.reference) {
        continue
      }
      const group = transfersByReference.get(txn.reference) ?? []
      group.push(txn)
      transfersByReference.set(txn.reference, group)
    }

    const recents: RecentTransfer[] = []
    for (const [reference, group] of transfersByReference) {
      const debit = group.find((txn) => txn.amount.amount < 0)
      const credit = group.find((txn) => txn.amount.amount > 0)
      if (!debit || !credit) continue
      recents.push({
        id: debit.id,
        reference,
        fromAccountId: debit.accountId,
        toAccountId: credit.accountId,
        amount: { amount: Math.abs(debit.amount.amount), currency: debit.amount.currency },
        description: debit.description,
        date: debit.date,
      })
    }
    return recents.sort((a, b) => b.date.localeCompare(a.date)).slice(0, Math.max(limit, 1))
  },

  getRecentRecipients(userId: string, limit = 4): TransferRecipient[] {
    const accountIds = this.getUserAccountIds(userId)
    const receivedByAccount = new Map<string, { lastTransferAt: string; transferCount: number }>()
    for (const txn of transactions) {
      if (
        !accountIds.includes(txn.accountId) ||
        txn.type !== 'transfer' ||
        txn.amount.amount <= 0
      ) {
        continue
      }
      const current = receivedByAccount.get(txn.accountId) ?? {
        lastTransferAt: txn.date,
        transferCount: 0,
      }
      if (txn.date > current.lastTransferAt) current.lastTransferAt = txn.date
      current.transferCount += 1
      receivedByAccount.set(txn.accountId, current)
    }

    const accountNameById = new Map(accounts.map((account) => [account.id, account.name]))
    return [...receivedByAccount.entries()]
      .map(([accountId, stats]) => ({
        accountId,
        accountName: accountNameById.get(accountId) ?? accountId,
        lastTransferAt: stats.lastTransferAt,
        transferCount: stats.transferCount,
      }))
      .sort((a, b) => b.lastTransferAt.localeCompare(a.lastTransferAt))
      .slice(0, Math.max(limit, 1))
  },

  getRecentTransfersResponse(userId: string): RecentTransfersResponse {
    return {
      transfers: this.getRecentTransfers(userId, 5),
      recipients: this.getRecentRecipients(userId, 4),
    }
  },

  getCardsForUser(userId: string): Card[] {
    const accountIds = this.getUserAccountIds(userId)
    return cards.filter((card) => accountIds.includes(card.accountId))
  },

  getCardForUser(userId: string, cardId: string): Card | null {
    return this.getCardsForUser(userId).find((card) => card.id === cardId) ?? null
  },

  setCardStatus(cardId: string, status: 'active' | 'frozen'): Card | null {
    const card = cards.find((entry) => entry.id === cardId)
    if (!card) return null
    card.status = status
    return card
  },

  getInsights(userId: string): SpendingInsights {
    const accountIds = this.getUserAccountIds(userId)
    const debits = transactions.filter(
      (txn) => accountIds.includes(txn.accountId) && txn.amount.amount < 0,
    )

    const byCategory = new Map<string, number>()
    for (const txn of debits) {
      byCategory.set(txn.category, (byCategory.get(txn.category) ?? 0) - txn.amount.amount)
    }

    const monthly = new Map<string, number>()
    for (const txn of debits) {
      const month = txn.date.slice(0, 7)
      monthly.set(month, (monthly.get(month) ?? 0) - txn.amount.amount)
    }

    const topMerchants = new Map<string, { amount: number; count: number }>()
    for (const txn of debits) {
      const merchant = txn.merchant ?? txn.description
      const existing = topMerchants.get(merchant) ?? { amount: 0, count: 0 }
      topMerchants.set(merchant, {
        amount: existing.amount - txn.amount.amount,
        count: existing.count + 1,
      })
    }

    return {
      byCategory: [...byCategory.entries()]
        .map(([category, amount]) => ({ category, amount, currency: 'NGN' as Currency }))
        .sort((a, b) => b.amount - a.amount),
      monthly: [...monthly.entries()]
        .map(([month, amount]) => ({ month, amount, currency: 'NGN' as Currency }))
        .sort((a, b) => a.month.localeCompare(b.month)),
      topMerchants: [...topMerchants.entries()]
        .map(([merchant, stats]) => ({
          merchant,
          amount: stats.amount,
          count: stats.count,
          currency: 'NGN' as Currency,
        }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5),
    }
  },

  updateProfile(userId: string, patch: ProfilePatch): User | null {
    const record = this.findUserById(userId)
    if (!record) return null
    if (patch.firstName !== undefined) record.firstName = patch.firstName
    if (patch.lastName !== undefined) record.lastName = patch.lastName
    if (patch.preferredCurrency !== undefined && CURRENCIES.includes(patch.preferredCurrency)) {
      record.preferredCurrency = patch.preferredCurrency
    }
    return this.toPublicUser(record)
  },

  getNotificationPreferences(userId: string): NotificationPreferences {
    return { ...DEFAULT_NOTIFICATION_PREFS, ...notificationPrefs[userId] }
  },

  setNotificationPreferences(
    userId: string,
    prefs: NotificationPreferences,
  ): NotificationPreferences {
    notificationPrefs[userId] = { ...prefs }
    return { ...notificationPrefs[userId] }
  },
}
