import { create } from 'zustand'
import type { User } from '@/lib/api/types'
import { getMe } from '@/lib/auth/authApi'
import { clearToken, getToken, saveToken } from '@/lib/auth/token'

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'

export interface AuthState {
  user: User | null
  token: string | null
  status: AuthStatus
  login: (token: string, user: User, remember?: boolean) => void
  logout: () => void
  restore: () => Promise<void>
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  token: null,
  status: 'loading',

  login: (token, user, remember = false) => {
    saveToken(token, remember)
    set({ token, user, status: 'authenticated' })
  },

  logout: () => {
    clearToken()
    set({ token: null, user: null, status: 'unauthenticated' })
  },

  restore: async () => {
    if (get().status !== 'loading') return
    const token = getToken()
    if (!token) {
      set({ token: null, user: null, status: 'unauthenticated' })
      return
    }
    try {
      const { user } = await getMe()
      set({ token, user, status: 'authenticated' })
    } catch {
      clearToken()
      set({ token: null, user: null, status: 'unauthenticated' })
    }
  },
}))
