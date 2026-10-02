import { describe, expect, it } from 'vitest'

import {
  categoryShares,
  periodDelta,
  sliceMonthly,
  topCategory,
  totalSpend,
} from '@/features/insights/lib/aggregate'

const MONTHLY = [
  { month: '2026-04', amount: 20000, currency: 'NGN' as const },
  { month: '2026-05', amount: 25000, currency: 'NGN' as const },
  { month: '2026-06', amount: 35000, currency: 'NGN' as const },
  { month: '2026-07', amount: 30000, currency: 'NGN' as const },
  { month: '2026-08', amount: 42000, currency: 'NGN' as const },
  { month: '2026-09', amount: 28000, currency: 'NGN' as const },
]

const BUCKETS = [
  { category: 'Dining', amount: 15000, currency: 'NGN' as const },
  { category: 'Groceries', amount: 10000, currency: 'NGN' as const },
  { category: 'Transport', amount: 5000, currency: 'NGN' as const },
]

describe('insight aggregation helpers', () => {
  describe('sliceMonthly', () => {
    it('returns the last N months', () => {
      expect(sliceMonthly(MONTHLY, 3)).toHaveLength(3)
      expect(sliceMonthly(MONTHLY, 1)).toHaveLength(1)
      expect(sliceMonthly(MONTHLY, 1)[0].month).toBe('2026-09')
    })

    it('returns all months if N >= length', () => {
      expect(sliceMonthly(MONTHLY, 12)).toHaveLength(6)
    })

    it('returns empty for 0 months (never used, but handles gracefully)', () => {
      expect(sliceMonthly([], 3)).toHaveLength(0)
    })
  })

  describe('totalSpend', () => {
    it('sums amounts', () => {
      expect(totalSpend(BUCKETS)).toBe(30000)
    })

    it('returns 0 for empty arrays', () => {
      expect(totalSpend([])).toBe(0)
    })
  })

  describe('categoryShares', () => {
    it('computes percentage shares rounding to 100', () => {
      const shares = categoryShares(BUCKETS)
      expect(shares.map((s) => s.pct)).toEqual([50, 33, 17])
      expect(shares.reduce((sum, s) => sum + s.pct, 0)).toBe(100)
    })

    it('returns all 0 for empty buckets', () => {
      expect(categoryShares([])).toEqual([])
    })
  })

  describe('topCategory', () => {
    it('returns the first bucket', () => {
      expect(topCategory(BUCKETS)?.category).toBe('Dining')
    })

    it('returns null for empty buckets', () => {
      expect(topCategory([])).toBeNull()
    })
  })

  describe('periodDelta', () => {
    it('returns percentage difference vs the prior period', () => {
      // 3M: {Jul 30k, Aug 42k, Sep 28k} = 100k; prior 3M: {Apr 20k, May 25k, Jun 35k} = 80k => 25%
      const delta = periodDelta(MONTHLY, 3)
      expect(delta).toBe(25)
    })

    it('returns null when previous period has 0 spend', () => {
      const short = [MONTHLY[5]]
      expect(periodDelta(short, 3)).toBeNull()
    })
  })
})
