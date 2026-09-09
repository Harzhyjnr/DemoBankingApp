import { useQuery } from '@tanstack/react-query'

import { apiClient } from '@/lib/api/client'
import type { Paginated, PaginationParams, Transaction } from '@/lib/api/types'

function fetchTransactions(params: PaginationParams): Promise<Paginated<Transaction>> {
  return apiClient<Paginated<Transaction>>('/transactions', { query: params })
}

export function useTransactions(params: PaginationParams) {
  return useQuery({
    queryKey: ['transactions', params],
    queryFn: () => fetchTransactions(params),
  })
}
