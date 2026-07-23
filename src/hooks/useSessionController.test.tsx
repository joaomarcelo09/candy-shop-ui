import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import toast from 'react-hot-toast'
import { getCandies } from '../api/candies'
import {
  closeSession,
  createSessionOrder,
  deleteSessionOrder,
  getCurrentSession,
  getSessionOrders,
} from '../api/sessions'
import type { CurrentSessionResource } from '../types/api'
import { generateSessionPdf } from '../utils/pdf'
import { createQueryWrapper } from '../test/renderHook'
import { useSessionController } from './useSessionController'

vi.mock('../api/candies', () => ({
  getCandies: vi.fn(),
  createCandy: vi.fn(),
  updateCandy: vi.fn(),
}))

vi.mock('../api/sessions', () => ({
  getCurrentSession: vi.fn(),
  getSessionOrders: vi.fn(),
  createSession: vi.fn(),
  createSessionOrder: vi.fn(),
  deleteSessionOrder: vi.fn(),
  closeSession: vi.fn(),
}))

vi.mock('../utils/pdf', () => ({
  generateSessionPdf: vi.fn(),
}))

vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}))

const candy = {
  id: '11111111-1111-4111-8111-111111111111',
  name: 'Chocolate',
  price: 500,
}
const sessionId = '22222222-2222-4222-8222-222222222222'
const orderId = '33333333-3333-4333-8333-333333333333'
const sessionResource: CurrentSessionResource = {
  summary: {
    id: sessionId,
    status: 'OPEN',
    date: '2026-07-22T12:00:00.000Z',
    total_sold: 500,
  },
  details: {
    id: sessionId,
    status: 'OPEN',
    date: '2026-07-22T12:00:00.000Z',
    total_sold: 500,
    items: [{ candy_id: candy.id, quantity_sold: 1, price: candy.price, subtotal: 500 }],
  },
}
const orders = [
  {
    id: orderId,
    session_id: sessionId,
    created_at: '2026-07-22T12:00:00.000Z',
    items: [{ candy_id: candy.id, quantity: 1, unit_price: candy.price, subtotal: 500 }],
  },
]

const mockedGetCandies = vi.mocked(getCandies)
const mockedGetCurrentSession = vi.mocked(getCurrentSession)
const mockedGetSessionOrders = vi.mocked(getSessionOrders)
const mockedCreateSessionOrder = vi.mocked(createSessionOrder)
const mockedDeleteSessionOrder = vi.mocked(deleteSessionOrder)
const mockedCloseSession = vi.mocked(closeSession)
const mockedGenerateSessionPdf = vi.mocked(generateSessionPdf)

describe('session controller', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedGetCandies.mockResolvedValue([candy])
    mockedGetCurrentSession.mockResolvedValue(sessionResource)
    mockedGetSessionOrders.mockResolvedValue(orders)
    mockedCreateSessionOrder.mockResolvedValue(undefined)
    mockedDeleteSessionOrder.mockResolvedValue(undefined)
    mockedCloseSession.mockResolvedValue({
      ...sessionResource.summary,
      status: 'CLOSED',
    })
  })

  async function renderLoadedController() {
    const testContext = createQueryWrapper()
    const hook = renderHook(() => useSessionController(), { wrapper: testContext.wrapper })

    await waitFor(() => expect(hook.result.current.activeSession?.id).toBe(sessionId))
    await waitFor(() => expect(hook.result.current.orders).toHaveLength(1))

    return { ...testContext, ...hook }
  }

  it('normalizes session data and keeps it visible when history fails', async () => {
    mockedGetSessionOrders.mockRejectedValue(new Error('history failed'))
    const { result } = renderHook(() => useSessionController(), { wrapper: createQueryWrapper().wrapper })

    await waitFor(() => expect(result.current.activeSession?.items[0].candyName).toBe(candy.name))
    await waitFor(() => expect(result.current.isOrdersError).toBe(true))

    expect(result.current.activeSession?.id).toBe(sessionId)
    expect(result.current.orders).toEqual([])
  })

  it('does not load orders or submit an empty draft when there is no session', async () => {
    mockedGetCurrentSession.mockResolvedValue(null)
    const { result } = renderHook(() => useSessionController(), { wrapper: createQueryWrapper().wrapper })

    await waitFor(() => expect(result.current.isInitialLoading).toBe(false))
    await act(async () => {
      await result.current.submitDraftOrder()
    })

    expect(result.current.activeSession).toBeNull()
    expect(mockedGetSessionOrders).not.toHaveBeenCalled()
    expect(mockedCreateSessionOrder).not.toHaveBeenCalled()
  })

  it('clears the draft only after an order succeeds', async () => {
    const { result } = await renderLoadedController()

    act(() => result.current.addCandyToDraft(candy))
    expect(result.current.draftOrder).toHaveLength(1)

    await act(async () => {
      await result.current.submitDraftOrder()
    })

    expect(mockedCreateSessionOrder.mock.calls[0]?.[0]).toEqual({
      sessionId,
      payload: { items: [{ candy_id: candy.id, quantity: 1 }] },
    })
    expect(result.current.draftOrder).toEqual([])
  })

  it('preserves the draft and history when mutations fail', async () => {
    mockedCreateSessionOrder.mockRejectedValueOnce(new Error('order failed'))
    mockedDeleteSessionOrder.mockRejectedValueOnce(new Error('delete failed'))
    const { result } = await renderLoadedController()

    act(() => result.current.addCandyToDraft(candy))

    await act(async () => {
      await expect(result.current.submitDraftOrder()).rejects.toThrow('order failed')
      await expect(result.current.deleteOrder(orderId)).rejects.toThrow('delete failed')
    })

    expect(result.current.draftOrder).toHaveLength(1)
    expect(result.current.orders).toHaveLength(1)
  })

  it('exposes the id of a deletion while it is pending', async () => {
    let resolveDeletion: (() => void) | undefined
    mockedDeleteSessionOrder.mockImplementationOnce(
      () => new Promise<void>((resolve) => {
        resolveDeletion = resolve
      }),
    )
    const { result } = await renderLoadedController()

    let deletionPromise: Promise<void> | undefined
    act(() => {
      deletionPromise = result.current.deleteOrder(orderId)
    })

    await waitFor(() => expect(result.current.deletingOrderIds).toContain(orderId))

    await act(async () => {
      resolveDeletion?.()
      await deletionPromise
    })

    await waitFor(() => expect(result.current.deletingOrderIds).not.toContain(orderId))
  })

  it('closes the session, generates the PDF and clears session data', async () => {
    mockedGetCurrentSession.mockReset().mockResolvedValueOnce(sessionResource).mockResolvedValue(null)
    const { result } = await renderLoadedController()
    act(() => result.current.addCandyToDraft(candy))

    await act(async () => {
      await result.current.closeSession()
    })

    expect(mockedGenerateSessionPdf).toHaveBeenCalledWith(
      expect.objectContaining({ id: sessionId, status: 'CLOSED', totalSold: 500 }),
    )
    expect(result.current.activeSession).toBeNull()
    expect(result.current.draftOrder).toEqual([])
  })

  it('keeps the session closed and reports a PDF generation failure', async () => {
    mockedGetCurrentSession.mockReset().mockResolvedValueOnce(sessionResource).mockResolvedValue(null)
    mockedGenerateSessionPdf.mockImplementationOnce(() => {
      throw new Error('PDF failed')
    })
    const { result } = await renderLoadedController()

    await act(async () => {
      await result.current.closeSession()
    })

    expect(result.current.activeSession).toBeNull()
    expect(toast.error).toHaveBeenCalledWith('Session closed, but the PDF could not be generated')
    expect(mockedCloseSession).toHaveBeenCalled()
  })
})
