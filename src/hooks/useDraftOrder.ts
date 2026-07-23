import { useMemo, useReducer } from 'react'
import type { Candy, DraftOrderItem } from '../types/domain'
import { buildDraftOrderItem, buildDraftTotal, updateDraftItemQuantity } from '../utils/session'

type DraftOrderAction =
  | { type: 'add'; candy: Candy }
  | { type: 'updateQuantity'; candyId: string; quantity: number }
  | { type: 'remove'; candyId: string }
  | { type: 'clear' }

export function draftOrderReducer(state: DraftOrderItem[], action: DraftOrderAction): DraftOrderItem[] {
  switch (action.type) {
    case 'add': {
      const existingItem = state.find((item) => item.candyId === action.candy.id)

      if (existingItem) {
        return state.map((item) =>
          item.candyId === action.candy.id ? updateDraftItemQuantity(item, item.quantity + 1) : item,
        )
      }

      return [...state, buildDraftOrderItem(action.candy)]
    }
    case 'updateQuantity':
      return state.map((item) =>
        item.candyId === action.candyId ? updateDraftItemQuantity(item, action.quantity) : item,
      )
    case 'remove':
      return state.filter((item) => item.candyId !== action.candyId)
    case 'clear':
      return []
  }
}

export function useDraftOrder() {
  const [items, dispatch] = useReducer(draftOrderReducer, [])
  const total = useMemo(() => buildDraftTotal(items), [items])

  return {
    items,
    total,
    addCandy: (candy: Candy) => dispatch({ type: 'add', candy }),
    updateQuantity: (candyId: string, quantity: number) =>
      dispatch({ type: 'updateQuantity', candyId, quantity }),
    removeItem: (candyId: string) => dispatch({ type: 'remove', candyId }),
    clear: () => dispatch({ type: 'clear' }),
  }
}
