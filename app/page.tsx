import { commerceProvider } from '@/lib/commerce/server'
import { commerce } from '@/lib/commerce'
import { LiveHome } from '@/components/shams/live'
import { Hero, CategoryExplorer, DealSection, BrandExplorer, StoreSection, TrustSection, Newsletter } from '@/components/shams/marketing'
import { CatalogDiscovery } from '@/components/shams/catalog'
import { ProductRailSection } from '@/components/shams/product'
import { WorkflowExplorer } from '@/components/shams/shared'
import { BundleSection } from '@/components/shams/bundles'
import { Footer } from '@/components/shams/layout'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Shams Stores — Photography, Cinema & Creator Gear in Egypt',
  description:
    'Egypt\'s specialist for photography, cinema and creator equipment. Cameras, lenses, audio, lighting and accessories with expert advice and nationwide delivery.',
  alternates: { canonical: '/' },
}

export default function HomePage() {
  if (commerceProvider() === 'woocommerce') return <LiveHome />
  const trending = commerce.collections.get('trending')?.products ?? []
  const newArrivals = commerce.collections.get('new-arrivals')?.products ?? []

  return (
    <div className="min-h-dvh bg-background">
      <main>
        <Hero />

        <CategoryExplorer />
        <CatalogDiscovery compact />

        <ProductRailSection
          eyebrow="Popular right now"
          title="Trending this week"
          description="The gear Egyptian creators are adding to cart most this week."
          href="/trending"
          products={trending}
        />

        <WorkflowExplorer />

        <DealSection />

        <BundleSection />

        <ProductRailSection
          eyebrow="Just landed"
          title="New arrivals"
          description="Fresh bodies, glass and rigs — first stock, first served."
          href="/new"
          products={newArrivals}
        />

        <BrandExplorer />

        <StoreSection />

        <TrustSection />

        <Newsletter />
      </main>
      <Footer />
    </div>
  )
}
