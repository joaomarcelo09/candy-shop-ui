export type SessionPeriod = 'morning' | 'evening'
export type SessionStatus = 'open' | 'closed'
export type SessionCloseReason = 'manual' | 'automatic'

export interface SalesSession {
  id: string
  period: SessionPeriod
  status: SessionStatus
  openedAt: string
  scheduledCloseAt: string
  closedAt: string | null
  closeReason: SessionCloseReason | null
  orderCount: number
  total: number
  deletedAt?: string | null
  deletedBy?: string | null
}

export interface OrderLineInput {
  candyId: string
  quantity: number
}

export interface OrderLine {
  candyId: string
  candyName: string
  quantity: number
  unitPrice: number
  subtotal: number
}

export interface SaleOrder {
  id: string
  sessionId: string
  lines: OrderLine[]
  total: number
  pixReceiptUrl: string | null
  createdAt: string
}

export interface CreateOrderInput {
  lines: OrderLineInput[]
  pixReceiptUrl?: string
}

export interface SessionOrderResult {
  session: SalesSession
  order: SaleOrder
}

export interface DeleteOrderResult {
  session: SalesSession
}
