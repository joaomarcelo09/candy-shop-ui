import type { User } from './domain'

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
}

export interface CandyPayload {
  name: string
  price: number
}

export interface SessionSummaryResponse {
  id: string
  status: 'OPEN' | 'CLOSED'
  totalSold?: number
  total_sold?: number
  date: string
}

export interface SessionDetailsResponse {
  id: string
  status: 'OPEN' | 'CLOSED'
  total_sold: number
  totalSold?: number
  date: string
  items: Array<{
    candy_id?: string
    candyId?: string
    candy_name?: string
    candyName?: string
    candy?: string
    price?: number
    quantity_sold?: number
    quantity?: number
    subtotal?: number
  }>
}

export interface SessionOrderItemResponse {
  id?: string
  candy_id?: string
  candyId?: string
  candy_name?: string
  candyName?: string
  candy?: string
  name?: string
  unit_price?: number
  unitPrice?: number
  price?: number
  quantity: number
  subtotal?: number
}

export interface SessionOrderResponse {
  id: string
  session_id?: string
  sessionId?: string
  created_at?: string
  createdAt?: string
  total?: number
  total_sold?: number
  totalSold?: number
  items: SessionOrderItemResponse[]
}

export interface SessionOrderPayload {
  items: Array<{
    candy_id: string
    quantity: number
  }>
}

export interface AuthStateSnapshot {
  token: string | null
  user: User | null
}

export interface AuthStoreState extends AuthStateSnapshot {
  setAuth: (token: string, user: User | null) => void
  logout: () => void
}

export interface UpdateCandyVariables {
  id: string
  payload: CandyPayload
}

export interface SessionOrderVariables {
  sessionId: string
  payload: SessionOrderPayload
}

export interface DeleteSessionOrderVariables {
  sessionId: string
  orderId: string
}

export interface CurrentSessionResource {
  summary: SessionSummaryResponse
  details: SessionDetailsResponse
}
