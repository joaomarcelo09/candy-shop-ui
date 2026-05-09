import type { User } from '../types/domain'

interface JwtPayload {
  sub: string
  email: string
  name: string
}

export function decodeUserFromToken(token: string): User | null {
  try {
    const payload = token.split('.')[1]

    if (!payload) {
      return null
    }

    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
    const decoded = JSON.parse(window.atob(normalized)) as JwtPayload

    if (!decoded.sub || !decoded.email) {
      return null
    }

    return {
      id: decoded.sub,
      email: decoded.email,
      name: decoded.name ?? decoded.email.split('@')[0],
    }
  } catch {
    return null
  }
}
