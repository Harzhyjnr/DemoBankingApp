import { formatMoney, type FormatMoneyOptions } from '@/lib/money'

export interface MoneyProps extends FormatMoneyOptions {
  amount: number
  className?: string
}

export function Money({ amount, currency, locale, className }: MoneyProps) {
  return (
    <span className={className} data-testid="money">
      {formatMoney(amount, { currency, locale })}
    </span>
  )
}
