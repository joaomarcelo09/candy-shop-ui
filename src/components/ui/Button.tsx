import type { ButtonHTMLAttributes, PropsWithChildren } from 'react'
import { clsx } from 'clsx'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  fullWidth?: boolean
}

export function Button({
  children,
  className,
  variant = 'primary',
  fullWidth = false,
  ...props
}: PropsWithChildren<ButtonProps>) {
  return (
    <button
      className={clsx(
        'inline-flex min-h-12 items-center justify-center rounded-2xl px-4 py-3 text-sm font-bold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50',
        fullWidth && 'w-full',
        variant === 'primary' &&
          'bg-cocoa-900 text-white shadow-[0_14px_30px_rgba(74,41,29,0.25)] hover:bg-cocoa-800',
        variant === 'secondary' &&
          'border border-cocoa-900/10 bg-white text-cocoa-900 hover:bg-cream-50',
        variant === 'ghost' && 'bg-transparent text-cocoa-900 hover:bg-white/50',
        variant === 'danger' && 'bg-strawberry-600 text-white hover:bg-strawberry-500',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
