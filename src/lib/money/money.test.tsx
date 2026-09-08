import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { formatMoney, toMinorUnits } from '@/lib/money'
import { Money } from '@/components/shared/Money'

describe('formatMoney', () => {
  it('formats minor units as USD currency by default', () => {
    expect(formatMoney(123456)).toBe('$1,234.56')
  })

  it('formats zero', () => {
    expect(formatMoney(0)).toBe('$0.00')
  })

  it('formats negative amounts', () => {
    expect(formatMoney(-2500)).toBe('-$25.00')
  })

  it('formats with a different currency (EUR)', () => {
    expect(formatMoney(123456, { currency: 'EUR', locale: 'de-DE' })).toBe('1.234,56\xa0€')
  })
})

describe('toMinorUnits', () => {
  it('converts a decimal string to minor units', () => {
    expect(toMinorUnits('1234.56')).toBe(123456)
    expect(toMinorUnits('0.05')).toBe(5)
    expect(toMinorUnits('-20')).toBe(-2000)
  })

  it('rounds a float safely instead of drifting', () => {
    expect(toMinorUnits(19.99)).toBe(1999)
  })
})

describe('Money component', () => {
  it('renders formatted money', () => {
    render(<Money amount={123456} />)
    expect(screen.getByTestId('money')).toHaveTextContent('$1,234.56')
  })
})
