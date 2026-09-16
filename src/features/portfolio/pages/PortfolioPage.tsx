import { Link } from 'react-router-dom'
import { ArrowRight, Landmark } from 'lucide-react'

import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { Money } from '@/components/shared/Money'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useAccounts } from '@/features/accounts/api'
import { useMarket, usePortfolio } from '@/features/portfolio/api'
import { AssetRow } from '@/features/portfolio/components/AssetRow'
import { PortfolioHero } from '@/features/portfolio/components/PortfolioHero'

export default function PortfolioPage() {
  const portfolioQuery = usePortfolio()
  const marketQuery = useMarket()
  const accountsQuery = useAccounts()

  const summary = portfolioQuery.data?.summary
  const holdings = portfolioQuery.data?.holdings ?? []
  const prices = marketQuery.data?.prices ?? []
  const accounts = accountsQuery.data ?? []

  const cryptoValue = summary?.cryptoValue ?? 0
  const totalValue = summary?.totalValue ?? 1
  const cryptoShare = totalValue > 0 ? cryptoValue / totalValue : 0

  const priceBySymbol = new Map(prices.map((price) => [price.symbol, price]))

  return (
    <div className="space-y-8">
      <PageHeader title="Portfolio" description="Naira cash and crypto, together in one view." />

      <PortfolioHero
        summary={summary}
        isPending={portfolioQuery.isPending}
        cryptoShare={cryptoShare}
      />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section aria-label="Your assets" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight">Your assets</h2>
            {accounts.length > 0 ? (
              <Button variant="link" asChild className="px-0">
                <Link to="/accounts">
                  View accounts
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
            ) : null}
          </div>

          <div className="card-crypto divide-y divide-border/60">
            {portfolioQuery.isPending ? (
              Array.from({ length: 3 }, (_, i) => (
                <div key={i} className="flex items-center gap-4 px-3 py-3">
                  <Skeleton className="size-10 rounded-xl" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              ))
            ) : holdings.length > 0 ? (
              holdings.map((holding) => {
                const price = priceBySymbol.get(holding.symbol)
                return price ? (
                  <AssetRow key={holding.symbol} holding={holding} price={price} />
                ) : null
              })
            ) : (
              <EmptyState title="No holdings" description="Buy your first coin to get started." />
            )}
          </div>

          <div className="card-crypto divide-y divide-border/60">
            {accounts.map((account) => (
              <Link
                key={account.id}
                to={`/accounts/${account.id}`}
                className="flex items-center gap-4 rounded-xl px-3 py-3 transition-colors hover:bg-muted/60"
              >
                <span
                  className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-md"
                  aria-hidden="true"
                >
                  <Landmark className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{account.name}</p>
                  <p className="text-xs text-muted-foreground">Naira account · {account.number}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold tabular-nums">
                    <Money amount={account.balance.amount} currency={account.currency} />
                  </p>
                  <p className="text-xs text-muted-foreground">balance</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <aside aria-label="Market" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight">Market</h2>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400 ring-1 ring-emerald-500/20">
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
              </span>
              Live
            </span>
          </div>
          <Card>
            <CardContent className="space-y-1 p-3">
              {marketQuery.isPending ? (
                Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-12 w-full" />)
              ) : prices.length === 0 ? (
                <EmptyState
                  title="Market offline"
                  description="Prices are temporarily unavailable."
                />
              ) : (
                prices.map((price) => (
                  <AssetRow
                    key={price.symbol}
                    holding={{ symbol: price.symbol, balance: 0, value: 0 }}
                    price={price}
                    className="px-2"
                  />
                ))
              )}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  )
}
