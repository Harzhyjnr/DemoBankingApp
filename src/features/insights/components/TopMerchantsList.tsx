import { formatMoney } from '@/lib/money'
import type { TopMerchant as TopMerchantType } from '@/lib/api/types'

export function TopMerchantsList({ merchants }: { merchants: TopMerchantType[] }) {
  if (merchants.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">No merchant spending yet.</p>
    )
  }

  const currency = merchants[0].currency

  return (
    <ol className="space-y-3">
      {merchants.map(({ merchant, amount, count }, index) => (
        <li key={`${merchant}-${index}`} className="flex items-center justify-between gap-4">
          <span className="flex min-w-0 items-center gap-3">
            <span className="font-mono text-xs tabular-nums text-muted-foreground">
              {String(index + 1).padStart(2, '0')}
            </span>
            <span className="truncate text-sm font-medium">{merchant}</span>
          </span>
          <span className="flex shrink-0 items-center gap-3">
            <span className="text-xs text-muted-foreground">
              {count} {count === 1 ? 'txn' : 'txns'}
            </span>
            <span className="w-24 text-right text-sm font-semibold tabular-nums">
              {formatMoney(amount, { currency })}
            </span>
          </span>
        </li>
      ))}
    </ol>
  )
}
