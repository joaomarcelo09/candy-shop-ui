import { CalendarClock, Clock3, History, Play, ShoppingBag, Sun, Sunset } from 'lucide-react'
import { useEffect, useMemo } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { getErrorMessage } from '../lib/errorHandler'
import { useSessionStore } from '../stores/sessionStore'
import { getSessionAvailability } from '../utils/sessionSchedule'
import { formatCurrency } from '../utils/inventoryFormat'

const dateTimeFormatter = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'long',
  day: '2-digit',
  month: 'long',
  hour: '2-digit',
  minute: '2-digit',
})

export function SalesPage() {
  const navigate = useNavigate()
  const activeSession = useSessionStore((state) => state.activeSession)
  const loading = useSessionStore((state) => state.loading)
  const saving = useSessionStore((state) => state.saving)
  const focusModeDismissed = useSessionStore((state) => state.focusModeDismissed)
  const createSession = useSessionStore((state) => state.createSession)
  const resumeSessionFocus = useSessionStore((state) => state.resumeSessionFocus)
  const mockScheduleEnabled =
    import.meta.env.VITE_ENABLE_API_MOCKS === 'true' &&
    import.meta.env.VITE_MOCK_ALLOW_SESSION_ANYTIME === 'true'
  const availability = useMemo(
    () => getSessionAvailability(new Date(), mockScheduleEnabled),
    [mockScheduleEnabled],
  )

  useEffect(() => {
    if (activeSession?.status === 'open' && !focusModeDismissed) {
      navigate(`/vendas/sessao/${activeSession.id}`, { replace: true })
    }
  }, [activeSession, focusModeDismissed, navigate])

  async function handleStartSession() {
    try {
      const session = await createSession()
      toast.success('Sessão iniciada')
      navigate(`/vendas/sessao/${session.id}`)
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  if (activeSession?.status === 'open' && focusModeDismissed) {
    return (
      <div className="px-4 pb-24 pt-4 lg:px-8 lg:pb-10 lg:pt-8 xl:px-10">
        <div className="mx-auto max-w-5xl">
          <header className="hidden lg:block">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-tangerine-500">Operação</p>
            <h1 className="mt-2 font-display text-4xl text-cocoa-900">Vendas</h1>
          </header>

          <Card className="overflow-hidden lg:mt-7">
            <div className="bg-cocoa-950 px-5 py-6 text-white sm:px-7 sm:py-8">
              <div className="flex items-start justify-between gap-4">
                <div className="grid size-12 place-items-center rounded-2xl bg-mint-500/15 text-mint-500">
                  <ShoppingBag className="size-6" />
                </div>
                <span className="rounded-full bg-mint-500/15 px-3 py-1 text-xs font-bold text-mint-500">
                  Sessão aberta
                </span>
              </div>
              <h2 className="mt-5 font-display text-3xl">Venda em andamento</h2>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-white/45">Total vendido</p>
                  <p className="mt-1 font-display text-2xl">{formatCurrency(activeSession.total)}</p>
                </div>
                <div>
                  <p className="text-xs text-white/45">Pedidos</p>
                  <p className="mt-1 font-display text-2xl">{activeSession.orderCount}</p>
                </div>
              </div>
            </div>

            <div className="grid gap-2 p-4 sm:grid-cols-2 sm:p-7">
              <Button
                className="min-h-14 text-base"
                onClick={() => {
                  resumeSessionFocus()
                  navigate(`/vendas/sessao/${activeSession.id}`)
                }}
              >
                <Play className="size-5 fill-current" />
                Voltar para a venda
              </Button>
              <Button
                variant="secondary"
                className="min-h-14 text-base"
                onClick={() => navigate('/vendas/historico')}
              >
                <History className="size-5" />
                Ver histórico
              </Button>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 pb-24 pt-4 lg:px-8 lg:pb-10 lg:pt-8 xl:px-10">
      <div className="mx-auto max-w-5xl">
        <header className="hidden lg:block">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-tangerine-500">Operação</p>
          <h1 className="mt-2 font-display text-4xl text-cocoa-900">Vendas</h1>
          <p className="mt-2 text-sm text-cocoa-800/55">Abra a sessão do culto e registre pedidos com poucos toques.</p>
        </header>

        <Card className="overflow-hidden lg:mt-7">
          <div className="bg-cocoa-950 px-5 py-6 text-white sm:px-7 sm:py-8">
            <div className="grid size-12 place-items-center rounded-2xl bg-white/10">
              <ShoppingBag className="size-6" />
            </div>
            <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-white/45">Próxima venda</p>
            <h2 className="mt-1 font-display text-3xl">Iniciar sessão</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-white/60">
              Ao começar, a tela entra em modo foco: a navegação desaparece e o total fica sempre à vista.
            </p>
          </div>

          <div className="p-4 sm:p-7">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-2xl bg-cream-50 p-4">
                <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-tangerine-50 text-tangerine-500">
                  <Sun className="size-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-cocoa-900">Domingo de manhã</p>
                  <p className="text-xs text-cocoa-800/50">Abrir 11:00–11:30 · fecha 12:00</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-cream-50 p-4">
                <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-strawberry-50 text-strawberry-500">
                  <Sunset className="size-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-cocoa-900">Domingo à noite</p>
                  <p className="text-xs text-cocoa-800/50">Abrir 18:00–18:30 · fecha 22:00</p>
                </div>
              </div>
            </div>

            {!availability.available ? (
              <div className="mt-4 flex items-start gap-3 rounded-2xl border border-cocoa-900/8 bg-white p-4">
                <CalendarClock className="mt-0.5 size-5 shrink-0 text-cocoa-800/45" />
                <div>
                  <p className="text-sm font-bold text-cocoa-900">Fora do horário de abertura</p>
                  <p className="mt-0.5 text-xs leading-5 text-cocoa-800/55">
                    Próxima abertura: {dateTimeFormatter.format(availability.nextOpeningAt)}.
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-4 flex items-center gap-3 rounded-2xl bg-mint-50 p-4 text-mint-500">
                <Clock3 className="size-5" />
                <p className="text-sm font-bold">Horário aberto para iniciar a sessão.</p>
              </div>
            )}

            <Button
              className="mt-5 min-h-14 w-full text-base sm:w-auto sm:min-w-56"
              onClick={handleStartSession}
              disabled={!availability.available || loading || saving}
            >
              <Play className="size-5 fill-current" />
              {loading ? 'Verificando sessão...' : 'Iniciar sessão'}
            </Button>
            <Button
              variant="secondary"
              className="mt-2 min-h-12 w-full sm:ml-2 sm:mt-5 sm:w-auto"
              onClick={() => navigate('/vendas/historico')}
            >
              <History className="size-4" />
              Ver histórico de vendas
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
