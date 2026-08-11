import { zodResolver } from '@hookform/resolvers/zod'
import { ClipboardPen } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import {
  stockQuantityCorrectionSchema,
  type StockQuantityCorrectionFormValues,
} from '../schemas/inventory'
import type { InventoryItem } from '../types/inventory'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { Label } from './ui/Label'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from './ui/Sheet'

interface EditQuantitySheetProps {
  item: InventoryItem | null
  saving: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (itemId: string, quantity: number) => Promise<void>
}

export function EditQuantitySheet({ item, saving, onOpenChange, onSubmit }: EditQuantitySheetProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StockQuantityCorrectionFormValues>({
    resolver: zodResolver(stockQuantityCorrectionSchema),
    defaultValues: { quantity: undefined },
  })

  useEffect(() => {
    if (item) reset({ quantity: item.quantity })
  }, [item, reset])

  return (
    <Sheet open={Boolean(item)} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Corrigir quantidade</SheetTitle>
          <SheetDescription>
            Use esta opção apenas para corrigir uma contagem incorreta. Novas entradas devem ser registradas por lote.
          </SheetDescription>
        </SheetHeader>

        {item ? (
          <form
            className="mt-5 grid gap-4"
            onSubmit={handleSubmit(async (values) => {
              try {
                await onSubmit(item.id, values.quantity)
                toast.success('Quantidade corrigida')
                onOpenChange(false)
              } catch {
                // O interceptor apresenta o erro e mantém os dados na tela.
              }
            })}
          >
            <div className="rounded-2xl bg-white p-3">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-cocoa-800/40">Doce</p>
              <p className="mt-1 font-bold text-cocoa-900">{item.name}</p>
              <p className="mt-1 text-xs text-cocoa-800/50">Quantidade atual: {item.quantity} un.</p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="correctQuantity">Quantidade correta</Label>
              <Input
                id="correctQuantity"
                className="hide-number-spin"
                type="number"
                min="0"
                inputMode="numeric"
                aria-invalid={Boolean(errors.quantity)}
                {...register('quantity', { valueAsNumber: true })}
              />
              {errors.quantity ? (
                <p className="text-xs font-bold text-strawberry-600">{errors.quantity.message}</p>
              ) : null}
            </div>

            <Button type="submit" className="mt-1 w-full" disabled={saving}>
              <ClipboardPen className="size-5" />
              {saving ? 'Salvando correção...' : 'Salvar correção'}
            </Button>
          </form>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
