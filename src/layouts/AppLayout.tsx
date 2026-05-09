import type { PropsWithChildren } from 'react'
import { NavLink } from 'react-router-dom'
import { useBootstrap } from '../hooks/useBootstrap'
import { useAuthStore } from '../stores/authStore'
import { Button } from '../components/ui/Button'

const navigationItems = [
  { to: '/dashboard', label: 'Dashboard', icon: '◌' },
  { to: '/candies', label: 'Candies', icon: '◍' },
  { to: '/session', label: 'Session', icon: '◎' },
]

export function AppLayout({ children }: PropsWithChildren) {
  useBootstrap()

  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[280px_1fr]">
      <aside className="hidden border-r border-white/60 bg-white/55 px-6 py-8 backdrop-blur lg:flex lg:flex-col">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-cocoa-800/50">Candy Shop</p>
          <h1 className="mt-3 font-display text-4xl leading-none text-cocoa-900">Pocket POS</h1>
          <p className="mt-3 text-sm text-cocoa-800/70">
            Fast candy sales tracking for counters, events, and live sessions.
          </p>
        </div>

        <nav className="mt-8 flex flex-col gap-2">
          {navigationItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `rounded-2xl px-4 py-3 text-sm font-bold transition ${
                  isActive ? 'bg-cocoa-900 text-white' : 'text-cocoa-900 hover:bg-white/70'
                }`
              }
            >
              <span className="mr-3 inline-block">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="glass-card mt-auto p-4">
          <p className="text-sm font-semibold text-cocoa-900">{user?.name ?? 'Seller'}</p>
          <p className="mt-1 text-xs text-cocoa-800/60">{user?.email}</p>
          <Button variant="secondary" className="mt-4 w-full" onClick={logout}>
            Logout
          </Button>
        </div>
      </aside>

      <main className="relative">{children}</main>

      <nav className="fixed inset-x-4 bottom-4 z-20 rounded-[28px] border border-white/70 bg-cocoa-900 p-2 shadow-[0_18px_40px_rgba(45,22,15,0.3)] lg:hidden">
        <div className="grid grid-cols-3 gap-2">
          {navigationItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `rounded-2xl px-3 py-3 text-center text-xs font-bold transition ${
                  isActive ? 'bg-white text-cocoa-900' : 'text-white/74'
                }`
              }
            >
              <div className="text-sm">{item.icon}</div>
              <div className="mt-1">{item.label}</div>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
