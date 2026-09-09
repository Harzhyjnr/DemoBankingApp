import { Link } from 'react-router-dom'

import { Money } from '@/components/shared/Money'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import type { Account, AccountType } from '@/lib/api/types'
import { cn } from '@/lib/utils'

const TYPE_VARIANT: Record<AccountType, 'secondary' | 'success' | 'destructive' | 'outline'> = {
  checking: 'secondary',
  savings: 'success',
  credit: 'destructive',
  investment: 'outline',
}

export function AccountTypeBadge({ type }: { type: AccountType }) {
  return <Badge variant={TYPE_VARIANT[type]}>{type}</Badge>
}

interface AccountCardProps {
  account: Account
  className?: string
}

export function AccountCard({ account, className }: AccountCardProps) {
  return (
    <Link to={`/accounts/${account.id}`} className="block">
      <Card
        className={cn(
          'h-full transition-colors hover:border-primary/60 hover:bg-muted/40',
          className,
        )}
      >
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <p className="font-medium">{account.name}</p>
            <AccountTypeBadge type={account.type} />
          </div>
          <p className="font-mono text-sm text-muted-foreground">{account.number}</p>
          <div>
            <p className="text-xs text-muted-foreground">Balance</p>
            <p className="text-2xl font-semibold tabular-nums">
              <Money amount={account.balance.amount} currency={account.currency} />
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
