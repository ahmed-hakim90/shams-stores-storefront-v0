import { CatalogPage } from '@/components/shams/catalog-page'
import { commerce } from '@/lib/commerce'

type SearchProps = { searchParams: Promise<{ q?: string }> }

export async function generateMetadata() { return { title: 'Search · Shams Stores', description: 'Search Shams Stores for cameras, lenses and creator gear.' } }

export default async function SearchPage({ searchParams }: SearchProps) {
  const { q = '' } = await searchParams
  return <CatalogPage products={commerce.search(q)} title="Search results" query={q} description={q ? `Explore products, brands and categories related to “${q}”.` : 'Search cameras, lenses, audio and creator gear.'} />
}
