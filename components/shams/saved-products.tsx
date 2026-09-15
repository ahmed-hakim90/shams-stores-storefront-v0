'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { useInteractions } from './interaction-provider'
import { commerceFetch } from '@/lib/commerce/browser'
import type { ProductSummary } from '@/lib/commerce/types'
import { ProductCard } from './product-card'
import { ProductRail } from './product-rail'
import { comparisonRows } from '@/lib/commerce/comparison'
import type { ProductSpecification } from '@/lib/commerce/types'
export function SavedProducts({
  mode,
  compact = false,
}: {
  mode: 'wishlist' | 'compare'
  compact?: boolean
}) {
  const { wishlistItems, compareItems, toggleCompare, toggleWishlist } =
      useInteractions(),
    ids = mode === 'wishlist' ? wishlistItems : compareItems
  const q = useQuery({
    queryKey: ['saved-products', ids],
    queryFn: ({ signal }) =>
      commerceFetch<ProductSummary[]>(
        `/api/commerce/products?ids=${ids.join(',')}`,
        { signal },
      ),
    enabled: ids.length > 0,
  })
  const products = q.data ?? []
  const [differencesOnly, setDifferencesOnly] = useState(false)
  const specs = useQuery({
    queryKey: ['comparison-specs', ids],
    queryFn: ({ signal }) =>
      commerceFetch<Record<string, ProductSpecification[]>>(
        `/api/commerce/comparison?ids=${ids.join(',')}`,
        { signal },
      ),
    enabled: mode === 'compare' && ids.length > 0,
    staleTime: 120000,
  })
  const rows = comparisonRows(products, specs.data)
  const unavailable = q.isSuccess
    ? ids.filter((id) => !products.some((p) => p.id === id))
    : []
  const Container = compact ? 'div' : 'main'
  return (
    <Container
      className={
        compact
          ? 'py-3'
          : 'shams-container shams-section'
      }
    >
      <h1 className="text-2xl font-semibold">
        {mode === 'wishlist' ? 'Your wishlist' : 'Compare gear'}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {mode === 'wishlist'
          ? 'Save the gear you want to come back to.'
          : 'A closer look at your shortlist.'}
      </p>
      {q.isLoading && <p className="py-8 text-sm">Loading your gear…</p>}
      {q.isError && (
        <button
          onClick={() => q.refetch()}
          className="my-6 min-h-11 rounded-lg border px-4"
        >
          Retry
        </button>
      )}
      {!ids.length && (
        <div className="py-12">
          <p className="text-sm text-muted-foreground">
            Your {mode} list is empty.
          </p>
          <Link
            href="/shop"
            className="mt-4 inline-flex min-h-11 items-center rounded-lg bg-brand px-5 text-sm text-brand-foreground"
          >
            Explore gear
          </Link>
        </div>
      )}
      {unavailable.length > 0 && (
        <div className="shams-panel mt-5 p-4 text-sm">
          <p>Some saved gear is no longer available in the catalog.</p>
          <button
            className="mt-2 min-h-11 text-brand-ink"
            onClick={() =>
              unavailable.forEach((id) =>
                mode === 'compare' ? toggleCompare(id) : toggleWishlist(id),
              )
            }
          >
            Remove unavailable items
          </button>
        </div>
      )}
      {mode === 'compare' && products.length > 0 ? (
        <div className="mt-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <label className="flex min-h-11 items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={differencesOnly}
                onChange={(e) => setDifferencesOnly(e.target.checked)}
              />
              Show differences only
            </label>
            <span role="status" className="text-xs text-muted-foreground">
              {specs.isFetching
                ? 'Loading specifications…'
                : 'Differences appear first'}
            </span>
          </div>
          {specs.isError && (
            <button
              className="mb-3 min-h-11 text-sm text-brand-ink"
              onClick={() => specs.refetch()}
            >
              Retry specifications
            </button>
          )}
          <div
            className="max-h-[70dvh] overflow-auto overscroll-contain rounded-2xl border bg-card"
            tabIndex={0}
            role="region"
            aria-label="Product comparison"
          >
            <table
              className="w-full table-fixed border-collapse text-left text-sm"
              style={{
                minWidth: `calc(72px + ${products.length} * clamp(104px, (100vw - 8rem) / 2, 240px))`,
              }}
            >
              <caption className="sr-only">
                Compare product differences and shared specifications
              </caption>
              <thead className="sticky top-0 z-10 bg-card">
                <tr>
                  <th
                    scope="col"
                    className="w-18 break-words bg-muted p-3 text-xs sm:min-w-36"
                  >
                    Your shortlist
                  </th>
                  {products.map((p) => (
                    <th
                      scope="col"
                      key={p.id}
                      className="break-words border-l p-3 align-top sm:min-w-60"
                    >
                      <div className="sticky top-0 bg-card">
                        <Link
                          href={`/p/${p.slug}`}
                          className="block text-sm font-semibold leading-6"
                        >
                          {p.name}
                        </Link>
                        <button
                          className="mt-2 min-h-11 text-xs font-normal text-muted-foreground underline"
                          onClick={() => toggleCompare(p.id)}
                        >
                          Remove
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows
                  .filter((r) => !differencesOnly || r.different)
                  .map((row) => (
                    <tr
                      key={row.key}
                      className={
                        row.different ? 'bg-brand-muted/40' : 'bg-card'
                      }
                    >
                      <th
                        scope="row"
                        className="break-words border-t p-3 text-xs font-medium text-muted-foreground sm:p-4"
                      >
                        {row.label}
                      </th>
                      {row.values.map((v, i) => (
                        <td
                          key={products[i].id}
                          className="break-words border-l border-t p-3 align-top leading-6 sm:p-4"
                        >
                          {v}
                        </td>
                      ))}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          {differencesOnly && rows.every((r) => !r.different) && (
            <p className="py-4 text-sm text-muted-foreground">
              No differences in the available specifications. Open product
              details for a closer look.
            </p>
          )}
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} view="compact-related" />
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} view="list" />
          ))}
        </div>
      )}
    </Container>
  )
}
export function RecordViewed({ id }: { id: string }) {
  useEffect(() => {
    try {
      const ids = JSON.parse(
        localStorage.getItem('shams-recent-products') ?? '[]',
      )
      localStorage.setItem(
        'shams-recent-products',
        JSON.stringify(
          [
            id,
            ...(Array.isArray(ids) ? ids : []).filter((x) => x !== id),
          ].slice(0, 12),
        ),
      )
    } catch {}
  }, [id])
  return null
}
export function RecentlyViewed() {
  const [ids, setIds] = useState<string[]>([])
  useEffect(() => {
    try {
      const v = JSON.parse(
        localStorage.getItem('shams-recent-products') ?? '[]',
      )
      if (Array.isArray(v))
        setIds(v.filter((x) => typeof x === 'string').slice(0, 12))
    } catch {}
  }, [])
  const q = useQuery({
    queryKey: ['recent-products', ids],
    queryFn: ({ signal }) =>
      commerceFetch<ProductSummary[]>(
        `/api/commerce/products?ids=${ids.join(',')}`,
        { signal },
      ),
    enabled: ids.length > 0,
  })
  if (!q.data?.length) return null
  return (
    <section className="shams-container shams-section">
      <h2 className="mb-5 text-2xl font-semibold">Recently viewed</h2>
      <ProductRail products={q.data} />
    </section>
  )
}
