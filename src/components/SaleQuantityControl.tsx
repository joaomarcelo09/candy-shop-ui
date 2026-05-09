import type { ChangeEvent } from 'react'
import { Button } from './ui/Button'

interface SaleQuantityControlProps {
  value: number
  busy: boolean
  onDecrease: () => void
  onIncrease: () => void
  onChange: (value: number) => void
  onSubmit?: () => void
  submitLabel?: string
  hideSubmit?: boolean
}

export function SaleQuantityControl({
  value,
  busy,
  onDecrease,
  onIncrease,
  onChange,
  onSubmit,
  submitLabel = 'Add sale',
  hideSubmit = false,
}: SaleQuantityControlProps) {
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const nextValue = Number.parseInt(event.target.value, 10)

    if (Number.isNaN(nextValue)) {
      onChange(1)
      return
    }

    onChange(nextValue)
  }

  return (
    <div className="grid w-full min-w-0 gap-2">
      <div className="grid min-w-0 grid-cols-[44px_minmax(0,1fr)_44px] items-center gap-2">
        <button
          type="button"
          disabled={busy || value <= 1}
          className="min-h-11 rounded-xl border border-cocoa-900/10 bg-white/75 text-xl font-bold text-cocoa-900 transition hover:bg-white disabled:text-cocoa-800/30"
          onClick={onDecrease}
          aria-label="Decrease sale quantity"
        >
          -
        </button>

        <input
          type="number"
          inputMode="numeric"
          min="1"
          step="1"
          value={value}
          disabled={busy}
          onChange={handleChange}
          className="hide-number-spin min-h-11 w-full min-w-0 rounded-xl border border-cocoa-900/10 bg-cocoa-900 px-3 text-center text-lg font-bold text-white outline-none focus:border-tangerine-500 focus:ring-4 focus:ring-tangerine-500/20"
          aria-label="Sale quantity"
        />

        <button
          type="button"
          disabled={busy}
          className="min-h-11 rounded-xl border border-cocoa-900/10 bg-white/75 text-xl font-bold text-cocoa-900 transition hover:bg-white disabled:text-cocoa-800/30"
          onClick={onIncrease}
          aria-label="Increase sale quantity"
        >
          +
        </button>
      </div>

      {hideSubmit ? null : (
        <Button
          type="button"
          onClick={onSubmit}
          disabled={busy}
          fullWidth
          className="min-h-10 rounded-xl px-3 py-2 text-xs"
        >
          {busy ? 'Saving...' : submitLabel}
        </Button>
      )}
    </div>
  )
}
