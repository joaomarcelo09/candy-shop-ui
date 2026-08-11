import { PencilLine } from 'lucide-react'
import type { InventoryItem } from '../types/inventory'
import { formatCurrency } from '../utils/inventoryFormat'
import { Badge } from './ui/Badge'
import { Card } from './ui/Card'

interface StockItemCardProps {
  item: InventoryItem
  onEditQuantity: () => void
}

function getStockStatus(quantity: number) {
  if (quantity === 0) {
    return { label: 'Sem estoque', variant: 'danger' as const }
  }

  if (quantity <= 10) {
    return { label: 'Estoque baixo', variant: 'warning' as const }
  }

  return { label: 'Disponível', variant: 'success' as const }
}

export function StockItemCard({ item, onEditQuantity }: StockItemCardProps) {
  const status = getStockStatus(item.quantity)

  return (
    <Card className="stock-list p-3 transition hover:border-tangerine-500/20 hover:shadow-[0_16px_40px_rgba(84,42,20,0.1)] lg:p-4">
      <div className="flex items-center gap-3">
        <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-cream-100 font-display text-lg text-cocoa-900 lg:size-12 lg:rounded-2xl lg:text-xl">
          {item.name.charAt(0).toLocaleUpperCase('pt-BR')}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h2 className="truncate text-sm font-bold text-cocoa-900">{item.name}</h2>
            <Badge variant={status.variant} className="shrink-0">
              {status.label}
            </Badge>
          </div>

          <div className="mt-2 flex items-end justify-between gap-2">
            <p className="shrink-0 whitespace-nowrap text-xs text-cocoa-800/55">
              <strong className="mr-1 font-display text-xl leading-none text-cocoa-900">
                {item.quantity}
              </strong>
              un. em estoque
            </p>
            <p className="ml-auto shrink-0 text-right text-[11px] text-cocoa-800/45">
              Venda
              <strong className="ml-1 text-sm text-cocoa-900">
                {item.unitSalePrice > 0 ? formatCurrency(item.unitSalePrice) : 'A definir'}
              </strong>
            </p>
            <button
              type="button"
              className="grid size-9 shrink-0 place-items-center rounded-xl border border-cocoa-900/8 bg-cream-50 text-cocoa-800/55 transition hover:bg-cream-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tangerine-500/20"
              onClick={onEditQuantity}
              aria-label={`Corrigir quantidade de ${item.name}`}
              title="Corrigir quantidade"
            >
              <PencilLine className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </Card>
  )
}
