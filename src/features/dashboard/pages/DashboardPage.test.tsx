import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import DashboardPage from '@/features/dashboard/pages/DashboardPage'
import { queryClient } from '@/app/queryClient'
import { db } from '@/mocks/db'
import { market } from '@/mocks/db/crypto'
import { useAuthStore } from '@/lib/auth/authStore'
import { saveToken } from '@/lib/auth/token'
import { formatMoney } from '@/lib/money'

function renderDashboard() {
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

const MOCK_USER = {
  id: 'usr_demo',
  firstName: 'Demo',
  lastName: 'User',
  email: 'demo@bank.com',
  preferredCurrency: 'NGN' as const,
}

beforeEach(() => {
  queryClient.clear()
  saveToken(db.issueToken('usr_demo'))
  useAuthStore.setState({ user: MOCK_USER, token: 'mock-token', status: 'authenticated' })
})

describe('DashboardPage', () => {
  it('shows the page header with a welcome message', async () => {
    renderDashboard()
    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()
    expect(screen.getByText('Welcome back, Demo.')).toBeInTheDocument()
  })

  it('renders the total portfolio value from accounts and crypto', async () => {
    renderDashboard()

    const accounts = db.getUserAccounts('usr_demo')
    const cashMinor = accounts.reduce((sum, account) => sum + account.balance.amount, 0)
    const cryptoValue = market.getHoldings().reduce((sum, h) => sum + h.value, 0)
    const total = cashMinor + cryptoValue
    const expected = formatMoney(total, { currency: 'NGN' })

    expect(await screen.findByText('Total portfolio')).toBeInTheDocument()
    const matches = await screen.findAllByText(expected)
    expect(matches.length).toBeGreaterThan(0)
  })

  it('renders account cards that link to account detail', async () => {
    renderDashboard()
    expect(await screen.findByRole('link', { name: /Naija Everyday/ })).toHaveAttribute(
      'href',
      '/accounts/acc_checking',
    )
    expect(screen.getAllByRole('link', { name: /Kobo Savings/ })).not.toHaveLength(0)
    expect(screen.getAllByRole('link', { name: /Travel Card/ })).not.toHaveLength(0)
  })

  it('shows the most recent transactions', async () => {
    renderDashboard()

    const recent = db.getAllTransactions('usr_demo', { page: 1, limit: 5 }).items
    expect((await screen.findAllByText(recent[0].description)).length).toBeGreaterThanOrEqual(1)
    expect(recent.length).toBeGreaterThan(0)
  })

  it('lazy-loads the spending chart', async () => {
    renderDashboard()
    expect(
      await screen.findByRole('img', {
        name: 'Area chart of monthly spending for the last 12 months',
      }),
    ).toBeInTheDocument()
  })
})
