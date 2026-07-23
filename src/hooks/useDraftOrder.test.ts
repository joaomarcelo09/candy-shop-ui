import { describe, expect, it } from 'vitest'
import type { Candy } from '../types/domain'
import { draftOrderReducer } from './useDraftOrder'

const candy: Candy = {
  id: '11111111-1111-4111-8111-111111111111',
  name: 'Chocolate',
  price: 500,
}

describe('draftOrderReducer', () => {
  it('adds candies and increments an existing item', () => {
    const firstState = draftOrderReducer([], { type: 'add', candy })
    const secondState = draftOrderReducer(firstState, { type: 'add', candy })

    expect(secondState).toEqual([
      expect.objectContaining({ candyId: candy.id, quantity: 2, subtotal: 1_000 }),
    ])
  })

  it('keeps quantities at one or higher and recalculates the subtotal', () => {
    const state = draftOrderReducer([{ ...candy, candyId: candy.id, candyName: candy.name, unitPrice: candy.price, quantity: 2, subtotal: 1_000 }], {
      type: 'updateQuantity',
      candyId: candy.id,
      quantity: 0,
    })

    expect(state[0]).toEqual(expect.objectContaining({ quantity: 1, subtotal: 500 }))
  })

  it('removes individual items and clears the whole draft', () => {
    const populated = draftOrderReducer([], { type: 'add', candy })

    expect(draftOrderReducer(populated, { type: 'remove', candyId: candy.id })).toEqual([])
    expect(draftOrderReducer(populated, { type: 'clear' })).toEqual([])
  })
})
