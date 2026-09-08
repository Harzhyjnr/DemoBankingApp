import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { axe, toHaveNoViolations } from 'jest-axe'
import RegisterPage from '@/app/pages/RegisterPage'
import { queryClient } from '@/app/queryClient'
import { useAuthStore } from '@/lib/auth/authStore'
import { clearToken } from '@/lib/auth/token'
import { db } from '@/mocks/db'

expect.extend(toHaveNoViolations)

const VALID_REGISTRATION = {
  firstName: 'Grace',
  lastName: 'Hopper',
  email: 'grace@bank.com',
  password: 'supersecret1',
}

function renderAt(initialEntry = '/register') {
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<div>Dashboard target</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

type RegistrationOverrides = Partial<typeof VALID_REGISTRATION> & {
  confirmPassword?: string
}

async function fillRegistration(overrides: RegistrationOverrides = {}) {
  const values = { ...VALID_REGISTRATION, ...overrides }
  const user = userEvent.setup()

  await user.type(screen.getByLabelText('First name'), values.firstName)
  await user.type(screen.getByLabelText('Last name'), values.lastName)
  await user.type(screen.getByLabelText('Email'), values.email)
  await user.type(screen.getByLabelText(/^Password$/), values.password)
  await user.type(
    screen.getByLabelText('Confirm password'),
    values.confirmPassword ?? values.password,
  )
  await user.click(screen.getByLabelText(/I agree to the Terms of Service/))
  await user.click(screen.getByRole('button', { name: 'Create account' }))
  return user
}

beforeEach(() => {
  clearToken()
  useAuthStore.setState({ user: null, token: null, status: 'loading' })
})

describe('RegisterForm', () => {
  it('renders all required fields', () => {
    renderAt()
    expect(screen.getByLabelText('First name')).toBeInTheDocument()
    expect(screen.getByLabelText('Last name')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText(/^Password$/)).toBeInTheDocument()
    expect(screen.getByLabelText('Confirm password')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Sign in/ })).toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { container } = renderAt()
    expect(await axe(container)).toHaveNoViolations()
  })

  it('rejects a password shorter than 8 characters', async () => {
    renderAt()
    await fillRegistration({ password: 'short' })

    expect(await screen.findByText('Password must be at least 8 characters.')).toBeInTheDocument()
  })

  it('rejects mismatched passwords', async () => {
    renderAt()
    await fillRegistration({ password: 'password1', confirmPassword: 'password2' })

    expect(await screen.findByText('Passwords do not match.')).toBeInTheDocument()
  })

  it('rejects submit when terms are not accepted', async () => {
    const user = userEvent.setup()
    renderAt()
    await user.type(screen.getByLabelText('First name'), VALID_REGISTRATION.firstName)
    await user.type(screen.getByLabelText('Last name'), VALID_REGISTRATION.lastName)
    await user.type(screen.getByLabelText('Email'), VALID_REGISTRATION.email)
    await user.type(screen.getByLabelText(/^Password$/), VALID_REGISTRATION.password)
    await user.type(screen.getByLabelText('Confirm password'), VALID_REGISTRATION.password)
    await user.click(screen.getByRole('button', { name: 'Create account' }))

    expect(await screen.findByText('You must accept the terms to continue.')).toBeInTheDocument()
    expect(db.findUserByEmail(VALID_REGISTRATION.email)).toBeNull()
  })

  it('creates the user and lands on the dashboard', async () => {
    renderAt()
    await fillRegistration()

    expect(await screen.findByText('Dashboard target')).toBeInTheDocument()
    expect(useAuthStore.getState().status).toBe('authenticated')
    expect(useAuthStore.getState().user?.email).toBe(VALID_REGISTRATION.email)
    expect(db.findUserByEmail(VALID_REGISTRATION.email)).not.toBeNull()
  })

  it('shows a 409 error when the email already exists', async () => {
    const user = userEvent.setup()
    renderAt()
    await user.type(screen.getByLabelText('First name'), 'Existing')
    await user.type(screen.getByLabelText('Last name'), 'User')
    await user.type(screen.getByLabelText('Email'), 'demo@bank.com')
    await user.type(screen.getByLabelText(/^Password$/), 'supersecret1')
    await user.type(screen.getByLabelText('Confirm password'), 'supersecret1')
    await user.click(screen.getByLabelText(/I agree to the Terms of Service/))
    await user.click(screen.getByRole('button', { name: 'Create account' }))

    expect(
      await screen.findByText('An account with this email already exists.'),
    ).toBeInTheDocument()
    expect(useAuthStore.getState().status).not.toBe('authenticated')
  })

  it('still works after a failed duplicate attempt (user can correct)', async () => {
    const user = userEvent.setup()
    renderAt()
    await user.type(screen.getByLabelText('First name'), VALID_REGISTRATION.firstName)
    await user.type(screen.getByLabelText('Last name'), VALID_REGISTRATION.lastName)
    await user.type(screen.getByLabelText('Email'), 'demo@bank.com')
    await user.type(screen.getByLabelText(/^Password$/), VALID_REGISTRATION.password)
    await user.type(screen.getByLabelText('Confirm password'), VALID_REGISTRATION.password)
    await user.click(screen.getByLabelText(/I agree to the Terms of Service/))
    await user.click(screen.getByRole('button', { name: 'Create account' }))
    await screen.findByText('An account with this email already exists.')

    const email = screen.getByLabelText('Email')
    await user.clear(email)
    await user.type(email, VALID_REGISTRATION.email)
    await user.click(screen.getByRole('button', { name: 'Create account' }))

    await waitFor(() => expect(screen.getByText('Dashboard target')).toBeInTheDocument())
    expect(db.findUserByEmail(VALID_REGISTRATION.email)).not.toBeNull()
  })
})
