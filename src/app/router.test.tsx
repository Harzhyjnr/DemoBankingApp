import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'

import { AppRoutes } from '@/app/router'
import { queryClient } from '@/app/queryClient'
import { TooltipProvider } from '@/components/ui/tooltip'
import type { User } from '@/lib/api/types'
import type { AuthStatus } from '@/lib/auth/authStore'
import { useAuthStore } from '@/lib/auth/authStore'

const demoUser: User = {
  id: 'usr_demo',
  firstName: 'Demo',
  lastName: 'User',
  email: 'demo@bank.com',
  preferredCurrency: 'USD',
}

function renderAt(path: string, status: AuthStatus = 'authenticated') {
  useAuthStore.setState({
    user: status === 'authenticated' ? demoUser : null,
    token: status === 'authenticated' ? 'mock-token' : null,
    status,
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[path]}>
        <TooltipProvider>
          <AppRoutes />
        </TooltipProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

beforeEach(() => {
  queryClient.clear()
})

describe('404 route', () => {
  it('renders the not-found page inside the app shell for signed-in users', () => {
    renderAt('/nope/not-a-real-page')

    expect(screen.getByRole('heading', { name: 'Page not found' })).toBeInTheDocument()
    expect(screen.getByText('/nope/not-a-real-page')).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Primary' })).toBeInTheDocument()
  })

  it('sends signed-out users to login instead of the not-found page', () => {
    renderAt('/nope', 'unauthenticated')

    expect(screen.getByText('Welcome back')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Page not found' })).not.toBeInTheDocument()
  })

  it('keeps known routes working', () => {
    renderAt('/ui')

    expect(screen.getByRole('heading', { name: 'UI Gallery' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Page not found' })).not.toBeInTheDocument()
  })
})
