import {
  ArrowLeft,
  CalendarDays,
  ChevronDown,
  Download,
  Image,
  Trash2,
  TriangleAlert,
} from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { getErrorMessage } from '../lib/errorHandler'
import {
  useSalesSessionOrdersQuery,
  useSalesSessionsQuery,
  useSoftDeleteSalesSessionMutation,
} from '../queries/useSalesHistory'
import type { SalesSession } from '../types/session'
import { formatCurrency } from '../utils/inventoryFormat'
import { generateSessionPdf } from '../utils/sessionPdf'
import { getPeriodLabel } from '../utils/sessionSchedule'

const sessionDateFormatter = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'short',
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

const timeFormatter = new Intl.DateTimeFormat('pt-BR', {
  hour: '2-digit',
  minute: '2-digit',
})

export function SalesHistoryPage() {
  const navigate = useNavigate()
  const sessionsQuery = useSalesSessionsQuery()
  const sessions = sessionsQuery.data ?? []
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)
  const [downloadingSessionId, setDownloadingSessionId] = useState<string | null>(null)
  const [sessionToDeleteId, setSessionToDeleteId] = useState<string | null>(null)
  const ordersQuery = useSalesSessionOrdersQuery(selectedSessionId)
  const softDeleteSession = useSoftDeleteSalesSessionMutation()
  const selectedOrders = ordersQuery.data ?? []

  async function handleDownload(session: SalesSession) {
    if (!ordersQuery.data || session.id !== selectedSessionId) return

    setDownloadingSessionId(session.id)
    try {
      await generateSessionPdf(session, ordersQuery.data)
      toast.success('Relatório baixado')
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setDownloadingSessionId(null)
    }
  }

  async function handleSoftDelete(session: SalesSession) {
    try {
      await softDeleteSession.mutateAsync(session.id)
      setSessionToDeleteId(null)
      setSelectedSessionId(null)
      toast.success('Sessão removida do histórico')
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  return (
    <div className="px-4 pb-24 pt-4 lg:px-8 lg:pb-10 lg:pt-8 xl:px-10">
      <div className="mx-auto max-w-5xl">
        <header className="flex items-start gap-3">
          <button
            type="button"
            className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-cocoa-800/55 shadow-sm hover:text-cocoa-900"
            onClick={() => navigate('/vendas')}
            aria-label="Voltar para vendas"
          >
            <ArrowLeft className="size-5" />
          </button>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-tangerine-500">Vendas</p>
            <h1 className="mt-1 font-display text-3xl text-cocoa-900 lg:text-4xl">Histórico de sessões</h1>
            <p className="mt-1 text-sm text-cocoa-800/50">Consulte as vendas e baixe relatórios de sessões encerradas.</p>
          </div>
        </header>

        <section className="mt-5 grid gap-3" aria-label="Sessões de venda">
          {sessionsQuery.isPending ? (
            [0, 1, 2].map((item) => (
              <div key={item} className="h-28 animate-pulse rounded-3xl bg-white" />
            ))
          ) : sessionsQuery.error ? (
            <Card className="p-6 text-center">
              <TriangleAlert className="mx-auto size-6 text-strawberry-500" />
              <p className="mt-3 text-sm font-bold text-cocoa-900">Não foi possível carregar o histórico</p>
              <p className="mt-1 text-xs text-cocoa-800/50">{getErrorMessage(sessionsQuery.error)}</p>
              <Button className="mt-4" variant="secondary" onClick={() => void sessionsQuery.refetch()}>
                Tentar novamente
              </Button>
            </Card>
          ) : sessions.length === 0 ? (
            <Card className="p-8 text-center shadow-none">
              <CalendarDays className="mx-auto size-6 text-cocoa-800/25" />
              <p className="mt-3 text-sm font-bold text-cocoa-900">Nenhuma sessão registrada</p>
              <p className="mt-1 text-xs text-cocoa-800/50">As sessões aparecerão aqui depois de iniciadas.</p>
            </Card>
          ) : (
            sessions.map((session) => {
              const selected = selectedSessionId === session.id
              const closed = session.status === 'closed'

              return (
                <Card key={session.id} className="overflow-hidden shadow-none">
                  <button
                    type="button"
                    className="flex min-h-24 w-full items-center gap-3 p-4 text-left hover:bg-cream-50/70"
                    onClick={() => {
                      setSelectedSessionId(selected ? null : session.id)
                      setSessionToDeleteId(null)
                    }}
                    aria-expanded={selected}
                  >
                    <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-cream-100 text-cocoa-900">
                      <CalendarDays className="size-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-sm font-bold capitalize text-cocoa-900">
                          {sessionDateFormatter.format(new Date(session.openedAt))}
                        </h2>
                        <span className={closed
                          ? 'rounded-full bg-cream-100 px-2 py-0.5 text-[10px] font-bold text-cocoa-800/55'
                          : 'rounded-full bg-mint-50 px-2 py-0.5 text-[10px] font-bold text-mint-500'}
                        >
                          {closed ? 'Encerrada' : 'Aberta'}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-cocoa-800/50">
                        {getPeriodLabel(session.period)} · {session.orderCount} {session.orderCount === 1 ? 'pedido' : 'pedidos'}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="font-display text-xl text-cocoa-900">{formatCurrency(session.total)}</p>
                      <p className="text-[10px] text-cocoa-800/40">Abrir {timeFormatter.format(new Date(session.openedAt))}</p>
                    </div>
                    <ChevronDown className={selected ? 'size-4 rotate-180 text-cocoa-800/40' : 'size-4 text-cocoa-800/40'} />
                  </button>

                  {selected ? (
                    <div className="border-t border-cocoa-900/8 bg-cream-50/55 p-3 sm:p-4">
                      {ordersQuery.isPending ? (
                        <div className="grid gap-2">
                          {[0, 1].map((item) => <div key={item} className="h-16 animate-pulse rounded-2xl bg-white" />)}
                        </div>
                      ) : ordersQuery.error ? (
                        <p className="rounded-2xl bg-strawberry-50 p-4 text-sm font-bold text-strawberry-600">
                          Não foi possível carregar as vendas desta sessão.
                        </p>
                      ) : selectedOrders.length === 0 ? (
                        <p className="rounded-2xl bg-white p-4 text-center text-sm text-cocoa-800/50">
                          Nenhuma venda registrada nesta sessão.
                        </p>
                      ) : (
                        <div className="grid gap-2">
                          {selectedOrders.map((order, index) => (
                            <div key={order.id} className="flex items-start gap-3 rounded-2xl bg-white p-3">
                              <div className="grid size-8 shrink-0 place-items-center rounded-xl bg-mint-50 text-xs font-bold text-mint-500">
                                {selectedOrders.length - index}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-2">
                                  <p className="text-sm font-bold text-cocoa-900">{formatCurrency(order.total)}</p>
                                  <p className="text-[10px] text-cocoa-800/40">{timeFormatter.format(new Date(order.createdAt))}</p>
                                </div>
                                <p className="mt-1 text-xs leading-5 text-cocoa-800/55">
                                  {order.lines.map((line) => `${line.quantity}× ${line.candyName}`).join(' · ')}
                                </p>
                                {order.pixReceiptUrl ? (
                                  <a
                                    href={order.pixReceiptUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-mint-500"
                                  >
                                    <Image className="size-3" /> Ver PIX
                                  </a>
                                ) : null}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {closed ? (
                        <>
                          <div className="mt-3 grid gap-2 sm:flex">
                            <Button
                              variant="secondary"
                              className="w-full sm:w-auto"
                              onClick={() => void handleDownload(session)}
                              disabled={ordersQuery.isPending || Boolean(ordersQuery.error) || downloadingSessionId === session.id}
                            >
                              <Download className="size-4" />
                              {downloadingSessionId === session.id ? 'Gerando PDF...' : 'Baixar relatório PDF'}
                            </Button>
                            <Button
                              variant="outline"
                              className="w-full border-strawberry-500/25 text-strawberry-600 hover:bg-strawberry-50 sm:w-auto"
                              onClick={() => setSessionToDeleteId(session.id)}
                              disabled={softDeleteSession.isPending}
                            >
                              <Trash2 className="size-4" />
                              Excluir sessão
                            </Button>
                          </div>

                          {sessionToDeleteId === session.id ? (
                            <div className="mt-3 rounded-2xl border border-strawberry-500/20 bg-strawberry-50 p-4">
                              <div className="flex items-start gap-3">
                                <TriangleAlert className="mt-0.5 size-5 shrink-0 text-strawberry-600" />
                                <div>
                                  <p className="text-sm font-bold text-cocoa-900">Excluir esta sessão do histórico?</p>
                                  <p className="mt-1 text-xs leading-5 text-cocoa-800/60">
                                    A sessão será ocultada, mas vendas, valores e comprovantes permanecerão armazenados para recuperação. Nenhum dado será apagado definitivamente.
                                  </p>
                                </div>
                              </div>
                              <div className="mt-4 grid grid-cols-2 gap-2">
                                <Button
                                  variant="secondary"
                                  onClick={() => setSessionToDeleteId(null)}
                                  disabled={softDeleteSession.isPending}
                                >
                                  Cancelar
                                </Button>
                                <Button
                                  variant="danger"
                                  onClick={() => void handleSoftDelete(session)}
                                  disabled={softDeleteSession.isPending}
                                >
                                  {softDeleteSession.isPending ? 'Excluindo...' : 'Confirmar exclusão'}
                                </Button>
                              </div>
                            </div>
                          ) : null}
                        </>
                      ) : null}
                    </div>
                  ) : null}
                </Card>
              )
            })
          )}
        </section>
      </div>
    </div>
  )
}
