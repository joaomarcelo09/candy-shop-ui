import type { ButtonHTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const buttonVariants = cva(
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl px-4 text-sm font-bold transition active:scale-[0.98] disabled:pointer-events-none disabled:opacity-45 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-tangerine-500/25',
  {
    variants: {
      variant: {
        default: 'bg-cocoa-900 text-white shadow-sm hover:bg-cocoa-950',
        secondary: 'border border-cocoa-900/10 bg-white text-cocoa-900 hover:bg-cream-50',
        ghost: 'bg-transparent text-cocoa-800 hover:bg-cocoa-900/5',
        outline: 'border border-cocoa-900/15 bg-transparent text-cocoa-900 hover:bg-white',
        danger: 'bg-strawberry-600 text-white hover:bg-strawberry-500',
      },
      size: {
        default: 'min-h-11 px-4',
        sm: 'min-h-9 rounded-xl px-3 text-xs',
        icon: 'size-11 shrink-0 p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, type = 'button', ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
}
