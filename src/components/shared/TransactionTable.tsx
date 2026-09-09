import { ArrowDownLeft, ArrowUpRight } from 'lucide-react'

import { Money } from '@/components/shared/Money'
import { StatusBadge } from '@/components/shared/StatusBadge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatDate } from '@/lib/formatters/date'
import type { Transaction } from '@/lib/api/types'
import { cn } from '@/lib/utils'

interface TransactionTableProps {
  transactions: Transaction[]
  accountName?: (accountId: string) => string
}

export function TransactionTable({ transactions, accountName }: TransactionTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          {accountName ? <TableHead>Account</TableHead> : null}
          <TableHead>Description</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((transaction) => {
          const isCredit = transaction.amount.amount > 0
          return (
            <TableRow key={transaction.id}>
              <TableCell className="text-muted-foreground">
                {formatDate(transaction.date)}
              </TableCell>
              {accountName ? (
                <TableCell className="text-muted-foreground">
                  {accountName(transaction.accountId)}
                </TableCell>
              ) : null}
              <TableCell className="font-medium">{transaction.description}</TableCell>
              <TableCell className="text-muted-foreground">{transaction.category}</TableCell>
              <TableCell>
                <span className="inline-flex items-center gap-1 capitalize text-muted-foreground">
                  {isCredit ? (
                    <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" aria-hidden="true" />
                  ) : (
                    <ArrowDownLeft className="h-3.5 w-3.5 text-rose-500" aria-hidden="true" />
                  )}
                  {transaction.type}
                </span>
              </TableCell>
              <TableCell>
                <StatusBadge status={transaction.status} />
              </TableCell>
              <TableCell
                className={cn(
                  'text-right tabular-nums',
                  isCredit ? 'text-emerald-600' : 'text-rose-600',
                )}
              >
                <Money amount={transaction.amount.amount} currency={transaction.amount.currency} />
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
