import { Suspense } from 'react'
import Link from 'next/link'
import { listProducts } from '@/lib/commerce/live/catalog'
import {
  homeCollections,
  type PageExperienceConfig,
} from '@/lib/commerce/experience'
import { ProductScrollRow, RecentlyViewedProducts } from '@/components/shams/product'
import { Reveal, SectionErrorBoundary } from '@/components/shams/shared'
import { LiveHero } from './live-hero'
import {
  CategoryMosaic,
  BrandShowcase,
  UseCaseDiscovery,
  SetupDiscovery,
  BundleStory,
  BrandCampaign,
  ExpertTrust,
  GearGuides,
  BuyingQuestions,
  MerchSectionHeading,
} from '@/components/shams/marketing/merchandising-sections'

async function Feed({ config }: { config: PageExperienceConfig }) {
  try {
    const page = await listProducts(config.query)
    if (!page.items.length) return null
    const mid = Math.ceil(page.items.length / 2)
    const row1 = page.items.slice(0, mid)
    const row2 = page.items.slice(mid)
    if (config.presentation === 'feature')
      return (
        <section
          className="border-y border-border bg-surface-raised"
          data-merch="deals"
        >
          <div className="shams-container py-4 sm:py-5">
            <MerchSectionHeading
              eyebrow={config.eyebrow}
              title={config.title}
              description={config.description}
              href={config.href}
              action="View all deals"
            />
            <div className="mt-3 flex flex-col gap-3">
              <ProductScrollRow products={row1} />
              {row2.length > 0 && <ProductScrollRow products={row2} />}
            </div>
          </div>
        </section>
      )
    return (
      <section className="shams-container py-4 sm:py-5" data-merch="rail">
        <MerchSectionHeading
          eyebrow={config.eyebrow}
          title={config.title}
          description={config.description}
          href={config.href}
        />
        <div className="mt-3 flex flex-col gap-3">
          <ProductScrollRow products={row1} />
          {row2.length > 0 && <ProductScrollRow products={row2} />}
        </div>
      </section>
    )
  } catch {
    return (
      <section className="shams-container py-4">
        <Link
          href={config.href}
          className="inline-flex h-7 items-center text-xs font-medium text-brand-ink"
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
      className="shams-container py-4"
      aria-label="Loading collection"
      role="status"
    >
      <div className="h-5 w-40 animate-pulse rounded bg-muted" />
      <div className="mt-3 h-44 animate-pulse rounded bg-muted" />
    </div>
  )
}

export function LiveHome() {
  return (
    <>
      <main className="merch-home pb-[calc(2rem+var(--mobile-bottom-nav-height))] sm:pb-0">
        <SectionErrorBoundary label="LiveHero">
          <Reveal as="fade-up">
            <Suspense fallback={<SectionSkeleton />}>
              <LiveHero />
            </Suspense>
          </Reveal>
        </SectionErrorBoundary>
        <SectionErrorBoundary label="CategoryMosaic">
          <Reveal as="fade-up" delay={40}>
            <Suspense fallback={<SectionSkeleton />}>
              <CategoryMosaic />
            </Suspense>
          </Reveal>
        </SectionErrorBoundary>
        <SectionErrorBoundary label="TrendingGear">
          <Reveal as="fade-up" delay={80}>
            <Suspense fallback={<SectionSkeleton />}>
              <Feed config={homeCollections[0]} />
            </Suspense>
          </Reveal>
        </SectionErrorBoundary>
        <SectionErrorBoundary label="BrandShowcase">
          <Reveal as="fade-up" delay={40}>
            <Suspense fallback={<SectionSkeleton />}>
              <BrandShowcase />
            </Suspense>
          </Reveal>
        </SectionErrorBoundary>
        <SectionErrorBoundary label="UseCaseDiscovery">
          <Reveal as="scale-in">
            <Suspense fallback={null}>
              <UseCaseDiscovery />
            </Suspense>
          </Reveal>
        </SectionErrorBoundary>
        <SectionErrorBoundary label="NewArrivals">
          <Reveal as="fade-up">
            <Suspense fallback={<SectionSkeleton />}>
              <Feed config={homeCollections[1]} />
            </Suspense>
          </Reveal>
        </SectionErrorBoundary>
        <SectionErrorBoundary label="SetupDiscovery">
          <Reveal as="scale-in" delay={40}>
            <Suspense fallback={null}>
              <SetupDiscovery />
            </Suspense>
          </Reveal>
        </SectionErrorBoundary>
        <SectionErrorBoundary label="Deals">
          <Reveal as="fade-up">
            <Suspense fallback={<SectionSkeleton />}>
              <Feed config={homeCollections[2]} />
            </Suspense>
          </Reveal>
        </SectionErrorBoundary>
        <SectionErrorBoundary label="GearGuides">
          <Reveal as="fade-up" delay={40}>
            <Suspense fallback={null}>
              <GearGuides />
            </Suspense>
          </Reveal>
        </SectionErrorBoundary>
        <SectionErrorBoundary label="BundleStory">
          <Reveal as="fade-up">
            <Suspense fallback={null}>
              <BundleStory />
            </Suspense>
          </Reveal>
        </SectionErrorBoundary>
        <SectionErrorBoundary label="BrandCampaign">
          <Reveal as="fade-up" delay={40}>
            <Suspense fallback={null}>
              <BrandCampaign />
            </Suspense>
          </Reveal>
        </SectionErrorBoundary>
        <SectionErrorBoundary label="BuyingQuestions">
          <Reveal as="fade-up">
            <Suspense fallback={null}>
              <BuyingQuestions />
            </Suspense>
          </Reveal>
        </SectionErrorBoundary>
        <SectionErrorBoundary label="RecentlyViewed">
          <Reveal as="fade-up" delay={40}>
            <RecentlyViewedProducts />
          </Reveal>
        </SectionErrorBoundary>
        <SectionErrorBoundary label="ExpertTrust">
          <Reveal as="fade-up">
            <ExpertTrust />
          </Reveal>
        </SectionErrorBoundary>
      </main>
    </>
  )
}
