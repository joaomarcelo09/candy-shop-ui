import axios from 'axios'
import toast from 'react-hot-toast'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api, AUTH_STORAGE_KEY } from '../api/http'
import type { AuthStoreState, LoginRequest, LoginResponse } from '../types/api'
import { decodeUserFromToken } from '../utils/jwt'

export const useAuthStore = create<AuthStoreState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      loading: false,
      async login(payload: LoginRequest) {
        set({ loading: true })

        try {
          const response = await api.post<LoginResponse>('/auth/login', payload)
          const user = decodeUserFromToken(response.data.token)

          set({
            token: response.data.token,
            user,
          })
        } catch (error) {
          if (!axios.isAxiosError(error)) {
            toast.error(error instanceof Error ? error.message : 'Unable to sign in')
          }

          throw error
        } finally {
          set({ loading: false })
        }
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
