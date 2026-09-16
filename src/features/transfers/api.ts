import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import type { RecentTransfersResponse, TransferRequest, TransferResult } from '@/lib/api/types'

function createTransfer(request: TransferRequest): Promise<TransferResult> {
  return apiClient<TransferResult>('/transfers', {
    method: 'POST',
    body: JSON.stringify(request),
  })
}

function fetchRecentTransfers(): Promise<RecentTransfersResponse> {
  return apiClient<RecentTransfersResponse>('/transfers/recent')
}

export function useCreateTransfer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createTransfer,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['accounts'] })
      void queryClient.invalidateQueries({ queryKey: ['transactions'] })
      void queryClient.invalidateQueries({ queryKey: ['transfers', 'recent'] })
    },
  })
}

export function useRecentTransfers() {
  return useQuery({
    queryKey: ['transfers', 'recent'],
    queryFn: fetchRecentTransfers,
  })
}
