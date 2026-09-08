import { faker } from '@faker-js/faker'
import type { Account, AccountType, Card, Transaction, TransactionType } from '@/lib/api/types'

export const DEFAULT_MOCK_SEED = 20260907

export interface MockUserRecord {
  id: string
  firstName: string
  lastName: string
  email: string
  password: string
  preferredCurrency: 'USD' | 'EUR' | 'GBP'
  createdAt: string
}

export interface SeedBundle {
  user: MockUserRecord
  accounts: Account[]
  transactions: Transaction[]
  cards: Card[]
}

const ACCOUNT_DEFS: Array<{
  id: string
  type: AccountType
  name: string
  last4: string
}> = [
  { id: 'acc_checking', type: 'checking', name: 'Everyday Checking', last4: '4821' },
  { id: 'acc_spending', type: 'checking', name: 'Spending Checking', last4: '0934' },
  { id: 'acc_savings', type: 'savings', name: 'High Yield Savings', last4: '7762' },
  { id: 'acc_credit', type: 'credit', name: 'Travel Credit Card', last4: '5501' },
]

const CATEGORY_MERCHANTS: Record<string, string[]> = {
  Groceries: ["Trader Joe's", 'Whole Foods', 'Safeway', 'Costco', 'Kroger'],
  Dining: ['Chipotle', 'Starbucks', 'Blue Bottle', 'Burger Joint', 'Pasta Palace'],
  Transport: ['Uber', 'Lyft', 'Shell', 'City Transit', 'Bolt'],
  Shopping: ['Amazon', 'Target', 'IKEA', 'Zara', 'Best Buy', 'Etsy'],
  Entertainment: ['Netflix', 'Spotify', 'AMC Theatres', 'Steam', 'Disney+'],
  Utilities: ['Pacific Gas & Electric', 'AT&T', 'Comcast', 'City Water & Power'],
  Health: ['CVS Pharmacy', 'Walgreens', 'City Dental', 'Kaiser'],
  Travel: ['Delta Air Lines', 'Airbnb', 'Marriott', 'Expedia'],
  Subscriptions: ['iCloud', 'Notion', 'Adobe', 'GitHub'],
}

const DEBIT_CATEGORIES = Object.keys(CATEGORY_MERCHANTS)

const TRANSFER_OPTIONS: Array<{ type: TransactionType; amount: number }> = [
  { type: 'transfer', amount: 100_000 },
  { type: 'transfer', amount: 150_000 },
  { type: 'transfer', amount: 200_000 },
  { type: 'transfer', amount: 75_000 },
]

function seedData(seed: number = DEFAULT_MOCK_SEED): SeedBundle {
  faker.seed(seed)

  const user: MockUserRecord = {
    id: 'usr_demo',
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    email: 'demo@bank.com',
    password: 'demo1234',
    preferredCurrency: 'USD',
    createdAt: '2024-01-15T08:00:00.000Z',
  }

  const transactions: Transaction[] = []
  const now = new Date()
  let counter = 0

  const pick = <T>(items: T[]): T => faker.helpers.arrayElement(items)

  const pushTxn = (
    accountId: string,
    type: TransactionType,
    category: string,
    merchant: string,
    absAmount: number,
    base: Date,
    description?: string,
  ) => {
    const amount = type === 'debit' ? -absAmount : absAmount
    const day = faker.number.int({ min: 1, max: 28 })
    const hour = faker.number.int({ min: 0, max: 23 })
    const minute = faker.number.int({ min: 0, max: 59 })
    const date = new Date(base.getFullYear(), base.getMonth(), day, hour, minute).toISOString()
    transactions.push({
      id: `txn_${counter++}`,
      accountId,
      type,
      amount: { amount, currency: 'USD' },
      category,
      merchant,
      description: description ?? merchant,
      date,
      status: faker.number.int({ min: 0, max: 99 }) < 5 ? 'pending' : 'completed',
      ...(type === 'transfer'
        ? { reference: `TRF-${faker.string.alphanumeric(8).toUpperCase()}` }
        : {}),
    })
  }

  for (let offset = 0; offset < 12; offset++) {
    const base = new Date(now.getFullYear(), now.getMonth() - offset, 1)

    const checkingCount = faker.number.int({ min: 10, max: 14 })
    for (let i = 0; i < checkingCount; i++) {
      const category = pick(DEBIT_CATEGORIES)
      pushTxn(
        'acc_checking',
        'debit',
        category,
        pick(CATEGORY_MERCHANTS[category]),
        faker.number.int({ min: 400, max: 45_000 }),
        base,
      )
    }
    pushTxn(
      'acc_checking',
      'debit',
      'Rent',
      'Landlord LLC',
      faker.number.int({ min: 170_000, max: 190_000 }),
      base,
    )
    pushTxn(
      'acc_checking',
      'credit',
      'Salary',
      'Acme Inc',
      faker.number.int({ min: 620_000, max: 720_000 }),
      base,
    )

    const spendingCount = faker.number.int({ min: 8, max: 12 })
    for (let i = 0; i < spendingCount; i++) {
      const category = pick(DEBIT_CATEGORIES)
      pushTxn(
        'acc_spending',
        'debit',
        category,
        pick(CATEGORY_MERCHANTS[category]),
        faker.number.int({ min: 300, max: 30_000 }),
        base,
      )
    }
    pushTxn(
      'acc_spending',
      'transfer',
      'Transfer',
      'Internal Transfer',
      pick(TRANSFER_OPTIONS).amount,
      base,
    )

    const savingsCount = faker.number.int({ min: 2, max: 4 })
    for (let i = 0; i < savingsCount; i++) {
      pushTxn(
        'acc_savings',
        'transfer',
        'Transfer',
        'Internal Transfer',
        faker.number.int({ min: 10_000, max: 80_000 }),
        base,
      )
    }
    pushTxn(
      'acc_savings',
      'credit',
      'Interest',
      'Bank Interest',
      faker.number.int({ min: 600, max: 4_000 }),
      base,
    )
    if (faker.number.int({ min: 0, max: 9 }) < 3) {
      pushTxn(
        'acc_savings',
        'debit',
        'Withdrawal',
        'Automatic Withdrawal',
        faker.number.int({ min: 25_000, max: 75_000 }),
        base,
      )
    }

    const purchasesCount = faker.number.int({ min: 8, max: 12 })
    for (let i = 0; i < purchasesCount; i++) {
      const category = pick(DEBIT_CATEGORIES)
      pushTxn(
        'acc_credit',
        'debit',
        category,
        pick(CATEGORY_MERCHANTS[category]),
        faker.number.int({ min: 300, max: 15_000 }),
        base,
      )
    }
    pushTxn(
      'acc_credit',
      'credit',
      'Payment',
      'Credit Card Payment',
      faker.number.int({ min: 50_000, max: 120_000 }),
      base,
    )
  }

  transactions.sort((a, b) => b.date.localeCompare(a.date))

  const balances: Record<string, number> = {}
  for (const txn of transactions) {
    balances[txn.accountId] = (balances[txn.accountId] ?? 0) + txn.amount.amount
  }

  const accounts: Account[] = ACCOUNT_DEFS.map((def, index) => {
    const balance = balances[def.id] ?? 0
    return {
      id: def.id,
      name: def.name,
      type: def.type,
      number: maskNumber(def.last4),
      balance: { amount: balance, currency: 'USD' },
      availableBalance: { amount: balance, currency: 'USD' },
      currency: 'USD',
      status: 'active',
      createdAt: `2024-0${index + 1}-05T12:00:00.000Z`,
    }
  })

  const cards: Card[] = [
    {
      id: 'card_visa',
      accountId: 'acc_checking',
      name: 'Everyday Visa',
      brand: 'Visa',
      last4: '4821',
      maskedNumber: maskNumber('4821'),
      expiry: '09/28',
      status: 'active',
    },
    {
      id: 'card_mc',
      accountId: 'acc_checking',
      name: 'Everyday Mastercard',
      brand: 'Mastercard',
      last4: '9137',
      maskedNumber: maskNumber('9137'),
      expiry: '03/29',
      status: 'active',
    },
  ]

  return { user, accounts, transactions, cards }
}

function maskNumber(last4: string): string {
  return `•••• ${last4}`
}

export default seedData
