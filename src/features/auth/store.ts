import { create } from 'zustand'
import type { UserDetails } from './types'

interface AuthState {
  accessToken: string | null
  user: UserDetails | null
  isInitializing: boolean
  setAuth: (accessToken: string, user: UserDetails) => void
  reset: () => void
  setInitializing: (value: boolean) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  isInitializing: true,
  setAuth: (accessToken, user) => set({ accessToken, user }),
  reset: () => set({ accessToken: null, user: null }),
  setInitializing: (value) => set({ isInitializing: value }),
}))

export const isLoggedIn = (state: AuthState) => !!state.accessToken
