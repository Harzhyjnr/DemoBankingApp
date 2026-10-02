import { useState } from 'react'
import { Filter, RotateCcw, SearchCheck } from 'lucide-react'

import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { SearchInput } from '@/components/shared/SearchInput'
import { Pagination } from '@/components/shared/Pagination'
import { TableSkeleton } from '@/components/shared/TableSkeleton'
import { TransactionTable } from '@/components/shared/TransactionTable'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAccounts } from '@/features/accounts/api'
import { useTransactions } from '@/features/transactions/api'
import { TRANSACTION_CATEGORIES, TRANSACTION_TYPES } from '@/features/transactions/constants'
import type { TransactionType } from '@/lib/api/types'
import { cn } from '@/lib/utils'

const RESET_VALUE = 'all'

export default function TransactionsPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState(RESET_VALUE)
  const [type, setType] = useState(RESET_VALUE)
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const accountsQuery = useAccounts()
  const accountNameById =
    accountsQuery.data === undefined
      ? undefined
      : new Map(accountsQuery.data.map((account) => [account.id, account.name]))

  const params = {
    page,
    q: search.trim() || undefined,
    category: category === RESET_VALUE ? undefined : category,
    type: type === RESET_VALUE ? undefined : (type as TransactionType),
    from: from || undefined,
    to: to || undefined,
  }

  const transactionsQuery = useTransactions(params)

  const hasFilters =
    search !== '' || category !== RESET_VALUE || type !== RESET_VALUE || from !== '' || to !== ''

  function handleSearchChange(value: string) {
    setSearch(value)
    setPage(1)
  }

  function handleCategoryChange(value: string) {
    setCategory(value)
    setPage(1)
  }

  function handleTypeChange(value: string) {
    setType(value)
    setPage(1)
  }

  function handleFromChange(value: string) {
    setFrom(value)
    setPage(1)
  }

  function handleToChange(value: string) {
    setTo(value)
    setPage(1)
  }

  function handleReset() {
    setSearch('')
    setCategory(RESET_VALUE)
    setType(RESET_VALUE)
    setFrom('')
    setTo('')
    setPage(1)
  }

  const transactions = transactionsQuery.data
  const activeFilters = [category, type, from, to].filter((value) => value !== RESET_VALUE).length

  return (
    <div className="space-y-8">
      <PageHeader
        title="Transactions"
        description="Search and filter every movement, in naira and coin."
      >
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400 ring-1 ring-emerald-500/20">
          <SearchCheck className="size-3.5" aria-hidden="true" />
          Live activity
        </span>
      </PageHeader>

      <Card className="overflow-hidden rounded-3xl border-border/60 shadow-card-hover">
        <div
          aria-hidden="true"
          className="h-1 w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500"
        />
        <CardContent className="space-y-4 py-5">
          <div className="flex items-center justify-between gap-2">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <Filter className="size-4 text-muted-foreground" aria-hidden="true" />
              Filters
              {activeFilters > 0 ? (
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600 ring-1 ring-emerald-500/20 dark:text-emerald-400">
                  {activeFilters} active
                </span>
              ) : null}
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              disabled={!hasFilters}
              className={cn('h-8 text-muted-foreground hover:text-foreground')}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_160px_160px_150px_150px]">
            <SearchInput
              value={search}
              onValueChange={handleSearchChange}
              placeholder="Search transactions…"
            />
            <div className="space-y-1.5">
              <Label htmlFor="filter-category">Category</Label>
              <Select value={category} onValueChange={handleCategoryChange}>
                <SelectTrigger id="filter-category" aria-label="Filter by category">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={RESET_VALUE}>All categories</SelectItem>
                  {TRANSACTION_CATEGORIES.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="filter-type">Type</Label>
              <Select value={type} onValueChange={handleTypeChange}>
                <SelectTrigger id="filter-type" aria-label="Filter by type">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={RESET_VALUE}>All types</SelectItem>
                  {TRANSACTION_TYPES.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="filter-from">From</Label>
              <Input
                id="filter-from"
                type="date"
                value={from}
                onChange={(event) => handleFromChange(event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="filter-to">To</Label>
              <Input
                id="filter-to"
                type="date"
                value={to}
                onChange={(event) => handleToChange(event.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {transactionsQuery.isPending ? (
        <TableSkeleton columns={6} rows={10} />
      ) : transactions && transactions.items.length > 0 ? (
        <Card className="overflow-hidden rounded-3xl border-border/60 shadow-card-hover">
          <CardContent className="p-0">
            <TransactionTable
              transactions={transactions.items}
              accountName={(accountId) => accountNameById?.get(accountId) ?? accountId}
            />
            <div className="border-t bg-muted/20 p-4">
              <Pagination
                page={transactions.page}
                totalPages={transactions.totalPages}
                total={transactions.total}
                onPageChange={setPage}
              />
            </div>
          </CardContent>
        </Card>
      ) : (
        <EmptyState
          title="No transactions found"
          description={
            hasFilters
              ? 'Try adjusting or resetting your filters.'
              : 'There are no transactions yet.'
          }
        >
          {hasFilters ? (
            <Button variant="outline" onClick={handleReset}>
              Reset filters
            </Button>
          ) : null}
        </EmptyState>
      )}
    </div>
  )
}
