import { apiClient } from '@/lib/api/client'
import type { AuthResponse, User } from '@/lib/api/types'

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  firstName: string
  lastName: string
  email: string
  password: string
}

export function loginUser(payload: LoginPayload): Promise<AuthResponse> {
  return apiClient<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function registerUser(payload: RegisterPayload): Promise<AuthResponse> {
  return apiClient<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function logoutUser(): Promise<void> {
  return apiClient<void>('/auth/logout', { method: 'POST' })
}

export function getMe(): Promise<{ user: User }> {
  return apiClient<{ user: User }>('/me')
}
