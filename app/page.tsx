import { commerceProvider } from '@/lib/commerce/server'
import { redirect } from 'next/navigation'
import { commerce } from '@/lib/commerce'
import { Hero } from '@/components/shams/hero'
import { CategoryExplorer } from '@/components/shams/category-explorer'
import { CatalogDiscovery } from '@/components/shams/catalog-discovery'
import { ProductRailSection } from '@/components/shams/product-rail-section'
import { WorkflowExplorer } from '@/components/shams/workflow-explorer'
import { BundleSection } from '@/components/shams/bundle-section'
import { DealSection } from '@/components/shams/deal-section'
import { BrandExplorer } from '@/components/shams/brand-explorer'
import { StoreSection } from '@/components/shams/store-section'
import { TrustSection } from '@/components/shams/trust-section'
import { Newsletter } from '@/components/shams/newsletter'
import { Footer } from '@/components/shams/footer'

export default function HomePage() {
  if (commerceProvider() === 'woocommerce') redirect('/shop')
  const trending = commerce.collections.get('trending')?.products ?? []
  const newArrivals = commerce.collections.get('new-arrivals')?.products ?? []

  return (
    <div className="min-h-screen bg-background">
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
