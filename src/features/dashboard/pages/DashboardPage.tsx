import { lazy, Suspense } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Wallet } from 'lucide-react'

import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { TableSkeleton } from '@/components/shared/TableSkeleton'
import { TransactionTable } from '@/components/shared/TransactionTable'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useAccounts } from '@/features/accounts/api'
import { AccountCard } from '@/features/accounts/components/AccountCard'
import { useTransactions } from '@/features/transactions/api'
import { useAuthStore } from '@/lib/auth/authStore'
import { Money } from '@/components/shared/Money'

const SpendingChart = lazy(() => import('@/features/dashboard/components/SpendingChart'))

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user)
  const accountsQuery = useAccounts()
  const recentTransactionsQuery = useTransactions({ page: 1, limit: 6 })

  const accounts = accountsQuery.data
  const recentTransactions = recentTransactionsQuery.data
  const accountNameById =
    accounts === undefined
      ? undefined
      : new Map(accounts.map((account) => [account.id, account.name]))

  const totalBalance = (accounts ?? []).reduce((sum, account) => sum + account.balance.amount, 0)
  const currency = user?.preferredCurrency ?? 'USD'

  return (
    <div className="space-y-8">
      <PageHeader title="Dashboard" description={`Welcome back, ${user?.firstName ?? 'there'}.`}>
        <Button asChild>
          <Link to="/accounts">
            View all accounts
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </Button>
      </PageHeader>

      <section aria-label="Total balance">
        <Card>
          <CardHeader>
            <CardDescription className="flex items-center gap-2">
              <Wallet className="h-4 w-4" aria-hidden="true" />
              Total balance
            </CardDescription>
          </CardHeader>
          <CardContent>
            {accountsQuery.isPending ? (
              <Skeleton className="h-9 w-48" />
            ) : (
              <p className="text-4xl font-semibold tabular-nums">
                <Money amount={totalBalance} currency={currency} />
              </p>
            )}
          </CardContent>
        </Card>
      </section>

      <section aria-label="Accounts" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Accounts</h2>
          <Button variant="link" asChild className="px-0">
            <Link to="/accounts">
              View all
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
        {accountsQuery.isPending ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 4 }, (_, i) => (
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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {accounts.map((account) => (
              <AccountCard key={account.id} account={account} />
            ))}
          </div>
        ) : (
          <EmptyState title="No accounts yet" description="Your accounts will appear here." />
        )}
      </section>

      <section aria-label="Recent activity" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent activity</h2>
          <Button variant="link" asChild className="px-0">
            <Link to="/transactions">
              View all
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
        {recentTransactionsQuery.isPending ? (
          <TableSkeleton columns={6} rows={6} />
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

      <section aria-label="Spending overview" className="space-y-3">
        <h2 className="text-lg font-semibold">Spending overview</h2>
        <Card>
          <CardContent className="py-6">
            <Suspense
              fallback={
                <div className="flex h-48 items-center justify-center">
                  <Skeleton className="h-full w-full" />
                </div>
              }
            >
              <SpendingChart />
            </Suspense>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
