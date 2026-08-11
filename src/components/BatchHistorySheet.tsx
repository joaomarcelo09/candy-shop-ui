import { PackageOpen } from 'lucide-react'
import type { StockEntry } from '../types/inventory'
import { formatCompactDate, formatCurrency } from '../utils/inventoryFormat'
import { Card } from './ui/Card'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from './ui/Sheet'

interface BatchHistorySheetProps {
  open: boolean
  entries: StockEntry[]
  onOpenChange: (open: boolean) => void
}

export function BatchHistorySheet({ open, entries, onOpenChange }: BatchHistorySheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Histórico de lotes</SheetTitle>
          <SheetDescription>
            Entradas registradas da mais recente para a mais antiga.
          </SheetDescription>
        </SheetHeader>

        {entries.length === 0 ? (
          <Card className="mt-5 p-6 text-center shadow-none">
            <PackageOpen className="mx-auto size-6 text-cocoa-800/35" />
            <p className="mt-3 text-sm font-bold text-cocoa-900">Nenhum lote registrado</p>
          </Card>
        ) : (
          <Card className="mt-5 divide-y divide-cocoa-900/7 overflow-hidden shadow-none">
            {entries.map((entry) => (
              <article key={entry.id} className="flex items-center justify-between gap-3 px-3 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-cocoa-900">{entry.candyName}</p>
                  <p className="mt-0.5 text-xs text-cocoa-800/50">
                    {formatCompactDate(entry.purchasedAt)} · Venda{' '}
                    {entry.unitSalePrice > 0 ? formatCurrency(entry.unitSalePrice) : 'a definir'}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-bold text-mint-500">+{entry.quantity} un.</p>
                  <p className="text-[10px] text-cocoa-800/40">entrada</p>
                </div>
              </article>
            ))}
          </Card>
        )}
      </SheetContent>
    </Sheet>
  )
}
