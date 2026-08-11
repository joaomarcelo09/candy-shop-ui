import type { AuthSession, LoginRequest } from '../types/auth'
import type {
  InventoryItem,
  StockEntry,
  StockEntryInput,
  StockEntryResult,
  StockQuantityResult,
} from '../types/inventory'
import type {
  CreateOrderInput,
  DeleteOrderResult,
  SaleOrder,
  SalesSession,
  SessionOrderResult,
} from '../types/session'

export interface AuthApi {
  login: (credentials: LoginRequest) => Promise<AuthSession>
}

export interface InventoryApi {
  getItems: () => Promise<InventoryItem[]>
  getEntries: () => Promise<StockEntry[]>
  addStockBatch: (input: StockEntryInput) => Promise<StockEntryResult>
  setStockQuantity: (itemId: string, quantity: number) => Promise<StockQuantityResult>
}

export interface SessionApi {
  getActiveSession: () => Promise<SalesSession | null>
  getSessions: () => Promise<SalesSession[]>
  createSession: () => Promise<SalesSession>
  getOrders: (sessionId: string) => Promise<SaleOrder[]>
  createOrder: (sessionId: string, input: CreateOrderInput) => Promise<SessionOrderResult>
  deleteOrder: (sessionId: string, orderId: string) => Promise<DeleteOrderResult>
  closeSession: (sessionId: string) => Promise<SalesSession>
  softDeleteSession: (sessionId: string) => Promise<SalesSession>
}

export interface ReceiptStorage {
  uploadPixReceipt: (sessionId: string, file: File) => Promise<string>
}

export interface AppDependencies {
  authApi: AuthApi
  inventoryApi: InventoryApi
  sessionApi: SessionApi
  receiptStorage: ReceiptStorage
}
