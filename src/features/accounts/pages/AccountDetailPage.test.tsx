import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import AccountDetailPage from '@/features/accounts/pages/AccountDetailPage'
import { queryClient } from '@/app/queryClient'
import { db } from '@/mocks/db'
import { saveToken } from '@/lib/auth/token'
import { formatMoney } from '@/lib/money'

function renderAt(accountId: string) {
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[`/accounts/${accountId}`]}>
        <Routes>
          <Route path="/accounts/:accountId" element={<AccountDetailPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

beforeEach(() => {
  queryClient.clear()
  saveToken(db.issueToken('usr_demo'))
})

describe('AccountDetailPage', () => {
  it('shows the account name, number and correct balance', async () => {
    renderAt('acc_checking')

    const account = db.getAccountForUser('usr_demo', 'acc_checking')!
    expect(await screen.findByRole('heading', { name: account.name })).toBeInTheDocument()
    expect(screen.getByText(`Account ${account.number}`)).toBeInTheDocument()
    const balanceText = formatMoney(account.balance.amount, { currency: account.currency })
    expect(screen.getAllByText(balanceText).length).toBeGreaterThanOrEqual(2)
    const availableBalanceText = formatMoney(account.availableBalance.amount, {
      currency: account.currency,
    })
    expect(screen.getAllByText(availableBalanceText).length).toBeGreaterThanOrEqual(1)
  })

  it('lists the account transactions', async () => {
    renderAt('acc_checking')

    const firstTxn = db.getAccountTransactions('usr_demo', 'acc_checking', { page: 1, limit: 10 })
      .items[0]
    expect(await screen.findByText(firstTxn.description)).toBeInTheDocument()
  })

  it('shows an empty state and back link when the account is unknown', async () => {
    renderAt('acc_missing')

    expect(await screen.findByText('Account not found', {}, { timeout: 5000 })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /All accounts/ })).toBeInTheDocument()
  }, 15000)
})
