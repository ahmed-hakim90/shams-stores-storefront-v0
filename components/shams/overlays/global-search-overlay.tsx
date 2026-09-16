'use client'
import { useEffect, useRef, useState } from 'react'
import { Dialog } from '@base-ui/react/dialog'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { Search, X, Clock, TrendingUp } from 'lucide-react'
import { useInteractions } from '@/components/shams/providers'
import { commerceFetch } from '@/lib/commerce/browser'
import type { SearchSuggestion } from '@/lib/commerce/types'
import { ProductImage } from '@/components/shams/product'
import { formatMoney } from '@/lib/commerce'
import { cn } from '@/lib/utils'
import { useCatalogNavigation } from '@/components/shams/catalog'
export function GlobalSearchOverlay() {
  const { searchOpen, closeSearch } = useInteractions(),
    router = useRouter(),
    input = useRef<HTMLInputElement>(null)
  const { categories, brands } = useCatalogNavigation()
  const [query, setQuery] = useState(''),
    [debounced, setDebounced] = useState(''),
    [active, setActive] = useState(-1),
    [recent, setRecent] = useState<string[]>([])
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 150)
    return () => clearTimeout(t)
  }, [query])
  useEffect(() => {
    if (searchOpen) {
      try {
        const v = JSON.parse(
          localStorage.getItem('shams-recent-searches') ?? '[]',
        )
        if (Array.isArray(v))
          setRecent(v.filter((x) => typeof x === 'string').slice(0, 6))
      } catch {}
    }
  }, [searchOpen])
  const q = useQuery({
    queryKey: ['search-suggestions', debounced],
    queryFn: ({ signal }) =>
      commerceFetch<SearchSuggestion[]>(
        `/api/commerce/search?q=${encodeURIComponent(debounced)}`,
        { signal },
      ),
    enabled: searchOpen && debounced.length >= 2,
    staleTime: 30000,
  })
  const results = q.data ?? []
  const navigate = (href: string) => {
    closeSearch()
    router.push(href)
  }
  const submit = (value = query) => {
    if (!value.trim()) return
    try {
      localStorage.setItem(
        'shams-recent-searches',
        JSON.stringify(
          [value, ...recent.filter((x) => x !== value)].slice(0, 6),
        ),
      )
    } catch {}
    navigate(`/search?q=${encodeURIComponent(value.trim())}`)
  }
  return (
    <Dialog.Root
      open={searchOpen}
      onOpenChange={(v) => {
        if (!v) closeSearch()
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop data-overlay-backdrop className="fixed inset-0 z-[150] bg-black/40 backdrop-blur-[2px]" />
        <Dialog.Popup
          initialFocus={input}
          data-overlay="search"
          className="shams-overlay fixed inset-x-0 top-0 z-[151] mx-auto flex max-h-[90dvh] flex-col overflow-hidden rounded-b-(--radius-editorial) border bg-background outline-none md:top-8 md:max-w-3xl md:rounded-(--radius-editorial)"
        >
          <Dialog.Title className="sr-only">Search Shams Stores</Dialog.Title>
          <form
            className="flex items-center gap-3 border-b p-4 pt-[max(1rem,env(safe-area-inset-top))]"
            onSubmit={(e) => {
              e.preventDefault()
              submit()
            }}
          >
            <Search className="size-5 shrink-0 text-brand-ink" />
            <input
              ref={input}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setActive(-1)
              }}
              onKeyDown={(e) => {
                if (e.nativeEvent.isComposing) return
                if (e.key === 'ArrowDown') {
                  e.preventDefault()
                  setActive((x) => Math.min(x + 1, results.length - 1))
                }
                if (e.key === 'ArrowUp') {
                  e.preventDefault()
                  setActive((x) => Math.max(x - 1, 0))
                }
                if (
                  e.key === 'Enter' &&
                  !q.isFetching &&
                  query.trim() === debounced &&
                  active >= 0 &&
                  results[active]
                ) {
                  e.preventDefault()
                  navigate(results[active].href)
                }
              }}
              role="combobox"
              aria-expanded={results.length > 0}
              aria-controls="search-options"
              aria-activedescendant={
                active >= 0 ? `suggestion-${active}` : undefined
              }
              aria-autocomplete="list"
              aria-label="Search products"
              autoComplete="off"
              enterKeyHint="search"
              placeholder="Model, brand or SKU…"
              className="min-w-0 flex-1 bg-transparent text-base outline-none"
            />
            <Dialog.Close
              aria-label="Close search"
              className="size-11 shrink-0 rounded-full hover:bg-muted"
            >
              <X className="mx-auto size-5" />
            </Dialog.Close>
          </form>
          <div className="min-h-40 overflow-y-auto overscroll-contain p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <div
              id="search-options"
              role={
                query.trim().length >= 2 && results.length && !q.isFetching
                  ? 'listbox'
                  : undefined
              }
              aria-label="Search suggestions"
            >
              {query.trim().length < 2 ? (
                <div>
                  {recent.length > 0 && (
                    <>
                      <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                        <Clock className="size-3" />
                        Recent searches
                      </p>
                      {recent.map((x) => (
                        <button
                          key={x}
                          onClick={() => submit(x)}
                          className="flex min-h-11 w-full items-center gap-2 rounded-(--radius-control) px-2 text-sm text-left hover:bg-muted"
                        >
                          <span className="text-muted-foreground">{x}</span>
                        </button>
                      ))}
                      <button
                        onClick={() => {
                          setRecent([])
                          try {
                            localStorage.removeItem('shams-recent-searches')
                          } catch {}
                        }}
                        className="ml-4 min-h-9 text-xs text-muted-foreground underline"
                      >
                        Clear
                      </button>
                    </>
                  )}
                  <div className={recent.length > 0 ? 'mt-5 border-t pt-5' : ''}>
                    <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      <TrendingUp className="size-3" />
                      Popular searches
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {['Canon EOS', 'Sony A7', 'DJI Mini', 'Rode Wireless', 'Godox'].map((term) => (
                        <button
                          key={term}
                          onClick={() => submit(term)}
                          className="rounded-full border px-3 py-1.5 text-sm hover:border-brand hover:text-brand-ink"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/shop')}
                    className="mt-5 min-h-11 text-sm font-semibold text-brand-ink"
                  >
                    Explore all gear →
                  </button>
                  <div className="mt-5 grid gap-5 border-t pt-5 sm:grid-cols-2">
                    <section>
                      <h3 className="mb-2 text-sm font-semibold">
                        Explore categories
                      </h3>
                      {categories.slice(0, 4).map((c) => (
                        <button
                          key={c.slug}
                          onClick={() => navigate(`/c/${c.slug}`)}
                          className="block min-h-11 text-sm text-muted-foreground hover:text-brand-ink"
                        >
                          {c.name} →
                        </button>
                      ))}
                    </section>
                    <section>
                      <h3 className="mb-2 text-sm font-semibold">
                        Explore brands
                      </h3>
                      {brands.slice(0, 4).map((b) => (
                        <button
                          key={b.id}
                          onClick={() => navigate(`/b/${b.slug}`)}
                          className="block min-h-11 text-sm text-muted-foreground hover:text-brand-ink"
                        >
                          {b.name} →
                        </button>
                      ))}
                    </section>
                  </div>
                </div>
              ) : q.isFetching || query.trim() !== debounced ? (
                <div aria-live="polite" className="space-y-3">
                  {[1, 2, 3].map((x) => (
                    <div
                      key={x}
                      className="h-16 animate-pulse rounded-(--radius-control) bg-muted/60"
                    />
                  ))}
                </div>
              ) : q.isError ? (
                <div role="status">
                  <p className="text-sm">Search is temporarily unavailable.</p>
                  <button
                    onClick={() => q.refetch()}
                    className="min-h-11 text-brand-ink"
                  >
                    Try again
                  </button>
                </div>
              ) : results.length ? (
                results.map((item, index) => (
                  <button
                    type="button"
                    role="option"
                    aria-selected={active === index}
                    id={`suggestion-${index}`}
                    key={`${item.kind}-${item.id}`}
                    onClick={() => navigate(item.href)}
                    className={cn(
                      'flex min-h-20 w-full items-center gap-3 rounded-(--radius-control) p-2 text-left hover:bg-muted',
                      active === index && 'bg-muted',
                    )}
                  >
                    {item.image && (
                      <span className="relative size-14 shrink-0 bg-surface-raised">
                        <ProductImage
                          src={item.image}
                          alt=""
                          fill
                          sizes="56px"
                          className="object-contain p-1"
                        />
                      </span>
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="text-[10px] uppercase tracking-widest text-brand-ink">
                        {item.kind}
                      </span>
                      <span className="mt-1 block text-sm font-medium">
                        {item.label}
                      </span>
                    </span>
                    {item.product && (
                      <span className="shrink-0 text-xs font-semibold">
                        {formatMoney(item.product.price)}
                      </span>
                    )}
                  </button>
                ))
              ) : (
                <p className="py-6 text-sm text-muted-foreground">
                  No matches. Try another model or browse the catalog.
                </p>
              )}
            </div>
            {debounced.length >= 2 && (
              <button
                onClick={() => submit()}
                className="mt-4 min-h-12 w-full border-t text-left text-sm font-semibold text-brand-ink"
              >
                View all results for “{query.trim()}” →
              </button>
            )}
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
export function SearchTrigger({
  className,
  placeholder = 'Search products',
}: {
  className?: string
  placeholder?: string
}) {
  const { openSearch } = useInteractions()
  return (
    <button
      onClick={openSearch}
      className={cn(
        'flex h-9 w-full items-center gap-2.5 rounded-(--radius-control) border bg-background px-3 text-left text-xs text-muted-foreground',
        className,
      )}
    >
      <Search className="size-3.5 shrink-0" />
      <span className="truncate">{placeholder}</span>
    </button>
  )
}
