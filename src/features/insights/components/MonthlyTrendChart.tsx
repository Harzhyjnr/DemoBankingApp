import { useId } from 'react'

import { formatMoney } from '@/lib/money'
import { formatMonthShort } from '@/lib/formatters/date'
import type { MonthlySpend } from '@/lib/api/types'

export function MonthlyTrendChart({ data }: { data: MonthlySpend[] }) {
  const gradientId = useId()

  if (data.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">No spending in this period.</p>
    )
  }

  const max = Math.max(...data.map((entry) => entry.amount), 1)
  const currency = data[0]?.currency ?? 'NGN'

  const w = 120
  const h = 40
  const step = w / (data.length - 1 || 1)
  const y = (amount: number) => h - (amount / max) * (h - 4) - 2

  const points = data.map((entry, i) => `${(i * step).toFixed(2)},${y(entry.amount).toFixed(2)}`)
  const line = points.join(' ')
  const area = `0,40 ${line} ${w},40`

  return (
    <div>
      <div role="img" aria-label="Area chart of monthly spending" className="h-40 w-full">
        <svg
          viewBox={`0 0 ${w} ${h}`}
          preserveAspectRatio="none"
          className="h-full w-full overflow-visible"
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.45" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
            </linearGradient>
          </defs>
          <line x1="0" y1="40" x2="120" y2="40" stroke="hsl(var(--border))" strokeWidth="0.4" />
          <path d={`M ${area}`} fill={`url(#${gradientId})`} stroke="none" />
          <polyline
            points={line}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {data.map((entry, i) => (
            <circle
              key={entry.month}
              cx={(i * step).toFixed(2)}
              cy={y(entry.amount).toFixed(2)}
              r="0.9"
              fill="hsl(var(--card))"
              stroke="hsl(var(--primary))"
              strokeWidth="0.6"
            />
          ))}
        </svg>
      </div>
      <div className="mt-3 flex justify-between gap-2">
        {data.map((entry) => (
          <span key={entry.month} className="text-[9px] tabular-nums text-muted-foreground">
            {formatMonthShort(entry.month)}
          </span>
        ))}
      </div>
      <ul className="sr-only">
        {data.map((entry) => (
          <li key={entry.month}>
            {formatMonthShort(entry.month)}: {formatMoney(entry.amount, { currency })}
          </li>
        ))}
      </ul>
    </div>
  )
}
