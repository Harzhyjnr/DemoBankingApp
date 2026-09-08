import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { axe, toHaveNoViolations } from 'jest-axe'
import LoginPage from '@/app/pages/LoginPage'
import { queryClient } from '@/app/queryClient'
import { useAuthStore } from '@/lib/auth/authStore'
import { clearToken } from '@/lib/auth/token'

expect.extend(toHaveNoViolations)

function renderAt(initialEntry = '/login') {
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<div>Register page</div>} />
          <Route path="/ui" element={<div>UI Gallery target</div>} />
          <Route path="/" element={<div>Dashboard target</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

async function fillCredentials(email = 'demo@bank.com', password = 'demo1234') {
  const user = userEvent.setup()
  await user.type(screen.getByLabelText('Email'), email)
  await user.type(screen.getByLabelText('Password'), password)
  await user.click(screen.getByRole('button', { name: 'Sign in' }))
  return user
}

beforeEach(() => {
  clearToken()
  useAuthStore.setState({ user: null, token: null, status: 'loading' })
})

describe('LoginForm', () => {
  it('renders the email + password fields and demo credentials hint', () => {
    renderAt()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByText(/demo@bank\.com \/ demo1234/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Create one/ })).toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { container } = renderAt()
    expect(await axe(container)).toHaveNoViolations()
  })

  it('shows validation errors for an empty submit', async () => {
    const user = userEvent.setup()
    renderAt()
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByText('Email is required.')).toBeInTheDocument()
    expect(screen.getByText('Password is required.')).toBeInTheDocument()
  })

  it('shows a 401 message for wrong credentials', async () => {
    renderAt()
    await fillCredentials('demo@bank.com', 'wrong-password')

    expect(await screen.findByText('Invalid email or password.')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(useAuthStore.getState().status).toBe('unauthenticated')
  })

  it('logs in with seeded credentials and lands on the dashboard', async () => {
    renderAt()
    await fillCredentials()

    expect(await screen.findByText('Dashboard target')).toBeInTheDocument()
    expect(useAuthStore.getState().status).toBe('authenticated')
    expect(useAuthStore.getState().user?.email).toBe('demo@bank.com')
  })

  it('persists the session to sessionStorage when "remember me" is checked', async () => {
    const user = userEvent.setup()
    renderAt()
    await user.click(screen.getByLabelText('Remember me'))
    await fillCredentials()

    expect(await screen.findByText('Dashboard target')).toBeInTheDocument()
    expect(window.sessionStorage.getItem('banking.auth.token')).toMatch(/^mock\./)
  })

  it('redirects to the `from` location after login', async () => {
    renderAt('/login?from=%2Fui')
    await fillCredentials()

    expect(await screen.findByText('UI Gallery target')).toBeInTheDocument()
  })
})
