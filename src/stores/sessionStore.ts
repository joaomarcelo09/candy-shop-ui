import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { appDependencies } from '../api/dependencies'
import { createOrderSchema } from '../schemas/session'
import type { InventoryItem } from '../types/inventory'
import type { SaleOrder, SalesSession } from '../types/session'

interface SessionStore {
  activeSession: SalesSession | null
  orders: SaleOrder[]
  draftOrder: Record<string, number>
  pixReceipt: File | null
  focusModeDismissed: boolean
  loading: boolean
  saving: boolean
  fetchActiveSession: () => Promise<SalesSession | null>
  createSession: () => Promise<SalesSession>
  fetchOrders: (sessionId: string) => Promise<SaleOrder[]>
  setDraftQuantity: (itemId: string, quantity: number, available: number) => void
  setPixReceipt: (file: File | null) => void
  leaveSessionFocus: () => void
  resumeSessionFocus: () => void
  clearDraft: () => void
  registerOrder: (items: InventoryItem[]) => Promise<SaleOrder>
  deleteOrder: (orderId: string) => Promise<void>
  closeSession: () => Promise<SalesSession>
  reset: () => void
}

const initialState = {
  activeSession: null,
  orders: [],
  draftOrder: {},
  pixReceipt: null,
  focusModeDismissed: false,
  loading: false,
  saving: false,
}

export const useSessionStore = create<SessionStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      async fetchActiveSession() {
        set({ loading: true })
        try {
          const session = await appDependencies.sessionApi.getActiveSession()
          set({
            activeSession: session,
            orders: session ? get().orders : [],
            draftOrder: session ? get().draftOrder : {},
            pixReceipt: session ? get().pixReceipt : null,
          })

          if (session) await get().fetchOrders(session.id)
          return session
        } finally {
          set({ loading: false })
        }
      },
      async createSession() {
        set({ saving: true })
        try {
          const session = await appDependencies.sessionApi.createSession()
          set({
            activeSession: session,
            orders: [],
            draftOrder: {},
            pixReceipt: null,
            focusModeDismissed: false,
          })
          return session
        } finally {
          set({ saving: false })
        }
      },
      async fetchOrders(sessionId) {
        const orders = await appDependencies.sessionApi.getOrders(sessionId)
        if (get().activeSession?.id === sessionId) set({ orders })
        return orders
      },
      setDraftQuantity(itemId, quantity, available) {
        const nextQuantity = Math.max(0, Math.min(Math.trunc(quantity), available))
        set((state) => {
          const draftOrder = { ...state.draftOrder }
          if (nextQuantity === 0) delete draftOrder[itemId]
          else draftOrder[itemId] = nextQuantity
          return { draftOrder }
        })
      },
      setPixReceipt: (pixReceipt) => set({ pixReceipt }),
      leaveSessionFocus: () => set({ focusModeDismissed: true }),
      resumeSessionFocus: () => set({ focusModeDismissed: false }),
      clearDraft: () => set({ draftOrder: {}, pixReceipt: null }),
      async registerOrder(items) {
        const { activeSession, draftOrder, pixReceipt } = get()
        if (!activeSession || activeSession.status !== 'open') {
          throw new Error('Não há uma sessão aberta')
        }

        const itemIds = new Set(items.map((item) => item.id))
        const input = createOrderSchema.parse({
          lines: Object.entries(draftOrder)
            .filter(([candyId, quantity]) => itemIds.has(candyId) && quantity > 0)
            .map(([candyId, quantity]) => ({ candyId, quantity })),
        })

        set({ saving: true })
        try {
          const pixReceiptUrl = pixReceipt
            ? await appDependencies.receiptStorage.uploadPixReceipt(activeSession.id, pixReceipt)
            : undefined
          const result = await appDependencies.sessionApi.createOrder(activeSession.id, {
            ...input,
            pixReceiptUrl,
          })

          set((state) => ({
            activeSession: result.session,
            orders: [result.order, ...state.orders],
            draftOrder: {},
            pixReceipt: null,
          }))
          return result.order
        } finally {
          set({ saving: false })
        }
      },
      async deleteOrder(orderId) {
        const { activeSession } = get()
        if (!activeSession || activeSession.status !== 'open') {
          throw new Error('Não é possível alterar uma sessão fechada')
        }

        set({ saving: true })
        try {
          const result = await appDependencies.sessionApi.deleteOrder(activeSession.id, orderId)
          set((state) => ({
            activeSession: result.session,
            orders: state.orders.filter((order) => order.id !== orderId),
          }))
        } finally {
          set({ saving: false })
        }
      },
      async closeSession() {
        const { activeSession } = get()
        if (!activeSession) throw new Error('Não há uma sessão aberta')

        set({ saving: true })
        try {
          const session = await appDependencies.sessionApi.closeSession(activeSession.id)
          set({
            activeSession: session,
            draftOrder: {},
            pixReceipt: null,
            focusModeDismissed: false,
          })
          return session
        } finally {
          set({ saving: false })
        }
      },
      reset: () => set(initialState),
    }),
    {
      name: 'candy-shop-session-v1',
      version: 1,
      partialize: ({ activeSession, draftOrder }) => ({ activeSession, draftOrder }),
    },
  ),
)
