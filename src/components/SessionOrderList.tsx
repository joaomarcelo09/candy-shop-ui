import type { SessionOrder } from '../types/domain'
import { formatCurrency, formatShortDate } from '../utils/format'
import { Button } from './ui/Button'

interface SessionOrderListProps {
  orders: SessionOrder[]
  sessionOpen: boolean
  deletingOrderIds: string[]
  onDelete: (orderId: string) => void
}

export function SessionOrderList({
  orders,
  sessionOpen,
  deletingOrderIds,
  onDelete,
}: SessionOrderListProps) {
  return (
    <section className="glass-card p-5">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-cocoa-800/55">Order history</p>
        <h3 className="mt-2 text-xl font-bold text-cocoa-900">Submitted orders</h3>
        <p className="mt-2 text-sm text-cocoa-800/70">Newest first so corrections stay close to the latest sale.</p>
      </div>

      {orders.length === 0 ? (
        <div className="mt-5 rounded-3xl border border-dashed border-cocoa-900/15 bg-cream-50 p-5 text-sm text-cocoa-800/65">
          No orders submitted in this session yet.
        </div>
      ) : (
        <div className="mt-5 space-y-4">
          {orders.map((order) => {
            const deleting = deletingOrderIds.includes(order.id)

            return (
              <article key={order.id} className="rounded-[26px] border border-cocoa-900/10 bg-white/70 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-cocoa-900">Order #{order.id.slice(0, 8)}</p>
                    <p className="mt-1 text-xs text-cocoa-800/60">{formatShortDate(order.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-[0.18em] text-cocoa-800/50">Total</p>
                    <p className="mt-1 font-bold text-cocoa-900">{formatCurrency(order.total)}</p>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  {order.items.map((item) => (
                    <div
                      key={`${order.id}-${item.candyId}`}
                      className="flex items-center justify-between gap-3 rounded-2xl bg-cream-50 px-3 py-2 text-sm"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-cocoa-900">{item.candyName}</p>
                        <p className="text-cocoa-800/60">
                          {item.quantity} x {formatCurrency(item.unitPrice)}
                        </p>
                      </div>
                      <span className="font-bold text-cocoa-900">{formatCurrency(item.subtotal)}</span>
                    </div>
                  ))}
                </div>

                {sessionOpen ? (
                  <div className="mt-4">
                    <Button variant="danger" disabled={deleting} onClick={() => onDelete(order.id)}>
                      {deleting ? 'Deleting...' : 'Delete order'}
                    </Button>
                  </div>
                ) : null}
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}
