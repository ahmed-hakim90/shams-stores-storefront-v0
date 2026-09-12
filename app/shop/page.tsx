import { ShopFeed } from '@/components/shams/shop-feed'
import { CatalogDiscovery } from '@/components/shams/catalog-discovery'
import { MobileListingHeader } from '@/components/shams/mobile-listing-header'
import { serverProducts, commerceProvider } from '@/lib/commerce/server'
import { catalogQuery } from '@/lib/commerce/woocommerce'

export const metadata = { title: 'Shop all gear · Shams Stores', description: 'Browse cameras, lenses, audio, lighting and creator gear from Shams Stores.' }

type Props = { searchParams: Promise<{ category?: string; brand?: string; q?: string; sort?: 'featured' | 'price-asc' | 'price-desc' | 'rating' }> }

export default async function ShopPage({ searchParams }: Props) {
  const params = await searchParams
  const page = await serverProducts().page(catalogQuery({ category: params.category, brand: params.brand, query: params.q, sort: params.sort, pageSize: 20 }))
  return <main className="mx-auto max-w-[1400px] px-4 py-4 sm:px-6 sm:py-10"><MobileListingHeader title="Shop" description="Browse professional photography, cinema and creator equipment by category, brand or use." count={page.total} chips={commerceProvider() === 'mock' ? <CatalogDiscovery compact /> : undefined} /><ShopFeed key={JSON.stringify(params)} brand={params.brand} sort={params.sort} initialProducts={page.items} initialCursor={page.nextCursor} initialHasNext={page.hasNextPage} total={page.total} category={params.category} query={params.q} /></main>
}
