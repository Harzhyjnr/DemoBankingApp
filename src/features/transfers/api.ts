import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import type { TransferRequest, TransferResult } from '@/lib/api/types'

function createTransfer(request: TransferRequest): Promise<TransferResult> {
  return apiClient<TransferResult>('/transfers', {
    method: 'POST',
    body: JSON.stringify(request),
  })
}

export function useCreateTransfer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createTransfer,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['accounts'] })
      void queryClient.invalidateQueries({ queryKey: ['transactions'] })
    },
  })
}
