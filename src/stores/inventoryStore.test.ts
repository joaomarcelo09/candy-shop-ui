import { beforeEach, describe, expect, it } from 'vitest'
import { useInventoryStore } from './inventoryStore'

describe('inventoryStore', () => {
  beforeEach(() => {
    useInventoryStore.setState({
      search: '',
      filter: 'all',
      purchaseOpen: false,
      historyOpen: false,
      itemToEdit: null,
    })
  })

  it('mantém somente o estado simples da interface', () => {
    useInventoryStore.getState().setSearch('paçoca')
    useInventoryStore.getState().setFilter('low')
    useInventoryStore.getState().setPurchaseOpen(true)

    expect(useInventoryStore.getState()).toEqual(
      expect.objectContaining({
        search: 'paçoca',
        filter: 'low',
        purchaseOpen: true,
      }),
    )
  })

  it('seleciona e limpa o item em edição', () => {
    const item = {
      id: 'pacoca',
      name: 'Paçoca',
      quantity: 7,
      unitSalePrice: 200,
      updatedAt: '2026-07-20T10:00:00.000Z',
    }

    useInventoryStore.getState().setItemToEdit(item)
    expect(useInventoryStore.getState().itemToEdit).toEqual(item)

    useInventoryStore.getState().setItemToEdit(null)
    expect(useInventoryStore.getState().itemToEdit).toBeNull()
  })
})
