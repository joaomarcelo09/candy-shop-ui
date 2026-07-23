import { useCallback } from 'react'
import { useMutation, useMutationState, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  closeSession,
  createSession,
  createSessionOrder,
  deleteSessionOrder,
  getCurrentSession,
  getSessionOrders,
} from '../api/sessions'
import { mutationKeys, sessionKeys } from '../queries/queryKeys'
import type { CurrentSessionResource, DeleteSessionOrderVariables } from '../types/api'
import type { Candy } from '../types/domain'
import { normalizeSession, normalizeSessionOrders } from '../utils/session'

export function useCurrentSessionQuery(candies: Candy[]) {
  const selectSession = useCallback(
    (resource: CurrentSessionResource | null) =>
      resource ? normalizeSession(resource.summary, resource.details, candies) : null,
    [candies],
  )

  return useQuery({
    queryKey: sessionKeys.current,
    queryFn: ({ signal }) => getCurrentSession(signal),
    select: selectSession,
  })
}

export function useSessionOrdersQuery(sessionId: string | undefined, candies: Candy[]) {
  const selectOrders = useCallback(
    (orders: Awaited<ReturnType<typeof getSessionOrders>>) =>
      sessionId ? normalizeSessionOrders(orders, sessionId, candies) : [],
    [candies, sessionId],
  )

  return useQuery({
    queryKey: sessionKeys.orders(sessionId ?? 'inactive'),
    queryFn: ({ signal }) => (sessionId ? getSessionOrders(sessionId, signal) : Promise.resolve([])),
    enabled: Boolean(sessionId),
    select: selectOrders,
  })
}

export function useCreateSessionMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: mutationKeys.createSession,
    mutationFn: createSession,
    onSuccess: async () => {
      toast.success('Session started')
      await queryClient.invalidateQueries({ queryKey: sessionKeys.current })
    },
  })
}

export function useCreateSessionOrderMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: mutationKeys.createSessionOrder,
    mutationFn: createSessionOrder,
    onSuccess: async (_, { sessionId }) => {
      toast.success('Order registered')
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: sessionKeys.current }),
        queryClient.invalidateQueries({ queryKey: sessionKeys.orders(sessionId) }),
      ])
    },
  })
}

export function useDeleteSessionOrderMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: mutationKeys.deleteSessionOrder,
    mutationFn: deleteSessionOrder,
    onSuccess: async (_, { sessionId }) => {
      toast.success('Order deleted')
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: sessionKeys.current }),
        queryClient.invalidateQueries({ queryKey: sessionKeys.orders(sessionId) }),
      ])
    },
  })
}

export function useDeletingOrderIds() {
  const variables = useMutationState({
    filters: {
      mutationKey: mutationKeys.deleteSessionOrder,
      status: 'pending',
    },
    select: (mutation) => mutation.state.variables as DeleteSessionOrderVariables | undefined,
  })

  return variables.flatMap((entry) => (entry ? [entry.orderId] : []))
}

export function useCloseSessionMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: mutationKeys.closeSession,
    mutationFn: closeSession,
    onSuccess: async (_, sessionId) => {
      queryClient.setQueryData(sessionKeys.current, null)
      queryClient.removeQueries({ queryKey: sessionKeys.orders(sessionId) })
      await queryClient.invalidateQueries({ queryKey: sessionKeys.current })
    },
  })
}
