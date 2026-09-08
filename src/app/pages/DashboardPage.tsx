import { ArrowDownRight, ArrowUpRight, Plus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Money } from '@/components/shared/Money'

const accounts = [
  { name: 'Everyday Checking', balance: 482_150, trend: '+2.4%' },
  { name: 'High Yield Savings', balance: 25_000_00, trend: '+5.1%' },
  { name: 'Travel Credit Card', balance: -12_340, trend: '-1.2%' },
]

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-muted-foreground">Phase 1 design system is live.</p>
        </div>
        <Button>
          <Plus className="h-4 w-4" />
          Quick transfer
        </Button>
      </div>

      <section aria-label="Accounts summary">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => (
            <Card key={account.name}>
              <CardHeader>
                <CardDescription>{account.name}</CardDescription>
                <CardTitle className="text-2xl tabular-nums">
                  <Money amount={account.balance} />
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant={account.balance < 0 ? 'destructive' : 'success'}>
                  {account.trend}
                </Badge>
                <span>vs last month</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section aria-label="Recent activity" className="space-y-3">
        <h2 className="text-lg font-semibold">Recent activity</h2>
        <Card>
          <CardContent className="p-6">
            <ul className="divide-y">
              <li className="flex items-center justify-between py-3">
                <span className="flex items-center gap-3">
                  <ArrowUpRight className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                  Coffee &amp; Co
                </span>
                <span className="text-sm font-medium">
                  <Money amount={-450} />
                </span>
              </li>
              <li className="flex items-center justify-between py-3">
                <span className="flex items-center gap-3">
                  <ArrowDownRight className="h-4 w-4 text-rose-600" aria-hidden="true" />
                  Salary — Acme Inc
                </span>
                <span className="text-sm font-medium">
                  <Money amount={3_450_000} />
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </section>

      <section aria-label="Loading placeholder" className="space-y-3">
        <h2 className="text-lg font-semibold">Something else loading</h2>
        <Card>
          <CardContent className="space-y-3 p-6">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-8 w-full" />
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
