import type { TransactionType } from '@/lib/api/types'

export const TRANSACTION_TYPES: TransactionType[] = ['debit', 'credit', 'transfer']

export const TRANSACTION_CATEGORIES = [
  'Groceries',
  'Dining',
  'Transport',
  'Shopping',
  'Entertainment',
  'Utilities',
  'Health',
  'Travel',
  'Subscriptions',
  'Rent',
  'Salary',
  'Transfer',
  'Interest',
  'Withdrawal',
  'Payment',
] as const
