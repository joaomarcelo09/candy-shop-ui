import type { LoginRequest, LoginResponse } from '../types/api'
import { api } from './http'

export async function login(payload: LoginRequest) {
  const response = await api.post<LoginResponse>('/auth/login', payload)

  return response.data
}
