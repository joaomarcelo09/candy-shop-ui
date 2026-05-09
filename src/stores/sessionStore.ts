import toast from 'react-hot-toast'
import { create } from 'zustand'
import { api } from '../api/http'
import { closeSessionSchema, sessionSaleSchema } from '../schemas/session'
import type {
  SessionDetailsResponse,
  SessionStoreState,
  SessionSummaryResponse,
} from '../types/api'
import { buildTotals, mergeOptimisticSale, normalizeSession } from '../utils/session'

export const useSessionStore = create<SessionStoreState>((set, get) => ({
  activeSession: null,
  loading: false,
  submittingSaleIds: [],
  totals: {
    candiesSold: 0,
    estimatedTotal: 0,
  },
  async fetchCurrentSession(candies) {
    set({ loading: true })

    try {
      const currentResponse = await api.get<SessionSummaryResponse | null>('/sessions/open/current')
      const currentSession = currentResponse.data

      if (!currentSession) {
        set({
          activeSession: null,
          totals: buildTotals(null),
        })

        return null
      }

      const detailsResponse = await api.get<SessionDetailsResponse>(`/sessions/${currentSession.id}`)
      const normalized = normalizeSession(currentSession, detailsResponse.data, candies)

      set({
        activeSession: normalized,
        totals: buildTotals(normalized),
      })

      return normalized
    } finally {
      set({ loading: false })
    }
  },
  async createSession(candies) {
    set({ loading: true })

    try {
      await api.post('/sessions', {})
      toast.success('Session started')
      await get().fetchCurrentSession(candies)
    } finally {
      set({ loading: false })
    }
  },
  async registerSale(candies, candyId, quantity = 1) {
    const parsed = sessionSaleSchema.parse({
      candy_id: candyId,
      quantity,
    })
    const session = get().activeSession
    const candy = candies.find((item) => item.id === candyId)

    if (!session || !candy) {
      return
    }

    const optimisticSession = mergeOptimisticSale(session, candy, parsed.quantity)

    set((state) => ({
      activeSession: optimisticSession,
      totals: buildTotals(optimisticSession),
      submittingSaleIds: [...state.submittingSaleIds, candyId],
    }))

    try {
      await api.post(`/sessions/${session.id}/sales`, parsed)
    } catch (error) {
      set({
        activeSession: session,
        totals: buildTotals(session),
      })
      throw error
    } finally {
      set((state) => ({
        submittingSaleIds: state.submittingSaleIds.filter((id) => id !== candyId),
      }))
    }
  },
  async closeSession() {
    const session = get().activeSession

    if (!session) {
      return
    }

    closeSessionSchema.parse({ sessionId: session.id })
    set({ loading: true })

    try {
      const response = await api.patch<SessionSummaryResponse>(`/sessions/${session.id}/close`)
      const closedSession = {
        ...session,
        status: response.data.status,
        totalSold: response.data.totalSold ?? session.totalSold,
      }
      const { generateSessionPdf } = await import('../utils/pdf')

      generateSessionPdf(closedSession)
      toast.success('Session closed and PDF generated')
      set({
        activeSession: null,
        totals: buildTotals(null),
      })
    } finally {
      set({ loading: false })
    }
  },
}))
