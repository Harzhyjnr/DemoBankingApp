import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import DashboardPage from '@/features/dashboard/pages/DashboardPage'
import { queryClient } from '@/app/queryClient'
import { db } from '@/mocks/db'
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
  preferredCurrency: 'USD' as const,
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

  it('renders the total balance from the seeded accounts', async () => {
    renderDashboard()

    const accounts = db.getUserAccounts('usr_demo')
    const totalBalance = accounts.reduce((sum, account) => sum + account.balance.amount, 0)
    const expected = formatMoney(totalBalance, { currency: 'USD' })

    expect(await screen.findByText('Total balance')).toBeInTheDocument()
    expect(await screen.findByText(expected)).toBeInTheDocument()
  })

  it('renders account cards that link to account detail', async () => {
    renderDashboard()
    expect(await screen.findByRole('link', { name: /Everyday Checking/ })).toHaveAttribute(
      'href',
      '/accounts/acc_checking',
    )
    expect(screen.getAllByRole('link', { name: /High Yield Savings/ })).not.toHaveLength(0)
    expect(screen.getAllByRole('link', { name: /Travel Credit Card/ })).not.toHaveLength(0)
  })

  it('shows the six most recent transactions', async () => {
    renderDashboard()

    const recent = db.getAllTransactions('usr_demo', { page: 1, limit: 6 }).items
    expect(await screen.findByText(recent[0].description)).toBeInTheDocument()
    expect(recent.length).toBeGreaterThan(0)
  })

  it('lazy-loads the spending chart', async () => {
    renderDashboard()
    expect(
      await screen.findByRole('img', {
        name: 'Bar chart of monthly spending for the last 12 months',
      }),
    ).toBeInTheDocument()
  })
})
