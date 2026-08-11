import { BarChart3, Boxes, Candy, LogOut, ShoppingBag } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useEffect } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { cn } from '../lib/utils'
import { useAuthStore } from '../stores/authStore'
import { useSessionStore } from '../stores/sessionStore'

const navigation = [
  { label: 'Vender', description: 'Nova venda', icon: ShoppingBag, available: true, to: '/vendas' },
  { label: 'Estoque', description: 'Doces e lotes', icon: Boxes, available: true, to: '/estoque' },
  { label: 'Dados', description: 'Resultados', icon: BarChart3, available: false },
] as const

export function MobileAppShell() {
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const queryClient = useQueryClient()
  const location = useLocation()
  const navigate = useNavigate()
  const fetchActiveSession = useSessionStore((state) => state.fetchActiveSession)
  const focusModeDismissed = useSessionStore((state) => state.focusModeDismissed)
  const pageTitle = location.pathname.startsWith('/vendas') ? 'Vendas' : 'Controle de estoque'

  useEffect(() => {
    void fetchActiveSession()
      .then((session) => {
        if (session?.status === 'open' && !focusModeDismissed) {
          navigate(`/vendas/sessao/${session.id}`, { replace: true })
        }
      })
      .catch(() => undefined)
  }, [fetchActiveSession, focusModeDismissed, navigate])

  function handleLogout() {
    queryClient.clear()
    useSessionStore.getState().reset()
    logout()
  }

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[17rem_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-dvh border-r border-cocoa-900/8 bg-cocoa-950 px-5 py-6 text-white lg:flex lg:flex-col">
        <div className="flex items-center gap-3 px-2">
          <div className="relative grid size-11 shrink-0 place-items-center rounded-2xl bg-white text-cocoa-950" aria-hidden="true">
            <Candy className="size-6" strokeWidth={2.2} />
            <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-cocoa-950 bg-tangerine-500" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-[11px] font-bold uppercase tracking-[0.18em] text-white/40">Loja de doces</p>
            <p className="truncate font-display text-lg">Painel de vendas</p>
          </div>
        </div>

        <nav className="mt-10 grid gap-2" aria-label="Navegação principal">
          {navigation.map((item) => {
            const Icon = item.icon

            if (!item.available) {
              return (
                <button
                  key={item.label}
                  type="button"
                  className="flex min-h-14 items-center gap-3 rounded-2xl px-3 text-left text-white/40 transition hover:bg-white/5 hover:text-white/55"
                  onClick={() => toast(`${item.label} estará disponível em breve`)}
                  aria-label={`${item.label}, em breve`}
                >
                  <Icon className="size-5 shrink-0" strokeWidth={2.1} />
                  <span>
                    <span className="block text-sm font-bold">{item.label}</span>
                    <span className="block text-[11px]">{item.description}</span>
                  </span>
                </button>
              )
            }

            return (
              <NavLink
                key={item.label}
                to={item.to}
                className={({ isActive }) => cn(
                  'flex min-h-14 items-center gap-3 rounded-2xl px-3 text-white/60 transition hover:bg-white/8 hover:text-white',
                  isActive && 'bg-white text-cocoa-950 shadow-sm hover:bg-white hover:text-cocoa-950',
                )}
              >
                <Icon className="size-5 shrink-0" strokeWidth={2.1} />
                <span>
                  <span className="block text-sm font-bold">{item.label}</span>
                  <span className="block text-[11px] opacity-60">{item.description}</span>
                </span>
              </NavLink>
            )
          })}
        </nav>

        <div className="mt-auto rounded-[22px] border border-white/10 bg-white/6 p-3">
          <div className="min-w-0 px-1">
            <p className="truncate text-sm font-bold">{user?.name ?? 'Vendedor'}</p>
            <p className="mt-0.5 truncate text-xs text-white/45">{user?.email}</p>
          </div>
          <button
            type="button"
            className="mt-3 flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-white/8 text-xs font-bold text-white/70 transition hover:bg-white hover:text-cocoa-950"
            onClick={handleLogout}
          >
            <LogOut className="size-4" />
            Sair da conta
          </button>
        </div>
      </aside>

      <div className="min-w-0 pb-24 lg:pb-0">
        <header className="sticky top-0 z-30 border-b border-cocoa-900/5 bg-cream-50/88 backdrop-blur-xl lg:hidden">
          <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="relative grid size-9 shrink-0 place-items-center rounded-[14px] bg-cocoa-900 text-white shadow-sm" aria-hidden="true">
              <Candy className="size-5" strokeWidth={2.2} />
              <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-cream-50 bg-tangerine-500" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-bold uppercase tracking-[0.16em] text-cocoa-800/45">
                Loja de doces
              </p>
              <p className="truncate text-sm font-bold text-cocoa-900">{pageTitle}</p>
            </div>
          </div>
            <button
              type="button"
              className="grid size-10 shrink-0 place-items-center rounded-xl text-cocoa-800/45 hover:bg-white"
              onClick={handleLogout}
              aria-label="Sair da conta"
            >
              <LogOut className="size-4" />
            </button>
        </div>
      </header>

        <main className="mx-auto w-full max-w-lg lg:max-w-none">
          <Outlet />
        </main>

        <nav
          className="safe-bottom fixed inset-x-0 bottom-0 z-40 mx-auto max-w-lg border-t border-white/70 bg-cocoa-950/96 px-3 pt-2 shadow-[0_-16px_40px_rgba(45,22,15,0.18)] backdrop-blur-xl lg:hidden"
          aria-label="Navegação principal"
        >
          <div className="grid grid-cols-3 gap-1">
            {navigation.map((item) => {
              const Icon = item.icon

              if (!item.available) {
                return (
                  <button
                    key={item.label}
                    type="button"
                    className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl text-white/45 transition active:bg-white/5"
                    onClick={() => toast(`${item.label} estará disponível em breve`)}
                    aria-label={`${item.label}, em breve`}
                  >
                    <Icon className="size-5" strokeWidth={2.2} />
                    <span className="text-[11px] font-bold">{item.label}</span>
                  </button>
                )
              }

              return (
                <NavLink
                  key={item.label}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl text-white/55 transition',
                      isActive && 'bg-white text-cocoa-900 shadow-sm',
                    )
                  }
                >
                  <Icon className="size-5" strokeWidth={2.2} />
                  <span className="text-[11px] font-bold">{item.label}</span>
                </NavLink>
              )
            })}
          </div>
        </nav>
      </div>
    </div>
  )
}
