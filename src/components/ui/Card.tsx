import type { HTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-[24px] border border-cocoa-900/8 bg-white/90 shadow-[0_12px_36px_rgba(84,42,20,0.08)]',
        className,
      )}
      {...props}
    />
  )
}
