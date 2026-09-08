import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import type { User } from '@/lib/api/types'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import type { AuthStatus } from '@/lib/auth/authStore'
import { useAuthStore } from '@/lib/auth/authStore'
import { queryClient } from '@/app/queryClient'

const demoUser: User = {
  id: 'usr_demo',
  firstName: 'Demo',
  lastName: 'User',
  email: 'demo@bank.com',
  preferredCurrency: 'USD',
}

function LoginProbe() {
  const location = useLocation()
  return <div>Login page at {location.pathname + location.search}</div>
}

function renderProtected(status: AuthStatus) {
  useAuthStore.setState({
    user: status === 'authenticated' ? demoUser : null,
    token: status === 'authenticated' ? 'mock-token' : null,
    status,
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/ui?tab=one']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/ui" element={<div>Protected target</div>} />
          </Route>
          <Route path="/login" element={<LoginProbe />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

beforeEach(() => {
  useAuthStore.setState({ user: null, token: null, status: 'loading' })
})

describe('ProtectedRoute', () => {
  it('renders children for authenticated users', () => {
    renderProtected('authenticated')
    expect(screen.getByText('Protected target')).toBeInTheDocument()
    expect(screen.queryByText(/Login page at/)).not.toBeInTheDocument()
  })

  it('redirects unauthenticated users to /login with the current location as `from`', () => {
    renderProtected('unauthenticated')
    expect(screen.getByText('Login page at /login?from=%2Fui%3Ftab%3Done')).toBeInTheDocument()
    expect(screen.queryByText('Protected target')).not.toBeInTheDocument()
  })

  it('shows a loading indicator while the session is being restored', () => {
    renderProtected('loading')
    expect(screen.getByRole('status', { name: 'Checking your session' })).toBeInTheDocument()
    expect(screen.queryByText('Protected target')).not.toBeInTheDocument()
    expect(screen.queryByText(/Login page at/)).not.toBeInTheDocument()
  })
})
