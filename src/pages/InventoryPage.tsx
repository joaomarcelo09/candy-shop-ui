import { Boxes, Candy, History, PackagePlus, Search, TriangleAlert } from 'lucide-react'
import { useMemo } from 'react'
import { BatchHistorySheet } from '../components/BatchHistorySheet'
import { EditQuantitySheet } from '../components/EditQuantitySheet'
import { PurchaseSheet } from '../components/PurchaseSheet'
import { StockItemCard } from '../components/StockItemCard'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { getErrorMessage } from '../lib/errorHandler'
import { cn } from '../lib/utils'
import {
  useAddStockBatchMutation,
  useInventoryItemsQuery,
  useSetStockQuantityMutation,
  useStockEntriesQuery,
} from '../queries/useInventory'
import { useInventoryStore } from '../stores/inventoryStore'
import type { InventoryItem, StockEntry, StockFilter } from '../types/inventory'

const EMPTY_ITEMS: InventoryItem[] = []
const EMPTY_ENTRIES: StockEntry[] = []

const filters: Array<{ value: StockFilter; label: string }> = [
  { value: 'all', label: 'Todos' },
  { value: 'low', label: 'Baixo' },
  { value: 'out', label: 'Sem estoque' },
]

const listTitles: Record<StockFilter, string> = {
  all: 'Todos os doces',
  low: 'Estoque baixo',
  out: 'Sem estoque',
}

export function InventoryPage() {
  const itemsQuery = useInventoryItemsQuery()
  const entriesQuery = useStockEntriesQuery()
  const addBatch = useAddStockBatchMutation()
  const setQuantity = useSetStockQuantityMutation()
  const store = useInventoryStore()

  const items = itemsQuery.data ?? EMPTY_ITEMS
  const entries = entriesQuery.data ?? EMPTY_ENTRIES
  const loading = itemsQuery.isPending || entriesQuery.isPending
  const saving = addBatch.isPending || setQuantity.isPending
  const error = itemsQuery.error ?? entriesQuery.error

  const summary = useMemo(
    () =>
      items.reduce(
        (result, item) => ({
          lowStockItems: result.lowStockItems + (item.quantity <= 10 ? 1 : 0),
          itemCount: result.itemCount + 1,
          totalUnits: result.totalUnits + item.quantity,
        }),
        { lowStockItems: 0, itemCount: 0, totalUnits: 0 },
      ),
    [items],
  )

  const visibleItems = useMemo(() => {
    const search = store.search.trim().toLocaleLowerCase('pt-BR')

    return items.filter((item) => {
      const matchesSearch = item.name.toLocaleLowerCase('pt-BR').includes(search)
      const matchesFilter =
        store.filter === 'all' ||
        (store.filter === 'low' && item.quantity > 0 && item.quantity <= 10) ||
        (store.filter === 'out' && item.quantity === 0)

      return matchesSearch && matchesFilter
    })
  }, [items, store.filter, store.search])

  function refetchInventory() {
    void Promise.all([itemsQuery.refetch(), entriesQuery.refetch()])
  }

  return (
    <>
      <div className="px-4 pb-24 pt-3 lg:px-8 lg:pb-10 lg:pt-8 xl:px-10">
        <div className="mx-auto max-w-[92rem]">
          <header className="hidden items-end justify-between gap-6 lg:flex">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-tangerine-500">Operação</p>
              <h1 className="mt-2 font-display text-4xl text-cocoa-900">Controle de estoque</h1>
              <p className="mt-2 max-w-2xl text-sm text-cocoa-800/55">
                Acompanhe quantidades, preços e entradas de todos os doces da loja.
              </p>
            </div>
            <Button
              className="min-h-12 px-5"
              onClick={() => store.setPurchaseOpen(true)}
              disabled={loading || Boolean(error) || saving}
              aria-label="Adicionar novo lote"
            >
              <PackagePlus className="size-5" />
              Adicionar lote
            </Button>
          </header>

          <section className="grid gap-3 lg:mt-7 lg:grid-cols-3" aria-label="Resumo do estoque">
            <Card className="flex items-center gap-3 bg-white/75 p-3 shadow-none lg:p-5">
              <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-tangerine-50 text-tangerine-500 lg:size-11 lg:rounded-2xl">
                <TriangleAlert className="size-4 lg:size-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-cocoa-900 lg:text-base">
                  {summary.lowStockItems}{' '}
                  {summary.lowStockItems === 1 ? 'doce pede atenção' : 'doces pedem atenção'}
                </p>
                <p className="text-xs text-cocoa-800/50">Estoque baixo ou zerado</p>
              </div>
            </Card>

            <Card className="hidden items-center gap-3 p-5 shadow-none lg:flex">
              <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-mint-50 text-mint-500">
                <Candy className="size-5" />
              </div>
              <div>
                <p className="font-display text-2xl leading-none text-cocoa-900">{summary.itemCount}</p>
                <p className="mt-1 text-xs text-cocoa-800/50">Doces cadastrados</p>
              </div>
            </Card>

            <Card className="hidden items-center gap-3 p-5 shadow-none lg:flex">
              <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-cream-100 text-cocoa-800">
                <Boxes className="size-5" />
              </div>
              <div>
                <p className="font-display text-2xl leading-none text-cocoa-900">{summary.totalUnits}</p>
                <p className="mt-1 text-xs text-cocoa-800/50">Unidades disponíveis</p>
              </div>
            </Card>
          </section>

          <section className="mt-4 lg:mt-6" aria-label="Busca e filtros">
            <Card className="bg-white/60 p-2 shadow-none lg:flex lg:items-center lg:gap-3 lg:p-3">
              <div className="relative lg:min-w-72 lg:flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-cocoa-800/35" />
                <Input
                  value={store.search}
                  onChange={(event) => store.setSearch(event.target.value)}
                  className="min-h-11 border-transparent bg-white pl-11 text-sm shadow-none"
                  placeholder="Buscar doce"
                  aria-label="Buscar doce no estoque"
                />
              </div>

              <div className="mt-2 flex gap-2 overflow-x-auto pb-1 lg:mt-0 lg:overflow-visible lg:pb-0" aria-label="Filtros do estoque">
                {filters.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    className={cn(
                      'min-h-9 shrink-0 rounded-full border border-cocoa-900/8 bg-white/75 px-3.5 text-xs font-bold text-cocoa-800 transition',
                      store.filter === item.value && 'border-cocoa-900 bg-cocoa-900 text-white',
                    )}
                    onClick={() => store.setFilter(item.value)}
                    aria-pressed={store.filter === item.value}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </Card>
          </section>

          <section className="mt-3 lg:mt-6" aria-labelledby="stock-list-title">
            <div className="mb-2 flex items-end justify-between gap-3 lg:mb-4">
              <div>
                <h2 id="stock-list-title" className="text-sm font-bold text-cocoa-900 lg:text-lg">
                  {listTitles[store.filter]}
                </h2>
                <p className="text-xs text-cocoa-800/50">
                  {visibleItems.length} {visibleItems.length === 1 ? 'doce' : 'doces'}
                </p>
              </div>
              <Button
                size="sm"
                variant="secondary"
                className="min-h-10 rounded-xl px-3 lg:px-4"
                onClick={() => store.setHistoryOpen(true)}
                disabled={loading || Boolean(error)}
                aria-label="Ver histórico de lotes"
              >
                <History className="size-4" />
                Histórico de lotes
              </Button>
            </div>

            {loading ? (
              <Card className="grid gap-3 p-4 lg:grid-cols-2" aria-label="Carregando estoque">
                {[0, 1, 2, 3].map((item) => (
                  <div key={item} className="h-20 animate-pulse rounded-2xl bg-cream-100" />
                ))}
              </Card>
            ) : error ? (
              <Card className="p-6 text-center lg:py-10">
                <TriangleAlert className="mx-auto size-6 text-strawberry-500" />
                <p className="mt-3 text-sm font-bold text-cocoa-900">Não foi possível carregar o estoque</p>
                <p className="mt-1 text-xs text-cocoa-800/55">{getErrorMessage(error)}</p>
                <Button className="mt-4" variant="secondary" onClick={refetchInventory}>
                  Tentar novamente
                </Button>
              </Card>
            ) : visibleItems.length === 0 ? (
              <Card className="p-5 text-center lg:py-12">
                <div className="mx-auto grid size-10 place-items-center rounded-xl bg-cream-100">
                  <Search className="size-4 text-cocoa-800/45" />
                </div>
                <p className="mt-3 text-sm font-bold text-cocoa-900">Nenhum doce encontrado</p>
                <p className="mt-1 text-xs text-cocoa-800/55">Tente outro nome ou filtro.</p>
              </Card>
            ) : (
              <div className="grid gap-2 lg:grid-cols-2 lg:gap-4 2xl:grid-cols-3">
                {visibleItems.map((item) => (
                  <StockItemCard
                    key={item.id}
                    item={item}
                    onEditQuantity={() => store.setItemToEdit(item)}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      <Button
        size="icon"
        className="fixed bottom-[5.4rem] right-4 z-30 size-12 rounded-full shadow-[0_12px_28px_rgba(45,22,15,0.28)] sm:left-1/2 sm:right-auto sm:translate-x-[200px] lg:hidden"
        onClick={() => store.setPurchaseOpen(true)}
        disabled={loading || Boolean(error) || saving}
        aria-label="Adicionar lote"
      >
        <PackagePlus className="size-5" />
      </Button>

      <PurchaseSheet
        open={store.purchaseOpen}
        items={items}
        saving={addBatch.isPending}
        onOpenChange={store.setPurchaseOpen}
        onSubmit={async (input) => {
          await addBatch.mutateAsync(input)
        }}
      />

      <EditQuantitySheet
        item={store.itemToEdit}
        saving={setQuantity.isPending}
        onOpenChange={(open) => {
          if (!open) store.setItemToEdit(null)
        }}
        onSubmit={async (itemId, quantity) => {
          await setQuantity.mutateAsync({ itemId, quantity })
        }}
      />

      <BatchHistorySheet
        open={store.historyOpen}
        entries={entries}
        onOpenChange={store.setHistoryOpen}
      />
    </>
  )
}
