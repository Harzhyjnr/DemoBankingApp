import { formatMoney } from '@/lib/money'
import type { CategoryShare } from '@/features/insights/lib/aggregate'

export function CategoryBreakdown({ shares }: { shares: CategoryShare[] }) {
  if (shares.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">No spend categorized yet.</p>
    )
  }

  const currency = shares[0].currency

  return (
    <ul className="space-y-4">
      {shares.map(({ category, amount, pct }) => (
        <li key={category}>
          <div className="flex items-baseline justify-between gap-4">
            <span className="text-sm font-medium">{category}</span>
            <span className="text-sm tabular-nums text-muted-foreground">
              {formatMoney(amount, { currency })}
              <span className="ml-2 inline-block w-10 text-right text-muted-foreground">
                {pct}%
              </span>
            </span>
          </div>
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={pct}
            aria-label={`${category} share`}
            className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted"
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
              style={{ width: `${Math.max(pct, 2)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  )
}
