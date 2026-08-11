import type { AxiosRequestConfig } from 'axios'
import AxiosMockAdapter from 'axios-mock-adapter'
import { api } from '../api/http'
import type { LoginRequest } from '../types/auth'
import type { StockEntryInput } from '../types/inventory'
import type { CreateOrderInput, SaleOrder, SalesSession } from '../types/session'
import { getSessionAvailability } from '../utils/sessionSchedule'
import { initialInventoryItems, initialStockEntries } from './data'

const MOCK_EMAIL = 'vendedora@doces.com'
const MOCK_PASSWORD = 'doces123'
const MOCK_TOKEN = 'mock-candy-shop-access-token'

let adapter: AxiosMockAdapter | null = null
let items = structuredClone(initialInventoryItems)
let entries = structuredClone(initialStockEntries)
let sessions: SalesSession[] = []
let orders: SaleOrder[] = []

const MOCK_SALES_STORAGE_KEY = 'candy-shop-mock-sales-v1'

function loadSalesState() {
  try {
    const rawState = window.localStorage.getItem(MOCK_SALES_STORAGE_KEY)
    if (!rawState) return
    const state = JSON.parse(rawState) as {
      items: typeof items
      sessions: SalesSession[]
      orders: SaleOrder[]
    }
    items = state.items
    sessions = state.sessions
    orders = state.orders
  } catch {
    window.localStorage.removeItem(MOCK_SALES_STORAGE_KEY)
  }
}

function saveSalesState() {
  try {
    window.localStorage.setItem(
      MOCK_SALES_STORAGE_KEY,
      JSON.stringify({ items, sessions, orders }),
    )
  } catch {
    // A sessão continua funcional mesmo se o navegador bloquear o armazenamento local do mock.
  }
}

function reconcileAutomaticClose() {
  const now = new Date()
  let changed = false
  sessions = sessions.map((session) => {
    if (session.status === 'open' && now >= new Date(session.scheduledCloseAt)) {
      changed = true
      return {
        ...session,
        status: 'closed' as const,
        closedAt: session.scheduledCloseAt,
        closeReason: 'automatic' as const,
      }
    }
    return session
  })
  if (changed) saveSalesState()
}

function updateSession(updatedSession: SalesSession) {
  sessions = sessions.map((session) =>
    session.id === updatedSession.id ? updatedSession : session,
  )
  saveSalesState()
}

loadSalesState()

function readBody<T>(config: AxiosRequestConfig): T {
  return (typeof config.data === 'string' ? JSON.parse(config.data) : config.data) as T
}

function isAuthorized(config: AxiosRequestConfig) {
  const headers = config.headers as Record<string, unknown> | undefined
  const authorization = headers?.Authorization ?? headers?.authorization
  return typeof authorization === 'string' && authorization.startsWith('Bearer ')
}

function normalizeCandyName(name: string) {
  return name.trim().replace(/\s+/g, ' ').toLocaleLowerCase('pt-BR')
}

function createItemId(name: string) {
  const slug = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  return `${slug || 'doce'}-${Date.now()}`
}

function unauthorized(): [number, { message: string }] {
  return [401, { message: 'Sessão inválida ou expirada' }]
}

export function startApiMock() {
  if (adapter) return adapter

  adapter = new AxiosMockAdapter(api, {
    delayResponse: 250,
    onNoMatch: 'throwException',
  })

  adapter.onPost('/auth/login').reply((config) => {
    const credentials = readBody<LoginRequest>(config)

    if (credentials.email !== MOCK_EMAIL || credentials.password !== MOCK_PASSWORD) {
      return [401, { message: 'E-mail ou senha incorretos' }]
    }

    return [
      200,
      {
        accessToken: MOCK_TOKEN,
        user: {
          id: 'mock-user-1',
          name: 'Maria da Loja',
          email: MOCK_EMAIL,
        },
      },
    ]
  })

  adapter.onGet('/inventory/items').reply((config) => {
    if (!isAuthorized(config)) return unauthorized()
    return [200, { items: structuredClone(items) }]
  })

  adapter.onGet('/inventory/entries').reply((config) => {
    if (!isAuthorized(config)) return unauthorized()
    return [200, { entries: structuredClone(entries) }]
  })

  adapter.onPost('/inventory/entries').reply((config) => {
    if (!isAuthorized(config)) return unauthorized()

    const input = readBody<StockEntryInput>(config)
    if (
      !input.candyName?.trim() ||
      input.quantity < 1 ||
      input.unitSalePrice < 1 ||
      (input.saleIncrement !== 1 && input.saleIncrement !== 5)
    ) {
      return [422, { message: 'Dados do lote inválidos' }]
    }

    const now = new Date().toISOString()
    const existingItem = items.find(
      (item) => normalizeCandyName(item.name) === normalizeCandyName(input.candyName),
    )
    const item = existingItem
      ? {
          ...existingItem,
          quantity: existingItem.quantity + input.quantity,
          unitSalePrice: input.unitSalePrice,
          saleIncrement: input.saleIncrement,
          updatedAt: now,
        }
      : {
          id: createItemId(input.candyName),
          name: input.candyName.trim().replace(/\s+/g, ' '),
          quantity: input.quantity,
          unitSalePrice: input.unitSalePrice,
          saleIncrement: input.saleIncrement,
          updatedAt: now,
        }

    items = existingItem
      ? items.map((current) => (current.id === existingItem.id ? item : current))
      : [item, ...items]

    const entry = {
      id: `entrada-${Date.now()}`,
      itemId: item.id,
      candyName: item.name,
      quantity: input.quantity,
      unitSalePrice: input.unitSalePrice,
      purchasedAt: now,
    }
    entries = [entry, ...entries]

    return [201, { item, entry }]
  })

  adapter.onPatch(/^\/inventory\/items\/[^/]+\/quantity$/).reply((config) => {
    if (!isAuthorized(config)) return unauthorized()

    const itemId = decodeURIComponent(
      config.url?.match(/^\/inventory\/items\/([^/]+)\/quantity$/)?.[1] ?? '',
    )
    const { quantity } = readBody<{ quantity: number }>(config)
    const existingItem = items.find((item) => item.id === itemId)

    if (!existingItem) return [404, { message: 'Doce não encontrado' }]
    if (!Number.isInteger(quantity) || quantity < 0) {
      return [422, { message: 'Quantidade inválida' }]
    }

    const item = {
      ...existingItem,
      quantity,
      updatedAt: new Date().toISOString(),
    }
    items = items.map((current) => (current.id === itemId ? item : current))

    return [200, { item }]
  })

  adapter.onGet('/sessions/active').reply((config) => {
    if (!isAuthorized(config)) return unauthorized()
    reconcileAutomaticClose()
    const session = sessions.find((current) => current.status === 'open' && !current.deletedAt) ?? null
    return [200, { session: structuredClone(session) }]
  })

  adapter.onGet('/sessions').reply((config) => {
    if (!isAuthorized(config)) return unauthorized()
    reconcileAutomaticClose()
    const history = sessions.filter((session) => !session.deletedAt).sort(
      (left, right) => new Date(right.openedAt).getTime() - new Date(left.openedAt).getTime(),
    )
    return [200, { sessions: structuredClone(history) }]
  })

  adapter.onPost('/sessions').reply((config) => {
    if (!isAuthorized(config)) return unauthorized()
    reconcileAutomaticClose()

    const existingSession = sessions.find((session) => session.status === 'open')
    if (existingSession) return [409, { message: 'Já existe uma sessão aberta' }]

    const now = new Date()
    const availability = getSessionAvailability(
      now,
      import.meta.env.VITE_MOCK_ALLOW_SESSION_ANYTIME === 'true',
    )
    if (!availability.available || !availability.period || !availability.scheduledCloseAt) {
      return [422, { message: 'As sessões só podem começar domingo, das 11h às 11h30 ou das 18h às 18h30' }]
    }

    const session: SalesSession = {
      id: `sessao-${Date.now()}`,
      period: availability.period,
      status: 'open',
      openedAt: now.toISOString(),
      scheduledCloseAt: availability.scheduledCloseAt.toISOString(),
      closedAt: null,
      closeReason: null,
      orderCount: 0,
      total: 0,
      deletedAt: null,
      deletedBy: null,
    }
    sessions = [session, ...sessions]
    saveSalesState()
    return [201, { session }]
  })

  adapter.onGet(/^\/sessions\/[^/]+\/orders$/).reply((config) => {
    if (!isAuthorized(config)) return unauthorized()
    reconcileAutomaticClose()
    const sessionId = decodeURIComponent(
      config.url?.match(/^\/sessions\/([^/]+)\/orders$/)?.[1] ?? '',
    )
    if (!sessions.some((session) => session.id === sessionId && !session.deletedAt)) {
      return [404, { message: 'Sessão não encontrada' }]
    }
    return [200, { orders: structuredClone(orders.filter((order) => order.sessionId === sessionId)) }]
  })

  adapter.onPost(/^\/sessions\/[^/]+\/orders$/).reply((config) => {
    if (!isAuthorized(config)) return unauthorized()
    reconcileAutomaticClose()
    const sessionId = decodeURIComponent(
      config.url?.match(/^\/sessions\/([^/]+)\/orders$/)?.[1] ?? '',
    )
    const session = sessions.find((current) => current.id === sessionId)
    if (!session) return [404, { message: 'Sessão não encontrada' }]
    if (session.status !== 'open') return [409, { message: 'Esta sessão já foi fechada' }]

    const input = readBody<CreateOrderInput>(config)
    if (!Array.isArray(input.lines) || input.lines.length === 0) {
      return [422, { message: 'Adicione ao menos um doce' }]
    }

    const saleLines = []
    for (const inputLine of input.lines) {
      const item = items.find((current) => current.id === inputLine.candyId)
      if (!item) return [404, { message: 'Um dos doces não foi encontrado' }]
      if (!Number.isInteger(inputLine.quantity) || inputLine.quantity < 1) {
        return [422, { message: 'Quantidade inválida' }]
      }
      if (inputLine.quantity > item.quantity) {
        return [409, { message: `Estoque insuficiente para ${item.name}` }]
      }
      saleLines.push({
        candyId: item.id,
        candyName: item.name,
        quantity: inputLine.quantity,
        unitPrice: item.unitSalePrice,
        subtotal: item.unitSalePrice * inputLine.quantity,
      })
    }

    const orderTotal = saleLines.reduce((total, line) => total + line.subtotal, 0)
    const order: SaleOrder = {
      id: `pedido-${Date.now()}`,
      sessionId,
      lines: saleLines,
      total: orderTotal,
      pixReceiptUrl: input.pixReceiptUrl ?? null,
      createdAt: new Date().toISOString(),
    }
    const soldByCandy = new Map(saleLines.map((line) => [line.candyId, line.quantity]))
    items = items.map((item) => ({
      ...item,
      quantity: item.quantity - (soldByCandy.get(item.id) ?? 0),
      updatedAt: soldByCandy.has(item.id) ? order.createdAt : item.updatedAt,
    }))
    orders = [order, ...orders]
    const updatedSession = {
      ...session,
      orderCount: session.orderCount + 1,
      total: session.total + orderTotal,
    }
    updateSession(updatedSession)
    return [201, { session: updatedSession, order }]
  })

  adapter.onDelete(/^\/sessions\/[^/]+\/orders\/[^/]+$/).reply((config) => {
    if (!isAuthorized(config)) return unauthorized()
    reconcileAutomaticClose()
    const match = config.url?.match(/^\/sessions\/([^/]+)\/orders\/([^/]+)$/)
    const sessionId = decodeURIComponent(match?.[1] ?? '')
    const orderId = decodeURIComponent(match?.[2] ?? '')
    const session = sessions.find((current) => current.id === sessionId)
    const order = orders.find((current) => current.id === orderId && current.sessionId === sessionId)
    if (!session || !order) return [404, { message: 'Pedido não encontrado' }]
    if (session.status !== 'open') return [409, { message: 'Esta sessão já foi fechada' }]

    const restoredByCandy = new Map(order.lines.map((line) => [line.candyId, line.quantity]))
    items = items.map((item) => ({
      ...item,
      quantity: item.quantity + (restoredByCandy.get(item.id) ?? 0),
      updatedAt: restoredByCandy.has(item.id) ? new Date().toISOString() : item.updatedAt,
    }))
    orders = orders.filter((current) => current.id !== orderId)
    const updatedSession = {
      ...session,
      orderCount: Math.max(0, session.orderCount - 1),
      total: Math.max(0, session.total - order.total),
    }
    updateSession(updatedSession)
    return [200, { session: updatedSession }]
  })

  adapter.onDelete(/^\/sessions\/[^/]+$/).reply((config) => {
    if (!isAuthorized(config)) return unauthorized()
    reconcileAutomaticClose()
    const sessionId = decodeURIComponent(
      config.url?.match(/^\/sessions\/([^/]+)$/)?.[1] ?? '',
    )
    const session = sessions.find((current) => current.id === sessionId)
    if (!session) return [404, { message: 'Sessão não encontrada' }]
    if (session.status === 'open') {
      return [409, { message: 'Conclua a sessão antes de excluí-la' }]
    }
    if (session.deletedAt) return [200, { session }]

    const deletedSession: SalesSession = {
      ...session,
      deletedAt: new Date().toISOString(),
      deletedBy: 'mock-user-1',
    }
    updateSession(deletedSession)
    return [200, { session: deletedSession }]
  })

  adapter.onPost(/^\/sessions\/[^/]+\/close$/).reply((config) => {
    if (!isAuthorized(config)) return unauthorized()
    reconcileAutomaticClose()
    const sessionId = decodeURIComponent(
      config.url?.match(/^\/sessions\/([^/]+)\/close$/)?.[1] ?? '',
    )
    const session = sessions.find((current) => current.id === sessionId)
    if (!session) return [404, { message: 'Sessão não encontrada' }]
    if (session.status === 'closed') return [200, { session }]

    const closedSession: SalesSession = {
      ...session,
      status: 'closed',
      closedAt: new Date().toISOString(),
      closeReason: 'manual',
    }
    updateSession(closedSession)
    return [200, { session: closedSession }]
  })

  return adapter
}
