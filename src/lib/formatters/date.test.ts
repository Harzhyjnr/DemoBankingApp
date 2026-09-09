import { describe, expect, it } from 'vitest'
import { formatDate, formatMonthShort } from '@/lib/formatters/date'

describe('formatDate', () => {
  it('formats an ISO date as a readable US date', () => {
    expect(formatDate('2026-09-08T14:30:00.000Z')).toBe('Sep 8, 2026')
  })

  it('handles midnight-safe local dates without timezone shifting', () => {
    expect(formatDate('2026-01-01T00:00:00.000Z')).toBe('Jan 1, 2026')
  })

  it('returns the raw slice for malformed input', () => {
    expect(formatDate('not-a-date')).toBe('not-a-date')
  })

  it('returns an empty string for empty input', () => {
    expect(formatDate('')).toBe('')
  })
})

describe('formatMonthShort', () => {
  it('formats a YYYY-MM month into a short month label', () => {
    expect(formatMonthShort('2026-03')).toBe('Mar')
  })

  it('returns the input when the month is invalid', () => {
    expect(formatMonthShort('2026-13')).toBe('2026-13')
    expect(formatMonthShort('oops')).toBe('oops')
  })
})
