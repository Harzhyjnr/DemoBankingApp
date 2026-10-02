const DEFAULT_API_BASE_URL = '/api'

const configuredBaseUrl = import.meta.env.VITE_APP_API_BASE_URL?.trim()

export const API_BASE_URL = (configuredBaseUrl || DEFAULT_API_BASE_URL).replace(/\/+$/, '')

export function apiUrl(path: string, origin: string): string {
  return new URL(`${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`, origin).toString()
}

export function apiPattern(path: string): string {
  const basePath = /^https?:\/\//.test(API_BASE_URL) ? new URL(API_BASE_URL).pathname : API_BASE_URL

  return `*/${`${basePath}${path}`.replace(/^\/+|\/+$/g, '')}`
}
