import type { AxiosInstance } from 'axios'
import type {
  InventoryItem,
  StockEntry,
  StockEntryResult,
  StockQuantityResult,
} from '../types/inventory'
import type { InventoryApi } from './contracts'

export function createInventoryApi(client: AxiosInstance): InventoryApi {
  return {
    async getItems() {
      const response = await client.get<{ items: InventoryItem[] }>('/inventory/items')
      return response.data.items
    },
    async getEntries() {
      const response = await client.get<{ entries: StockEntry[] }>('/inventory/entries')
      return response.data.entries
    },
    async addStockBatch(input) {
      const response = await client.post<StockEntryResult>('/inventory/entries', input)
      return response.data
    },
    async setStockQuantity(itemId, quantity) {
      const response = await client.patch<StockQuantityResult>(
        `/inventory/items/${encodeURIComponent(itemId)}/quantity`,
        { quantity },
      )
      return response.data
    },
  }
}
