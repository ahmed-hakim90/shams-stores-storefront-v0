'use client'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { ProductDetail, BranchAvailability } from '@/lib/commerce/types'
import { commerceFetch } from '@/lib/commerce/browser'
import { ProductGallery } from './product-gallery'
import { ProductCard } from './product-card'
import { PriceDisplay } from './price-display'
import { StockStatus } from './stock-status'
import { AddToCartButton } from './add-to-cart-button'
import { WishlistAction } from './wishlist-action'
import { CompareAction } from './compare-action'
import { ProductBadge } from './product-badge'
import { RatingStars } from './rating-stars'
import { useInteractions } from './interaction-provider'
import { RecordViewed } from './saved-products'
export function LiveProductDetail({ product }: { product: ProductDetail }) {
  const [quantity, setQuantity] = useState(1)
  const purchase = useRef<HTMLDivElement>(null),
    [sticky, setSticky] = useState(false)
  const { setStickyPurchaseVisible } = useInteractions()
  useEffect(() => {
    const el = purchase.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        const shown =
          !entry.isIntersecting && entry.boundingClientRect.bottom < 0
        setSticky(shown)
        setStickyPurchaseVisible(shown)
      },
      { threshold: 0 },
    )
    observer.observe(el)
    return () => {
      observer.disconnect()
      setStickyPurchaseVisible(false)
    }
  }, [setStickyPurchaseVisible])
  const stock = useQuery({
    queryKey: ['branch-stock', product.id],
    queryFn: ({ signal }) =>
      commerceFetch<BranchAvailability>(
        `/api/commerce/availability?id=${product.id}`,
        { signal },
      ),
    staleTime: 30000,
  })
  const gallery = product.gallery.length
    ? product.gallery
    : [{ url: product.image, alt: product.name }]
  return (
    <main className="shams-container py-6 sm:py-10">
      <RecordViewed id={product.id} />
      <nav
        aria-label="Breadcrumb"
        className="mb-6 flex flex-wrap gap-2 text-xs text-muted-foreground"
      >
        <Link href="/">Home</Link>
        <span>/</span>
        <Link href="/shop">Shop</Link>
        {product.categories.slice(0, 1).map((c) => (
          <span key={c.id}>
            {' '}
            / <Link href={`/c/${c.slug}`}>{c.name}</Link>
          </span>
        ))}
      </nav>
      <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-12">
        <ProductGallery images={gallery} name={product.name} />
        <section className="min-w-0">
          {product.brand && (
            <Link
              href={`/b/${product.brandSlug}`}
              className="text-sm font-semibold uppercase tracking-[.15em] text-brand-ink"
            >
              {product.brand}
            </Link>
          )}
          <h1 className="mt-3 text-2xl font-semibold leading-tight tracking-tight sm:text-4xl">
            {product.name}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {product.badges.map((b) => (
              <ProductBadge key={b} badge={b} />
            ))}
            {product.sku && (
              <span className="text-xs text-muted-foreground">
                SKU {product.sku}
              </span>
            )}
          </div>
          {product.reviewCount > 0 && (
            <RatingStars
              rating={product.rating}
              reviewCount={product.reviewCount}
            />
          )}
          <div className="my-6 border-y py-5">
            <PriceDisplay
              price={product.price}
              previousPrice={product.previousPrice}
              installmentFrom={product.installmentFrom}
              size="lg"
            />
          </div>
          <StockStatus status={product.stock} />
          {product.highlights?.length ? (
            <ul className="mt-5 space-y-2 text-sm leading-6 text-muted-foreground">
              {product.highlights.map((h) => (
                <li key={h.value}>• {h.value}</li>
              ))}
            </ul>
          ) : null}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <label className="text-xs text-muted-foreground">
              Quantity
              <input
                type="number"
                aria-label="Quantity"
                min="1"
                max="99"
                value={quantity}
                onChange={(e) =>
                  setQuantity(
                    Math.min(99, Math.max(1, Number(e.target.value) || 1)),
                  )
                }
                className="ml-2 h-12 w-16 rounded-lg border px-3 text-base text-foreground"
              />
            </label>
            <WishlistAction productId={product.id} productName={product.name} />
            <CompareAction productId={product.id} productName={product.name} />
          </div>
          <div ref={purchase}>
            <AddToCartButton
              product={product}
              quantity={quantity}
              className="mt-4 min-h-12 w-full rounded-lg"
            />
          </div>
          {product.stock === 'out_of_stock' && (
            <p className="mt-3 text-sm text-muted-foreground">
              This item is currently out of stock. Explore related gear below or
              save it to your wishlist.
            </p>
          )}
          {product.hasOptions && (
            <p className="mt-3 text-sm text-muted-foreground">
              Contact Shams to confirm the available configuration.
            </p>
          )}
          <Link
            href="/support"
            className="mt-5 inline-flex min-h-11 items-center text-sm font-medium text-brand-ink"
          >
            Need help choosing? Talk to Shams →
          </Link>
          {product.warranty && (
            <div className="shams-panel mt-6 p-4">
              <h2 className="text-sm font-semibold">Warranty</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {product.warranty}
              </p>
            </div>
          )}
          {stock.data?.branches.length ? (
            <section className="shams-panel mt-6 p-4">
              <h2 className="font-semibold">Branch availability</h2>
              {stock.data.message && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {stock.data.message}
                </p>
              )}
              <ul className="mt-3 divide-y divide-border">
                {stock.data.branches.map((b) => (
                  <li
                    key={b.id}
                    className="flex items-center justify-between gap-3 py-2 text-sm"
                  >
                    <span className="min-w-0 truncate">{b.name}</span>
                    <span className="shrink-0 font-medium">{b.status}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </section>
      </div>
      <nav
        aria-label="Product information"
        className="mt-10 flex gap-3 overflow-x-auto border-y py-2 text-sm"
      >
        {product.description && (
          <a
            href="#overview"
            className="shrink-0 rounded-full px-4 py-3 hover:bg-brand-muted"
          >
            Overview
          </a>
        )}
        {product.specifications.length > 0 && (
          <a
            href="#specifications"
            className="shrink-0 rounded-full px-4 py-3 hover:bg-brand-muted"
          >
            Specifications
          </a>
        )}
        {product.relationships.length > 0 && (
          <a
            href="#related-gear"
            className="shrink-0 rounded-full px-4 py-3 hover:bg-brand-muted"
          >
            Explore related gear
          </a>
        )}
      </nav>
      <div className="mt-8 space-y-10">
        {product.description && (
          <section
            id="overview"
            className="grid gap-5 lg:grid-cols-[240px_1fr]"
          >
            <h2 className="mb-4 text-2xl font-semibold">Overview</h2>
            <p className="max-w-4xl whitespace-pre-line break-words text-sm leading-7 text-muted-foreground">
              {product.description}
            </p>
          </section>
        )}
        {product.specifications.length > 0 && (
          <section
            id="specifications"
            className="grid gap-5 border-t pt-8 lg:grid-cols-[240px_1fr]"
          >
            <h2 className="mb-4 text-2xl font-semibold">Specifications</h2>
            <dl className="max-w-4xl overflow-hidden rounded-xl border">
              {product.specifications.map((s) => (
                <div
                  key={s.key}
                  className="grid gap-1 border-b p-4 text-sm odd:bg-card sm:grid-cols-2 sm:gap-4 last:border-0"
                >
                  <dt className="text-muted-foreground">{s.label}</dt>
                  <dd>{s.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}
        {product.relationships.map((group, i) => (
          <section
            id={i === 0 ? 'related-gear' : undefined}
            key={group.type}
            className="border-t pt-8"
          >
            <h2 className="mb-6 text-2xl font-semibold">{group.title}</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {group.products.slice(0, 6).map((p) => (
                <ProductCard key={p.id} product={p} view="compact-related" />
              ))}
            </div>
          </section>
        ))}
      </div>
      {sticky && (
        <div
          data-fixed-bar
          className="fixed inset-x-0 z-[65] border-t bg-background p-3 lg:hidden"
          style={{
            bottom: 'var(--fixed-stack-bottom)',
          }}
        >
          <div className="mx-auto flex max-w-xl items-center gap-3">
            <div className="min-w-0 flex-1">
              <PriceDisplay price={product.price} size="sm" />
            </div>
            <AddToCartButton
              product={product}
              quantity={quantity}
              className="min-h-12 max-w-[180px] rounded-lg"
            />
          </div>
        </div>
      )}
    </main>
  )
}
