import { useSpendingInsights } from '@/features/insights/api'
import { formatMoney } from '@/lib/money'
import { formatMonthShort } from '@/lib/formatters/date'
import { cn } from '@/lib/utils'

export default function SpendingChart() {
  const { data: insights } = useSpendingInsights()

  if (!insights) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground" role="status">
        Loading spending chart…
      </p>
    )
  }

  const recent = insights.monthly.slice(-12)
  const max = Math.max(...recent.map((entry) => entry.amount), 1)
  const currency = recent[0]?.currency ?? 'USD'

  if (recent.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No spending data yet.</p>
  }

  return (
    <div
      role="img"
      aria-label="Bar chart of monthly spending for the last 12 months"
      className="flex h-48 items-end gap-2"
    >
      {recent.map((entry) => {
        const heightPct = Math.max((entry.amount / max) * 100, 2)
        return (
          <div
            key={entry.month}
            data-month={entry.month}
            className="flex h-full flex-1 flex-col justify-end gap-1"
          >
            <div
              className={cn('w-full rounded-t bg-primary/70')}
              style={{ height: `${heightPct}%` }}
            />
            <span className="sr-only">
              {formatMonthShort(entry.month)}: {formatMoney(entry.amount, { currency })}
            </span>
          </div>
        )
      })}
    </div>
  )
}
