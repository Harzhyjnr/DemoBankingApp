import { lazy, Suspense, useState } from 'react'
import { TrendingDown, TrendingUp } from 'lucide-react'

import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useSpendingInsights } from '@/features/insights/api'
import { TopMerchantsList } from '@/features/insights/components/TopMerchantsList'

const MonthlyTrendChart = lazy(() =>
  import('@/features/insights/components/MonthlyTrendChart').then((m) => ({
    default: m.MonthlyTrendChart,
  })),
)

const CategoryBreakdown = lazy(() =>
  import('@/features/insights/components/CategoryBreakdown').then((m) => ({
    default: m.CategoryBreakdown,
  })),
)
import {
  categoryShares,
  INSIGHT_PERIODS,
  periodDelta,
  sliceMonthly,
  totalSpend,
  type InsightPeriod,
} from '@/features/insights/lib/aggregate'
import { formatMoney } from '@/lib/money'
import { cn } from '@/lib/utils'

export default function InsightsPage() {
  const { data: insights, isPending, isError, refetch } = useSpendingInsights()
  const [period, setPeriod] = useState<InsightPeriod>(12)

  const currency = insights?.monthly[0]?.currency ?? insights?.byCategory[0]?.currency ?? 'NGN'

  if (isPending) {
    return (
      <div className="space-y-8">
        <PageHeader title="Insights" description="Understand where your money goes." />
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-56 rounded-xl" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="space-y-8">
        <PageHeader title="Insights" description="Understand where your money goes." />
        <EmptyState
          title="We couldn't load your spending insights"
          description="Something went wrong while fetching your data."
        >
          <Button size="sm" variant="outline" onClick={() => refetch()}>
            Try again
          </Button>
        </EmptyState>
      </div>
    )
  }

  if (!insights) {
    return (
      <div className="space-y-8">
        <PageHeader title="Insights" description="Understand where your money goes." />
        <p className="text-muted-foreground">We couldn't load your spending insights.</p>
      </div>
    )
  }

  const monthly = sliceMonthly(insights.monthly, period)
  const periodTotal = totalSpend(monthly)
  const delta = periodDelta(insights.monthly, period)
  const shares = categoryShares(insights.byCategory)

  return (
    <div className="space-y-8">
      <PageHeader title="Insights" description="Understand where your money goes.">
        <div
          role="group"
          aria-label="Time period"
          className="flex items-center rounded-lg border border-border/70 bg-muted/40 p-1"
        >
          {INSIGHT_PERIODS.map((option) => {
            const active = period === option.value
            return (
              <Button
                key={option.value}
                size="sm"
                variant={active ? 'default' : 'ghost'}
                aria-pressed={active}
                onClick={() => setPeriod(option.value)}
              >
                {option.label}
              </Button>
            )
          })}
        </div>
      </PageHeader>

      <Card className="card-crypto relative overflow-hidden bg-gradient-to-br from-teal-500/15 via-emerald-500/10 to-cyan-500/10">
        <div aria-hidden="true" className="absolute inset-0 bg-grid opacity-40 bg-radial-fade" />
        <CardContent className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Spent in the last {period} months</p>
            <p
              data-testid="period-total"
              className="mt-2 font-display text-4xl font-bold tabular-nums"
            >
              {formatMoney(periodTotal, { currency })}
            </p>
          </div>
          {delta !== null ? (
            <span
              className={cn(
                'flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ring-1',
                delta >= 0
                  ? 'bg-destructive/10 text-destructive ring-destructive/20'
                  : 'bg-success/10 text-success ring-success/20',
              )}
            >
              {delta >= 0 ? (
                <TrendingUp className="size-3.5" aria-hidden="true" />
              ) : (
                <TrendingDown className="size-3.5" aria-hidden="true" />
              )}
              {delta >= 0 ? '+' : ''}
              {delta}% vs previous {period} months
            </span>
          ) : null}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <h2 className="font-semibold leading-none tracking-tight">Monthly spend</h2>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<Skeleton className="h-44 w-full rounded-xl" />}>
              <MonthlyTrendChart data={monthly} />
            </Suspense>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <h2 className="font-semibold leading-none tracking-tight">By category</h2>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<Skeleton className="h-44 w-full rounded-xl" />}>
              <CategoryBreakdown shares={shares} />
            </Suspense>
          </CardContent>
        </Card>

        <Card className="lg:col-span-5">
          <CardHeader>
            <h2 className="font-semibold leading-none tracking-tight">Top merchants</h2>
          </CardHeader>
          <CardContent>
            <TopMerchantsList merchants={insights.topMerchants} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
