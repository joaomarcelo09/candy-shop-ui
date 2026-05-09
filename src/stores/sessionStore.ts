import toast from 'react-hot-toast'
import { create } from 'zustand'
import { api } from '../api/http'
import { closeSessionSchema, sessionOrderSchema } from '../schemas/session'
import type {
  SessionDetailsResponse,
  SessionOrderResponse,
  SessionStoreState,
  SessionSummaryResponse,
} from '../types/api'
import {
  buildDraftOrderItem,
  buildTotals,
  normalizeSession,
  normalizeSessionOrders,
  updateDraftItemQuantity,
} from '../utils/session'

export const useSessionStore = create<SessionStoreState>((set, get) => ({
  activeSession: null,
  orders: [],
  draftOrder: [],
  loading: false,
  submittingOrder: false,
  deletingOrderIds: [],
  totals: {
    candiesSold: 0,
    estimatedTotal: 0,
  },
  async fetchSessionOrders(sessionId, candies) {
    const response = await api.get<SessionOrderResponse[]>(`/sessions/${sessionId}/orders`)
    const normalizedOrders = normalizeSessionOrders(response.data, sessionId, candies)

    set({ orders: normalizedOrders })

    return normalizedOrders
  },
  async fetchCurrentSession(candies) {
    set({ loading: true })

    try {
      const currentResponse = await api.get<SessionSummaryResponse | null>('/sessions/open/current')
      const currentSession = currentResponse.data

      if (!currentSession) {
        set({
          activeSession: null,
          orders: [],
          draftOrder: [],
          totals: buildTotals(null),
        })

        return null
      }

      const detailsResponse = await api.get<SessionDetailsResponse>(`/sessions/${currentSession.id}`)
      const normalized = normalizeSession(currentSession, detailsResponse.data, candies)
      let normalizedOrders: SessionOrderResponse[] = []

      try {
        const ordersResponse = await api.get<SessionOrderResponse[]>(`/sessions/${currentSession.id}/orders`)
        normalizedOrders = ordersResponse.data
      } catch {
        normalizedOrders = []
      }

      set({
        activeSession: normalized,
        orders: normalizeSessionOrders(normalizedOrders, currentSession.id, candies),
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
  addCandyToDraft(candy) {
    set((state) => {
      const existingItem = state.draftOrder.find((item) => item.candyId === candy.id)

      if (existingItem) {
        return {
          draftOrder: state.draftOrder.map((item) =>
            item.candyId === candy.id ? updateDraftItemQuantity(item, item.quantity + 1) : item,
          ),
        }
      }

      return {
        draftOrder: [...state.draftOrder, buildDraftOrderItem(candy)],
      }
    })
  },
  updateDraftQuantity(candyId, quantity) {
    set((state) => ({
      draftOrder: state.draftOrder.map((item) =>
        item.candyId === candyId ? updateDraftItemQuantity(item, quantity) : item,
      ),
    }))
  },
  removeDraftItem(candyId) {
    set((state) => ({
      draftOrder: state.draftOrder.filter((item) => item.candyId !== candyId),
    }))
  },
  clearDraftOrder() {
    set({ draftOrder: [] })
  },
  async submitDraftOrder(candies) {
    const session = get().activeSession
    const draftOrder = get().draftOrder

    if (!session || draftOrder.length === 0) {
      return
    }

    const payload = sessionOrderSchema.parse({
      items: draftOrder.map((item) => ({
        candy_id: item.candyId,
        quantity: item.quantity,
      })),
    })

    set({ submittingOrder: true })

    try {
      await api.post(`/sessions/${session.id}/orders`, payload)
      toast.success('Order registered')
      set({ draftOrder: [] })
      await get().fetchCurrentSession(candies)
    } finally {
      set({ submittingOrder: false })
    }
  },
  async deleteOrder(orderId, candies) {
    const session = get().activeSession

    if (!session) {
      return
    }

    set((state) => ({
      deletingOrderIds: [...state.deletingOrderIds, orderId],
    }))

    try {
      await api.delete(`/sessions/${session.id}/orders/${orderId}`)
      toast.success('Order deleted')
      await get().fetchCurrentSession(candies)
    } finally {
      set((state) => ({
        deletingOrderIds: state.deletingOrderIds.filter((id) => id !== orderId),
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
        totalSold: response.data.totalSold ?? response.data.total_sold ?? session.totalSold,
      }
      const { generateSessionPdf } = await import('../utils/pdf')

      generateSessionPdf(closedSession)
      toast.success('Session closed and PDF generated')
      set({
        activeSession: null,
        orders: [],
        draftOrder: [],
        totals: buildTotals(null),
      })
    } finally {
      set({ loading: false })
    }
  },
}))
