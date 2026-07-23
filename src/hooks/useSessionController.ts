import { useMemo } from 'react'
import toast from 'react-hot-toast'
import { closeSessionSchema, sessionOrderSchema } from '../schemas/session'
import { buildTotals } from '../utils/session'
import { useCandiesQuery } from './useCandies'
import { useDraftOrder } from './useDraftOrder'
import {
  useCloseSessionMutation,
  useCreateSessionMutation,
  useCreateSessionOrderMutation,
  useCurrentSessionQuery,
  useDeleteSessionOrderMutation,
  useDeletingOrderIds,
  useSessionOrdersQuery,
} from './useSession'

export function useSessionController() {
  const candiesQuery = useCandiesQuery()
  const candies = candiesQuery.data ?? []
  const currentSessionQuery = useCurrentSessionQuery(candies)
  const activeSession = currentSessionQuery.data ?? null
  const ordersQuery = useSessionOrdersQuery(activeSession?.id, candies)
  const draft = useDraftOrder()
  const createSessionMutation = useCreateSessionMutation()
  const createOrderMutation = useCreateSessionOrderMutation()
  const deleteOrderMutation = useDeleteSessionOrderMutation()
  const closeSessionMutation = useCloseSessionMutation()
  const deletingOrderIds = useDeletingOrderIds()
  const totals = useMemo(() => buildTotals(activeSession), [activeSession])

  async function submitDraftOrder() {
    if (!activeSession || draft.items.length === 0) {
      return
    }

    const payload = sessionOrderSchema.parse({
      items: draft.items.map((item) => ({
        candy_id: item.candyId,
        quantity: item.quantity,
      })),
    })

    await createOrderMutation.mutateAsync({ sessionId: activeSession.id, payload })
    draft.clear()
  }

  async function deleteOrder(orderId: string) {
    if (!activeSession) {
      return
    }

    await deleteOrderMutation.mutateAsync({ sessionId: activeSession.id, orderId })
  }

  async function finishSession() {
    if (!activeSession) {
      return
    }

    const session = activeSession
    closeSessionSchema.parse({ sessionId: session.id })
    const response = await closeSessionMutation.mutateAsync(session.id)
    const closedSession = {
      ...session,
      status: response.status,
      totalSold: response.totalSold ?? response.total_sold ?? session.totalSold,
    }

    draft.clear()

    try {
      const { generateSessionPdf } = await import('../utils/pdf')

      generateSessionPdf(closedSession)
      toast.success('Session closed and PDF generated')
    } catch {
      toast.error('Session closed, but the PDF could not be generated')
    }
  }

  return {
    candies,
    activeSession,
    orders: ordersQuery.data ?? [],
    draftOrder: draft.items,
    draftTotal: draft.total,
    totals,
    deletingOrderIds,
    isInitialLoading: candiesQuery.isPending || currentSessionQuery.isPending,
    isCatalogError: candiesQuery.isError && candiesQuery.data === undefined,
    isSessionError:
      currentSessionQuery.isError &&
      (currentSessionQuery.data === null || currentSessionQuery.data === undefined),
    isCatalogFetching: candiesQuery.isFetching,
    isSessionFetching: currentSessionQuery.isFetching,
    isOrdersError: ordersQuery.isError,
    isOrdersFetching: ordersQuery.isFetching,
    isStartingSession: createSessionMutation.isPending,
    isSubmittingOrder: createOrderMutation.isPending,
    isClosingSession: closeSessionMutation.isPending,
    retryCandies: candiesQuery.refetch,
    retrySession: currentSessionQuery.refetch,
    retryOrders: ordersQuery.refetch,
    startSession: createSessionMutation.mutateAsync,
    addCandyToDraft: draft.addCandy,
    updateDraftQuantity: draft.updateQuantity,
    removeDraftItem: draft.removeItem,
    clearDraftOrder: draft.clear,
    submitDraftOrder,
    deleteOrder,
    closeSession: finishSession,
  }
}
