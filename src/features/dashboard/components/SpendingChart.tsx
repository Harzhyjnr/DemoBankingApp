import { useId } from 'react'
import { useSpendingInsights } from '@/features/insights/api'
import { formatMoney } from '@/lib/money'
import { formatMonthShort } from '@/lib/formatters/date'
import { cn } from '@/lib/utils'

export default function SpendingChart() {
  const { data: insights } = useSpendingInsights()
  const gradientId = useId()

  if (!insights) {
    return (
      <div className="h-full w-full animate-pulse rounded-xl bg-muted" role="status">
        <span className="sr-only">Loading spending chart…</span>
      </div>
    )
  }

  const recent = insights.monthly.slice(-12)
  const max = Math.max(...recent.map((entry) => entry.amount), 1)
  const currency = recent[0]?.currency ?? 'USD'

  if (recent.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No spending data yet.</p>
  }

  const w = 120
  const h = 40
  const step = w / (recent.length - 1 || 1)
  const y = (amount: number) => h - (amount / max) * (h - 4) - 2

  const points = recent.map((entry, i) => `${(i * step).toFixed(2)},${y(entry.amount).toFixed(2)}`)
  const line = points.join(' ')
  const area = `0,40 ${line} ${w},40`

  const thisMonth =
    recent.length > 1
      ? `${formatMonthShort(recent[recent.length - 1].month)} vs ${formatMonthShort(recent[recent.length - 2].month)}`
      : undefined

  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <p className="text-xs text-muted-foreground">Last 12 months</p>
          <p className="mt-0.5 text-2xl font-bold tabular-nums">
            {formatMoney(recent[recent.length - 1].amount, { currency })}
          </p>
        </div>
        <p className="text-xs text-muted-foreground">{thisMonth}</p>
      </div>
      <div
        role="img"
        aria-label="Area chart of monthly spending for the last 12 months"
        className="mt-4 h-40 w-full"
      >
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
          {recent.map((entry, i) => (
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
        {recent.map((entry, i) => (
          <span
            key={entry.month}
            className={cn(
              'text-[9px] tabular-nums text-muted-foreground',
              i !== 0 && i % 2 !== 0 && 'hidden sm:inline',
            )}
          >
            {formatMonthShort(entry.month)}
          </span>
        ))}
      </div>
      <ul className="sr-only">
        {recent.map((entry) => (
          <li key={entry.month}>
            {formatMonthShort(entry.month)}: {formatMoney(entry.amount, { currency })}
          </li>
        ))}
      </ul>
    </div>
  )
}
