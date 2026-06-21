import { create } from 'zustand'
import { api } from '@/lib/api'
import type { User } from '@/types'

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string) => Promise<void>
  logout: () => void
  initialize: () => Promise<void>
  clearError: () => void
}

const TOKEN_KEY = 'vaulta-token'

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem(TOKEN_KEY),
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null })
    try {
      const { data } = await api.post<{ token: string; user: User }>('/auth/login', { email, password })
      localStorage.setItem(TOKEN_KEY, data.token)
      set({ token: data.token, user: data.user, isLoading: false })
    } catch (err: unknown) {
      const message = extractMessage(err) ?? 'Login failed'
      set({ isLoading: false, error: message })
      throw new Error(message)
    }
  },

  signup: async (email, password) => {
    set({ isLoading: true, error: null })
    try {
      const { data } = await api.post<{ token: string; user: User }>('/auth/signup', { email, password })
      localStorage.setItem(TOKEN_KEY, data.token)
      set({ token: data.token, user: data.user, isLoading: false })
    } catch (err: unknown) {
      const message = extractMessage(err) ?? 'Signup failed'
      set({ isLoading: false, error: message })
      throw new Error(message)
    }
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY)
    set({ user: null, token: null, error: null })
    window.location.href = '/login'
  },

  initialize: async () => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) { set({ isLoading: false }); return }

    set({ isLoading: true })
    try {
      const { data } = await api.get<User>('/auth/me')
      set({ user: data, token, isLoading: false })
    } catch {
      localStorage.removeItem(TOKEN_KEY)
      set({ user: null, token: null, isLoading: false })
    }
  },

  clearError: () => set({ error: null }),
}))

function extractMessage(err: unknown): string | null {
  if (err && typeof err === 'object' && 'response' in err) {
    const response = (err as { response?: { data?: { error?: string } } }).response
    return response?.data?.error ?? null
  }
  return null
}
