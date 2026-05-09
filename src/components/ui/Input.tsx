import type { InputHTMLAttributes } from 'react'
import { clsx } from 'clsx'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export function Input({ className, label, error, ...props }: InputProps) {
  return (
    <label className="flex flex-col gap-2 text-sm font-medium text-cocoa-800">
      <span>{label}</span>
      <input
        className={clsx(
          'min-h-12 rounded-2xl border border-cocoa-900/10 bg-white px-4 text-cocoa-900 outline-none transition placeholder:text-cocoa-800/35 focus:border-tangerine-500 focus:ring-4 focus:ring-tangerine-500/15',
          error && 'border-strawberry-500 focus:border-strawberry-500 focus:ring-strawberry-500/15',
          className,
        )}
        {...props}
      />
      {error ? <span className="text-xs font-medium text-strawberry-600">{error}</span> : null}
    </label>
  )
}
