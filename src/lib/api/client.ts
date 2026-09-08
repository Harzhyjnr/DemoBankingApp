import { ApiError } from '@/lib/api/errors'
import { getToken } from '@/lib/auth/token'

const API_BASE_URL = import.meta.env.VITE_APP_API_BASE_URL ?? '/api'

export interface ApiClientOptions extends RequestInit {
  query?: Record<string, string | number | boolean | undefined>
}

export async function apiClient<T>(path: string, options: ApiClientOptions = {}): Promise<T> {
  const { query, headers, ...rest } = options

  const url = new URL(
    `${API_BASE_URL}${path}`,
    typeof window === 'undefined' ? 'http://localhost' : window.location.origin,
  )

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) {
        url.searchParams.set(key, String(value))
      }
    }
  }

  const response = await fetch(url.toString(), {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
      ...headers,
    },
  })

  if (!response.ok) {
    let errorBody: { error?: { code?: string; message?: string; details?: unknown } } | null = null
    try {
      errorBody = await response.json()
    } catch {
      errorBody = null
    }
    throw new ApiError(
      response.status,
      errorBody?.error?.code ?? 'UNKNOWN_ERROR',
      errorBody?.error?.message ?? `Request failed with status ${response.status}`,
      errorBody?.error?.details,
    )
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}
