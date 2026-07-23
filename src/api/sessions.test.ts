import { beforeEach, describe, expect, it, vi } from 'vitest'
import { api } from './http'
import { getCurrentSession } from './sessions'

vi.mock('./http', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}))

const mockedGet = vi.mocked(api.get)

describe('session API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('stops after the current-session request when there is no open session', async () => {
    mockedGet.mockResolvedValueOnce({ data: null })

    await expect(getCurrentSession()).resolves.toBeNull()

    expect(mockedGet).toHaveBeenCalledTimes(1)
    expect(mockedGet).toHaveBeenCalledWith('/sessions/open/current', { signal: undefined })
  })

  it('loads details with the same abort signal when a session exists', async () => {
    const controller = new AbortController()
    const summary = { id: 'session-1', status: 'OPEN' as const, date: '2026-07-22' }
    const details = { ...summary, total_sold: 0, items: [] }
    mockedGet.mockResolvedValueOnce({ data: summary }).mockResolvedValueOnce({ data: details })

    await expect(getCurrentSession(controller.signal)).resolves.toEqual({ summary, details })

    expect(mockedGet).toHaveBeenNthCalledWith(1, '/sessions/open/current', { signal: controller.signal })
    expect(mockedGet).toHaveBeenNthCalledWith(2, '/sessions/session-1', { signal: controller.signal })
  })
})
