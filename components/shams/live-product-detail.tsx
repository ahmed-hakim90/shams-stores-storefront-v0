'use client'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { ProductDetail, BranchAvailability } from '@/lib/commerce/types'
import { commerceFetch } from '@/lib/commerce/browser'
import { ProductImage } from './product-image'
import { PriceDisplay } from './price-display'
import { StockStatus } from './stock-status'
import { AddToCartButton } from './add-to-cart-button'
import { WishlistAction } from './wishlist-action'
import { CompareAction } from './compare-action'
import { ProductRail } from './product-rail'
import { RatingStars } from './rating-stars'
import { useInteractions } from './interaction-provider'
import { RecordViewed } from './saved-products'
export function LiveProductDetail({ product }: { product: ProductDetail }) {
  const [selected, setSelected] = useState(0),
    [quantity, setQuantity] = useState(1)
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
    <main className="mobile-storefront-page mx-auto max-w-[1400px] px-4 py-6 pb-28 sm:px-6 sm:py-10">
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
        <section className="min-w-0">
          <div className="relative aspect-square overflow-hidden rounded-2xl border bg-white">
            <ProductImage
              key={selected}
              src={gallery[selected].url}
              alt={gallery[selected].alt}
              fill
              priority
              sizes="(max-width: 1023px) 90vw, 620px"
              className="object-contain p-6"
            />
          </div>
          {gallery.length > 1 && (
            <div className="mt-3 flex gap-3 overflow-x-auto">
              {gallery.map((image, i) => (
                <button
                  key={image.url}
                  onClick={() => setSelected(i)}
                  aria-label={`View image ${i + 1}`}
                  aria-pressed={selected === i}
                  className={`relative size-20 shrink-0 rounded-lg border bg-white ${selected === i ? 'border-brand ring-1 ring-brand' : ''}`}
                >
                  <ProductImage
                    src={image.url}
                    alt=""
                    fill
                    sizes="80px"
                    className="object-contain p-2"
                  />
                </button>
              ))}
            </div>
          )}
        </section>
        <section className="min-w-0">
          {product.brand && (
            <Link
              href={`/b/${product.brandSlug}`}
              className="text-sm font-semibold uppercase tracking-[.15em] text-brand"
            >
              {product.brand}
            </Link>
          )}
          <h1 className="mt-3 text-2xl font-semibold leading-tight tracking-tight sm:text-4xl">
            {product.name}
          </h1>
          {product.sku && (
            <p className="mt-3 text-xs text-muted-foreground">
              SKU {product.sku}
            </p>
          )}
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
          {product.warranty && (
            <div className="mt-6 rounded-xl border p-4">
              <h2 className="text-sm font-semibold">Warranty</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {product.warranty}
              </p>
            </div>
          )}
          {stock.data?.branches.length ? (
            <section className="mt-6 rounded-xl border p-4">
              <h2 className="font-semibold">Branch availability</h2>
              {stock.data.branches.map((b) => (
                <div
                  key={b.id}
                  className="mt-3 flex justify-between gap-3 text-sm"
                >
                  <span>{b.name}</span>
                  <span>{b.status}</span>
                </div>
              ))}
            </section>
          ) : null}
        </section>
      </div>
      <div className="mt-12 space-y-8">
        {product.description && (
          <section className="border-t pt-8">
            <h2 className="mb-4 text-2xl font-semibold">Overview</h2>
            <p className="max-w-4xl whitespace-pre-line text-sm leading-7 text-muted-foreground">
              {product.description}
            </p>
          </section>
        )}
        {product.specifications.length > 0 && (
          <section className="border-t pt-8">
            <h2 className="mb-4 text-2xl font-semibold">Specifications</h2>
            <dl className="max-w-4xl overflow-hidden rounded-xl border">
              {product.specifications.map((s) => (
                <div
                  key={s.key}
                  className="grid grid-cols-2 gap-4 border-b p-4 text-sm last:border-0"
                >
                  <dt className="text-muted-foreground">{s.label}</dt>
                  <dd>{s.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}
        {product.relationships.map((group) => (
          <section key={group.type} className="border-t pt-8">
            <h2 className="mb-6 text-2xl font-semibold">{group.title}</h2>
            <ProductRail products={group.products} />
          </section>
        ))}
      </div>
      {sticky && (
        <div
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
