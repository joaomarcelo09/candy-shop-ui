import { useMemo } from 'react'
import { DraftOrderPanel } from '../components/DraftOrderPanel'
import { OrderCatalogCard } from '../components/OrderCatalogCard'
import { SessionOrderList } from '../components/SessionOrderList'
import { Button } from '../components/ui/Button'
import { Skeleton } from '../components/ui/Skeleton'
import { useCandyStore } from '../stores/candyStore'
import { useSessionStore } from '../stores/sessionStore'
import { formatCurrency, formatShortDate } from '../utils/format'
import { buildDraftTotal } from '../utils/session'

export function SessionPage() {
  const candies = useCandyStore((state) => state.candies)
  const loadingCandies = useCandyStore((state) => state.loading)
  const activeSession = useSessionStore((state) => state.activeSession)
  const orders = useSessionStore((state) => state.orders)
  const draftOrder = useSessionStore((state) => state.draftOrder)
  const loadingSession = useSessionStore((state) => state.loading)
  const submittingOrder = useSessionStore((state) => state.submittingOrder)
  const deletingOrderIds = useSessionStore((state) => state.deletingOrderIds)
  const totals = useSessionStore((state) => state.totals)
  const createSession = useSessionStore((state) => state.createSession)
  const addCandyToDraft = useSessionStore((state) => state.addCandyToDraft)
  const updateDraftQuantity = useSessionStore((state) => state.updateDraftQuantity)
  const removeDraftItem = useSessionStore((state) => state.removeDraftItem)
  const clearDraftOrder = useSessionStore((state) => state.clearDraftOrder)
  const submitDraftOrder = useSessionStore((state) => state.submitDraftOrder)
  const deleteOrder = useSessionStore((state) => state.deleteOrder)
  const closeSession = useSessionStore((state) => state.closeSession)

  const soldQuantityByCandy = useMemo(() => {
    return Object.fromEntries(activeSession?.items.map((item) => [item.candyId, item.quantity]) ?? [])
  }, [activeSession])

  const draftTotal = useMemo(() => buildDraftTotal(draftOrder), [draftOrder])
  const sessionOpen = activeSession?.status === 'OPEN'

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
            Open a live session before creating orders. Every candy will start visually at quantity zero.
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
            <h2 className="section-title mt-2">Order-based selling</h2>
            <p className="mt-2 text-sm text-cocoa-800/70">
              Build a multi-candy order, submit it once, and delete mistakes from the history while the session stays open.
            </p>
          </div>
          <Button
            variant="danger"
            disabled={loadingSession || totals.candiesSold === 0 || !sessionOpen}
            onClick={() => closeSession()}
          >
            {loadingSession ? 'Finishing...' : 'Finish Session'}
          </Button>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-4">
          <div className="rounded-3xl bg-cream-50 p-4">
            <p className="text-sm text-cocoa-800/55">Session date</p>
            <p className="mt-1 text-lg font-bold text-cocoa-900">{formatShortDate(activeSession.date)}</p>
          </div>
          <div className="rounded-3xl bg-white/70 p-4">
            <p className="text-sm text-cocoa-800/55">Status</p>
            <p className="mt-1 text-lg font-bold text-mint-500">{activeSession.status}</p>
          </div>
          <div className="rounded-3xl bg-white/70 p-4">
            <p className="text-sm text-cocoa-800/55">Orders</p>
            <p className="mt-1 text-lg font-bold text-cocoa-900">{orders.length}</p>
          </div>
          <div className="rounded-3xl bg-cocoa-900 p-4 text-white">
            <p className="text-sm text-white/60">Live session total</p>
            <p className="mt-1 font-display text-3xl">{formatCurrency(totals.estimatedTotal)}</p>
          </div>
        </div>
      </section>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
        <div className="order-2 grid gap-4 lg:order-1">
          <section className="glass-card p-5">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-cocoa-800/55">Catalog</p>
                <h3 className="mt-2 text-xl font-bold text-cocoa-900">Add candies to the current order</h3>
                <p className="mt-2 text-sm text-cocoa-800/70">
                  Tap any candy to add it to the draft. Repeated taps increase the quantity.
                </p>
              </div>
              <span className="rounded-full bg-cream-50 px-3 py-2 text-sm font-bold text-cocoa-900">
                {candies.length} candies
              </span>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {candies.map((candy) => (
                <OrderCatalogCard
                  key={candy.id}
                  candy={candy}
                  soldQuantity={soldQuantityByCandy[candy.id] ?? 0}
                  disabled={!sessionOpen || submittingOrder}
                  onAdd={() => addCandyToDraft(candy)}
                />
              ))}
            </div>
          </section>

          <SessionOrderList
            orders={orders}
            sessionOpen={sessionOpen}
            deletingOrderIds={deletingOrderIds}
            onDelete={(orderId) => deleteOrder(orderId, candies)}
          />
        </div>

        <div className="order-1 grid gap-4 lg:order-2 lg:sticky lg:top-6">
          <section className="glass-card p-5">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-cocoa-800/55">Session summary</p>
            <h3 className="mt-2 text-xl font-bold text-cocoa-900">Keep the totals visible</h3>

            <div className="mt-5 grid gap-3">
              <div className="rounded-3xl bg-cream-50 p-4">
                <p className="text-sm text-cocoa-800/60">Candies sold</p>
                <p className="mt-1 font-display text-3xl text-cocoa-900">{totals.candiesSold}</p>
              </div>
              <div className="rounded-3xl border border-cocoa-900/10 bg-white/70 p-4">
                <p className="text-sm text-cocoa-800/60">Current draft total</p>
                <p className="mt-1 text-xl font-bold text-cocoa-900">{formatCurrency(draftTotal)}</p>
              </div>
            </div>
          </section>

          <DraftOrderPanel
            items={draftOrder}
            total={draftTotal}
            disabled={!sessionOpen || submittingOrder}
            onDecrease={(candyId, nextQuantity) => updateDraftQuantity(candyId, nextQuantity)}
            onIncrease={(candyId, nextQuantity) => updateDraftQuantity(candyId, nextQuantity)}
            onChange={(candyId, nextQuantity) => updateDraftQuantity(candyId, nextQuantity)}
            onRemove={removeDraftItem}
            onSubmit={() => submitDraftOrder(candies)}
            onClear={clearDraftOrder}
          />
        </div>
      </div>
    </div>
  )
}
