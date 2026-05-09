import type { SessionDetailsResponse, SessionSummaryResponse } from '../types/api'
import type { Candy, DashboardTotals, Session } from '../types/domain'

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
  const items = details?.items.map((item) => {
    const candy = candies.find((entry) => entry.name === item.candy)

    return {
      candyId: candy?.id ?? item.candy,
      candyName: item.candy,
      unitPrice: item.price,
      quantity: item.quantity_sold,
      subtotal: item.subtotal,
    }
  }) ?? []

  return {
    id: summary.id,
    status: summary.status,
    date: summary.date,
    totalSold: details?.total_sold ?? summary.totalSold ?? summary.total_sold ?? 0,
    items,
  }
}

export function mergeOptimisticSale(session: Session, candy: Candy, quantity: number) {
  const existingItem = session.items.find((item) => item.candyId === candy.id)

  if (existingItem) {
    const nextQuantity = existingItem.quantity + quantity

    return {
      ...session,
      items: session.items.map((item) =>
        item.candyId === candy.id
          ? {
              ...item,
              quantity: nextQuantity,
              subtotal: nextQuantity * item.unitPrice,
            }
          : item,
      ),
    }
  }

  return {
    ...session,
    items: [
      ...session.items,
      {
        candyId: candy.id,
        candyName: candy.name,
        unitPrice: candy.price,
        quantity,
        subtotal: candy.price * quantity,
      },
    ],
  }
}
