import type {
  CurrentSessionResource,
  DeleteSessionOrderVariables,
  SessionDetailsResponse,
  SessionOrderResponse,
  SessionOrderVariables,
  SessionSummaryResponse,
} from '../types/api'
import { api } from './http'

export async function getCurrentSession(signal?: AbortSignal): Promise<CurrentSessionResource | null> {
  const currentResponse = await api.get<SessionSummaryResponse | null>('/sessions/open/current', { signal })
  const summary = currentResponse.data

  if (!summary) {
    return null
  }

  const detailsResponse = await api.get<SessionDetailsResponse>(`/sessions/${summary.id}`, { signal })

  return {
    summary,
    details: detailsResponse.data,
  }
}

export async function getSessionOrders(sessionId: string, signal?: AbortSignal) {
  const response = await api.get<SessionOrderResponse[]>(`/sessions/${sessionId}/orders`, { signal })

  return response.data
}

export async function createSession() {
  await api.post('/sessions', {})
}

export async function createSessionOrder({ sessionId, payload }: SessionOrderVariables) {
  await api.post(`/sessions/${sessionId}/orders`, payload)
}

export async function deleteSessionOrder({ sessionId, orderId }: DeleteSessionOrderVariables) {
  await api.delete(`/sessions/${sessionId}/orders/${orderId}`)
}

export async function closeSession(sessionId: string) {
  const response = await api.patch<SessionSummaryResponse>(`/sessions/${sessionId}/close`)

  return response.data
}
