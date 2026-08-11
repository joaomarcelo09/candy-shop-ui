import { Check, ChevronsUpDown, Plus, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { InventoryItem } from '../types/inventory'
import { cn } from '../lib/utils'
import { Input } from './ui/Input'
import { Popover, PopoverContent, PopoverTrigger } from './ui/Popover'

interface CandyComboboxProps {
  id: string
  labelId: string
  items: InventoryItem[]
  value: string
  invalid?: boolean
  onChange: (value: string) => void
}

function normalizeSearch(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLocaleLowerCase('pt-BR')
}

export function CandyCombobox({
  id,
  labelId,
  items,
  value,
  invalid = false,
  onChange,
}: CandyComboboxProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const sortedItems = useMemo(
    () => [...items].sort((left, right) => left.name.localeCompare(right.name, 'pt-BR')),
    [items],
  )
  const normalizedSearch = normalizeSearch(search)
  const filteredItems = sortedItems.filter((item) =>
    normalizeSearch(item.name).includes(normalizedSearch),
  )
  const newCandyName = search.trim().replace(/\s+/g, ' ')
  const hasExactMatch = sortedItems.some(
    (item) => normalizeSearch(item.name) === normalizeSearch(newCandyName),
  )
  const canCreate = newCandyName.length >= 2 && !hasExactMatch && filteredItems.length === 0

  function chooseCandy(name: string) {
    onChange(name)
    setSearch('')
    setOpen(false)
  }

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen)
        if (!nextOpen) setSearch('')
      }}
    >
      <PopoverTrigger asChild>
        <button
          id={id}
          type="button"
          role="combobox"
          aria-labelledby={labelId}
          aria-expanded={open}
          aria-invalid={invalid}
          className={cn(
            'flex min-h-12 w-full items-center justify-between gap-3 rounded-2xl border border-cocoa-900/10 bg-white px-4 text-left text-base text-cocoa-900 shadow-sm outline-none transition focus:border-tangerine-500 focus:ring-4 focus:ring-tangerine-500/15',
            !value && 'text-cocoa-800/35',
            invalid && 'border-strawberry-500',
          )}
        >
          <span className="truncate">{value || 'Selecione ou cadastre um doce'}</span>
          <ChevronsUpDown className="size-4 shrink-0 text-cocoa-800/35" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="w-[var(--radix-popover-trigger-width)] p-0"
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        <div className="relative border-b border-cocoa-900/8 p-2">
          <Search className="pointer-events-none absolute left-5 top-1/2 size-4 -translate-y-1/2 text-cocoa-800/35" />
          <Input
            autoFocus
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="min-h-10 border-0 bg-cream-50 pl-10 text-sm shadow-none focus:ring-2"
            placeholder="Buscar doce"
            aria-label="Buscar doce"
          />
        </div>

        <div className="max-h-56 overflow-y-auto p-1" role="listbox" aria-label="Doces cadastrados">
          {filteredItems.map((item) => {
            const selected = normalizeSearch(item.name) === normalizeSearch(value)

            return (
              <button
                key={item.id}
                type="button"
                role="option"
                aria-label={item.name}
                aria-selected={selected}
                className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm transition hover:bg-cream-50 focus:bg-cream-50 focus:outline-none"
                onClick={() => chooseCandy(item.name)}
              >
                <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-cream-100 font-bold text-cocoa-900">
                  {item.name.charAt(0).toLocaleUpperCase('pt-BR')}
                </span>
                <span className="min-w-0 flex-1 truncate font-semibold">{item.name}</span>
                {selected ? <Check className="size-4 shrink-0 text-mint-500" /> : null}
              </button>
            )
          })}

          {filteredItems.length === 0 && !canCreate ? (
            <p className="px-3 py-4 text-center text-sm text-cocoa-800/50">
              Digite pelo menos 2 letras.
            </p>
          ) : null}

          {canCreate ? (
            <button
              type="button"
              role="option"
              aria-label={`Adicionar novo doce “${newCandyName}”`}
              aria-selected="false"
              className="mt-1 flex min-h-12 w-full items-center gap-3 rounded-xl bg-mint-50 px-3 text-left transition hover:bg-mint-50/70 focus:outline-none focus:ring-2 focus:ring-mint-500/20"
              onClick={() => chooseCandy(newCandyName)}
            >
              <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-mint-500 text-white">
                <Plus className="size-4" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-bold text-cocoa-900">
                  Adicionar novo doce “{newCandyName}”
                </span>
                <span className="block text-[11px] text-cocoa-800/50">
                  Será cadastrado ao confirmar a compra
                </span>
              </span>
            </button>
          ) : null}
        </div>
      </PopoverContent>
    </Popover>
  )
}
