import { beforeEach, describe, expect, it, vi } from 'vitest'
import { appDependencies } from '../api/dependencies'
import type { InventoryItem } from '../types/inventory'
import type { SaleOrder, SalesSession } from '../types/session'
import { useSessionStore } from './sessionStore'

const activeSession: SalesSession = {
  id: 'sessao-1',
  period: 'morning',
  status: 'open',
  openedAt: '2026-08-09T14:20:00.000Z',
  scheduledCloseAt: '2026-08-09T15:00:00.000Z',
  closedAt: null,
  closeReason: null,
  orderCount: 0,
  total: 0,
}

const candy: InventoryItem = {
  id: 'pacoca',
  name: 'Paçoca',
  quantity: 10,
  unitSalePrice: 200,
  updatedAt: '2026-08-09T14:00:00.000Z',
}

const order: SaleOrder = {
  id: 'pedido-1',
  sessionId: activeSession.id,
  lines: [{ candyId: candy.id, candyName: candy.name, quantity: 2, unitPrice: 200, subtotal: 400 }],
  total: 400,
  pixReceiptUrl: null,
  createdAt: '2026-08-09T14:30:00.000Z',
}

describe('sessionStore', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    useSessionStore.getState().reset()
  })

  it('mantém o rascunho quando o registro da venda falha', async () => {
    useSessionStore.setState({ activeSession, draftOrder: { [candy.id]: 2 } })
    vi.spyOn(appDependencies.sessionApi, 'createOrder').mockRejectedValue(new Error('Falha na API'))

    await expect(useSessionStore.getState().registerOrder([candy])).rejects.toThrow('Falha na API')

    expect(useSessionStore.getState().draftOrder).toEqual({ [candy.id]: 2 })
    expect(useSessionStore.getState().orders).toEqual([])
  })

  it('mantém o histórico quando a exclusão falha', async () => {
    useSessionStore.setState({ activeSession, orders: [order] })
    vi.spyOn(appDependencies.sessionApi, 'deleteOrder').mockRejectedValue(new Error('Falha na API'))

    await expect(useSessionStore.getState().deleteOrder(order.id)).rejects.toThrow('Falha na API')

    expect(useSessionStore.getState().orders).toEqual([order])
  })
})
