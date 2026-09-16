import { Link } from 'react-router-dom'
import { ArrowUpRight, CreditCard, PiggyBank, TrendingUp, Wallet } from 'lucide-react'

import { Money } from '@/components/shared/Money'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import type { Account, AccountType } from '@/lib/api/types'
import { cn } from '@/lib/utils'

const TYPE_VARIANT: Record<AccountType, 'secondary' | 'success' | 'destructive' | 'outline'> = {
  checking: 'secondary',
  savings: 'success',
  credit: 'destructive',
  investment: 'outline',
}

const TYPE_GRADIENT: Record<AccountType, string> = {
  checking: 'from-emerald-400 to-teal-500',
  savings: 'from-lime-400 to-emerald-500',
  credit: 'from-rose-400 to-amber-500',
  investment: 'from-cyan-400 to-sky-500',
}

const TYPE_ICON: Record<AccountType, typeof Wallet> = {
  checking: Wallet,
  savings: PiggyBank,
  credit: CreditCard,
  investment: TrendingUp,
}

export function AccountTypeBadge({ type }: { type: AccountType }) {
  return <Badge variant={TYPE_VARIANT[type]}>{type}</Badge>
}

interface AccountCardProps {
  account: Account
  className?: string
}

export function AccountCard({ account, className }: AccountCardProps) {
  const Icon = TYPE_ICON[account.type]

  return (
    <Link to={`/accounts/${account.id}`} className="group block h-full">
      <Card
        className={cn(
          'relative flex h-full flex-col overflow-hidden transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-card-hover',
          className,
        )}
      >
        <div
          aria-hidden="true"
          className={cn(
            'absolute inset-x-0 top-0 h-1 bg-gradient-to-r',
            TYPE_GRADIENT[account.type],
          )}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-grid opacity-[0.35] [mask-image:linear-gradient(to_bottom,black,transparent_70%)]"
        />
        <div className="relative flex flex-1 gap-4 p-5 pt-6">
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className={cn(
                    'flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md',
                    TYPE_GRADIENT[account.type],
                  )}
                >
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="truncate font-semibold">{account.name}</p>
                  <p className="font-mono text-xs text-muted-foreground">{account.number}</p>
                </div>
              </div>
            </div>
            <div className="mt-auto pt-6">
              <p className="text-xs text-muted-foreground">Balance</p>
              <p className="font-display text-2xl font-bold tabular-nums">
                <Money amount={account.balance.amount} currency={account.currency} />
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end justify-between">
            <AccountTypeBadge type={account.type} />
            <ArrowUpRight
              className="size-5 text-muted-foreground transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
              aria-hidden="true"
            />
          </div>
        </div>
      </Card>
    </Link>
  )
}
