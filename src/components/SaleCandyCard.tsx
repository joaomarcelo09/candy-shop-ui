import { clsx } from 'clsx'
import type { Candy } from '../types/domain'
import { formatCurrency } from '../utils/format'
import { Button } from './ui/Button'

interface SaleCandyCardProps {
  candy: Candy
  quantity: number
  busy: boolean
  onAdd: () => void
}

export function SaleCandyCard({ candy, quantity, busy, onAdd }: SaleCandyCardProps) {
  return (
    <article className="glass-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-cocoa-900">{candy.name}</h3>
          <p className="mt-1 text-sm text-cocoa-800/70">{formatCurrency(candy.price)}</p>
        </div>
        <span className="rounded-full bg-cream-100 px-3 py-1 text-xs font-bold text-cocoa-900">
          Live sale
        </span>
      </div>

      <div className="mt-5 grid grid-cols-[60px_1fr_60px] items-center gap-3">
        <button
          type="button"
          disabled
          className="min-h-14 rounded-2xl border border-cocoa-900/10 bg-white/70 text-2xl font-bold text-cocoa-800/30"
          aria-label={`Decrease ${candy.name} quantity`}
        >
          -
        </button>
        <div
          className={clsx(
            'min-h-14 rounded-2xl bg-cocoa-900 px-4 py-3 text-center text-2xl font-bold text-white transition',
            busy && 'animate-pulse',
          )}
        >
          {quantity}
        </div>
        <Button
          type="button"
          onClick={onAdd}
          disabled={busy}
          className="min-h-14 rounded-2xl px-0 text-2xl"
          aria-label={`Increase ${candy.name} quantity`}
        >
          +
        </Button>
      </div>

      <p className="mt-3 text-xs text-cocoa-800/60">
        Sales are instant. Corrections should be done from the backend until a reverse-sale endpoint exists.
      </p>
    </article>
  )
}
