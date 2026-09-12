import { primaryCategories } from '@/lib/commerce/navigation'
import Link from 'next/link'
import { Suspense } from 'react'
import { terms, listProducts } from '@/lib/commerce/live/catalog'
import { ProductRailSection } from './product-rail-section'
import { TaxonomyCards } from './taxonomy-cards'
import { LiveFooter } from './live-footer'
import { ProductImage } from './product-image'
import { RecentlyViewed } from './saved-products'
async function Categories() {
  try {
    const all = await terms('categories')
    return (
      <section className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6">
        <h2 className="mb-5 text-2xl font-semibold">
          Find your next piece of gear
        </h2>
        <TaxonomyCards terms={primaryCategories(all)} />
      </section>
    )
  } catch {
    return null
  }
}
async function Brands() {
  try {
    const all = await terms('brands')
    return (
      <section className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6">
        <div className="mb-5 flex justify-between">
          <h2 className="text-2xl font-semibold">Explore the brands</h2>
          <Link href="/brands" className="text-sm text-brand">
            View all →
          </Link>
        </div>
        <TaxonomyCards
          terms={[...all].sort((a, b) => b.count - a.count).slice(0, 8)}
          kind="brand"
        />
      </section>
    )
  } catch {
    return null
  }
}
async function Feed({ kind }: { kind: 'new' | 'deals' | 'best-sellers' }) {
  try {
    const page = await listProducts({
      pageSize: kind === 'deals' ? 6 : 8,
      onSale: kind === 'deals',
      sort: kind === 'best-sellers' ? 'best-selling' : 'newest',
    })
    if (!page.items.length) return null
    return (
      <ProductRailSection
        eyebrow={
          kind === 'new'
            ? 'Just arrived'
            : kind === 'best-sellers'
              ? 'Chosen by our customers'
              : 'Current offers'
        }
        title={
          kind === 'new'
            ? 'New arrivals'
            : kind === 'best-sellers'
              ? 'Best sellers'
              : 'Gear worth a closer look'
        }
        description={
          kind === 'new'
            ? 'The latest additions to the Shams catalog.'
            : kind === 'best-sellers'
              ? 'Popular purchases from across the Shams catalog.'
              : 'Current offers on cameras, lenses and creator equipment.'
        }
        href={`/${kind}`}
        products={page.items}
      />
    )
  } catch {
    return (
      <section className="mx-auto max-w-[1400px] px-6 py-8 text-sm">
        <Link href={`/${kind}`} className="text-brand">
          Explore {kind === 'new' ? 'new arrivals' : 'current offers'} →
        </Link>
      </section>
    )
  }
}
async function DiscoveryHero() {
  const cats = await terms('categories').catch(() => [])
  return (
    <section className="mx-auto max-w-[1400px] px-4 pt-5 sm:px-6">
      <div className="grid gap-4 lg:grid-cols-[1.25fr_1fr]">
        <div className="relative overflow-hidden rounded-3xl bg-brand p-7 text-white sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[.2em] text-white/80">
            Shams Stores · For image makers
          </p>
          <h1 className="mt-6 text-4xl font-semibold leading-[1.08] tracking-tight sm:text-6xl">
            Your vision.
            <br />
            The right gear.
          </h1>
          <p className="mt-5 max-w-lg text-sm leading-7 text-white/85 sm:text-base">
            Cameras, lenses, cinema and creator essentials. Explore the tools
            for whatever you want to make next.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/shop"
              className="inline-flex min-h-12 items-center rounded-xl bg-white px-6 text-sm font-semibold text-brand"
            >
              Explore all gear →
            </Link>
            <Link
              href="/deals"
              className="inline-flex min-h-12 items-center rounded-xl border border-white/40 px-6 text-sm font-semibold"
            >
              Shop offers
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {['cameras', 'lens']
            .map((slug) => cats.find((c) => c.slug === slug))
            .filter((c) => c !== undefined)
            .map((cat, i) => (
              <Link
                key={cat.id}
                href={`/c/${cat.slug}`}
                className="group flex min-w-0 flex-col justify-end overflow-hidden rounded-3xl border bg-white p-4 sm:p-6"
              >
                {cat.image && (
                  <div className="relative aspect-square">
                    <ProductImage
                      src={cat.image}
                      alt={cat.name}
                      fill
                      priority={i === 0}
                      sizes="(max-width: 1023px) 42vw, 260px"
                      className="object-contain transition-transform motion-safe:group-hover:scale-105"
                    />
                  </div>
                )}
                <h2 className="mt-4 text-xl font-semibold">{cat.name}</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Explore the range →
                </p>
              </Link>
            ))}
        </div>
      </div>
    </section>
  )
}
export function LiveHome() {
  return (
    <>
      <main>
        <Suspense
          fallback={
            <div className="h-96 animate-pulse rounded-3xl bg-brand/10" />
          }
        >
          <DiscoveryHero />
        </Suspense>
        <Suspense fallback={<div className="h-80 animate-pulse bg-muted/20" />}>
          <Categories />
        </Suspense>
        <Suspense fallback={null}>
          <Feed kind="new" />
        </Suspense>
        <Suspense fallback={null}>
          <Feed kind="deals" />
        </Suspense>
        <Suspense fallback={null}>
          <Feed kind="best-sellers" />
        </Suspense>
        <Suspense fallback={null}>
          <Brands />
        </Suspense>
        <RecentlyViewed />
      </main>
      <LiveFooter />
    </>
  )
}
