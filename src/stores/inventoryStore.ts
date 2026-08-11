import { create } from 'zustand'
import type { InventoryItem, StockFilter } from '../types/inventory'

interface InventoryStore {
  search: string
  filter: StockFilter
  purchaseOpen: boolean
  historyOpen: boolean
  itemToEdit: InventoryItem | null
  setSearch: (search: string) => void
  setFilter: (filter: StockFilter) => void
  setPurchaseOpen: (open: boolean) => void
  setHistoryOpen: (open: boolean) => void
  setItemToEdit: (item: InventoryItem | null) => void
}

export const useInventoryStore = create<InventoryStore>((set) => ({
  search: '',
  filter: 'all',
  purchaseOpen: false,
  historyOpen: false,
  itemToEdit: null,
  setSearch: (search) => set({ search }),
  setFilter: (filter) => set({ filter }),
  setPurchaseOpen: (purchaseOpen) => set({ purchaseOpen }),
  setHistoryOpen: (historyOpen) => set({ historyOpen }),
  setItemToEdit: (itemToEdit) => set({ itemToEdit }),
}))
