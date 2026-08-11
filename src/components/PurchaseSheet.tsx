import { zodResolver } from '@hookform/resolvers/zod'
import { PackagePlus } from 'lucide-react'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { stockEntrySchema, type StockEntryFormValues } from '../schemas/inventory'
import type { InventoryItem, StockEntryInput } from '../types/inventory'
import { toCents } from '../utils/inventoryFormat'
import { CandyCombobox } from './CandyCombobox'
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

interface PurchaseSheetProps {
  open: boolean
  items: InventoryItem[]
  saving: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (entry: StockEntryInput) => Promise<void>
}

export function PurchaseSheet({
  open,
  items,
  saving,
  onOpenChange,
  onSubmit,
}: PurchaseSheetProps) {
  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<StockEntryFormValues>({
    resolver: zodResolver(stockEntrySchema),
    defaultValues: {
      candyName: '',
      quantity: undefined,
      unitSalePrice: undefined,
      saleIncrement: 1,
    },
  })

  useEffect(() => {
    if (open) {
      reset({
        candyName: '',
        quantity: undefined,
        unitSalePrice: undefined,
        saleIncrement: 1,
      })
    }
  }, [open, reset])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Adicionar lote</SheetTitle>
          <SheetDescription>
            Selecione o doce e registre a quantidade recebida e o preço unitário de venda.
          </SheetDescription>
        </SheetHeader>

        <form
          className="mt-5 grid gap-4"
          onSubmit={handleSubmit(async (values) => {
            try {
              await onSubmit({
                candyName: values.candyName,
                quantity: values.quantity,
                unitSalePrice: toCents(values.unitSalePrice),
                saleIncrement: values.saleIncrement,
              })
              toast.success('Lote adicionado ao estoque')
              onOpenChange(false)
            } catch {
              // O interceptor apresenta o erro e o formulário permanece intacto.
            }
          })}
        >
          <div className="grid gap-2">
            <Label id="candyNameLabel" htmlFor="candyName">Doce</Label>
            <Controller
              name="candyName"
              control={control}
              render={({ field }) => (
                <CandyCombobox
                  id="candyName"
                  labelId="candyNameLabel"
                  items={items}
                  value={field.value}
                  invalid={Boolean(errors.candyName)}
                  onChange={(name) => {
                    field.onChange(name)
                    const existingItem = items.find((item) => item.name === name)
                    setValue('saleIncrement', existingItem?.saleIncrement ?? 1)
                  }}
                />
              )}
            />
            {errors.candyName ? (
              <p className="text-xs font-bold text-strawberry-600">{errors.candyName.message}</p>
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="quantity">Quantidade do lote</Label>
              <Input
                id="quantity"
                className="hide-number-spin"
                type="number"
                min="1"
                inputMode="numeric"
                placeholder="Ex.: 50"
                aria-invalid={Boolean(errors.quantity)}
                {...register('quantity', { valueAsNumber: true })}
              />
              {errors.quantity ? (
                <p className="text-xs font-bold text-strawberry-600">{errors.quantity.message}</p>
              ) : null}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="unitSalePrice">Preço de venda</Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-cocoa-800/45">
                  R$
                </span>
                <Input
                  id="unitSalePrice"
                  className="hide-number-spin pl-11"
                  type="number"
                  min="0.01"
                  step="0.01"
                  inputMode="decimal"
                  placeholder="0,00"
                  aria-invalid={Boolean(errors.unitSalePrice)}
                  {...register('unitSalePrice', { valueAsNumber: true })}
                />
              </div>
              {errors.unitSalePrice ? (
                <p className="text-xs font-bold text-strawberry-600">{errors.unitSalePrice.message}</p>
              ) : null}
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Atalho na venda</Label>
            <Controller
              name="saleIncrement"
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-2 gap-2" role="group" aria-label="Atalho na venda">
                  <button
                    type="button"
                    className={field.value === 1
                      ? 'min-h-12 rounded-2xl border border-cocoa-900 bg-cocoa-900 px-3 text-sm font-bold text-white'
                      : 'min-h-12 rounded-2xl border border-cocoa-900/10 bg-white px-3 text-sm font-bold text-cocoa-900'}
                    onClick={() => field.onChange(1)}
                    aria-pressed={field.value === 1}
                  >
                    Somente +1
                  </button>
                  <button
                    type="button"
                    className={field.value === 5
                      ? 'min-h-12 rounded-2xl border border-tangerine-500 bg-tangerine-500 px-3 text-sm font-bold text-white'
                      : 'min-h-12 rounded-2xl border border-tangerine-500/20 bg-tangerine-50 px-3 text-sm font-bold text-tangerine-500'}
                    onClick={() => field.onChange(5)}
                    aria-pressed={field.value === 5}
                  >
                    Mostrar +5
                  </button>
                </div>
              )}
            />
            <p className="text-xs leading-5 text-cocoa-800/50">
              Use +5 para doces vendidos com frequência em grupos de cinco.
            </p>
          </div>

          <Button type="submit" className="mt-2 w-full" disabled={saving}>
            <PackagePlus className="size-5" />
            {saving ? 'Salvando lote...' : 'Confirmar entrada do lote'}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  )
}
