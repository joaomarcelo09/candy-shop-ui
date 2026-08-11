import type { ComponentProps } from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '../../lib/utils'

export function Sheet(props: ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root {...props} />
}

export function SheetContent({
  className,
  children,
  ...props
}: ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-cocoa-950/45 backdrop-blur-[2px] data-[state=closed]:animate-out data-[state=open]:animate-in" />
      <DialogPrimitive.Content
        className={cn(
          'safe-bottom fixed inset-x-0 bottom-0 z-50 max-h-[92dvh] overflow-y-auto rounded-t-[30px] border border-white/60 bg-cream-50 p-5 shadow-2xl outline-none sm:left-1/2 sm:max-w-lg sm:-translate-x-1/2 lg:inset-y-0 lg:left-auto lg:right-0 lg:max-h-none lg:w-full lg:max-w-md lg:translate-x-0 lg:rounded-none lg:border-y-0 lg:border-r-0 lg:p-7',
          className,
        )}
        {...props}
      >
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-cocoa-900/15 sm:hidden" />
        {children}
        <DialogPrimitive.Close
          className="absolute right-4 top-4 flex size-10 items-center justify-center rounded-full bg-white text-cocoa-800 shadow-sm transition hover:bg-cream-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-tangerine-500/20"
          aria-label="Fechar"
        >
          <X className="size-5" />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}

export function SheetHeader({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('pr-12', className)} {...props} />
}

export function SheetTitle({
  className,
  ...props
}: ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      className={cn('font-display text-2xl text-cocoa-900', className)}
      {...props}
    />
  )
}

export function SheetDescription({
  className,
  ...props
}: ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      className={cn('mt-1 text-sm leading-relaxed text-cocoa-800/65', className)}
      {...props}
    />
  )
}
