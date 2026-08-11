import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { appDependencies } from './api/dependencies'
import { queryKeys } from './queries/queryKeys'
import { useAuthStore } from './stores/authStore'
import { useSessionStore } from './stores/sessionStore'
import type { InventoryItem } from './types/inventory'

function renderApp(path: string, items: InventoryItem[] = []) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  queryClient.setQueryData(queryKeys.inventory.items, items)
  queryClient.setQueryData(queryKeys.inventory.entries, [])

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[path]}>
        <App />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('App authentication routes', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    useAuthStore.setState({ token: null, user: null })
    useSessionStore.getState().reset()
  })

  it('redireciona visitantes sem sessão para o login', async () => {
    renderApp('/estoque')

    expect(
      await screen.findByRole('heading', { name: 'Entre na sua conta' }),
    ).toBeInTheDocument()
  })

  it('redireciona usuários autenticados para vendas', async () => {
    useAuthStore.getState().setSession('token-valido', {
      name: 'Maria',
      email: 'maria@doces.com',
    })

    renderApp('/login')

    expect(
      await screen.findByRole('heading', { name: 'Iniciar sessão' }),
    ).toBeInTheDocument()
  })

  it('oculta a navegação global dentro de uma sessão de venda', async () => {
    useAuthStore.getState().setSession('token-valido', {
      name: 'Maria',
      email: 'maria@doces.com',
    })
    const activeSession = {
        id: 'sessao-foco',
        period: 'morning' as const,
        status: 'open' as const,
        openedAt: '2026-08-09T14:20:00.000Z',
        scheduledCloseAt: '2099-08-09T15:00:00.000Z',
        closedAt: null,
        closeReason: null,
        orderCount: 0,
        total: 0,
      }
    vi.spyOn(appDependencies.sessionApi, 'getActiveSession').mockResolvedValue(activeSession)
    vi.spyOn(appDependencies.sessionApi, 'getOrders').mockResolvedValue([])
    useSessionStore.setState({
      activeSession,
      orders: [],
      loading: false,
    })

    renderApp('/vendas/sessao/sessao-foco')

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Montar pedido' })).toBeInTheDocument()
    })
    expect(screen.queryByRole('navigation', { name: 'Navegação principal' })).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Sair da venda e manter sessão aberta' }))
    expect(await screen.findByRole('heading', { name: 'Venda em andamento' })).toBeInTheDocument()
    expect(screen.getAllByRole('navigation', { name: 'Navegação principal' }).length).toBeGreaterThan(0)
    expect(useSessionStore.getState().activeSession?.id).toBe('sessao-foco')
  })

  it('busca doces e adiciona cinco unidades pelo atalho classificado', async () => {
    useAuthStore.getState().setSession('token-valido', {
      name: 'Maria',
      email: 'maria@doces.com',
    })
    const activeSession = {
      id: 'sessao-atalho',
      period: 'morning' as const,
      status: 'open' as const,
      openedAt: '2026-08-09T14:20:00.000Z',
      scheduledCloseAt: '2099-08-09T15:00:00.000Z',
      closedAt: null,
      closeReason: null,
      orderCount: 0,
      total: 0,
    }
    const items: InventoryItem[] = [
      {
        id: 'bala',
        name: 'Bala de gelatina',
        quantity: 20,
        unitSalePrice: 200,
        saleIncrement: 5,
        updatedAt: '2026-08-09T14:00:00.000Z',
      },
      {
        id: 'pacoca',
        name: 'Paçoca',
        quantity: 10,
        unitSalePrice: 150,
        saleIncrement: 1,
        updatedAt: '2026-08-09T14:00:00.000Z',
      },
    ]
    vi.spyOn(appDependencies.sessionApi, 'getActiveSession').mockResolvedValue(activeSession)
    vi.spyOn(appDependencies.sessionApi, 'getOrders').mockResolvedValue([])
    vi.spyOn(appDependencies.inventoryApi, 'getItems').mockResolvedValue(items)
    useSessionStore.setState({ activeSession, orders: [], loading: false })

    renderApp('/vendas/sessao/sessao-atalho', items)

    const search = await screen.findByRole('searchbox', { name: 'Buscar doce para vender' })
    fireEvent.change(search, { target: { value: 'pac' } })
    await waitFor(() => {
      expect(screen.queryByText('Bala de gelatina')).not.toBeInTheDocument()
      expect(screen.getByText('Paçoca')).toBeInTheDocument()
    })

    fireEvent.change(search, { target: { value: '' } })
    const addFive = await screen.findByRole('button', { name: 'Adicionar 5 Bala de gelatina' })
    fireEvent.click(addFive)

    expect(
      screen.getAllByLabelText('Quantidade de Bala de gelatina').every((element) => element.textContent === '5'),
    ).toBe(true)

    const receiptInput = screen.getByLabelText('Adicionar foto do PIX')
    fireEvent.change(receiptInput, {
      target: { files: [new File(['foto'], 'pix.jpg', { type: 'image/jpeg' })] },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Visualizar foto do PIX' }))
    expect(screen.getByRole('dialog', { name: 'Visualizar comprovante PIX' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Comprovante PIX selecionado' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Fechar visualização do PIX' }))

    fireEvent.click(screen.getByRole('button', { name: 'Remover foto do PIX' }))
    expect(screen.queryByRole('button', { name: 'Visualizar foto do PIX' })).not.toBeInTheDocument()
    expect(screen.getByLabelText('Adicionar foto do PIX')).toBeInTheDocument()
  })

  it('mostra as vendas no histórico e oferece PDF apenas na sessão encerrada', async () => {
    useAuthStore.getState().setSession('token-valido', {
      name: 'Maria',
      email: 'maria@doces.com',
    })
    const closedSession = {
      id: 'sessao-encerrada',
      period: 'evening' as const,
      status: 'closed' as const,
      openedAt: '2026-08-09T21:00:00.000Z',
      scheduledCloseAt: '2026-08-10T01:00:00.000Z',
      closedAt: '2026-08-10T01:00:00.000Z',
      closeReason: 'automatic' as const,
      orderCount: 1,
      total: 500,
    }
    vi.spyOn(appDependencies.sessionApi, 'getActiveSession').mockResolvedValue(null)
    vi.spyOn(appDependencies.sessionApi, 'getSessions').mockResolvedValue([closedSession])
    vi.spyOn(appDependencies.sessionApi, 'softDeleteSession').mockResolvedValue({
      ...closedSession,
      deletedAt: '2026-08-10T22:30:00.000Z',
      deletedBy: 'user-1',
    })
    vi.spyOn(appDependencies.sessionApi, 'getOrders').mockResolvedValue([
      {
        id: 'pedido-historico',
        sessionId: closedSession.id,
        lines: [
          {
            candyId: 'chocolate',
            candyName: 'Chocolate',
            quantity: 1,
            unitPrice: 500,
            subtotal: 500,
          },
        ],
        total: 500,
        pixReceiptUrl: null,
        createdAt: '2026-08-09T21:15:00.000Z',
      },
    ])
    useSessionStore.setState({ focusModeDismissed: true })

    renderApp('/vendas/historico')

    expect(await screen.findByRole('heading', { name: 'Histórico de sessões' })).toBeInTheDocument()
    fireEvent.click(await screen.findByRole('button', { name: /Encerrada/ }))
    expect(await screen.findByText('1× Chocolate')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Baixar relatório PDF' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Excluir sessão' }))
    expect(screen.getByText('Excluir esta sessão do histórico?')).toBeInTheDocument()
    expect(screen.getByText(/Nenhum dado será apagado definitivamente/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar exclusão' }))

    expect(await screen.findByText('Nenhuma sessão registrada')).toBeInTheDocument()
    expect(appDependencies.sessionApi.softDeleteSession).toHaveBeenCalledWith(
      closedSession.id,
      expect.anything(),
    )
  })
})
