import { useQuery } from '@tanstack/react-query'

import { apiClient } from '@/lib/api/client'
import type { SpendingInsights } from '@/lib/api/types'

function fetchSpendingInsights(): Promise<SpendingInsights> {
  return apiClient<SpendingInsights>('/insights/spending')
}

export function useSpendingInsights() {
  return useQuery({
    queryKey: ['insights', 'spending'],
    queryFn: fetchSpendingInsights,
  })
}
