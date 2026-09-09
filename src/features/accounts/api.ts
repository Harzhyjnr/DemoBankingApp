import { useQuery } from '@tanstack/react-query'

import { apiClient } from '@/lib/api/client'
import type { Account, Paginated, PaginationParams, Transaction } from '@/lib/api/types'

interface AccountDetailResponse {
  account: Account
}

interface AccountsResponse {
  accounts: Account[]
}

function fetchAccounts(): Promise<AccountsResponse> {
  return apiClient<AccountsResponse>('/accounts')
}

function fetchAccount(accountId: string): Promise<AccountDetailResponse> {
  return apiClient<AccountDetailResponse>(`/accounts/${accountId}`)
}

function fetchAccountTransactions(
  accountId: string,
  params: PaginationParams,
): Promise<Paginated<Transaction>> {
  return apiClient<Paginated<Transaction>>(`/accounts/${accountId}/transactions`, { query: params })
}

export interface UseAccountsOptions {
  enabled?: boolean
}

export function useAccounts(options: UseAccountsOptions = {}) {
  return useQuery({
    queryKey: ['accounts'],
    queryFn: fetchAccounts,
    select: (data) => data.accounts,
    ...options,
  })
}

export function useAccount(accountId: string | undefined) {
  return useQuery({
    queryKey: ['accounts', accountId],
    queryFn: () => fetchAccount(accountId as string),
    select: (data) => data.account,
    enabled: Boolean(accountId),
  })
}

export function useAccountTransactions(accountId: string | undefined, params: PaginationParams) {
  return useQuery({
    queryKey: ['accounts', accountId, 'transactions', params],
    queryFn: () => fetchAccountTransactions(accountId as string, params),
    enabled: Boolean(accountId),
  })
}
