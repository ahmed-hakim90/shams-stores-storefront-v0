'use client'
import { useEffect, useLayoutEffect, useRef } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { ProductCard } from './product-card'
import { FilterFields, MobileFilterDrawer } from './catalog-filters'
import { commerceFetch } from '@/lib/commerce/browser'
import type {
  CatalogPage,
  CatalogQuery,
  FacetResult,
  ProductSummary,
} from '@/lib/commerce/types'

const emptyFacets: FacetResult = { groups: [] }
export function ShopFeed({
  initialProducts,
  initialCursor,
  initialHasNext,
  total,
  category,
  query,
  brand,
  sort,
  initialFacets = emptyFacets,
  lockedFilters = [],
}: {
  initialProducts: ProductSummary[]
  initialCursor?: string
  initialHasNext: boolean
  total: number
  category?: string
  query?: string
  brand?: string
  sort?: CatalogQuery['sort']
  lockedFilters?: string[]
  initialFacets?: FacetResult
}) {
  const search = useSearchParams(),
    router = useRouter(),
    pathname = usePathname(),
    sentinel = useRef<HTMLDivElement>(null)
  const p = new URLSearchParams(search.toString())
  if (category) p.set('category', category)
  if (brand) p.set('brand', brand)
  if (query) p.set('q', query)
  if (sort && !p.has('sort')) p.set('sort', sort)
  p.delete('cursor')
  p.sort()
  const params = p.toString()
  const feed = useInfiniteQuery({
    queryKey: ['catalog', params],
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam, signal }) =>
      commerceFetch<CatalogPage>(
        `/api/commerce/products?${params}&pageSize=24${pageParam ? `&cursor=${encodeURIComponent(pageParam)}` : ''}`,
        { signal },
      ),
    getNextPageParam: (last) => last.nextCursor,
    initialData: {
      pages: [
        {
          items: initialProducts,
          nextCursor: initialCursor,
          hasNextPage: initialHasNext,
          total,
        },
      ],
      pageParams: [undefined],
    },
    staleTime: 120000,
  })
  const facetQuery = useQuery({
    queryKey: ['facets', params],
    queryFn: ({ signal }) =>
      commerceFetch<FacetResult>(`/api/commerce/facets?${params}`, { signal }),
    initialData: initialFacets.groups.length ? initialFacets : undefined,
  })
  const availableFacets = {
    ...(facetQuery.data ?? emptyFacets),
    groups: (facetQuery.data ?? emptyFacets).groups.filter(
      (g) => !lockedFilters.includes(g.key),
    ),
  }
  const items = [
    ...new Map(
      feed.data.pages
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
    router.push(`${pathname}?${next}`, { scroll: false })
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
          Sort
          <select
            value={p.get('sort') ?? 'newest'}
            onChange={(e) => change('sort', e.target.value)}
            className="min-h-11 max-w-[180px] rounded-lg border bg-background px-3"
          >
            {query && <option value="relevance">Best match</option>}
            <option value="newest">Newest</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
            <option value="best-selling">Best selling</option>
          </select>
        </label>
      </div>
      <div className="grid items-start gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="hidden max-h-[calc(100dvh-190px)] overflow-y-auto pr-3 lg:sticky lg:top-[176px] lg:block">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Refine your search</h2>
            {active.length > 0 && (
              <button
                onClick={() => {
                  const n = new URLSearchParams(search)
                  active.forEach((k) => n.delete(k))
                  apply(n)
                }}
                className="min-h-10 text-xs text-brand"
              >
                Clear all
              </button>
            )}
          </div>
          {facetQuery.isError ? (
            <button
              onClick={() => facetQuery.refetch()}
              className="text-sm text-brand"
            >
              Retry filters
            </button>
          ) : (
            <FilterFields facets={availableFacets} values={p} change={change} />
          )}
        </aside>
        <div className="min-w-0">
          <div className="mb-4 flex flex-wrap gap-2">
            {active.map((k) => (
              <button
                key={k}
                onClick={() => change(k, '')}
                className="min-h-9 rounded-full border border-brand/30 bg-brand/5 px-3 text-xs text-brand"
              >
                {k === 'onSale' ? 'On sale' : p.get(k)?.replaceAll('-', ' ')} ×
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 gap-4">
            {items.map((product) => (
              <ProductCard key={product.id} product={product} view="list" />
            ))}
          </div>
          {items.length === 0 && (
            <div className="rounded-xl border border-dashed p-10 text-center">
              <h2 className="text-lg font-semibold">
                No gear matches these filters
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Try removing a filter or searching for another model.
              </p>
            </div>
          )}
          <div ref={sentinel} className="py-6" aria-live="polite">
            {feed.isFetchingNextPage && (
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
