export interface AuthUser {
  id?: string
  name?: string
  email: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token?: string
  accessToken?: string
  user?: AuthUser
}

export interface AuthSession {
  token: string
  user?: AuthUser
}
