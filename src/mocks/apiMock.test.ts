import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createAppDependencies } from '../api/dependencies'
import { AUTH_STORAGE_KEY, api } from '../api/http'
import { startApiMock } from './apiMock'

describe('frontend API mock', () => {
  const dependencies = createAppDependencies(api)
  const mockAdapter = startApiMock()

  beforeAll(() => {
    window.localStorage.removeItem(AUTH_STORAGE_KEY)
  })

  afterAll(() => {
    mockAdapter.restore()
  })

  it('autentica a conta de demonstração sem backend', async () => {
    const session = await dependencies.authApi.login({
      email: 'vendedora@doces.com',
      password: 'doces123',
    })

    expect(session).toEqual({
      token: 'mock-candy-shop-access-token',
      user: {
        id: 'mock-user-1',
        name: 'Maria da Loja',
        email: 'vendedora@doces.com',
      },
    })
  })

  it('serve o estoque pela mesma instância Axios autenticada', async () => {
    window.localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({ state: { token: 'mock-candy-shop-access-token' }, version: 0 }),
    )

    const [items, entries] = await Promise.all([
      dependencies.inventoryApi.getItems(),
      dependencies.inventoryApi.getEntries(),
    ])

    expect(items).toHaveLength(4)
    expect(entries).toHaveLength(2)
  })
})
