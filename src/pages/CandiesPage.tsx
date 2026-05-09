import { useState } from 'react'
import { CandyForm } from '../components/CandyForm'
import { Button } from '../components/ui/Button'
import { Skeleton } from '../components/ui/Skeleton'
import { useCandyStore } from '../stores/candyStore'
import type { Candy } from '../types/domain'
import { formatCurrency, formatShortDate } from '../utils/format'

export function CandiesPage() {
  const candies = useCandyStore((state) => state.candies)
  const loading = useCandyStore((state) => state.loading)
  const createCandy = useCandyStore((state) => state.createCandy)
  const updateCandy = useCandyStore((state) => state.updateCandy)
  const [selectedCandy, setSelectedCandy] = useState<Candy | null>(null)

  return (
    <div className="page-shell">
      <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-cocoa-800/55">Catalog</p>
          <h2 className="section-title mt-2">Candy management</h2>
          <p className="mt-2 max-w-2xl text-sm text-cocoa-800/70">
            Keep the sales catalog clean so the session screen stays fast and tap-friendly.
          </p>
        </div>
        {selectedCandy ? (
          <Button variant="ghost" onClick={() => setSelectedCandy(null)}>
            Clear selection
          </Button>
        ) : null}
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[380px_1fr]">
        <CandyForm
          candy={selectedCandy}
          loading={loading}
          onSubmit={async (payload) => {
            if (selectedCandy) {
              await updateCandy(selectedCandy.id, payload)
            } else {
              await createCandy(payload)
            }

            setSelectedCandy(null)
          }}
        />

        <div className="glass-card p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-cocoa-900">Registered candies</h3>
              <p className="mt-1 text-sm text-cocoa-800/65">
                Mobile cards below, desktop table on larger screens.
              </p>
            </div>
            <span className="rounded-full bg-cream-100 px-3 py-1 text-xs font-bold text-cocoa-900">
              {candies.length} items
            </span>
          </div>

          {loading && candies.length === 0 ? (
            <div className="mt-5 grid gap-3">
              <Skeleton className="h-28 w-full" />
              <Skeleton className="h-28 w-full" />
              <Skeleton className="h-28 w-full" />
            </div>
          ) : null}

          <div className="mt-5 grid gap-3 lg:hidden">
            {candies.map((candy) => (
              <button
                key={candy.id}
                type="button"
                className="rounded-3xl border border-cocoa-900/10 bg-white/70 p-4 text-left transition hover:bg-white"
                onClick={() => setSelectedCandy(candy)}
              >
                <div className="flex items-center justify-between gap-3">
                  <h4 className="text-lg font-bold text-cocoa-900">{candy.name}</h4>
                  <span className="rounded-full bg-cocoa-900 px-3 py-1 text-xs font-bold text-white">
                    Edit
                  </span>
                </div>
                <p className="mt-2 text-sm text-cocoa-800/60">{formatCurrency(candy.price)}</p>
                <p className="mt-3 text-xs text-cocoa-800/50">
                  Created {candy.createdAt ? formatShortDate(candy.createdAt) : 'recently'}
                </p>
              </button>
            ))}
          </div>

          <div className="mt-5 hidden overflow-hidden rounded-3xl border border-cocoa-900/10 lg:block">
            <table className="min-w-full border-collapse bg-white/70">
              <thead>
                <tr className="bg-cream-50 text-left text-sm text-cocoa-800/70">
                  <th className="px-4 py-3">Candy</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {candies.map((candy) => (
                  <tr key={candy.id} className="border-t border-cocoa-900/10 text-sm">
                    <td className="px-4 py-4 font-semibold text-cocoa-900">{candy.name}</td>
                    <td className="px-4 py-4 text-cocoa-800">{formatCurrency(candy.price)}</td>
                    <td className="px-4 py-4 text-cocoa-800/60">
                      {candy.createdAt ? formatShortDate(candy.createdAt) : 'recently'}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Button variant="secondary" onClick={() => setSelectedCandy(candy)}>
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  )
}
