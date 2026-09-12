'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { ProductViewToggle, type ProductView } from './product-view-toggle'
import { LoaderCircle, RefreshCw } from 'lucide-react'
import type { CatalogPage, CatalogQuery, Product } from '@/lib/commerce'
import { ProductCard } from './product-card'
import { Button } from '@/components/ui/button'

type Props = { initialProducts: Product[]; initialCursor?: string; initialHasNext: boolean; total: number; category?: string; query?: string; brand?: string; sort?: CatalogQuery['sort'] }

export function ShopFeed({ initialProducts, initialCursor, initialHasNext, total, category, query, brand, sort }: Props) {
  const [items, setItems] = useState(initialProducts)
  const [cursor, setCursor] = useState(initialCursor)
  const [hasNext, setHasNext] = useState(initialHasNext)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [view, setView] = useState<ProductView>('grid')
  const inFlight = useRef(false)
  const sentinel = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const saved = window.localStorage.getItem('shams-product-view')
    if (saved === 'grid' || saved === 'list') { setView(saved); return }
    setView(window.matchMedia('(max-width: 639px)').matches ? 'list' : 'grid')
  }, [])
  useEffect(() => { window.localStorage.setItem('shams-product-view', view) }, [view])

  const loadMore = useCallback(async () => {
    if (inFlight.current || !hasNext) return
    inFlight.current = true
    setLoading(true)
    setError(false)
    try {
        const params = new URLSearchParams({ pageSize: '20' })
        for (const [key, value] of Object.entries({ cursor, category, query, brand, sort })) if (value) params.set(key, value)
        const response = await fetch(`/api/commerce/products?${params}`, { cache: 'no-store' })
        if (!response.ok) throw new Error('Unable to load products')
        const page: CatalogPage = await response.json()
        setItems((current) => [...current, ...page.items.filter((item) => !current.some((existing) => existing.id === item.id))])
        setCursor(page.nextCursor)
        setHasNext(page.hasNextPage)
    } catch { setError(true) } finally { inFlight.current = false; setLoading(false) }
  }, [category, cursor, hasNext, query, brand, sort])

  useEffect(() => {
    const element = sentinel.current
    if (!element) return
    const observer = new IntersectionObserver((entries) => { if (entries[0]?.isIntersecting && !error) loadMore() }, { rootMargin: '800px' })
    observer.observe(element)
    return () => observer.disconnect()
  }, [loadMore, error])

  return <section aria-label="Shop products">
    <div className="mb-5 flex items-center justify-between gap-3 text-sm text-muted-foreground"><div><span>{total} products</span><span className="ml-2 text-xs">{items.length} loaded</span></div><ProductViewToggle value={view} onChange={setView} /></div>
    <div className={view === 'list' ? 'grid grid-cols-1 gap-3' : 'grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-6 xl:grid-cols-4'}>{items.map((product) => <ProductCard key={product.id} product={product} view={view} />)}</div>
    <div ref={sentinel} className="flex min-h-24 items-center justify-center py-6">{loading && <LoaderCircle className="size-5 animate-spin text-brand" aria-label="Loading more products" />}{error && <div className="flex items-center gap-3 text-sm text-muted-foreground"><span>Could not load more products.</span><Button variant="outline" className="min-h-10 gap-2" onClick={loadMore}><RefreshCw className="size-4" />Retry</Button></div>}{!loading && !error && !hasNext && items.length > 0 && <p className="text-sm text-muted-foreground">You&apos;ve reached the end.</p>}</div>
  </section>
}
