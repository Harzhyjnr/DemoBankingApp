import { useState } from 'react'
import { RotateCcw } from 'lucide-react'

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

  return (
    <div className="space-y-8">
      <PageHeader title="Transactions" description="Search and filter all of your transactions." />

      <Card>
        <CardContent className="space-y-4 py-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_160px_160px_150px_150px_auto]">
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
            <div className="flex items-end">
              <Button variant="outline" onClick={handleReset} disabled={!hasFilters}>
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {transactionsQuery.isPending ? (
        <TableSkeleton columns={6} rows={10} />
      ) : transactions && transactions.items.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <TransactionTable
              transactions={transactions.items}
              accountName={(accountId) => accountNameById?.get(accountId) ?? accountId}
            />
            <div className="border-t p-4">
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
