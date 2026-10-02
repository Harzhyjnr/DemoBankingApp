import type { MonthlySpend, SpendingBucket } from '@/lib/api/types'

export const INSIGHT_PERIODS = [
  { value: 3, label: '3M' },
  { value: 6, label: '6M' },
  { value: 12, label: '12M' },
] as const

export type InsightPeriod = (typeof INSIGHT_PERIODS)[number]['value']

export function sliceMonthly(monthly: MonthlySpend[], months: number): MonthlySpend[] {
  return monthly.slice(-months)
}

export function totalSpend(entries: Array<MonthlySpend | SpendingBucket>): number {
  return entries.reduce((sum, entry) => sum + entry.amount, 0)
}

export interface CategoryShare extends SpendingBucket {
  pct: number
}

export function categoryShares(
  buckets: SpendingBucket[],
  total = totalSpend(buckets),
): CategoryShare[] {
  return buckets.map((bucket) => ({
    ...bucket,
    pct: total === 0 ? 0 : Math.round((bucket.amount / total) * 100),
  }))
}

export function topCategory(buckets: SpendingBucket[]): SpendingBucket | null {
  return buckets.length === 0 ? null : buckets[0]
}

export function periodDelta(monthly: MonthlySpend[], months: number): number | null {
  const windowed = sliceMonthly(monthly, months * 2)
  const past = totalSpend(windowed.slice(0, windowed.length - months))
  const current = totalSpend(windowed.slice(windowed.length - months))
  if (past === 0) return null
  return Math.round(((current - past) / past) * 100)
}
