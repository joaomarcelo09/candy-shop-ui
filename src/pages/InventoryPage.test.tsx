import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { queryKeys } from '../queries/queryKeys'
import { useInventoryStore } from '../stores/inventoryStore'
import type { InventoryItem, StockEntryInput } from '../types/inventory'

const inventoryApi = vi.hoisted(() => ({
  getItems: vi.fn(),
  getEntries: vi.fn(),
  addStockBatch: vi.fn(),
  setStockQuantity: vi.fn(),
}))

vi.mock('../api/dependencies', () => ({
  appDependencies: {
    inventoryApi,
    authApi: { login: vi.fn() },
  },
}))

import { InventoryPage } from './InventoryPage'

const items: InventoryItem[] = [
  {
    id: 'pacoca',
    name: 'Paçoca',
    quantity: 7,
    unitSalePrice: 100,
    updatedAt: '2026-07-20T10:00:00.000Z',
  },
  {
    id: 'pirulito',
    name: 'Pirulito',
    quantity: 0,
    unitSalePrice: 80,
    updatedAt: '2026-07-20T10:00:00.000Z',
  },
]

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  render(
    <QueryClientProvider client={queryClient}>
      <InventoryPage />
    </QueryClientProvider>,
  )

  return queryClient
}

describe('InventoryPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useInventoryStore.setState({
      search: '',
      filter: 'all',
      purchaseOpen: false,
      historyOpen: false,
      itemToEdit: null,
    })
    inventoryApi.getItems.mockResolvedValue(items)
    inventoryApi.getEntries.mockResolvedValue([])
    inventoryApi.addStockBatch.mockImplementation(async (input: StockEntryInput) => {
      const existingItem = items.find(
        (item) => item.name.toLocaleLowerCase('pt-BR') === input.candyName.trim().toLocaleLowerCase('pt-BR'),
      )
      const item = existingItem
        ? {
            ...existingItem,
            quantity: existingItem.quantity + input.quantity,
            unitSalePrice: input.unitSalePrice,
            saleIncrement: input.saleIncrement,
          }
        : {
            id: 'novo-doce',
            name: input.candyName,
            quantity: input.quantity,
            unitSalePrice: input.unitSalePrice,
            saleIncrement: input.saleIncrement,
            updatedAt: '2026-07-20T10:00:00.000Z',
          }

      return {
        item,
        entry: {
          id: 'nova-entrada',
          itemId: item.id,
          candyName: item.name,
          quantity: input.quantity,
          unitSalePrice: input.unitSalePrice,
          purchasedAt: '2026-07-20T10:00:00.000Z',
        },
      }
    })
    inventoryApi.setStockQuantity.mockImplementation(async (itemId: string, quantity: number) => ({
      item: { ...items.find((item) => item.id === itemId)!, quantity },
    }))
  })

  it('carrega pelo TanStack Query e filtra os itens sem estoque', async () => {
    renderPage()

    expect(await screen.findByText('Paçoca')).toBeInTheDocument()
    expect(screen.getByText('Pirulito')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Sem estoque' }))

    expect(screen.getByRole('heading', { name: 'Sem estoque' })).toBeInTheDocument()
    expect(screen.getByText('Pirulito')).toBeInTheDocument()
    expect(screen.queryByText('Paçoca')).not.toBeInTheDocument()
    expect(screen.getByText('1 doce')).toBeInTheDocument()
  })

  it('registra um lote e atualiza o cache do estoque', async () => {
    const queryClient = renderPage()
    await screen.findByText('Paçoca')
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar lote' }))

    const dialog = await screen.findByRole('dialog')
    fireEvent.click(within(dialog).getByRole('combobox', { name: 'Doce' }))
    fireEvent.change(screen.getByLabelText('Buscar doce'), { target: { value: 'paç' } })
    fireEvent.click(screen.getByRole('option', { name: 'Paçoca' }))
    fireEvent.change(within(dialog).getByLabelText('Quantidade do lote'), { target: { value: '3' } })
    fireEvent.change(within(dialog).getByLabelText('Preço de venda'), { target: { value: '2' } })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Mostrar +5' }))
    fireEvent.click(within(dialog).getByRole('button', { name: 'Confirmar entrada do lote' }))

    await waitFor(() => {
      expect(queryClient.getQueryData<InventoryItem[]>(queryKeys.inventory.items)?.[0]).toMatchObject({
        name: 'Paçoca',
        quantity: 10,
        unitSalePrice: 200,
      })
    })
    expect(inventoryApi.addStockBatch.mock.calls[0][0]).toEqual(
      expect.objectContaining({ saleIncrement: 5 }),
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('corrige a quantidade e atualiza o cache', async () => {
    const queryClient = renderPage()
    await screen.findByText('Paçoca')
    fireEvent.click(screen.getByRole('button', { name: 'Corrigir quantidade de Paçoca' }))

    const dialog = await screen.findByRole('dialog', { name: 'Corrigir quantidade' })
    fireEvent.change(within(dialog).getByLabelText('Quantidade correta'), { target: { value: '5' } })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Salvar correção' }))

    await waitFor(() => {
      expect(queryClient.getQueryData<InventoryItem[]>(queryKeys.inventory.items)?.[0].quantity).toBe(5)
    })
    expect(screen.queryByRole('dialog', { name: 'Corrigir quantidade' })).not.toBeInTheDocument()
  })

  it('abre o histórico carregado pelo TanStack Query', async () => {
    inventoryApi.getEntries.mockResolvedValue([
      {
        id: 'entrada-teste',
        itemId: 'pacoca',
        candyName: 'Paçoca',
        quantity: 20,
        unitSalePrice: 200,
        purchasedAt: '2026-07-29T10:00:00.000Z',
      },
    ])
    renderPage()
    await screen.findByText('Paçoca')

    fireEvent.click(screen.getByRole('button', { name: 'Ver histórico de lotes' }))

    const dialog = await screen.findByRole('dialog', { name: 'Histórico de lotes' })
    expect(within(dialog).getByText('+20 un.')).toBeInTheDocument()
  })

  it('permite cadastrar um novo doce pelo mutation cache', async () => {
    const queryClient = renderPage()
    await screen.findByText('Paçoca')
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar lote' }))

    const dialog = await screen.findByRole('dialog')
    fireEvent.click(within(dialog).getByRole('combobox', { name: 'Doce' }))
    fireEvent.change(screen.getByLabelText('Buscar doce'), { target: { value: 'Jujuba azeda' } })
    fireEvent.click(screen.getByRole('option', { name: /Adicionar novo doce “Jujuba azeda”/ }))
    fireEvent.change(within(dialog).getByLabelText('Quantidade do lote'), { target: { value: '12' } })
    fireEvent.change(within(dialog).getByLabelText('Preço de venda'), { target: { value: '1.5' } })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Confirmar entrada do lote' }))

    await waitFor(() => {
      expect(queryClient.getQueryData<InventoryItem[]>(queryKeys.inventory.items)?.[0]).toMatchObject({
        name: 'Jujuba azeda',
        quantity: 12,
        unitSalePrice: 150,
      })
    })
  })
})
