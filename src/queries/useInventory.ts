import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { appDependencies } from '../api/dependencies'
import type { InventoryItem, StockEntry } from '../types/inventory'
import { queryKeys } from './queryKeys'

export function useInventoryItemsQuery() {
  return useQuery({
    queryKey: queryKeys.inventory.items,
    queryFn: appDependencies.inventoryApi.getItems,
  })
}

export function useStockEntriesQuery() {
  return useQuery({
    queryKey: queryKeys.inventory.entries,
    queryFn: appDependencies.inventoryApi.getEntries,
  })
}

export function useAddStockBatchMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: appDependencies.inventoryApi.addStockBatch,
    onSuccess: ({ item: updatedItem, entry }) => {
      queryClient.setQueryData<InventoryItem[]>(queryKeys.inventory.items, (items = []) => {
        const exists = items.some((item) => item.id === updatedItem.id)
        return exists
          ? items.map((item) => (item.id === updatedItem.id ? updatedItem : item))
          : [updatedItem, ...items]
      })
      queryClient.setQueryData<StockEntry[]>(queryKeys.inventory.entries, (entries = []) => [
        entry,
        ...entries,
      ])
    },
  })
}

export function useSetStockQuantityMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      appDependencies.inventoryApi.setStockQuantity(itemId, quantity),
    onSuccess: ({ item: updatedItem }) => {
      queryClient.setQueryData<InventoryItem[]>(queryKeys.inventory.items, (items = []) =>
        items.map((item) => (item.id === updatedItem.id ? updatedItem : item)),
      )
    },
  })
}
