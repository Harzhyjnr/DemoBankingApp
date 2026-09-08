import { useEffect } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { AppRoutes } from '@/app/router'
import { queryClient } from '@/app/queryClient'
import { useAuthStore } from '@/lib/auth/authStore'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'

export default function App() {
  const restore = useAuthStore((state) => state.restore)

  useEffect(() => {
    void restore()
  }, [restore])

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <TooltipProvider>
          <AppRoutes />
          <Toaster position="bottom-right" />
        </TooltipProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
