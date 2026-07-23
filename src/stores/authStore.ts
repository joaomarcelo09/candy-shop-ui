import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AUTH_STORAGE_KEY } from '../api/http'
import type { AuthStoreState } from '../types/api'

export const useAuthStore = create<AuthStoreState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth(token, user) {
        set({ token, user })
      },
      logout() {
        set({
          token: null,
          user: null,
        })
      },
    }),
    {
      name: AUTH_STORAGE_KEY,
      partialize: (state) => ({
        token: state.token,
        user: state.user,
      }),
    },
  ),
)
