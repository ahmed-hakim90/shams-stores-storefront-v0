import { Suspense } from 'react'
import Link from 'next/link'
import { listProducts } from '@/lib/commerce/live/catalog'
import {
  homeCollections,
  type PageExperienceConfig,
} from '@/lib/commerce/experience'
import { ProductRailSection } from './product-rail-section'
import { ProductCard } from './product-card'
import { RecentlyViewed } from './saved-products'
import {
  ProductSpotlight,
  CategoryMosaic,
  BrandShowcase,
  UseCaseDiscovery,
  SetupDiscovery,
  BundleStory,
  BrandCampaign,
  ExpertTrust,
  MerchSectionHeading,
} from './merchandising-sections'

async function Feed({ config }: { config: PageExperienceConfig }) {
  try {
    const page = await listProducts(config.query)
    if (!page.items.length) return null
    if (config.presentation === 'feature')
      return (
        <section
          className="border-y border-border bg-[#efede7]"
          data-merch="deals"
        >
          <div className="shams-container merch-section">
            <MerchSectionHeading
              eyebrow={config.eyebrow}
              title={config.title}
              description={config.description}
              href={config.href}
              action="View all deals"
            />
            <div className="grid gap-4 lg:grid-cols-2">
              {page.items.map((p) => (
                <ProductCard key={p.id} product={p} view="compact-related" />
              ))}
            </div>
          </div>
        </section>
      )
    return <ProductRailSection {...config} products={page.items} />
  } catch {
    return (
      <section className="shams-container py-6">
        <Link
          href={config.href}
          className="inline-flex min-h-11 items-center text-sm font-medium text-brand-ink"
        >
          Explore {config.eyebrow.toLowerCase()} →
        </Link>
      </section>
    )
  }
}

function SectionSkeleton() {
  return (
    <div
      className="shams-container merch-section"
      aria-label="Loading collection"
      role="status"
    >
      <div className="h-7 w-48 animate-pulse rounded bg-muted" />
      <div className="mt-5 h-52 animate-pulse rounded-xl bg-muted" />
    </div>
  )
}

export function LiveHome() {
  return (
    <>
      <main className="merch-home">
        <Suspense fallback={<SectionSkeleton />}>
          <ProductSpotlight />
        </Suspense>
        <Suspense fallback={<SectionSkeleton />}>
          <CategoryMosaic />
        </Suspense>
        <Suspense fallback={<SectionSkeleton />}>
          <Feed config={homeCollections[0]} />
        </Suspense>
        <Suspense fallback={<SectionSkeleton />}>
          <BrandShowcase />
        </Suspense>
        <Suspense fallback={null}>
          <UseCaseDiscovery />
        </Suspense>
        <Suspense fallback={null}>
          <SetupDiscovery />
        </Suspense>
        <Suspense fallback={<SectionSkeleton />}>
          <Feed config={homeCollections[1]} />
        </Suspense>
        <Suspense fallback={null}>
          <BundleStory />
        </Suspense>
        <Suspense fallback={<SectionSkeleton />}>
          <Feed config={homeCollections[2]} />
        </Suspense>
        <Suspense fallback={null}>
          <BrandCampaign />
        </Suspense>
        <ExpertTrust />
        <RecentlyViewed />
      </main>
    </>
  )
}
