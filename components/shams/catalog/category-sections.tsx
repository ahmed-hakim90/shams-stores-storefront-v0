'use client'
import { useCallback, useEffect, useId, useRef, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { CatalogPage, ProductSummary, TaxonomyTerm } from '@/lib/commerce/types'
import { commerceFetch } from '@/lib/commerce/browser'
import { ProductCard, ProductImage } from '@/components/shams/product'
import { ProductCardSkeleton } from '@/components/shams/shared/storefront-skeletons'
import { Reveal } from '@/components/shams/shared'

export type CategorySectionGroup = {
  category: TaxonomyTerm
  products: ProductSummary[]
  total: number
  hasNextPage: boolean
  nextCursor?: string
}

const sectionQuery = (slug: string, cursor?: string) =>
  `/api/commerce/products?category=${encodeURIComponent(slug)}&pageSize=12&sort=best-selling${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ''}`

function CategoryRail({ group }: { group: CategorySectionGroup }) {
  const scroller = useRef<HTMLDivElement>(null)
  const sentinel = useRef<HTMLDivElement>(null)
  const id = useId()
  const [products, setProducts] = useState(group.products)
  const [cursor, setCursor] = useState(group.nextCursor)
  const [hasNext, setHasNext] = useState(group.hasNextPage)
  const [total, setTotal] = useState(group.total)
  const [loading, setLoading] = useState(false)
  const [edges, setEdges] = useState({ start: true, end: false })

  const loadMore = useCallback(async () => {
    if (!cursor) return
    setLoading(true)
    try {
      const page = await commerceFetch<CatalogPage>(
        sectionQuery(group.category.slug, cursor),
      )
      setProducts((prev) => {
        const seen = new Set(prev.map((p) => p.id))
        return [...prev, ...page.items.filter((i) => !seen.has(i.id))]
      })
      setCursor(page.nextCursor)
      setHasNext(page.hasNextPage)
      setTotal(page.total)
    } catch {
      setHasNext(false)
    } finally {
      setLoading(false)
    }
  }, [cursor, group.category.slug])

  useEffect(() => {
    const el = scroller.current
    if (!el) return
    const update = () =>
      setEdges({
        start: el.scrollLeft <= 2,
        end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 2,
      })
    const observer = new ResizeObserver(update)
    observer.observe(el)
    el.addEventListener('scroll', update, { passive: true })
    update()
    return () => {
      observer.disconnect()
      el.removeEventListener('scroll', update)
    }
  }, [products.length])

  useEffect(() => {
    const el = sentinel.current
    const root = scroller.current
    if (!el || !root || !hasNext || loading) return
    const o = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) void loadMore()
      },
      { root, rootMargin: '200px' },
    )
    o.observe(el)
    return () => o.disconnect()
  }, [hasNext, loading, loadMore])

  const move = (direction: number) => {
    const el = scroller.current
    if (el)
      el.scrollBy({
        left: direction * (el.clientWidth * 0.85),
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
          ? 'instant'
          : 'smooth',
      })
  }

  return (
    <div className="min-w-0">
      <div className="relative">
        <div
          ref={scroller}
          id={id}
          className="shams-rail"
          role="region"
          aria-label={`${group.category.name} products`}
          tabIndex={0}
        >
          {products.map((p) => (
            <ProductCard key={p.id} product={p} view="rail" />
          ))}
          {loading && <ProductCardSkeleton />}
          <Link
            href={`/c/${group.category.slug}`}
            prefetch={false}
            data-prefetch-on-intent
            className="flex w-44 shrink-0 snap-start flex-col items-center justify-center gap-1.5 rounded-(--radius-card) border border-dashed border-border p-6 text-center transition-colors duration-fast hover:border-foreground"
          >
            <span className="text-xs font-semibold">View all</span>
            <span className="text-[11px] text-muted-foreground">
              {total} {total === 1 ? 'product' : 'products'} →
            </span>
          </Link>
          <div ref={sentinel} aria-hidden className="w-px shrink-0" />
        </div>
        <div className="mt-2 hidden items-center justify-end gap-1.5 md:flex">
          <button
            aria-label={`Previous ${group.category.name} products`}
            aria-controls={id}
            disabled={edges.start}
            onClick={() => move(-1)}
            className="shams-icon-control size-8 disabled:cursor-not-allowed disabled:opacity-45"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            aria-label={`Next ${group.category.name} products`}
            aria-controls={id}
            disabled={edges.end}
            onClick={() => move(1)}
            className="shams-icon-control size-8 disabled:cursor-not-allowed disabled:opacity-45"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

function SectionHeader({
  term,
  count,
  priority,
}: {
  term: TaxonomyTerm
  count: number
  priority?: boolean
}) {
  return (
    <Link
      href={`/c/${term.slug}`}
      prefetch={false}
      data-prefetch-on-intent
      className="group relative block h-40 overflow-hidden rounded-(--radius-card) bg-surface-subtle sm:h-48 lg:h-56"
    >
      <ProductImage
        src={term.image ?? '/images/hero-mirrorless.png'}
        alt={term.name}
        fill
        sizes="(max-width:1023px) calc(100vw - 2rem), 900px"
        className="object-cover transition-transform duration-standard motion-safe:[@media(hover:hover)]:group-hover:scale-[1.025]"
        priority={priority}
      />
      <span
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-surface-overlay/90 via-surface-overlay/45 to-transparent"
      />
      <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4">
        <span className="min-w-0">
          <span className="block truncate text-lg font-semibold tracking-tight text-on-dark sm:text-xl">
            {term.name}
          </span>
          <span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-[.16em] text-on-dark-muted">
            {count} {count === 1 ? 'product' : 'products'}
          </span>
        </span>
        <span className="shrink-0 text-xs font-medium text-on-dark">
          View all →
        </span>
      </span>
    </Link>
  )
}

function SectionSkeleton() {
  return (
    <section aria-label="Loading category" className="space-y-3">
      <div className="h-40 animate-pulse rounded-(--radius-card) bg-muted/40 motion-reduce:animate-none sm:h-48 lg:h-56" />
      <div className="shams-rail" aria-hidden>
        {[0, 1, 2, 3].map((x) => (
          <ProductCardSkeleton key={x} />
        ))}
      </div>
    </section>
  )
}

export function CategorySections({
  groups,
  remaining,
}: {
  groups: CategorySectionGroup[]
  remaining: TaxonomyTerm[]
}) {
  const [sections, setSections] = useState<CategorySectionGroup[]>(groups)
  const [queue, setQueue] = useState<TaxonomyTerm[]>(remaining)
  const [loadingSection, setLoadingSection] = useState(false)
  const sentinel = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = sentinel.current
    if (!el || queue.length === 0 || loadingSection) return
    let cancelled = false
    const o = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting || cancelled) return
        const [next, ...rest] = queue
        cancelled = true
        o.disconnect()
        setLoadingSection(true)
        commerceFetch<CatalogPage>(sectionQuery(next.slug))
          .then((page) => {
            setQueue(rest)
            if (page.items.length > 0)
              setSections((prev) => [
                ...prev,
                {
                  category: next,
                  products: page.items,
                  total: page.total,
                  hasNextPage: page.hasNextPage,
                  nextCursor: page.nextCursor,
                },
              ])
          })
          .catch(() => setQueue(rest))
          .finally(() => {
            if (!cancelled) return
            setLoadingSection(false)
            cancelled = false
          })
      },
      { rootMargin: '800px' },
    )
    o.observe(el)
    return () => {
      cancelled = true
      o.disconnect()
    }
  }, [queue, loadingSection])

  return (
    <div className="space-y-8 sm:space-y-10">
      {sections.map((group, i) => (
        <Reveal key={group.category.slug} as="fade-up">
          <section aria-label={group.category.name} className="space-y-3">
            <SectionHeader
              term={group.category}
              count={group.total}
              priority={i === 0}
            />
            <CategoryRail group={group} />
          </section>
        </Reveal>
      ))}
      {loadingSection && <SectionSkeleton />}
      {queue.length > 0 && (
        <div ref={sentinel} aria-hidden className="h-px" />
      )}
    </div>
  )
}
