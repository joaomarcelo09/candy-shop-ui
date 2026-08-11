import type { InventoryItem, StockEntry } from '../types/inventory'

export const initialInventoryItems: InventoryItem[] = [
  {
    id: 'bala-gelatina',
    name: 'Bala de gelatina',
    quantity: 42,
    unitSalePrice: 250,
    saleIncrement: 5,
    updatedAt: '2026-07-25T14:20:00.000Z',
  },
  {
    id: 'chocolate-ao-leite',
    name: 'Chocolate ao leite',
    quantity: 18,
    unitSalePrice: 500,
    saleIncrement: 1,
    updatedAt: '2026-07-24T17:10:00.000Z',
  },
  {
    id: 'pacoca',
    name: 'Paçoca',
    quantity: 7,
    unitSalePrice: 200,
    saleIncrement: 5,
    updatedAt: '2026-07-23T12:40:00.000Z',
  },
  {
    id: 'pirulito-coracao',
    name: 'Pirulito coração',
    quantity: 0,
    unitSalePrice: 150,
    saleIncrement: 1,
    updatedAt: '2026-07-21T09:15:00.000Z',
  },
]

export const initialStockEntries: StockEntry[] = [
  {
    id: 'entrada-1',
    itemId: 'bala-gelatina',
    candyName: 'Bala de gelatina',
    quantity: 30,
    unitSalePrice: 250,
    purchasedAt: '2026-07-25T14:20:00.000Z',
  },
  {
    id: 'entrada-2',
    itemId: 'chocolate-ao-leite',
    candyName: 'Chocolate ao leite',
    quantity: 12,
    unitSalePrice: 500,
    purchasedAt: '2026-07-24T17:10:00.000Z',
  },
]
