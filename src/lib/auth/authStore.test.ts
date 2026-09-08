import { beforeEach, describe, expect, it } from 'vitest'
import { apiClient } from '@/lib/api/client'
import type { AuthResponse } from '@/lib/api/types'
import { useAuthStore } from '@/lib/auth/authStore'
import { clearToken, getToken } from '@/lib/auth/token'

const TOKEN_STORAGE_KEY = 'banking.auth.token'

async function freshToken(): Promise<string> {
  const auth = await apiClient<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'demo@bank.com', password: 'demo1234' }),
  })
  return auth.token
}

function expiredToken(): string {
  const payload = btoa(JSON.stringify({ sub: 'usr_demo', iat: 1, exp: 1 }))
  return `mock.${payload}.sig`
}

beforeEach(() => {
  clearToken()
  useAuthStore.setState({ user: null, token: null, status: 'loading' })
})

describe('authStore', () => {
  it('starts unauthenticated after a restore with no stored token', async () => {
    await useAuthStore.getState().restore()
    expect(useAuthStore.getState().status).toBe('unauthenticated')
    expect(useAuthStore.getState().user).toBeNull()
  })

  it('login sets an authenticated session; remember persists to sessionStorage', async () => {
    const token = await freshToken()
    useAuthStore.getState().login(
      token,
      {
        id: 'usr_demo',
        firstName: 'A',
        lastName: 'B',
        email: 'demo@bank.com',
        preferredCurrency: 'USD',
      },
      true,
    )

    expect(useAuthStore.getState().status).toBe('authenticated')
    expect(useAuthStore.getState().user?.email).toBe('demo@bank.com')
    expect(getToken()).toBe(token)
    expect(window.sessionStorage.getItem(TOKEN_STORAGE_KEY)).toBe(token)
  })

  it('login without remember keeps the token only in memory', async () => {
    const token = await freshToken()
    useAuthStore.getState().login(
      token,
      {
        id: 'usr_demo',
        firstName: 'A',
        lastName: 'B',
        email: 'demo@bank.com',
        preferredCurrency: 'USD',
      },
      false,
    )

    expect(useAuthStore.getState().status).toBe('authenticated')
    expect(getToken()).toBe(token)
    expect(window.sessionStorage.getItem(TOKEN_STORAGE_KEY)).toBeNull()
  })

  it('logout clears the session and the stored token', async () => {
    const token = await freshToken()
    useAuthStore.getState().login(
      token,
      {
        id: 'usr_demo',
        firstName: 'A',
        lastName: 'B',
        email: 'demo@bank.com',
        preferredCurrency: 'USD',
      },
      true,
    )

    useAuthStore.getState().logout()
    expect(useAuthStore.getState().status).toBe('unauthenticated')
    expect(useAuthStore.getState().user).toBeNull()
    expect(getToken()).toBeNull()
  })

  it('restore authenticates from a remembered session (sessionStorage)', async () => {
    const token = await freshToken()
    window.sessionStorage.setItem(TOKEN_STORAGE_KEY, token)

    await useAuthStore.getState().restore()
    expect(useAuthStore.getState().status).toBe('authenticated')
    expect(useAuthStore.getState().user?.email).toBe('demo@bank.com')
  })

  it('restore clears expired sessions', async () => {
    window.sessionStorage.setItem(TOKEN_STORAGE_KEY, expiredToken())

    await useAuthStore.getState().restore()
    expect(useAuthStore.getState().status).toBe('unauthenticated')
    expect(useAuthStore.getState().user).toBeNull()
    expect(window.sessionStorage.getItem(TOKEN_STORAGE_KEY)).toBeNull()
  })
})
