import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query'
import { isApiError } from '@/lib/api/errors'
import { useAuthStore } from '@/lib/auth/authStore'

function handleSessionExpired(error: unknown) {
  if (isApiError(error) && error.status === 401) {
    useAuthStore.getState().logout()
  }
}

export const queryClient = new QueryClient({
  queryCache: new QueryCache({ onError: handleSessionExpired }),
  mutationCache: new MutationCache({ onError: handleSessionExpired }),
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})
