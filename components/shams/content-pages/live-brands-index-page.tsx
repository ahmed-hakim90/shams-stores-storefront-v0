import { terms } from '@/lib/commerce/live/catalog'
import { TaxonomyCards } from './taxonomy-cards'

export async function LiveBrandsIndexPage() {
  const allBrands = await terms('brands')
  return (
    <main className="shams-container max-w-[1400px] py-10 pb-[calc(2.5rem+var(--mobile-bottom-nav-height))] sm:pb-10">
      <h1 className="mb-6 text-3xl font-semibold">Shop by brand</h1>
      <TaxonomyCards terms={allBrands} kind="brand" />
    </main>
  )
}
