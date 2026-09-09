import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import AccountsPage from '@/features/accounts/pages/AccountsPage'
import { queryClient } from '@/app/queryClient'
import { db } from '@/mocks/db'
import { saveToken } from '@/lib/auth/token'
import { formatMoney } from '@/lib/money'

function renderPage() {
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <AccountsPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

beforeEach(() => {
  queryClient.clear()
  saveToken(db.issueToken('usr_demo'))
})

describe('AccountsPage', () => {
  it('renders all user accounts as cards linking to their detail page', async () => {
    renderPage()

    const accounts = db.getUserAccounts('usr_demo')
    expect(await screen.findByText('Everyday Checking')).toBeInTheDocument()
    for (const account of accounts) {
      expect(screen.getByRole('link', { name: new RegExp(account.name) })).toHaveAttribute(
        'href',
        `/accounts/${account.id}`,
      )
    }
  })

  it('shows each account balance', async () => {
    renderPage()

    const accounts = db.getUserAccounts('usr_demo')
    for (const account of accounts) {
      const expected = formatMoney(account.balance.amount, { currency: account.currency })
      expect(await screen.findByText(expected)).toBeInTheDocument()
    }
  })
})
