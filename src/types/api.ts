import type { Candy, DraftOrderItem, Session, SessionOrder, User } from './domain'

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
  loading: boolean
  login: (payload: LoginRequest) => Promise<void>
  logout: () => void
}

export interface CandyStoreState {
  candies: Candy[]
  loading: boolean
  fetchCandies: () => Promise<Candy[]>
  createCandy: (payload: CandyPayload) => Promise<void>
  updateCandy: (id: string, payload: CandyPayload) => Promise<void>
}

export interface SessionStoreState {
  activeSession: Session | null
  orders: SessionOrder[]
  draftOrder: DraftOrderItem[]
  loading: boolean
  submittingOrder: boolean
  deletingOrderIds: string[]
  totals: {
    candiesSold: number
    estimatedTotal: number
  }
  fetchCurrentSession: (candies: Candy[]) => Promise<Session | null>
  createSession: (candies: Candy[]) => Promise<void>
  fetchSessionOrders: (sessionId: string, candies: Candy[]) => Promise<SessionOrder[]>
  addCandyToDraft: (candy: Candy) => void
  updateDraftQuantity: (candyId: string, quantity: number) => void
  removeDraftItem: (candyId: string) => void
  clearDraftOrder: () => void
  submitDraftOrder: (candies: Candy[]) => Promise<void>
  deleteOrder: (orderId: string, candies: Candy[]) => Promise<void>
  closeSession: () => Promise<void>
}
