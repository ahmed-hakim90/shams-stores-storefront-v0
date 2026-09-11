import { ShopFeed } from '@/components/shams/shop-feed'
import { commerce } from '@/lib/commerce'

export const metadata = { title: 'Shop all gear · Shams Stores', description: 'Browse cameras, lenses, audio, lighting and creator gear from Shams Stores.' }

type Props = { searchParams: Promise<{ category?: string; brand?: string; q?: string; sort?: 'featured' | 'price-asc' | 'price-desc' | 'rating' }> }

export default async function ShopPage({ searchParams }: Props) {
  const params = await searchParams
  const page = commerce.products.page({ category: params.category, brand: params.brand, query: params.q, sort: params.sort, pageSize: 20 })
  return <main className="mx-auto max-w-[1400px] px-4 py-7 sm:px-6 sm:py-10"><nav aria-label="Breadcrumb" className="mb-5 text-sm text-muted-foreground"><a href="/" className="hover:text-brand">Home</a><span className="mx-2">/</span><span className="text-foreground">Shop</span></nav><header className="mb-8 border-b border-border pb-6"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">Shams Stores</p><h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-5xl">Shop all gear</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">Browse professional photography, cinema and creator equipment by category, brand or use.</p></header><ShopFeed initialProducts={page.items} initialCursor={page.nextCursor} initialHasNext={page.hasNextPage} total={page.total} category={params.category} query={params.q} /></main>
}
