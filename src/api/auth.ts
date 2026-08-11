import type { AxiosInstance } from 'axios'
import type { AuthSession, LoginResponse } from '../types/auth'
import type { AuthApi } from './contracts'

export function createAuthApi(client: AxiosInstance): AuthApi {
  return {
    async login(payload): Promise<AuthSession> {
      const response = await client.post<LoginResponse>('/auth/login', payload)
      const token = response.data.token ?? response.data.accessToken

      if (!token) throw new Error('A resposta do login não contém um token de acesso')

      return { token, user: response.data.user }
    },
  }
}
