import {
  ArrowLeft,
  Camera,
  CircleCheckBig,
  Clock3,
  Eye,
  Image,
  Minus,
  Plus,
  ReceiptText,
  Search,
  Trash2,
  TriangleAlert,
  X,
} from 'lucide-react'
import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { getErrorMessage } from '../lib/errorHandler'
import { useInventoryItemsQuery } from '../queries/useInventory'
import { useSessionStore } from '../stores/sessionStore'
import type { InventoryItem } from '../types/inventory'
import { formatCurrency } from '../utils/inventoryFormat'
import { getPeriodLabel } from '../utils/sessionSchedule'

const EMPTY_ITEMS: InventoryItem[] = []

const timeFormatter = new Intl.DateTimeFormat('pt-BR', {
  hour: '2-digit',
  minute: '2-digit',
})

function normalizeCandySearch(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLocaleLowerCase('pt-BR')
}

export function SaleSessionPage() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const itemsQuery = useInventoryItemsQuery()
  const items = itemsQuery.data ?? EMPTY_ITEMS
  const activeSession = useSessionStore((state) => state.activeSession)
  const orders = useSessionStore((state) => state.orders)
  const draftOrder = useSessionStore((state) => state.draftOrder)
  const pixReceipt = useSessionStore((state) => state.pixReceipt)
  const loading = useSessionStore((state) => state.loading)
  const saving = useSessionStore((state) => state.saving)
  const fetchActiveSession = useSessionStore((state) => state.fetchActiveSession)
  const setDraftQuantity = useSessionStore((state) => state.setDraftQuantity)
  const setPixReceipt = useSessionStore((state) => state.setPixReceipt)
  const registerOrder = useSessionStore((state) => state.registerOrder)
  const deleteOrder = useSessionStore((state) => state.deleteOrder)
  const closeSession = useSessionStore((state) => state.closeSession)
  const leaveSessionFocus = useSessionStore((state) => state.leaveSessionFocus)
  const [closingConfirmation, setClosingConfirmation] = useState(false)
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null)
  const [candySearch, setCandySearch] = useState('')
  const [receiptPreviewOpen, setReceiptPreviewOpen] = useState(false)
  const [receiptPreviewUrl, setReceiptPreviewUrl] = useState<string | null>(() =>
    pixReceipt && typeof URL.createObjectURL === 'function'
      ? URL.createObjectURL(pixReceipt)
      : null,
  )
  const deferredCandySearch = useDeferredValue(candySearch)

  const draftLines = useMemo(
    () => items.filter((item) => (draftOrder[item.id] ?? 0) > 0),
    [draftOrder, items],
  )
  const draftTotal = useMemo(
    () => draftLines.reduce((total, item) => total + item.unitSalePrice * draftOrder[item.id], 0),
    [draftLines, draftOrder],
  )
  const visibleItems = useMemo(() => {
    const search = normalizeCandySearch(deferredCandySearch)
    if (!search) return items
    return items.filter((item) => normalizeCandySearch(item.name).includes(search))
  }, [deferredCandySearch, items])
  useEffect(() => {
    return () => {
      if (receiptPreviewUrl && typeof URL.revokeObjectURL === 'function') {
        URL.revokeObjectURL(receiptPreviewUrl)
      }
    }
  }, [receiptPreviewUrl])

  useEffect(() => {
    void fetchActiveSession()
      .then((session) => {
        if (!session) navigate('/vendas', { replace: true })
        else if (session.id !== sessionId) navigate(`/vendas/sessao/${session.id}`, { replace: true })
      })
      .catch((error) => toast.error(getErrorMessage(error)))
  }, [fetchActiveSession, navigate, sessionId])

  useEffect(() => {
    if (!activeSession || activeSession.status !== 'open') return
    const remaining = new Date(activeSession.scheduledCloseAt).getTime() - Date.now()

    if (remaining <= 0) {
      void fetchActiveSession()
      return
    }

    const timeout = window.setTimeout(() => {
      void closeSession()
        .then(() => {
          toast('Sessão encerrada automaticamente')
          navigate('/vendas/historico', { replace: true })
        })
        .catch((error) => toast.error(getErrorMessage(error)))
    }, Math.min(remaining, 2_147_000_000))

    return () => window.clearTimeout(timeout)
  }, [activeSession, closeSession, fetchActiveSession, navigate])

  async function handleRegisterOrder() {
    try {
      await registerOrder(items)
      setReceiptPreviewOpen(false)
      setReceiptPreviewUrl(null)
      await itemsQuery.refetch()
      toast.success('Venda registrada')
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  function handlePixReceiptChange(file: File | null) {
    setReceiptPreviewOpen(false)
    setReceiptPreviewUrl(
      file && typeof URL.createObjectURL === 'function' ? URL.createObjectURL(file) : null,
    )
    setPixReceipt(file)
  }

  async function handleDeleteOrder(orderId: string) {
    try {
      await deleteOrder(orderId)
      await itemsQuery.refetch()
      setOrderToDelete(null)
      toast.success('Venda excluída e estoque corrigido')
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  async function handleCloseSession() {
    try {
      await closeSession()
      toast.success('Sessão concluída')
      navigate('/vendas/historico', { replace: true })
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  if (!activeSession || activeSession.id !== sessionId || loading) {
    return (
      <div className="grid min-h-dvh place-items-center px-4 text-sm font-bold text-cocoa-800/55">
        Carregando sessão de venda...
      </div>
    )
  }

  const sessionOpen = activeSession.status === 'open'

  return (
    <div className="min-h-dvh bg-cream-50/70">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-cocoa-950 text-white shadow-lg">
        <div className="mx-auto flex min-h-16 max-w-[92rem] items-center gap-3 px-4 py-2 lg:px-8">
          <button
            type="button"
            className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/10 text-white/75 hover:bg-white/15 hover:text-white"
            onClick={() => {
              leaveSessionFocus()
              navigate('/vendas')
            }}
            aria-label="Sair da venda e manter sessão aberta"
          >
            <ArrowLeft className="size-5" />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-mint-500" />
              <p className="truncate text-xs font-bold">Sessão {getPeriodLabel(activeSession.period).toLocaleLowerCase('pt-BR')}</p>
            </div>
            <p className="mt-0.5 flex items-center gap-1 text-[11px] text-white/45">
              <Clock3 className="size-3" /> fecha às {timeFormatter.format(new Date(activeSession.scheduledCloseAt))}
            </p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/40">Total da sessão</p>
            <p className="font-display text-xl leading-tight">{formatCurrency(activeSession.total)}</p>
          </div>
          <button
            type="button"
            className="flex min-h-10 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-tangerine-500 px-2.5 text-white shadow-sm transition hover:bg-tangerine-500/90"
            onClick={() => setClosingConfirmation(true)}
            aria-label="Concluir sessão"
          >
            <CircleCheckBig className="size-4" />
            <span className="text-xs font-bold">Concluir</span>
          </button>
        </div>
      </header>

      <main className="mx-auto grid max-w-[92rem] gap-4 px-4 py-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(22rem,0.8fr)] lg:px-8 lg:py-7">
        <Card className="p-4 lg:col-start-2 lg:row-start-1 lg:p-5" aria-labelledby="draft-title">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-tangerine-500">Venda atual</p>
              <h1 id="draft-title" className="mt-1 font-display text-2xl text-cocoa-900">Montar pedido</h1>
            </div>
            <p className="font-display text-xl text-cocoa-900">{formatCurrency(draftTotal)}</p>
          </div>

          <div className="mt-4 h-28 overflow-y-auto overscroll-contain pr-1">
            {draftLines.length === 0 ? (
              <div className="grid h-full place-items-center rounded-2xl border border-dashed border-cocoa-900/15 px-4 text-center">
                <div>
                  <Plus className="mx-auto size-5 text-cocoa-800/30" />
                  <p className="mt-2 text-sm font-bold text-cocoa-900">Toque em + para adicionar doces</p>
                  <p className="mt-1 text-xs text-cocoa-800/50">As quantidades começam em zero.</p>
                </div>
              </div>
            ) : (
              <div className="grid gap-2">
                {draftLines.map((item) => (
                  <div key={item.id} className="flex items-center gap-2 rounded-2xl bg-cream-50 p-2.5">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-cocoa-900">{item.name}</p>
                      <p className="text-xs text-cocoa-800/50">{formatCurrency(item.unitSalePrice)} cada</p>
                    </div>
                    <QuantityControl
                      name={item.name}
                      quantity={draftOrder[item.id]}
                      available={item.quantity}
                      onChange={(quantity) => setDraftQuantity(item.id, quantity, item.quantity)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 flex min-h-14 items-center gap-2 rounded-2xl border border-cocoa-900/10 bg-white p-2">
            {pixReceipt ? (
              <button
                type="button"
                className="relative grid size-10 shrink-0 place-items-center overflow-hidden rounded-xl bg-mint-50 text-mint-500"
                onClick={() => setReceiptPreviewOpen(true)}
                disabled={!receiptPreviewUrl}
                aria-label="Visualizar foto do PIX"
              >
                {receiptPreviewUrl ? (
                  <img src={receiptPreviewUrl} alt="" className="size-full object-cover" />
                ) : (
                  <Image className="size-4" />
                )}
                <span className="absolute bottom-0 right-0 grid size-4 place-items-center rounded-tl-md bg-cocoa-950/75 text-white">
                  <Eye className="size-2.5" />
                </span>
              </button>
            ) : (
              <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-mint-50 text-mint-500">
                <Camera className="size-4" />
              </div>
            )}

            <label htmlFor="pixReceipt" className="min-w-0 flex-1 cursor-pointer px-1">
              <span className="block text-sm font-bold text-cocoa-900">
                {pixReceipt ? 'Trocar foto do PIX' : 'Adicionar foto do PIX'}
              </span>
              <span className="block truncate text-xs text-cocoa-800/50">
                {pixReceipt?.name ?? 'Opcional · câmera ou galeria'}
              </span>
            </label>

            {pixReceipt ? (
              <button
                type="button"
                className="grid size-10 shrink-0 place-items-center rounded-xl text-cocoa-800/35 hover:bg-strawberry-50 hover:text-strawberry-600"
                onClick={() => {
                  handlePixReceiptChange(null)
                }}
                disabled={!sessionOpen || saving}
                aria-label="Remover foto do PIX"
              >
                <Trash2 className="size-4" />
              </button>
            ) : null}

            <input
              key={pixReceipt ? 'attached' : 'empty'}
              id="pixReceipt"
              className="sr-only"
              type="file"
              accept="image/*"
              capture="environment"
              aria-label={pixReceipt ? 'Trocar foto do PIX' : 'Adicionar foto do PIX'}
              onChange={(event) => handlePixReceiptChange(event.target.files?.[0] ?? null)}
              disabled={!sessionOpen || saving}
            />
          </div>

          <Button
            className="mt-4 min-h-14 w-full text-base"
            onClick={handleRegisterOrder}
            disabled={!sessionOpen || saving || draftLines.length === 0}
          >
            <ReceiptText className="size-5" />
            {saving ? 'Registrando...' : `Registrar venda · ${formatCurrency(draftTotal)}`}
          </Button>
        </Card>

        <section className="lg:col-start-1 lg:row-span-2 lg:row-start-1" aria-labelledby="catalog-title">
          <h2 id="catalog-title" className="font-display text-2xl text-cocoa-900">
            Escolha os doces
          </h2>
          <div className="relative mb-3 mt-2">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-cocoa-800/35" />
            <Input
              type="search"
              value={candySearch}
              onChange={(event) => setCandySearch(event.target.value)}
              className="min-h-11 bg-white pl-11 pr-11 text-sm"
              placeholder="Buscar doce"
              aria-label="Buscar doce para vender"
              autoComplete="off"
            />
            {candySearch ? (
              <button
                type="button"
                className="absolute right-1 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-xl text-cocoa-800/40 hover:bg-cream-100 hover:text-cocoa-900"
                onClick={() => setCandySearch('')}
                aria-label="Limpar busca de doces"
              >
                <X className="size-4" />
              </button>
            ) : null}
          </div>

          {itemsQuery.isPending ? (
            <div className="grid gap-2 sm:grid-cols-2">
              {[0, 1, 2, 3].map((item) => <div key={item} className="h-[4.5rem] animate-pulse rounded-2xl bg-white" />)}
            </div>
          ) : itemsQuery.error ? (
            <Card className="p-6 text-center">
              <TriangleAlert className="mx-auto size-6 text-strawberry-500" />
              <p className="mt-3 text-sm font-bold text-cocoa-900">Não foi possível carregar os doces</p>
              <Button className="mt-4" variant="secondary" onClick={() => void itemsQuery.refetch()}>Tentar novamente</Button>
            </Card>
          ) : visibleItems.length === 0 ? (
            <Card className="p-5 text-center shadow-none">
              <Search className="mx-auto size-5 text-cocoa-800/25" />
              <p className="mt-2 text-sm font-bold text-cocoa-900">Nenhum doce encontrado</p>
            </Card>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {visibleItems.map((item) => {
                const quantity = draftOrder[item.id] ?? 0
                return (
                  <Card key={item.id} className="rounded-2xl p-2.5 shadow-none">
                    <div className="flex min-h-11 items-center gap-2">
                      <div className="min-w-0 flex-1 pl-1">
                        <h3 className="line-clamp-2 text-sm font-bold leading-[1.15rem] text-cocoa-900">
                          {item.name}
                        </h3>
                        <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-xs font-bold text-tangerine-500">
                          {formatCurrency(item.unitSalePrice)}
                          {item.quantity === 0 ? (
                            <span className="text-[10px] uppercase tracking-wide text-strawberry-600">
                              Esgotado
                            </span>
                          ) : null}
                        </p>
                      </div>
                      <QuantityControl
                        name={item.name}
                        quantity={quantity}
                        available={item.quantity}
                        quickAddQuantity={item.saleIncrement === 5 ? 5 : undefined}
                        onChange={(nextQuantity) => setDraftQuantity(item.id, nextQuantity, item.quantity)}
                      />
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </section>

        <section className="lg:col-start-2 lg:row-start-2" aria-labelledby="history-title">
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-tangerine-500">Sessão</p>
              <h2 id="history-title" className="mt-1 font-display text-2xl text-cocoa-900">Vendas registradas</h2>
            </div>
            <p className="text-xs text-cocoa-800/50">{orders.length} {orders.length === 1 ? 'pedido' : 'pedidos'}</p>
          </div>
          {orders.length === 0 ? (
            <Card className="p-5 text-center shadow-none">
              <ReceiptText className="mx-auto size-5 text-cocoa-800/25" />
              <p className="mt-2 text-sm font-bold text-cocoa-900">Nenhuma venda ainda</p>
            </Card>
          ) : (
            <div
              className="grid max-h-[25rem] gap-2 overflow-y-auto overscroll-contain pr-1 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-tangerine-500"
              role="region"
              aria-label="Lista de vendas registradas"
              tabIndex={0}
            >
              {orders.map((order, index) => (
                <Card key={order.id} className="p-3 shadow-none">
                  <div className="flex items-start gap-3">
                    <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-mint-50 text-sm font-bold text-mint-500">{orders.length - index}</div>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex shrink-0 items-center justify-between gap-2">
                        <p className="shrink-0 whitespace-nowrap text-sm font-bold text-cocoa-900">{formatCurrency(order.total)}</p>
                        <p className="shrink-0 whitespace-nowrap text-[11px] text-cocoa-800/45">{timeFormatter.format(new Date(order.createdAt))}</p>
                      </div>
                      <div
                        className="mt-1 max-h-10 overflow-y-auto overscroll-contain break-words pr-1 text-xs leading-5 text-cocoa-800/55 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-tangerine-500"
                        role="region"
                        tabIndex={0}
                        aria-label={`Itens da venda ${orders.length - index}`}
                      >
                        {order.lines.map((line) => `${line.quantity}× ${line.candyName}`).join(' · ')}
                      </div>
                      {order.pixReceiptUrl ? <p className="mt-1 flex shrink-0 items-center gap-1 text-[11px] font-bold text-mint-500"><Image className="size-3 shrink-0" /> PIX anexado</p> : null}
                    </div>
                    {sessionOpen ? (
                      orderToDelete === order.id ? (
                        <div className="flex shrink-0 self-stretch flex-col gap-1">
                          <button type="button" className="grid min-h-9 flex-1 place-items-center rounded-xl bg-strawberry-600 px-2.5 text-[11px] font-bold text-white" onClick={() => void handleDeleteOrder(order.id)} disabled={saving}>Excluir</button>
                          <button type="button" className="grid min-h-9 flex-1 place-items-center rounded-xl bg-cream-100" onClick={() => setOrderToDelete(null)} aria-label="Cancelar exclusão"><X className="size-4" /></button>
                        </div>
                      ) : (
                        <button type="button" className="grid size-11 shrink-0 place-items-center rounded-xl text-cocoa-800/35 hover:bg-strawberry-50 hover:text-strawberry-600" onClick={() => setOrderToDelete(order.id)} aria-label={`Excluir venda ${orders.length - index}`}><Trash2 className="size-4" /></button>
                      )
                    ) : null}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>

      {receiptPreviewOpen && receiptPreviewUrl ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-cocoa-950/85 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Visualizar comprovante PIX"
          onClick={() => setReceiptPreviewOpen(false)}
        >
          <div
            className="relative max-h-[88dvh] w-full max-w-lg overflow-hidden rounded-2xl bg-cocoa-950 p-2 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <img
              src={receiptPreviewUrl}
              alt="Comprovante PIX selecionado"
              className="max-h-[84dvh] w-full rounded-xl object-contain"
            />
            <button
              type="button"
              className="absolute right-4 top-4 grid size-10 place-items-center rounded-xl bg-cocoa-950/80 text-white shadow-lg"
              onClick={() => setReceiptPreviewOpen(false)}
              aria-label="Fechar visualização do PIX"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>
      ) : null}

      {closingConfirmation ? (
        <div className="fixed inset-0 z-50 grid place-items-end bg-cocoa-950/45 p-3 backdrop-blur-sm sm:place-items-center" role="dialog" aria-modal="true" aria-labelledby="close-title">
          <Card className="safe-bottom w-full max-w-md p-5">
            <h2 id="close-title" className="font-display text-2xl text-cocoa-900">Concluir esta sessão?</h2>
            <p className="mt-2 text-sm leading-6 text-cocoa-800/55">Depois de fechada, as vendas não poderão mais ser alteradas. O relatório ficará disponível no histórico.</p>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <Button variant="secondary" onClick={() => setClosingConfirmation(false)}>Continuar vendendo</Button>
              <Button variant="danger" onClick={() => void handleCloseSession()} disabled={saving}>{saving ? 'Concluindo...' : 'Concluir sessão'}</Button>
            </div>
          </Card>
        </div>
      ) : null}
    </div>
  )
}

interface QuantityControlProps {
  name: string
  quantity: number
  available: number
  quickAddQuantity?: 5
  onChange: (quantity: number) => void
}

function QuantityControl({
  name,
  quantity,
  available,
  quickAddQuantity,
  onChange,
}: QuantityControlProps) {
  return (
    <div className="flex shrink-0 items-center gap-1">
      {quickAddQuantity ? (
        <button
          type="button"
          className="grid size-10 place-items-center rounded-xl bg-tangerine-500 text-xs font-bold text-white shadow-sm disabled:opacity-35"
          onClick={() => onChange(quantity + quickAddQuantity)}
          disabled={quantity + quickAddQuantity > available}
          aria-label={`Adicionar 5 ${name}`}
        >
          +5
        </button>
      ) : null}
      <div className="flex items-center gap-1 rounded-2xl bg-cream-100 p-1">
        <button type="button" className="grid size-10 place-items-center rounded-xl bg-white text-cocoa-900 shadow-sm disabled:opacity-35" onClick={() => onChange(quantity - 1)} disabled={quantity === 0} aria-label={`Remover ${name}`}><Minus className="size-4" /></button>
        <span className="min-w-8 text-center font-display text-lg text-cocoa-900" aria-label={`Quantidade de ${name}`}>{quantity}</span>
        <button type="button" className="grid size-10 place-items-center rounded-xl bg-cocoa-900 text-white shadow-sm disabled:opacity-35" onClick={() => onChange(quantity + 1)} disabled={quantity >= available || available === 0} aria-label={`Adicionar ${name}`}><Plus className="size-4" /></button>
      </div>
    </div>
  )
}
