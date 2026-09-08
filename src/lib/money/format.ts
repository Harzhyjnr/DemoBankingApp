export const DEFAULT_CURRENCY = 'USD'
export const DEFAULT_LOCALE = 'en-US'

export interface FormatMoneyOptions {
  currency?: string
  locale?: string
}

export function formatMoney(
  amountMinor: number,
  { currency = DEFAULT_CURRENCY, locale = DEFAULT_LOCALE }: FormatMoneyOptions = {},
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amountMinor / 100)
}

export function toMinorUnits(amount: string | number): number {
  if (typeof amount === 'number') {
    return Math.round(amount * 100)
  }
  const [whole, fraction = ''] = amount.trim().split('.')
  const sign = whole.startsWith('-') ? -1 : 1
  const digits = `${Math.abs(Number(whole))}${fraction.padEnd(2, '0').slice(0, 2)}`
  return sign * Number(digits)
}
