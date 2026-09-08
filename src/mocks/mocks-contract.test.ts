import { beforeEach, describe, expect, it } from 'vitest'
import { apiClient } from '@/lib/api/client'
import { saveToken, clearToken } from '@/lib/auth/token'
import type {
  Account,
  AuthResponse,
  Card,
  SpendingInsights,
  TransferResult,
  Transaction,
  User,
} from '@/lib/api/types'

async function loginAsDemo(): Promise<AuthResponse> {
  const auth = await apiClient<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'demo@bank.com', password: 'demo1234' }),
  })
  saveToken(auth.token)
  return auth
}

function expiredToken(): string {
  const payload = btoa(JSON.stringify({ sub: 'usr_demo', iat: 1, exp: 1 }))
  return `mock.${payload}.sig`
}

beforeEach(() => {
  clearToken()
})

describe('MSW contract: endpoints return the documented shape', () => {
  it('rejects a login with wrong credentials with 401', async () => {
    await expect(
      apiClient('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: 'demo@bank.com', password: 'wrong-password' }),
      }),
    ).rejects.toMatchObject({ status: 401, code: 'INVALID_CREDENTIALS' })
  })

  it('logs in with seeded credentials and returns a token + user', async () => {
    const auth = await loginAsDemo()
    expect(auth.token).toMatch(/^mock\./)
    expect(auth.user.email).toBe('demo@bank.com')
    expect(auth.user).toMatchObject({
      id: 'usr_demo',
      firstName: expect.any(String),
      lastName: expect.any(String),
      preferredCurrency: 'USD',
    })
  })

  it('returns 401 for protected endpoints without a token', async () => {
    await expect(apiClient('/me')).rejects.toMatchObject({ status: 401, code: 'UNAUTHORIZED' })
    await expect(apiClient('/accounts')).rejects.toMatchObject({
      status: 401,
      code: 'UNAUTHORIZED',
    })
    await expect(apiClient('/cards')).rejects.toMatchObject({ status: 401, code: 'UNAUTHORIZED' })
  })

  it('returns 401 for an expired session token', async () => {
    saveToken(expiredToken())
    await expect(apiClient('/me')).rejects.toMatchObject({ status: 401, code: 'UNAUTHORIZED' })
  })

  it('GET /me returns the authenticated user', async () => {
    await loginAsDemo()
    const { user } = await apiClient<{ user: User }>('/me')
    expect(user.email).toBe('demo@bank.com')
  })

  it('GET /users/:id returns a user, 404 for unknown ids', async () => {
    const { user } = await apiClient<{ user: User }>('/users/usr_demo')
    expect(user.id).toBe('usr_demo')
    await expect(apiClient('/users/nope')).rejects.toMatchObject({ status: 404 })
  })

  it('registers a user (201) and rejects duplicate emails (409)', async () => {
    const auth = await apiClient<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        firstName: 'Grace',
        lastName: 'Hopper',
        email: 'grace@bank.com',
        password: 'supersecret1',
      }),
    })
    expect(auth.user.email).toBe('grace@bank.com')
    saveToken(auth.token)

    await expect(
      apiClient('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          firstName: 'Grace',
          lastName: 'Hopper',
          email: 'grace@bank.com',
          password: 'supersecret1',
        }),
      }),
    ).rejects.toMatchObject({ status: 409, code: 'EMAIL_TAKEN' })
  })

  it('GET /accounts returns accounts with money in minor units', async () => {
    await loginAsDemo()
    const { accounts } = await apiClient<{ accounts: Account[] }>('/accounts')
    expect(accounts.length).toBeGreaterThanOrEqual(4)
    for (const account of accounts) {
      expect(Number.isInteger(account.balance.amount)).toBe(true)
      expect(Number.isInteger(account.availableBalance.amount)).toBe(true)
      expect(account).toMatchObject({
        id: expect.any(String),
        name: expect.any(String),
        type: expect.any(String),
        number: expect.stringContaining('•'),
        currency: 'USD',
      })
    }
  })

  it('GET /accounts/:id returns an account and 404 for unknown/foreign accounts', async () => {
    await loginAsDemo()
    const { accounts } = await apiClient<{ accounts: Account[] }>('/accounts')
    const { account } = await apiClient<{ account: Account }>(`/accounts/${accounts[0].id}`)
    expect(account.id).toBe(accounts[0].id)
    await expect(apiClient('/accounts/unknown')).rejects.toMatchObject({ status: 404 })
  })

  it('paginates and filters account transactions', async () => {
    await loginAsDemo()
    const { accounts } = await apiClient<{ accounts: Account[] }>('/accounts')
    const base = `/accounts/${accounts[0].id}/transactions`

    const pageOne = await apiClient<{
      items: Transaction[]
      page: number
      total: number
      totalPages: number
    }>(`${base}?page=1&limit=5`)
    expect(pageOne.items).toHaveLength(5)
    expect(pageOne.total).toBeGreaterThan(5)
    expect(pageOne.totalPages).toBeGreaterThan(1)

    const filtered = await apiClient<{ items: Transaction[] }>(`${base}?page=1&limit=5&type=credit`)
    expect(filtered.items.every((txn) => txn.type === 'credit')).toBe(true)
  })

  it('GET /transactions returns paginated cross-account transactions', async () => {
    await loginAsDemo()
    const page = await apiClient<{
      items: Transaction[]
      page: number
      total: number
      totalPages: number
    }>('/transactions?page=2&limit=10')
    expect(page.page).toBe(2)
    expect(page.items.length).toBeLessThanOrEqual(10)
    for (const txn of page.items) {
      expect(txn).toMatchObject({
        id: expect.any(String),
        accountId: expect.any(String),
        date: expect.any(String),
        amount: { currency: 'USD' },
      })
      expect(Number.isInteger(txn.amount.amount)).toBe(true)
    }
  })

  it('POST /transfers creates debit + credit and updates balances', async () => {
    await loginAsDemo()
    const { accounts } = await apiClient<{ accounts: Account[] }>('/accounts')
    const fromId = accounts[0].id
    const toId = accounts[2].id
    const amount = 1_234

    const result = await apiClient<TransferResult>('/transfers', {
      method: 'POST',
      body: JSON.stringify({
        amount: { amount, currency: 'USD' },
        fromAccountId: fromId,
        toAccountId: toId,
      }),
    })
    expect(result.debit.accountId).toBe(fromId)
    expect(result.debit.amount.amount).toBe(-amount)
    expect(result.credit.accountId).toBe(toId)
    expect(result.credit.amount.amount).toBe(amount)

    const after = await apiClient<{ accounts: Account[] }>('/accounts')
    const fromAfter = after.accounts.find((account) => account.id === fromId)!
    const toAfter = after.accounts.find((account) => account.id === toId)!
    expect(fromAfter.balance.amount).toBe(accounts[0].balance.amount - amount)
    expect(toAfter.balance.amount).toBe(accounts[2].balance.amount + amount)
  })

  it('POST /transfers rejects invalid amounts and insufficient funds', async () => {
    await loginAsDemo()
    const { accounts } = await apiClient<{ accounts: Account[] }>('/accounts')
    const body = (fromAccountId: string, toAccountId: string, amount: number) =>
      JSON.stringify({ amount: { amount, currency: 'USD' }, fromAccountId, toAccountId })

    await expect(
      apiClient('/transfers', {
        method: 'POST',
        body: body(accounts[0].id, accounts[2].id, 0),
      }),
    ).rejects.toMatchObject({ status: 400, code: 'INVALID_AMOUNT' })

    await expect(
      apiClient('/transfers', {
        method: 'POST',
        body: body(accounts[0].id, accounts[2].id, 999_999_999),
      }),
    ).rejects.toMatchObject({ status: 400, code: 'INSUFFICIENT_FUNDS' })
  })

  it('lists cards and toggles freeze/unfreeze', async () => {
    await loginAsDemo()
    const { cards } = await apiClient<{ cards: Card[] }>('/cards')
    expect(cards.length).toBeGreaterThanOrEqual(2)

    const cardId = cards[0].id
    const frozen = await apiClient<{ card: Card }>(`/cards/${cardId}/freeze`, { method: 'POST' })
    expect(frozen.card.status).toBe('frozen')
    const active = await apiClient<{ card: Card }>(`/cards/${cardId}/unfreeze`, { method: 'POST' })
    expect(active.card.status).toBe('active')

    await expect(apiClient('/cards/unknown/freeze', { method: 'POST' })).rejects.toMatchObject({
      status: 404,
    })
  })

  it('GET /insights/spending returns the documented analytics shape', async () => {
    await loginAsDemo()
    const insights = await apiClient<SpendingInsights>('/insights/spending')
    expect(insights.byCategory.length).toBeGreaterThan(0)
    expect(insights.monthly.length).toBe(12)
    expect(insights.topMerchants.length).toBeGreaterThan(0)
    for (const bucket of insights.byCategory) {
      expect(bucket.amount).toBeGreaterThan(0)
      expect(bucket.currency).toBe('USD')
      expect(bucket.category).toEqual(expect.any(String))
    }
  })

  it('PATCH /settings/profile and /settings/security return documented shapes', async () => {
    await loginAsDemo()
    const profile = await apiClient<{ user: User }>('/settings/profile', {
      method: 'PATCH',
      body: JSON.stringify({ firstName: 'Demo', preferredCurrency: 'EUR' }),
    })
    expect(profile.user.firstName).toBe('Demo')
    expect(profile.user.preferredCurrency).toBe('EUR')

    const security = await apiClient<{ ok: boolean }>('/settings/security', {
      method: 'PATCH',
      body: JSON.stringify({}),
    })
    expect(security.ok).toBe(true)
  })

  it('POST /auth/logout returns 204', async () => {
    await loginAsDemo()
    await expect(apiClient('/auth/logout', { method: 'POST' })).resolves.toBeUndefined()
  })
})
