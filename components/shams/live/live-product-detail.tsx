'use client'
import Link from 'next/link'
import { InstallmentNotice } from '@/components/shams/payments/installment-notice'
import { ProductAssurances } from '@/components/shams/product/product-assurances'
import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { ProductDetail, BranchAvailability, ProductSummary } from '@/lib/commerce/types'
import { commerceFetch } from '@/lib/commerce/browser'
import {
  ProductGallery,
  ProductCard,
  PriceDisplay,
  StockStatus,
  AddToCartButton,
  VariantSelector,
  type SelectedVariant,
  WishlistAction,
  CompareAction,
  ProductBadge,
  RatingStars,
  RecentlyViewed,
  ProductBundleAddonCard,
  RecordViewed,
} from '@/components/shams/product'
import { Reveal } from '@/components/shams/shared'
import { SafeRichText } from '@/components/shams/shared/safe-rich-text'
import { useInteractions } from '@/components/shams/providers'
import { measureOaiq, trackViewContent } from '@/lib/tracking'
export function LiveProductDetail({ product }: { product: ProductDetail }) {
  const [quantity, setQuantity] = useState(1)
  const [selectedVariant, setSelectedVariant] = useState<SelectedVariant | null>(null)
  const purchase = useRef<HTMLDivElement>(null),
    [sticky, setSticky] = useState(false)
  const { setStickyPurchaseVisible } = useInteractions()
  useEffect(() => {
    const params = {
      content_name: product.name,
      content_ids: [product.id],
      content_type: 'product',
      value: product.price.amount,
      currency: 'EGP',
    }
    measureOaiq('view_content', params)
    trackViewContent({ id: product.id, name: product.name, price: product.price.amount })
  }, [product.id, product.name, product.price.amount])
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
    <main className="shams-container py-6 pb-[calc(1.5rem+var(--mobile-bottom-nav-height))] sm:py-10 sm:pb-10">
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://shams-stores.com/' },
              { '@type': 'ListItem', position: 2, name: 'Shop', item: 'https://shams-stores.com/shop' },
              ...product.categories.slice(0, 1).map((c, i) => ({
                '@type': 'ListItem',
                position: 3 + i,
                name: c.name,
                item: `https://shams-stores.com/c/${c.slug}`,
              })),
              {
                '@type': 'ListItem',
                position: 3 + product.categories.slice(0, 1).length,
                name: product.name,
              },
            ],
          }),
        }}
      />
      <Reveal as="fade-up">
        <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="space-y-2 lg:hidden">
            <h1 className="text-xl font-semibold">{product.name}</h1>
            <PriceDisplay price={selectedVariant?.price ?? product.price} />
            <InstallmentNotice eligible={(selectedVariant?.price.amount ?? product.price.amount) > 0 && (selectedVariant?.stock.status ?? product.stock) !== 'out_of_stock' && product.purchasable !== false} href="#installments" />
            <StockStatus status={selectedVariant?.stock.status ?? product.stock} />
          </div>
          <ProductGallery images={gallery} name={product.name} />
          <section className="min-w-0">
            {product.brand && (
              <div className="flex items-center gap-2">
                <Link
                  href={`/b/${product.brandSlug}`}
                  className="text-sm font-semibold uppercase tracking-[.15em] text-brand-ink"
                >
                  {product.brand}
                </Link>
                {product.official && (
                  <span className="rounded-full bg-brand-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-ink">
                    Authorized
                  </span>
                )}
              </div>
            )}
            <h1 className="hidden lg:block mt-3 text-2xl font-semibold leading-tight tracking-tight sm:text-4xl">
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
            {product.shortDescription && (
              <SafeRichText className="shams-description mt-4 text-sm leading-relaxed text-muted-foreground" html={product.shortDescription} />
            )}
            {product.reviewCount > 0 && (
              <RatingStars
                rating={product.rating}
                reviewCount={product.reviewCount}
              />
            )}
            <div className="my-6 rounded-(--radius-control) bg-surface-raised/40 px-4 py-5">
              <PriceDisplay
                price={selectedVariant?.price ?? product.price}
                previousPrice={!selectedVariant ? product.previousPrice : undefined}
                installmentFrom={!selectedVariant ? product.installmentFrom : undefined}
                size="lg"
              />
            </div>
            <StockStatus status={selectedVariant?.stock.status ?? product.stock} />
            {(() => {
              const qty = selectedVariant?.stock.quantity
              const isLow = selectedVariant
                ? qty != null && qty > 0 && qty <= 5
                : product.stock === 'low_stock'
              if (!isLow) return null
              return (
                <p className="mt-1.5 text-xs font-medium text-warning">
                  {qty != null && qty > 0
                    ? `Only ${qty} left — order soon`
                    : 'Low stock — order soon'}
                </p>
              )
            })()}
            {product.variants.length > 0 && (
              <div className="mt-5">
                <VariantSelector
                  variants={product.variants}
                  onSelect={setSelectedVariant}
                />
              </div>
            )}
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
                  className="ml-2 h-12 w-16 rounded-(--radius-control) border px-3 text-base text-foreground"
                />
              </label>
              <WishlistAction productId={product.id} productName={product.name} />
              <CompareAction productId={product.id} productName={product.name} />
            </div>
            <div ref={purchase}>
              <AddToCartButton
                product={product}
                quantity={quantity}
                variant={selectedVariant}
                className="mt-4 min-h-12 w-full rounded-(--radius-control)"
              />
            </div>
            <InstallmentNotice detailed eligible={(selectedVariant?.price.amount ?? product.price.amount) > 0 && (selectedVariant?.stock.status ?? product.stock) !== 'out_of_stock' && product.purchasable !== false} />
            <div className="mt-4"><ProductAssurances value={product.assurances} /></div>
            {product.stock === 'out_of_stock' && (
              <p className="mt-3 text-sm text-muted-foreground">
                This item is currently out of stock. Explore related gear below or
                save it to your wishlist.
              </p>
            )}
            {product.hasOptions && product.variants.length === 0 && (
              <p className="mt-3 text-sm text-muted-foreground">
                Contact Shams to confirm the available configuration.
              </p>
            )}
            {product.bundles && product.bundles.length > 0 && (
              <section className="mt-4">
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-brand-ink">
                  Complete your setup
                </h2>
                <div className="space-y-2">
                  {product.bundles.map((bundle) => (
                    <ProductBundleAddonCard key={bundle.id} bundle={bundle} />
                  ))}
                </div>
              </section>
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
      </Reveal>
      <Reveal as="fade-up" delay={60}>
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
      </Reveal>
      <div className="mt-8 space-y-14">
        {!!product.decisionFields?.length && <section className="border-t pt-8"><h2 className="mb-4 text-2xl font-semibold">Product details</h2><dl className="grid gap-4 sm:grid-cols-2">{product.decisionFields.map(field => <div key={field.label}><dt className="text-sm font-medium">{field.label}</dt><dd dir="auto" className="mt-1 whitespace-pre-line text-sm text-muted-foreground">{field.value}</dd></div>)}</dl></section>}
        {!!product.resourceLinks?.length && <nav aria-label="Product resources" className="flex flex-wrap gap-4">{product.resourceLinks.map(link => <a key={link.href} href={link.href} className="text-brand-ink underline underline-offset-4">{link.label}</a>)}</nav>}
        {product.relationships.map((group, i) => (
          <Reveal as="fade-up" delay={i * 60} key={`${group.type}-${group.source}`}>
            <section
              id={i === 0 ? 'related-gear' : undefined}
              className="border-t pt-8"
            >
              <h2 className="mb-6 text-2xl font-semibold">{group.title}</h2>
              {group.type === 'accessories' ? (
                <AccessoriesByCategory products={group.products.slice(0, 12)} />
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {group.products.slice(0, 6).map((p) => (
                    <div key={p.id}>
                      <ProductCard product={p} view="compact-related" />
                      {group.compatibility?.[p.id] && <p dir="auto" className="mt-2 text-sm text-muted-foreground"><span className="font-medium text-foreground">{group.compatibility[p.id].level === 'exact' ? 'Exact match' : group.compatibility[p.id].level === 'compatible' ? 'Compatible' : group.compatibility[p.id].level === 'recommended' ? 'Recommended' : 'Check compatibility'}</span>{group.compatibility[p.id].note && ` — ${group.compatibility[p.id].note}`}</p>}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </Reveal>
        ))}
        {product.description && (
          <Reveal as="fade-up">
            <section
              id="overview"
              className="grid gap-5 border-t pt-8 lg:grid-cols-[240px_1fr]"
            >
              <h2 className="mb-4 text-2xl font-semibold">Overview</h2>
              <SafeRichText className="shams-description max-w-4xl break-words text-sm leading-7 text-muted-foreground" html={product.description} />
            </section>
          </Reveal>
        )}
        {product.specifications.length > 0 && (
          <Reveal as="fade-up" delay={60}>
            <section
              id="specifications"
              className="grid gap-5 border-t pt-8 lg:grid-cols-[240px_1fr]"
            >
              <h2 className="mb-4 text-2xl font-semibold">Specifications</h2>
              <dl className="max-w-4xl overflow-hidden rounded-(--radius-card) border">
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
          </Reveal>
        )}
      </div>
      {product.reviews !== undefined && <section className="mt-12 border-t pt-8"><h2 className="text-2xl font-semibold">Customer reviews</h2>{product.reviews.length ? product.reviews.map(review => <article key={review.id} className="mt-4 rounded-(--radius-card) border p-4"><p className="font-medium">{review.author} · {review.rating}/5</p><p dir="auto" className="mt-2 whitespace-pre-line text-sm text-muted-foreground">{review.content}</p></article>) : <p className="mt-3 text-muted-foreground">No reviews yet.</p>}</section>}
      <RecentlyViewed currentSlug={product.slug} />
      {sticky && (
        <div
          data-fixed-bar
          className="fixed inset-x-0 z-[65] animate-slide-in-up border-t bg-background/85 backdrop-blur-xl backdrop-saturate-150 shadow-[0_-2px_12px_rgba(0,0,0,0.06)] p-3 motion-reduce:animate-none lg:hidden"
          style={{
            bottom: 'var(--fixed-stack-bottom)',
          }}
        >
          <div className="mx-auto flex max-w-xl items-center gap-2">
            <div className="min-w-0 flex-1">
              <PriceDisplay price={selectedVariant?.price ?? product.price} size="sm" />
            </div>
            <div className="flex items-center gap-0.5">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                aria-label="Decrease quantity"
                className="flex size-8 items-center justify-center rounded-(--radius-control) border text-sm disabled:opacity-40"
              >
                −
              </button>
              <span className="w-7 text-center text-sm font-medium tabular-nums">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(Math.min(99, quantity + 1))}
                disabled={quantity >= 99}
                aria-label="Increase quantity"
                className="flex size-8 items-center justify-center rounded-(--radius-control) border text-sm disabled:opacity-40"
              >
                +
              </button>
            </div>
            <AddToCartButton
              product={product}
              quantity={quantity}
              variant={selectedVariant}
              className="min-h-12 max-w-[150px] rounded-(--radius-control)"
            />
          </div>
        </div>
      )}
    </main>
  )
}

function AccessoriesByCategory({ products }: { products: ProductSummary[] }) {
  const grouped = products.reduce<Record<string, ProductSummary[]>>((acc, p) => {
    const cat = p.category || 'Other accessories'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(p)
    return acc
  }, {})

  const categories = Object.entries(grouped).sort(([, a], [, b]) => b.length - a.length)

  if (categories.length <= 1) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {products.slice(0, 6).map((p) => (
          <ProductCard key={p.id} product={p} view="compact-related" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {categories.map(([category, items]) => (
        <div key={category}>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {category}
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            {items.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} view="compact-related" />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
