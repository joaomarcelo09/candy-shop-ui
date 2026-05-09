import type { Candy, Session, User } from './domain'

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
  date: string
  items: Array<{
    candy: string
    price: number
    quantity_sold: number
    subtotal: number
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
  loading: boolean
  submittingSaleIds: string[]
  totals: {
    candiesSold: number
    estimatedTotal: number
  }
  fetchCurrentSession: (candies: Candy[]) => Promise<Session | null>
  createSession: (candies: Candy[]) => Promise<void>
  registerSale: (candies: Candy[], candyId: string, quantity?: number) => Promise<void>
  closeSession: () => Promise<void>
}
