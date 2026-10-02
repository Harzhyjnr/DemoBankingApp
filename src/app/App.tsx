import { useEffect } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, useLocation } from 'react-router-dom'
import { AppRoutes } from '@/app/router'
import { queryClient } from '@/app/queryClient'
import { useAuthStore } from '@/lib/auth/authStore'
import { ErrorBoundary } from '@/components/shared/ErrorBoundary'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'

function AppProviders() {
  const { pathname } = useLocation()

  return (
    <ErrorBoundary resetKeys={[pathname]}>
      <TooltipProvider>
        <AppRoutes />
        <Toaster position="bottom-right" />
      </TooltipProvider>
    </ErrorBoundary>
  )
}

export default function App() {
  const restore = useAuthStore((state) => state.restore)

  useEffect(() => {
    void restore()
  }, [restore])

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppProviders />
      </BrowserRouter>
    </QueryClientProvider>
  )
}
