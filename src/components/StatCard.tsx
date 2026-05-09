import type { ReactNode } from 'react'

interface StatCardProps {
  eyebrow: string
  title: string
  value: string
  accent: ReactNode
}

export function StatCard({ eyebrow, title, value, accent }: StatCardProps) {
  return (
    <article className="glass-card relative overflow-hidden p-5">
      <div className="absolute right-4 top-4 text-3xl">{accent}</div>
      <p className="text-xs font-bold uppercase tracking-[0.24em] text-cocoa-800/60">{eyebrow}</p>
      <h3 className="mt-3 text-lg font-semibold text-cocoa-900">{title}</h3>
      <p className="mt-4 font-display text-3xl text-cocoa-900">{value}</p>
    </article>
  )
}
