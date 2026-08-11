export interface InventoryItem {
  id: string
  name: string
  quantity: number
  unitSalePrice: number
  saleIncrement?: 1 | 5
  updatedAt: string
}

export interface StockEntry {
  id: string
  itemId: string
  candyName: string
  quantity: number
  unitSalePrice: number
  purchasedAt: string
}

export interface StockEntryInput {
  candyName: string
  quantity: number
  unitSalePrice: number
  saleIncrement: 1 | 5
}

export type StockFilter = 'all' | 'low' | 'out'

export interface InventorySummary {
  lowStockItems: number
  itemCount: number
  totalUnits: number
}

export interface StockEntryResult {
  item: InventoryItem
  entry: StockEntry
}

export interface StockQuantityResult {
  item: InventoryItem
}
