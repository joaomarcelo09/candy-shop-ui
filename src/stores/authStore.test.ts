import { beforeEach, describe, expect, it } from 'vitest'
import { useAuthStore } from './authStore'

describe('authStore', () => {
  beforeEach(() => {
    useAuthStore.setState({ token: null, user: null })
  })

  it('armazena a sessão entregue pelo fluxo de autenticação', () => {
    useAuthStore.getState().setSession('token-valido', {
      id: 'user-1',
      name: 'Vendedora',
      email: 'vendedora@doces.com',
    })

    expect(useAuthStore.getState()).toEqual(
      expect.objectContaining({
        token: 'token-valido',
        user: expect.objectContaining({ email: 'vendedora@doces.com' }),
      }),
    )
    expect(window.localStorage.getItem('candy-shop-auth')).toContain('token-valido')
  })

  it('limpa a sessão ao sair', () => {
    useAuthStore.getState().setSession('token-valido', { email: 'vendedora@doces.com' })
    useAuthStore.getState().logout()

    expect(useAuthStore.getState().token).toBeNull()
    expect(useAuthStore.getState().user).toBeNull()
  })
})
