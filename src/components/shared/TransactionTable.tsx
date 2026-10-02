import { ArrowDownLeft, ArrowUpRight, CalendarDays, ReceiptText } from 'lucide-react'

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

function initialsOf(description: string): string {
  return description
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('')
}

export function TransactionTable({ transactions, accountName }: TransactionTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead>
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-3.5 text-muted-foreground/60" aria-hidden="true" />
              Date
            </span>
          </TableHead>
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
            <TableRow key={transaction.id} className="group transition-colors hover:bg-muted/40">
              <TableCell className="whitespace-nowrap text-muted-foreground">
                {formatDate(transaction.date)}
              </TableCell>
              {accountName ? (
                <TableCell className="text-muted-foreground">
                  {accountName(transaction.accountId)}
                </TableCell>
              ) : null}
              <TableCell>
                <span
                  className={cn(
                    'flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                    isCredit
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
                  )}
                  aria-hidden="true"
                >
                  {initialsOf(transaction.description)}
                </span>
                <span className="ml-3 font-medium">{transaction.description}</span>
              </TableCell>
              <TableCell>
                <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                  <ReceiptText className="size-3.5 text-muted-foreground/60" aria-hidden="true" />
                  {transaction.category}
                </span>
              </TableCell>
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
                  'whitespace-nowrap text-right font-semibold tabular-nums',
                  isCredit
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400',
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
