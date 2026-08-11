import type { HTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const badgeVariants = cva(
  'inline-flex min-h-6 items-center rounded-full px-2.5 text-[11px] font-bold',
  {
    variants: {
      variant: {
        default: 'bg-cream-100 text-cocoa-900',
        success: 'bg-mint-50 text-mint-500',
        warning: 'bg-tangerine-50 text-tangerine-500',
        danger: 'bg-strawberry-50 text-strawberry-600',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}
