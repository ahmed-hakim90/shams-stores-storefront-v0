'use client'
import { useEffect, useRef, useState } from 'react'
import { Dialog } from '@base-ui/react/dialog'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { useInteractions } from './interaction-provider'
import { commerceFetch } from '@/lib/commerce/browser'
import type { SearchSuggestion } from '@/lib/commerce/types'
import { ProductImage } from './product-image'
import { formatMoney } from '@/lib/commerce'
import { cn } from '@/lib/utils'
import { useCatalogNavigation } from './catalog-navigation'
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
    const t = setTimeout(() => setDebounced(query.trim()), 250)
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
        <Dialog.Backdrop className="fixed inset-0 z-[150] bg-black/40 backdrop-blur-[2px]" />
        <Dialog.Popup
          initialFocus={input}
          className="shams-overlay fixed inset-x-0 top-0 z-[151] mx-auto flex max-h-[90dvh] flex-col overflow-hidden rounded-b-2xl border bg-background shadow-xl outline-none md:top-8 md:max-w-3xl md:rounded-2xl"
        >
          <Dialog.Title className="sr-only">Search Shams Stores</Dialog.Title>
          <form
            className="flex items-center gap-3 border-b p-4"
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
          <div className="min-h-40 overflow-y-auto overscroll-contain p-4">
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
                  <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    {recent.length
                      ? 'Recent searches'
                      : 'Start with a model, brand or product'}
                  </p>
                  {recent.map((x) => (
                    <button
                      key={x}
                      onClick={() => submit(x)}
                      className="block min-h-11 text-sm"
                    >
                      {x}
                    </button>
                  ))}
                  <button
                    onClick={() => navigate('/shop')}
                    className="mt-4 min-h-11 text-sm font-semibold text-brand-ink"
                  >
                    Explore all gear →
                  </button>
                  {recent.length > 0 && (
                    <button
                      onClick={() => {
                        setRecent([])
                        try {
                          localStorage.removeItem('shams-recent-searches')
                        } catch {}
                      }}
                      className="ml-4 min-h-11 text-xs text-muted-foreground"
                    >
                      Clear recent searches
                    </button>
                  )}
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
                      className="h-16 animate-pulse rounded-lg bg-muted/60"
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
                      'flex min-h-20 w-full items-center gap-3 rounded-lg p-2 text-left hover:bg-muted',
                      active === index && 'bg-muted',
                    )}
                  >
                    {item.image && (
                      <span className="relative size-14 shrink-0 bg-white">
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
        'flex h-11 w-full items-center gap-3 rounded-xl border bg-background px-3.5 text-left text-sm text-muted-foreground',
        className,
      )}
    >
      <Search className="size-4 shrink-0" />
      <span className="truncate">{placeholder}</span>
    </button>
  )
}
