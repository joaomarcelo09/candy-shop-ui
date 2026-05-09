import type {
  SessionDetailsResponse,
  SessionOrderItemResponse,
  SessionOrderResponse,
  SessionSummaryResponse,
} from '../types/api'
import type { Candy, DashboardTotals, DraftOrderItem, Session, SessionItem, SessionOrder } from '../types/domain'

function findCandyByReference(candies: Candy[], reference?: string | null) {
  if (!reference) {
    return undefined
  }

  return candies.find((entry) => entry.id === reference || entry.name === reference)
}

function toSessionItem(
  item: {
    candy_id?: string
    candyId?: string
    candy_name?: string
    candyName?: string
    candy?: string
    price?: number
    unit_price?: number
    unitPrice?: number
    quantity_sold?: number
    quantity?: number
    subtotal?: number
  },
  candies: Candy[],
): SessionItem {
  const candyReference = item.candy_id ?? item.candyId ?? item.candy_name ?? item.candyName ?? item.candy
  const candy = findCandyByReference(candies, candyReference)
  const candyId = item.candy_id ?? item.candyId ?? candy?.id ?? item.candy ?? item.candyName ?? item.candy_name ?? ''
  const candyName = item.candy_name ?? item.candyName ?? item.candy ?? candy?.name ?? candyId
  const unitPrice = item.unit_price ?? item.unitPrice ?? item.price ?? candy?.price ?? 0
  const quantity = item.quantity_sold ?? item.quantity ?? 0
  const subtotal = item.subtotal ?? unitPrice * quantity

  return {
    candyId,
    candyName,
    unitPrice,
    quantity,
    subtotal,
  }
}

function normalizeOrderItem(item: SessionOrderItemResponse, candies: Candy[]) {
  return toSessionItem(
    {
      candy_id: item.candy_id,
      candyId: item.candyId,
      candy_name: item.candy_name,
      candyName: item.candyName ?? item.name,
      candy: item.candy,
      price: item.price,
      unit_price: item.unit_price,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      subtotal: item.subtotal,
    },
    candies,
  )
}

export function buildTotals(session: Session | null): DashboardTotals {
  if (!session) {
    return {
      candiesSold: 0,
      estimatedTotal: 0,
    }
  }

  return session.items.reduce(
    (accumulator, item) => ({
      candiesSold: accumulator.candiesSold + item.quantity,
      estimatedTotal: accumulator.estimatedTotal + item.subtotal,
    }),
    { candiesSold: 0, estimatedTotal: 0 },
  )
}

export function normalizeSession(
  summary: SessionSummaryResponse,
  details: SessionDetailsResponse | null,
  candies: Candy[],
): Session {
  const items = details?.items.map((item) => toSessionItem(item, candies)) ?? []

  return {
    id: summary.id,
    status: details?.status ?? summary.status,
    date: details?.date ?? summary.date,
    totalSold: details?.totalSold ?? details?.total_sold ?? summary.totalSold ?? summary.total_sold ?? 0,
    items,
  }
}

export function normalizeSessionOrders(
  orders: SessionOrderResponse[],
  sessionId: string,
  candies: Candy[],
): SessionOrder[] {
  return orders
    .map((order) => {
      const items = order.items.map((item) => normalizeOrderItem(item, candies))
      const total = order.total ?? order.totalSold ?? order.total_sold ?? items.reduce((sum, item) => sum + item.subtotal, 0)

      return {
        id: order.id,
        sessionId: order.sessionId ?? order.session_id ?? sessionId,
        createdAt: order.createdAt ?? order.created_at ?? new Date().toISOString(),
        total,
        items,
      }
    })
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
}

export function buildDraftOrderItem(candy: Candy): DraftOrderItem {
  return {
    candyId: candy.id,
    candyName: candy.name,
    unitPrice: candy.price,
    quantity: 1,
    subtotal: candy.price,
  }
}

export function updateDraftItemQuantity(item: DraftOrderItem, quantity: number): DraftOrderItem {
  const nextQuantity = Math.max(1, quantity)

  return {
    ...item,
    quantity: nextQuantity,
    subtotal: item.unitPrice * nextQuantity,
  }
}

export function buildDraftTotal(items: DraftOrderItem[]) {
  return items.reduce((sum, item) => sum + item.subtotal, 0)
}
