export type SessionStatus = 'OPEN' | 'CLOSED'

export interface User {
  id: string
  email: string
  name: string
}

export interface Candy {
  id: string
  name: string
  price: number
  createdAt?: string
  updatedAt?: string
}

export interface SessionItem {
  candyId: string
  candyName: string
  unitPrice: number
  quantity: number
  subtotal: number
}

export interface SessionOrderItem {
  candyId: string
  candyName: string
  unitPrice: number
  quantity: number
  subtotal: number
}

export interface SessionOrder {
  id: string
  sessionId: string
  createdAt: string
  total: number
  items: SessionOrderItem[]
}

export interface DraftOrderItem {
  candyId: string
  candyName: string
  unitPrice: number
  quantity: number
  subtotal: number
}

export interface Session {
  id: string
  status: SessionStatus
  date: string
  totalSold: number
  items: SessionItem[]
}

export interface DashboardTotals {
  candiesSold: number
  estimatedTotal: number
}
