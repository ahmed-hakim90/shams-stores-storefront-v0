'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { useInteractions } from './interaction-provider'
import { commerceFetch } from '@/lib/commerce/browser'
import type { ProductSummary } from '@/lib/commerce/types'
import { ProductCard } from './product-card'
import { ProductRail } from './product-rail'
import { formatMoney } from '@/lib/commerce'
export function SavedProducts({
  mode,
  compact = false,
}: {
  mode: 'wishlist' | 'compare'
  compact?: boolean
}) {
  const { wishlistItems, compareItems } = useInteractions(),
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
  return (
    <div
      className={
        compact
          ? 'py-3'
          : 'mobile-storefront-page mx-auto max-w-[1400px] px-4 py-10 sm:px-6'
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
            className="mt-4 inline-flex min-h-11 items-center rounded-lg bg-brand px-5 text-sm text-white"
          >
            Explore gear
          </Link>
        </div>
      )}
      {mode === 'compare' && products.length > 0 ? (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[660px] border-collapse text-left text-sm">
            <thead>
              <tr>
                <th className="p-4">Product</th>
                {products.map((p) => (
                  <th key={p.id} className="w-64 border p-3">
                    <ProductCard product={p} view="rail" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {['Brand', 'Price', 'Availability', 'Highlights'].map((label) => (
                <tr key={label}>
                  <th className="border p-4">{label}</th>
                  {products.map((p) => (
                    <td key={p.id} className="border p-4 align-top">
                      {label === 'Brand'
                        ? p.brand || '—'
                        : label === 'Price'
                          ? formatMoney(p.price)
                          : label === 'Availability'
                            ? p.stock.replaceAll('_', ' ')
                            : p.highlights?.map((h) => h.value).join(' · ') ||
                              'See product details'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} view="list" />
          ))}
        </div>
      )}
    </div>
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
    <section className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6">
      <h2 className="mb-5 text-2xl font-semibold">Recently viewed</h2>
      <ProductRail products={q.data} />
    </section>
  )
}
