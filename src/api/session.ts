import type { AxiosInstance } from 'axios'
import type { SaleOrder, SalesSession } from '../types/session'
import type { SessionApi } from './contracts'

export function createSessionApi(client: AxiosInstance): SessionApi {
  return {
    async getActiveSession() {
      const response = await client.get<{ session: SalesSession | null }>('/sessions/active')
      return response.data.session
    },
    async getSessions() {
      const response = await client.get<{ sessions: SalesSession[] }>('/sessions')
      return response.data.sessions
    },
    async createSession() {
      const response = await client.post<{ session: SalesSession }>('/sessions')
      return response.data.session
    },
    async getOrders(sessionId) {
      const response = await client.get<{ orders: SaleOrder[] }>(
        `/sessions/${encodeURIComponent(sessionId)}/orders`,
      )
      return response.data.orders
    },
    async createOrder(sessionId, input) {
      const response = await client.post(
        `/sessions/${encodeURIComponent(sessionId)}/orders`,
        input,
      )
      return response.data
    },
    async deleteOrder(sessionId, orderId) {
      const response = await client.delete(
        `/sessions/${encodeURIComponent(sessionId)}/orders/${encodeURIComponent(orderId)}`,
      )
      return response.data
    },
    async closeSession(sessionId) {
      const response = await client.post<{ session: SalesSession }>(
        `/sessions/${encodeURIComponent(sessionId)}/close`,
      )
      return response.data.session
    },
    async softDeleteSession(sessionId) {
      const response = await client.delete<{ session: SalesSession }>(
        `/sessions/${encodeURIComponent(sessionId)}`,
      )
      return response.data.session
    },
  }
}
