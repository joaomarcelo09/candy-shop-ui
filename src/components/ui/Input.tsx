import type { InputHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

export function Input({ className, type, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type={type}
      className={cn(
        'flex min-h-12 w-full rounded-2xl border border-cocoa-900/10 bg-white px-4 text-base text-cocoa-900 shadow-sm outline-none transition placeholder:text-cocoa-800/35 focus:border-tangerine-500 focus:ring-4 focus:ring-tangerine-500/15 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}
