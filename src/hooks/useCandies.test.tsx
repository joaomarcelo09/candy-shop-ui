import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createCandy, getCandies } from '../api/candies'
import { candyKeys } from '../queries/queryKeys'
import { createQueryWrapper } from '../test/renderHook'
import { useCandiesQuery, useCreateCandyMutation } from './useCandies'

vi.mock('../api/candies', () => ({
  getCandies: vi.fn(),
  createCandy: vi.fn(),
  updateCandy: vi.fn(),
}))

vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}))

const mockedGetCandies = vi.mocked(getCandies)
const mockedCreateCandy = vi.mocked(createCandy)
const candies = [{ id: 'candy-1', name: 'Chocolate', price: 500 }]

describe('candy queries', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedGetCandies.mockResolvedValue(candies)
  })

  it('deduplicates consumers that request the catalog together', async () => {
    const { wrapper } = createQueryWrapper()
    const { result } = renderHook(
      () => ({ first: useCandiesQuery(), second: useCandiesQuery() }),
      { wrapper },
    )

    await waitFor(() => expect(result.current.first.isSuccess).toBe(true))

    expect(result.current.first.data).toEqual(candies)
    expect(result.current.second.data).toEqual(candies)
    expect(mockedGetCandies).toHaveBeenCalledTimes(1)
  })

  it('invalidates the catalog after a successful creation', async () => {
    mockedCreateCandy.mockResolvedValue(undefined)
    const { queryClient, wrapper } = createQueryWrapper()
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => useCreateCandyMutation(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync({ name: 'Gum', price: 200 })
    })

    expect(invalidate).toHaveBeenCalledWith({ queryKey: candyKeys.all })
  })

  it('does not invalidate the catalog when creation fails', async () => {
    mockedCreateCandy.mockRejectedValue(new Error('request failed'))
    const { queryClient, wrapper } = createQueryWrapper()
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => useCreateCandyMutation(), { wrapper })

    await act(async () => {
      await expect(result.current.mutateAsync({ name: 'Gum', price: 200 })).rejects.toThrow('request failed')
    })

    expect(invalidate).not.toHaveBeenCalled()
  })
})
