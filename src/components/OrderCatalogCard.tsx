import type { Candy } from '../types/domain'
import { formatCurrency } from '../utils/format'
import { Button } from './ui/Button'

interface OrderCatalogCardProps {
  candy: Candy
  soldQuantity: number
  disabled?: boolean
  onAdd: () => void
}

export function OrderCatalogCard({ candy, soldQuantity, disabled = false, onAdd }: OrderCatalogCardProps) {
  return (
    <article className="glass-card min-w-0 overflow-hidden p-4">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-lg font-bold text-cocoa-900">{candy.name}</h3>
          <p className="mt-1 text-sm text-cocoa-800/70">{formatCurrency(candy.price)}</p>
        </div>
        <span className="rounded-full bg-cream-100 px-3 py-1 text-xs font-bold text-cocoa-900">Catalog</span>
      </div>

      <div className="mt-5 rounded-3xl bg-cream-50 p-4">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-cocoa-800/55">Sold this session</p>
        <p className="mt-2 font-display text-4xl text-cocoa-900">{soldQuantity}</p>
      </div>

      <Button className="mt-4" fullWidth disabled={disabled} onClick={onAdd}>
        Add to order
      </Button>
    </article>
  )
}
