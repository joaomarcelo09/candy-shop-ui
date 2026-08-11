import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { appDependencies } from '../api/dependencies'
import type { SalesSession } from '../types/session'
import { queryKeys } from './queryKeys'

export function useSalesSessionsQuery() {
  return useQuery({
    queryKey: queryKeys.sessions.history,
    queryFn: appDependencies.sessionApi.getSessions,
    refetchOnMount: 'always',
  })
}

export function useSalesSessionOrdersQuery(sessionId: string | null) {
  return useQuery({
    queryKey: queryKeys.sessions.orders(sessionId ?? ''),
    queryFn: () => appDependencies.sessionApi.getOrders(sessionId!),
    enabled: Boolean(sessionId),
    refetchOnMount: 'always',
  })
}

export function useSoftDeleteSalesSessionMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: appDependencies.sessionApi.softDeleteSession,
    onSuccess: (deletedSession) => {
      queryClient.setQueryData<SalesSession[]>(queryKeys.sessions.history, (sessions = []) =>
        sessions.filter((session) => session.id !== deletedSession.id),
      )
      queryClient.removeQueries({ queryKey: queryKeys.sessions.orders(deletedSession.id) })
    },
  })
}
