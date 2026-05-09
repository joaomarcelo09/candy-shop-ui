import type { DraftOrderItem } from '../types/domain'
import { formatCurrency } from '../utils/format'
import { SaleQuantityControl } from './SaleQuantityControl'
import { Button } from './ui/Button'

interface DraftOrderPanelProps {
  items: DraftOrderItem[]
  total: number
  disabled?: boolean
  onDecrease: (candyId: string, nextQuantity: number) => void
  onIncrease: (candyId: string, nextQuantity: number) => void
  onChange: (candyId: string, nextQuantity: number) => void
  onRemove: (candyId: string) => void
  onSubmit: () => void
  onClear: () => void
}

export function DraftOrderPanel({
  items,
  total,
  disabled = false,
  onDecrease,
  onIncrease,
  onChange,
  onRemove,
  onSubmit,
  onClear,
}: DraftOrderPanelProps) {
  return (
    <section className="glass-card p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-cocoa-800/55">Draft order</p>
          <h3 className="mt-2 text-xl font-bold text-cocoa-900">Build the current ticket</h3>
          <p className="mt-2 text-sm text-cocoa-800/70">Adjust quantities before sending one request to the session.</p>
        </div>
        <Button variant="ghost" disabled={disabled || items.length === 0} onClick={onClear}>
          Clear
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="mt-5 rounded-3xl border border-dashed border-cocoa-900/15 bg-cream-50 p-5 text-sm text-cocoa-800/65">
          Add candies from the catalog to start a new order.
        </div>
      ) : (
        <div className="mt-5 space-y-4">
          {items.map((item) => (
            <article key={item.candyId} className="rounded-[26px] border border-cocoa-900/10 bg-white/70 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h4 className="truncate font-bold text-cocoa-900">{item.candyName}</h4>
                  <p className="mt-1 text-sm text-cocoa-800/65">{formatCurrency(item.unitPrice)} each</p>
                </div>
                <button
                  type="button"
                  disabled={disabled}
                  className="text-sm font-bold text-strawberry-600 disabled:opacity-40"
                  onClick={() => onRemove(item.candyId)}
                >
                  Remove
                </button>
              </div>

              <div className="mt-4">
                <SaleQuantityControl
                  value={item.quantity}
                  busy={disabled}
                  onDecrease={() => onDecrease(item.candyId, item.quantity - 1)}
                  onIncrease={() => onIncrease(item.candyId, item.quantity + 1)}
                  onChange={(value) => onChange(item.candyId, value)}
                  hideSubmit
                />
              </div>

              <div className="mt-3 flex items-center justify-between text-sm text-cocoa-800/70">
                <span>Line subtotal</span>
                <span className="font-bold text-cocoa-900">{formatCurrency(item.subtotal)}</span>
              </div>
            </article>
          ))}
        </div>
      )}

      <div className="mt-5 rounded-3xl bg-cocoa-900 p-4 text-white">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-sm text-white/60">Order total</p>
            <p className="mt-1 font-display text-3xl">{formatCurrency(total)}</p>
          </div>
          <Button disabled={disabled || items.length === 0} onClick={onSubmit}>
            {disabled ? 'Registering...' : 'Register order'}
          </Button>
        </div>
      </div>
    </section>
  )
}
