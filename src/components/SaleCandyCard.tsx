import type { Candy } from '../types/domain'
import { formatCurrency } from '../utils/format'
import { SaleQuantityControl } from './SaleQuantityControl'

interface SaleCandyCardProps {
  candy: Candy
  soldQuantity: number
  saleQuantity: number
  busy: boolean
  onDecrease: () => void
  onIncrease: () => void
  onChange: (value: number) => void
  onSubmit: () => void
}

export function SaleCandyCard({
  candy,
  soldQuantity,
  saleQuantity,
  busy,
  onDecrease,
  onIncrease,
  onChange,
  onSubmit,
}: SaleCandyCardProps) {
  return (
    <article className="glass-card min-w-0 overflow-hidden p-4">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-cocoa-900">{candy.name}</h3>
          <p className="mt-1 text-sm text-cocoa-800/70">{formatCurrency(candy.price)}</p>
        </div>
        <span className="rounded-full bg-cream-100 px-3 py-1 text-xs font-bold text-cocoa-900">
          Live sale
        </span>
      </div>

      <div className="mt-5 rounded-3xl bg-cream-50 p-4">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-cocoa-800/55">Sold quantity</p>
        <p className="mt-2 font-display text-4xl text-cocoa-900">{soldQuantity}</p>
      </div>

      <div className="mt-4 min-w-0">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-cocoa-800/55">Sale to register</p>
        <SaleQuantityControl
          value={saleQuantity}
          busy={busy}
          onDecrease={onDecrease}
          onIncrease={onIncrease}
          onChange={onChange}
          onSubmit={onSubmit}
          submitLabel="Register sale"
        />
      </div>
    </article>
  )
}
