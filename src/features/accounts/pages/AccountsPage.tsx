import { Link } from 'react-router-dom'

import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useAccounts } from '@/features/accounts/api'
import { AccountCard } from '@/features/accounts/components/AccountCard'

export default function AccountsPage() {
  const { data: accounts, isPending } = useAccounts()

  return (
    <div className="space-y-8">
      <PageHeader title="Accounts" description="Your accounts and their current balances.">
        <Button asChild>
          <Link to="/transactions">View transactions</Link>
        </Button>
      </PageHeader>

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
        <EmptyState title="No accounts" description="You don't have any accounts yet." />
      )}
    </div>
  )
}
