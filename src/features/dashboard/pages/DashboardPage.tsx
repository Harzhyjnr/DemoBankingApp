import { lazy, Suspense } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ArrowUpRight, Plus } from 'lucide-react'

import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { TableSkeleton } from '@/components/shared/TableSkeleton'
import { TransactionTable } from '@/components/shared/TransactionTable'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useAccounts } from '@/features/accounts/api'
import { AccountCard } from '@/features/accounts/components/AccountCard'
import { useTransactions } from '@/features/transactions/api'
import { useMarket, usePortfolio } from '@/features/portfolio/api'
import { AssetRow } from '@/features/portfolio/components/AssetRow'
import { PortfolioHero } from '@/features/portfolio/components/PortfolioHero'
import { useAuthStore } from '@/lib/auth/authStore'

const SpendingChart = lazy(() => import('@/features/dashboard/components/SpendingChart'))

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user)
  const accountsQuery = useAccounts()
  const portfolioQuery = usePortfolio()
  const marketQuery = useMarket()
  const recentTransactionsQuery = useTransactions({ page: 1, limit: 5 })

  const accounts = accountsQuery.data
  const recentTransactions = recentTransactionsQuery.data
  const accountNameById =
    accounts === undefined
      ? undefined
      : new Map(accounts.map((account) => [account.id, account.name]))

  const holdings = portfolioQuery.data?.holdings ?? []
  const summary = portfolioQuery.data?.summary
  const prices = marketQuery.data?.prices ?? []
  const priceBySymbol = new Map(prices.map((price) => [price.symbol, price]))

  const totalValue = summary?.totalValue ?? 1
  const cryptoValue = summary?.cryptoValue ?? 0
  const cryptoShare = totalValue > 0 ? cryptoValue / totalValue : 0

  return (
    <div className="space-y-8">
      <PageHeader title="Dashboard" description={`Welcome back, ${user?.firstName ?? 'there'}.`}>
        <Button asChild>
          <Link to="/transfers">
            <Plus className="size-4" aria-hidden="true" />
            New transfer
          </Link>
        </Button>
      </PageHeader>

      <PortfolioHero
        summary={summary}
        isPending={portfolioQuery.isPending}
        cryptoShare={cryptoShare}
      />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0 space-y-8">
          <section aria-label="Crypto assets" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg font-semibold tracking-tight">Crypto</h2>
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                  {holdings.length}
                </span>
              </div>
              <Button variant="link" asChild className="px-0">
                <Link to="/portfolio">
                  View all
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>

            {portfolioQuery.isPending ? (
              <div className="card-crypto divide-y divide-border/60">
                {Array.from({ length: 3 }, (_, i) => (
                  <div key={i} className="flex items-center gap-4 px-3 py-3">
                    <Skeleton className="size-10 rounded-xl" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                    <Skeleton className="h-6 w-16" />
                  </div>
                ))}
              </div>
            ) : holdings.length > 0 ? (
              <div className="card-crypto divide-y divide-border/60">
                {holdings.map((holding) => {
                  const price = priceBySymbol.get(holding.symbol)
                  return price ? (
                    <AssetRow
                      key={holding.symbol}
                      holding={holding}
                      price={price}
                      href="/portfolio"
                    />
                  ) : null
                })}
              </div>
            ) : (
              <EmptyState title="No crypto yet" description="Your coins will appear here." />
            )}
          </section>

          <section aria-label="Accounts" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg font-semibold tracking-tight">Cash accounts</h2>
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                  {accountsQuery.data?.length ?? 0}
                </span>
              </div>
              <Button variant="link" asChild className="px-0">
                <Link to="/accounts">
                  View all
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>
            {accountsQuery.isPending ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {Array.from({ length: 2 }, (_, i) => (
                  <Card key={i}>
                    <CardContent className="space-y-4">
                      <Skeleton className="h-5 w-1/2" />
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-8 w-32" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : accounts && accounts.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {accounts.map((account) => (
                  <AccountCard key={account.id} account={account} />
                ))}
              </div>
            ) : (
              <EmptyState title="No accounts yet" description="Your accounts will appear here." />
            )}
          </section>
        </div>

        <aside className="space-y-8">
          <section aria-label="Spending overview" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold tracking-tight">Spending</h2>
                <p className="text-sm text-muted-foreground">12-month naira trend</p>
              </div>
              <ArrowUpRight className="size-4 text-muted-foreground" aria-hidden="true" />
            </div>
            <Card>
              <CardContent className="p-5 sm:p-6">
                <Suspense
                  fallback={
                    <div className="h-52">
                      <Skeleton className="h-full w-full rounded-xl" />
                    </div>
                  }
                >
                  <SpendingChart />
                </Suspense>
              </CardContent>
            </Card>
          </section>

          <section aria-label="Market snapshot" className="space-y-4">
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
            <div className="card-crypto divide-y divide-border/60">
              {marketQuery.isPending ? (
                Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-12 w-full" />)
              ) : prices.length > 0 ? (
                prices.map((price) => (
                  <AssetRow
                    key={price.symbol}
                    holding={{ symbol: price.symbol, balance: 0, value: 0 }}
                    price={price}
                    className="px-2"
                  />
                ))
              ) : (
                <p className="p-4 text-sm text-muted-foreground">Market is offline.</p>
              )}
            </div>
          </section>
        </aside>
      </div>

      <section aria-label="Recent activity" className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-semibold tracking-tight">Recent activity</h2>
            <ArrowUpRight className="size-4 text-muted-foreground" aria-hidden="true" />
          </div>
          <Button variant="link" asChild className="px-0">
            <Link to="/transactions">
              View all
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
        {recentTransactionsQuery.isPending ? (
          <TableSkeleton columns={6} rows={5} />
        ) : recentTransactions && recentTransactions.items.length > 0 ? (
          <Card>
            <CardContent className="p-0">
              <TransactionTable
                transactions={recentTransactions.items}
                accountName={(accountId) => accountNameById?.get(accountId) ?? accountId}
              />
            </CardContent>
          </Card>
        ) : (
          <EmptyState title="No transactions yet" description="Recent activity will appear here." />
        )}
      </section>
    </div>
  )
}
