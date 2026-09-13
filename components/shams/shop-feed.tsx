'use client'
import Link from 'next/link'
import { useEffect, useLayoutEffect, useRef } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import {
  useInfiniteQuery,
  useQuery,
  keepPreviousData,
} from '@tanstack/react-query'
import { catalogParams, type CatalogScope } from '@/lib/commerce/experience'
import { CatalogDiscovery } from './contextual-discovery'
import type { TaxonomyTerm } from '@/lib/commerce/types'
import { ProductCard } from './product-card'
import { FilterFields, MobileFilterDrawer } from './catalog-filters'
import { commerceFetch } from '@/lib/commerce/browser'
import type {
  CatalogPage,
  FacetResult,
  ProductSummary,
} from '@/lib/commerce/types'

const emptyFacets: FacetResult = { groups: [] }
export function ShopFeed({
  initialProducts,
  initialCursor,
  initialHasNext,
  total,
  initialParams,
  scope = {},
  discovery,
  initialFacets = emptyFacets,
  lockedFilters = [],
}: {
  initialProducts: ProductSummary[]
  initialCursor?: string
  initialHasNext: boolean
  total: number
  initialParams: string
  scope?: CatalogScope
  discovery?: {
    categories: TaxonomyTerm[]
    brands: TaxonomyTerm[]
    hub: boolean
  }
  lockedFilters?: string[]
  initialFacets?: FacetResult
}) {
  const search = useSearchParams(),
    pathname = usePathname(),
    sentinel = useRef<HTMLDivElement>(null)
  const params = catalogParams(search.toString(), scope, {
    sort: new URLSearchParams(initialParams).get('sort') ?? undefined,
  })
  const p = new URLSearchParams(params)
  const query = p.get('q')
  const initialMatch = params === initialParams
  const feed = useInfiniteQuery({
    queryKey: ['catalog', params],
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam, signal }) =>
      commerceFetch<CatalogPage>(
        `/api/commerce/products?${params}&pageSize=24${pageParam ? `&cursor=${encodeURIComponent(pageParam)}` : ''}`,
        { signal },
      ),
    getNextPageParam: (last) => last.nextCursor,
    placeholderData: keepPreviousData,
    initialData: initialMatch
      ? {
          pages: [
            {
              items: initialProducts,
              nextCursor: initialCursor,
              hasNextPage: initialHasNext,
              total,
            },
          ],
          pageParams: [undefined],
        }
      : undefined,
    staleTime: 120000,
  })
  const facetQuery = useQuery({
    queryKey: ['facets', params],
    queryFn: ({ signal }) =>
      commerceFetch<FacetResult>(`/api/commerce/facets?${params}`, { signal }),
    placeholderData: keepPreviousData,
    initialData:
      initialMatch && initialFacets.groups.length ? initialFacets : undefined,
  })
  const availableFacets = {
    ...(facetQuery.data ?? emptyFacets),
    groups: (facetQuery.data ?? emptyFacets).groups.filter(
      (g) => !lockedFilters.includes(g.key),
    ),
  }
  const items = [
    ...new Map(
      (feed.data?.pages ?? [])
        .flatMap((page) => page.items)
        .map((item) => [item.id, item]),
    ).values(),
  ]
  useEffect(() => {
    const el = sentinel.current
    if (!el) return
    const o = new IntersectionObserver(
      ([e]) => {
        if (
          e.isIntersecting &&
          feed.hasNextPage &&
          !feed.isFetching &&
          !feed.isPlaceholderData &&
          !feed.isFetchNextPageError
        )
          void feed.fetchNextPage()
      },
      { rootMargin: '500px' },
    )
    o.observe(el)
    return () => o.disconnect()
  }, [
    feed.hasNextPage,
    feed.isFetching,
    feed.isFetchNextPageError,
    feed.isPlaceholderData,
    feed.fetchNextPage,
  ])
  useLayoutEffect(() => {
    try {
      const saved = JSON.parse(
        sessionStorage.getItem('shams-catalog-return') ?? 'null',
      )
      if (saved?.key === pathname + '?' + params) {
        const frame = requestAnimationFrame(() => {
          window.scrollTo(0, saved.y)
          sessionStorage.removeItem('shams-catalog-return')
        })
        return () => cancelAnimationFrame(frame)
      }
    } catch {}
  }, [pathname, params])
  const rememberPosition = (event: React.MouseEvent) => {
    if ((event.target as HTMLElement).closest('a[href^="/p/"]')) {
      try {
        sessionStorage.setItem(
          'shams-catalog-return',
          JSON.stringify({ key: pathname + '?' + params, y: window.scrollY }),
        )
      } catch {}
    }
  }
  const apply = (next: URLSearchParams) => {
    next.delete('cursor')
    const canonical = catalogParams(next, scope)
    if (canonical !== params)
      window.history.pushState(null, '', `${pathname}?${canonical}`)
  }
  const change = (key: string, value: string) => {
    const next = new URLSearchParams(search.toString())
    if (value) next.set(key, value)
    else next.delete(key)
    apply(next)
  }
  const active = [
    'category',
    'brand',
    'stock',
    'minPrice',
    'maxPrice',
    'onSale',
  ].filter((k) => p.has(k) && !lockedFilters.includes(k))
  return (
    <section
      onClickCapture={rememberPosition}
      className="mt-6"
      aria-label="Product catalog"
    >
      {discovery && (
        <CatalogDiscovery
          {...discovery}
          scope={scope}
          params={params}
          change={change}
        />
      )}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <MobileFilterDrawer
          params={params}
          lockedFilters={lockedFilters}
          facets={availableFacets}
          apply={apply}
        />
        <p className="hidden text-sm text-muted-foreground lg:block">
          Find the right gear for your next project
        </p>
        <label className="flex items-center gap-2 text-sm">
          <span className="sr-only sm:not-sr-only">Sort</span>
          <select
            value={p.get('sort') ?? 'newest'}
            onChange={(e) => change('sort', e.target.value)}
            className="min-h-11 max-w-[160px] rounded-lg border bg-background px-3"
          >
            {query && <option value="relevance">Best match</option>}
            <option value="newest">Newest</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
            <option value="best-selling">Best selling</option>
          </select>
        </label>
      </div>
      <div className="shams-catalog-layout">
        <aside className="shams-sidebar hidden pr-3 lg:block">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Refine your search</h2>
            {active.length > 0 && (
              <button
                onClick={() => {
                  const n = new URLSearchParams(search)
                  active.forEach((k) => n.delete(k))
                  apply(n)
                }}
                className="min-h-11 text-xs text-brand-ink"
              >
                Clear all
              </button>
            )}
          </div>
          {facetQuery.isError ? (
            <button
              onClick={() => facetQuery.refetch()}
              className="text-sm text-brand-ink"
            >
              Retry filters
            </button>
          ) : null}
          <FilterFields facets={availableFacets} values={p} change={change} />
        </aside>
        <div className="min-w-0">
          <div className="mb-4 flex flex-wrap gap-2">
            {active.map((k) => (
              <button
                key={k}
                onClick={() => change(k, '')}
                className="min-h-11 rounded-full border border-brand/30 bg-brand/5 px-3 text-xs text-brand-ink"
              >
                {k === 'onSale' ? 'On sale' : p.get(k)?.replaceAll('-', ' ')} ×
              </button>
            ))}
          </div>
          <div
            role="status"
            className="mb-3 text-sm text-muted-foreground"
            aria-live="polite"
          >
            {feed.isPlaceholderData
              ? 'Updating your selection… Previous results are shown below.'
              : feed.isError && !feed.isFetchNextPageError
                ? 'We could not update these results.'
                : ''}
          </div>
          {feed.isError && !feed.isFetchNextPageError && (
            <button
              className="shams-button shams-button-secondary mb-4"
              onClick={() => feed.refetch()}
            >
              Retry results
            </button>
          )}
          <div
            className="grid grid-cols-1 gap-4"
            data-results-pending={feed.isPlaceholderData}
            aria-busy={feed.isFetching && !feed.isFetchingNextPage}
          >
            {items.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                view="list"
                purchaseDisabled={feed.isPlaceholderData}
              />
            ))}
          </div>
          {items.length === 0 && !feed.isPending && !feed.isError && (
            <div className="rounded-xl border border-dashed p-10 text-center">
              <h2 className="text-lg font-semibold">
                No gear matches these filters
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Try removing a filter or searching for another model.
              </p>
              {active.length || query ? (
                <button
                  className="shams-button mt-5"
                  onClick={() => {
                    const n = new URLSearchParams(params)
                    active.forEach((k) => n.delete(k))
                    n.delete('q')
                    apply(n)
                  }}
                >
                  Reset your search
                </button>
              ) : (
                <Link href="/shop" className="shams-button mt-5">
                  Explore all gear →
                </Link>
              )}
            </div>
          )}
          <div ref={sentinel} className="py-6" aria-live="polite">
            {(feed.isFetchingNextPage || feed.isPending) && (
              <div className="space-y-4" aria-label="Loading more products">
                {[0, 1, 2].map((x) => (
                  <div
                    key={x}
                    className="h-52 animate-pulse rounded-xl border bg-muted/40 motion-reduce:animate-none"
                  />
                ))}
              </div>
            )}
            {feed.isFetchNextPageError && (
              <div className="text-center text-sm">
                <p>
                  Your results are still here. The next page could not load.
                </p>
                <button
                  onClick={() => feed.fetchNextPage()}
                  className="mt-3 min-h-11 rounded-lg border px-5"
                >
                  Retry
                </button>
              </div>
            )}
            {feed.hasNextPage &&
              !feed.isFetchingNextPage &&
              !feed.isFetchNextPageError && (
                <button
                  onClick={() => feed.fetchNextPage()}
                  className="mx-auto block min-h-11 rounded-lg border px-5 text-sm"
                >
                  Load more
                </button>
              )}
          </div>
        </div>
      </div>
    </section>
  )
}
