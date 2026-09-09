import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { Pagination } from '@/components/shared/Pagination'
import { TableSkeleton } from '@/components/shared/TableSkeleton'
import { TransactionTable } from '@/components/shared/TransactionTable'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useAccount, useAccountTransactions } from '@/features/accounts/api'
import { AccountTypeBadge } from '@/features/accounts/components/AccountCard'
import { Money } from '@/components/shared/Money'

const PAGE_SIZE = 10

export default function AccountDetailPage() {
  const { accountId } = useParams<{ accountId: string }>()
  const [page, setPage] = useState(1)

  const accountQuery = useAccount(accountId)
  const transactionsQuery = useAccountTransactions(accountId, { page, limit: PAGE_SIZE })

  if (accountQuery.isPending) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-8 w-72" />
        <Card>
          <CardContent className="space-y-4 py-6">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-9 w-56" />
          </CardContent>
        </Card>
        <TableSkeleton columns={6} rows={6} />
      </div>
    )
  }

  if (accountQuery.isError || !accountQuery.data) {
    return (
      <div className="space-y-8">
        <Button variant="ghost" asChild>
          <Link to="/accounts">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            All accounts
          </Link>
        </Button>
        <EmptyState
          title="Account not found"
          description="This account doesn't exist or is no longer available."
        />
      </div>
    )
  }

  const account = accountQuery.data
  const transactions = transactionsQuery.data

  return (
    <div className="space-y-8">
      <Button variant="ghost" asChild className="-mt-2 w-fit">
        <Link to="/accounts">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          All accounts
        </Link>
      </Button>

      <PageHeader title={account.name} description={`Account ${account.number}`}>
        <AccountTypeBadge type={account.type} />
      </PageHeader>

      <section aria-label="Account balance">
        <Card>
          <CardContent className="flex flex-wrap items-center gap-8 py-6">
            <div>
              <p className="text-sm text-muted-foreground">Balance</p>
              <p className="text-3xl font-semibold tabular-nums">
                <Money amount={account.balance.amount} currency={account.currency} />
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Available balance</p>
              <p className="text-2xl font-medium tabular-nums">
                <Money amount={account.availableBalance.amount} currency={account.currency} />
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section aria-label="Transactions" className="space-y-3">
        <h2 className="text-lg font-semibold">Transactions</h2>
        <Card>
          <CardContent className="p-0">
            {transactionsQuery.isPending ? (
              <TableSkeleton columns={6} rows={6} />
            ) : transactions && transactions.items.length > 0 ? (
              <>
                <TransactionTable transactions={transactions.items} />
                <div className="border-t p-4">
                  <Pagination
                    page={transactions.page}
                    totalPages={transactions.totalPages}
                    total={transactions.total}
                    onPageChange={setPage}
                  />
                </div>
              </>
            ) : (
              <div className="p-6">
                <EmptyState
                  title="No transactions"
                  description="There are no transactions for this account."
                />
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
