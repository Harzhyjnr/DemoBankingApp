import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Spinner } from '@/components/shared/Spinner'
import { useAuthStore } from '@/lib/auth/authStore'

export function ProtectedRoute() {
  const status = useAuthStore((state) => state.status)
  const location = useLocation()

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner className="h-8 w-8" label="Checking your session" />
      </div>
    )
  }

  if (status === 'unauthenticated') {
    const from = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?from=${from}`} replace />
  }

  return <Outlet />
}
