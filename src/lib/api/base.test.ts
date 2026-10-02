import { afterEach, describe, expect, it, vi } from 'vitest'

async function loadBase(configured?: string) {
  vi.resetModules()
  if (configured === undefined) {
    vi.stubEnv('VITE_APP_API_BASE_URL', undefined as unknown as string)
  } else {
    vi.stubEnv('VITE_APP_API_BASE_URL', configured)
  }
  return import('@/lib/api/base')
}

afterEach(() => {
  vi.unstubAllEnvs()
  vi.resetModules()
})

describe('API base URL', () => {
  it('defaults to /api when the variable is not configured', async () => {
    const { API_BASE_URL, apiPattern, apiUrl } = await loadBase(undefined)
    expect(API_BASE_URL).toBe('/api')
    expect(apiUrl('/auth/login', 'https://bank.test')).toBe('https://bank.test/api/auth/login')
    expect(apiPattern('/auth/login')).toBe('*/api/auth/login')
  })

  it('falls back to /api when the variable is empty, as on Vercel', async () => {
    const { API_BASE_URL, apiPattern, apiUrl } = await loadBase('')
    expect(API_BASE_URL).toBe('/api')
    expect(apiUrl('/auth/login', 'https://bank.test')).toBe('https://bank.test/api/auth/login')
    expect(apiPattern('/auth/login')).toBe('*/api/auth/login')
  })

  it('ignores whitespace-only values and trailing slashes', async () => {
    for (const configured of ['   ', '/api/', '/api///', ' /api/ ']) {
      const { API_BASE_URL, apiUrl, apiPattern } = await loadBase(configured)
      expect(API_BASE_URL).toBe('/api')
      expect(apiUrl('/auth/login', 'https://bank.test')).toBe('https://bank.test/api/auth/login')
      expect(apiPattern('/auth/login')).toBe('*/api/auth/login')
    }
  })

  it('keeps MSW patterns aligned with a custom path base', async () => {
    const { apiUrl, apiPattern } = await loadBase('/gateway')
    expect(apiUrl('/auth/login', 'https://bank.test')).toBe('https://bank.test/gateway/auth/login')
    expect(apiPattern('/auth/login')).toBe('*/gateway/auth/login')
  })

  it('keeps MSW patterns aligned with an absolute base URL', async () => {
    const { apiUrl, apiPattern } = await loadBase('https://api.bank.test')
    expect(apiUrl('/auth/login', 'https://bank.test')).toBe('https://api.bank.test/auth/login')
    expect(apiPattern('/auth/login')).toBe('*/auth/login')
  })

  it('keeps MSW patterns aligned with an absolute base URL that has a path', async () => {
    const { apiUrl, apiPattern } = await loadBase('https://api.bank.test/v2/')
    expect(apiUrl('/auth/login', 'https://bank.test')).toBe('https://api.bank.test/v2/auth/login')
    expect(apiPattern('/auth/login')).toBe('*/v2/auth/login')
  })

  it('accepts paths without a leading slash', async () => {
    const { apiUrl, apiPattern } = await loadBase('/api')
    expect(apiUrl('auth/login', 'https://bank.test')).toBe('https://bank.test/api/auth/login')
    expect(apiPattern('/auth/login')).toBe('*/api/auth/login')
  })
})
