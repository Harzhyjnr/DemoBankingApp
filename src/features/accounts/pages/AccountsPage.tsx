import { Link } from 'react-router-dom'
import { ArrowLeftRight, ArrowRight } from 'lucide-react'

import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { Money } from '@/components/shared/Money'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useAccounts } from '@/features/accounts/api'
import { AccountCard } from '@/features/accounts/components/AccountCard'

export default function AccountsPage() {
  const { data: accounts, isPending } = useAccounts()

  const totalCash = (accounts ?? []).reduce((sum, account) => sum + account.balance.amount, 0)
  const currency = accounts?.[0]?.currency ?? 'NGN'

  return (
    <div className="space-y-8">
      <PageHeader title="Accounts" description="Your naira accounts and balances.">
        <Button asChild>
          <Link to="/transactions">View transactions</Link>
        </Button>
      </PageHeader>

      <section
        aria-label="Cash balance"
        className="card-crypto relative overflow-hidden bg-gradient-to-br from-teal-500/15 via-emerald-500/10 to-cyan-500/10 p-6"
      >
        <div aria-hidden="true" className="absolute inset-0 bg-grid opacity-40 bg-radial-fade" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Total naira balance</p>
            {isPending ? (
              <div className="mt-2 h-10 w-56 animate-pulse rounded-lg bg-foreground/10" />
            ) : (
              <p className="font-display text-4xl font-bold tabular-nums">
                <Money amount={totalCash} currency={currency} />
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400 ring-1 ring-emerald-500/20">
              {accounts?.length ?? 0} accounts
            </span>
            <Button variant="outline" asChild>
              <Link to="/transfers">
                <ArrowLeftRight className="size-4" aria-hidden="true" />
                Transfer
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {isPending ? (
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
        <EmptyState title="No accounts" description="You don't have any accounts yet.">
          <Button asChild>
            <Link to="/portfolio">
              Explore crypto
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </EmptyState>
      )}
    </div>
  )
}
