import { act, fireEvent, render, renderHook, screen } from '@testing-library/react'
import { QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { login } from '../api/auth'
import { AppLayout } from '../layouts/AppLayout'
import { useAuthStore } from '../stores/authStore'
import { createQueryWrapper, createTestQueryClient } from '../test/renderHook'
import { useLoginMutation } from './useAuth'

vi.mock('../api/auth', () => ({
  login: vi.fn(),
}))

vi.mock('../utils/jwt', () => ({
  decodeUserFromToken: vi.fn(() => ({ id: 'user-1', email: 'seller@example.com', name: 'Seller' })),
}))

const mockedLogin = vi.mocked(login)

describe('authentication query integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuthStore.setState({ token: null, user: null })
  })

  it('stores credentials after a successful login mutation', async () => {
    mockedLogin.mockResolvedValue({ token: 'valid-token' })
    const { wrapper } = createQueryWrapper()
    const { result } = renderHook(() => useLoginMutation(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync({ email: 'seller@example.com', password: '123456' })
    })

    expect(useAuthStore.getState()).toEqual(
      expect.objectContaining({
        token: 'valid-token',
        user: expect.objectContaining({ email: 'seller@example.com' }),
      }),
    )
    expect(window.localStorage.getItem('candy-shop-auth')).toContain('valid-token')
  })

  it('does not authenticate when login fails', async () => {
    mockedLogin.mockRejectedValue(new Error('invalid credentials'))
    const { wrapper } = createQueryWrapper()
    const { result } = renderHook(() => useLoginMutation(), { wrapper })

    await act(async () => {
      await expect(
        result.current.mutateAsync({ email: 'seller@example.com', password: 'wrong-password' }),
      ).rejects.toThrow('invalid credentials')
    })

    expect(useAuthStore.getState().token).toBeNull()
  })

  it('clears the query cache and authentication on manual logout', () => {
    const queryClient = createTestQueryClient()
    queryClient.setQueryData(['candies'], [{ id: 'candy-1' }])
    useAuthStore.getState().setAuth('valid-token', {
      id: 'user-1',
      email: 'seller@example.com',
      name: 'Seller',
    })

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AppLayout>
            <div>Content</div>
          </AppLayout>
        </MemoryRouter>
      </QueryClientProvider>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Logout' }))

    expect(queryClient.getQueryData(['candies'])).toBeUndefined()
    expect(useAuthStore.getState().token).toBeNull()
  })
})
