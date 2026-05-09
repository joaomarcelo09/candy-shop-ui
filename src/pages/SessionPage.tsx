import { useMemo } from 'react'
import { SaleCandyCard } from '../components/SaleCandyCard'
import { Button } from '../components/ui/Button'
import { Skeleton } from '../components/ui/Skeleton'
import { useCandyStore } from '../stores/candyStore'
import { useSessionStore } from '../stores/sessionStore'
import { formatCurrency, formatShortDate } from '../utils/format'

export function SessionPage() {
  const candies = useCandyStore((state) => state.candies)
  const loadingCandies = useCandyStore((state) => state.loading)
  const activeSession = useSessionStore((state) => state.activeSession)
  const loadingSession = useSessionStore((state) => state.loading)
  const submittingSaleIds = useSessionStore((state) => state.submittingSaleIds)
  const totals = useSessionStore((state) => state.totals)
  const createSession = useSessionStore((state) => state.createSession)
  const registerSale = useSessionStore((state) => state.registerSale)
  const closeSession = useSessionStore((state) => state.closeSession)

  const quantityMap = useMemo(() => {
    return Object.fromEntries(activeSession?.items.map((item) => [item.candyId, item.quantity]) ?? [])
  }, [activeSession])

  if (loadingCandies && candies.length === 0) {
    return (
      <div className="page-shell grid gap-4">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  if (!activeSession) {
    return (
      <div className="page-shell">
        <section className="glass-card overflow-hidden p-5 sm:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-cocoa-800/55">Session control</p>
          <h2 className="section-title mt-3">Ready to start selling</h2>
          <p className="mt-3 max-w-xl text-sm text-cocoa-800/70">
            Open a live session before registering any candy sale. Every candy will start visually at quantity zero.
          </p>

          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
            <Button disabled={loadingSession || candies.length === 0} onClick={() => createSession(candies)}>
              {loadingSession ? 'Starting...' : 'Start Session'}
            </Button>
            <p className="text-sm text-cocoa-800/60">
              {candies.length === 0
                ? 'Add candies first so the selling screen has products to show.'
                : `${candies.length} candies ready for sale.`}
            </p>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="page-shell">
      <section className="glass-card p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-cocoa-800/55">Live session</p>
            <h2 className="section-title mt-2">Main selling screen</h2>
            <p className="mt-2 text-sm text-cocoa-800/70">
              Large touch targets, instant optimistic counts, and no forms during sales.
            </p>
          </div>
          <Button
            variant="danger"
            disabled={loadingSession || totals.candiesSold === 0}
            onClick={() => closeSession()}
          >
            {loadingSession ? 'Finishing...' : 'Finish Session'}
          </Button>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <div className="rounded-3xl bg-cream-50 p-4">
            <p className="text-sm text-cocoa-800/55">Session date</p>
            <p className="mt-1 text-lg font-bold text-cocoa-900">{formatShortDate(activeSession.date)}</p>
          </div>
          <div className="rounded-3xl bg-white/70 p-4">
            <p className="text-sm text-cocoa-800/55">Status</p>
            <p className="mt-1 text-lg font-bold text-mint-500">{activeSession.status}</p>
          </div>
          <div className="rounded-3xl bg-cocoa-900 p-4 text-white">
            <p className="text-sm text-white/60">Live estimated total</p>
            <p className="mt-1 font-display text-3xl">{formatCurrency(totals.estimatedTotal)}</p>
          </div>
        </div>
      </section>

      <section className="mt-5 grid gap-4 lg:hidden">
        {candies.map((candy) => (
          <SaleCandyCard
            key={candy.id}
            candy={candy}
            quantity={quantityMap[candy.id] ?? 0}
            busy={submittingSaleIds.includes(candy.id)}
            onAdd={() => registerSale(candies, candy.id)}
          />
        ))}
      </section>

      <section className="mt-5 hidden lg:block">
        <div className="glass-card overflow-hidden">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-cream-50 text-left text-sm text-cocoa-800/70">
                <th className="px-5 py-4">Candy</th>
                <th className="px-5 py-4">Price</th>
                <th className="px-5 py-4">Quantity</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {candies.map((candy) => (
                <tr key={candy.id} className="border-t border-cocoa-900/10">
                  <td className="px-5 py-4 font-semibold text-cocoa-900">{candy.name}</td>
                  <td className="px-5 py-4 text-cocoa-800">{formatCurrency(candy.price)}</td>
                  <td className="px-5 py-4 text-cocoa-900">{quantityMap[candy.id] ?? 0}</td>
                  <td className="px-5 py-4 text-right">
                    <Button disabled={submittingSaleIds.includes(candy.id)} onClick={() => registerSale(candies, candy.id)}>
                      Add sale
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
