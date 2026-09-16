'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { catalogParams } from '@/lib/commerce/experience'
import type { ProductSummary, TaxonomyTerm } from '@/lib/commerce/types'
import { CatalogDiscovery } from '@/components/shams/marketing'
import { ProductScrollRow } from '@/components/shams/product'

type CategoryGroup = {
  category: TaxonomyTerm
  products: ProductSummary[]
}

export function CatalogLanding({
  params,
  categories,
  brands,
  categoryGroups,
}: {
  params: string
  categories: TaxonomyTerm[]
  brands: TaxonomyTerm[]
  categoryGroups: CategoryGroup[]
}) {
  const router = useRouter()
  const change = (key: string, value: string) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    router.push(`/shop?${catalogParams(next)}`, { scroll: false })
  }

  return (
    <section className="mt-6" aria-label="Product catalog">
      <CatalogDiscovery
        categories={categories}
        brands={brands}
        hub={false}
        scope={{}}
        params={params}
        change={change}
      />
      <div className="space-y-6">
        {categoryGroups.map((group) => (
          <section key={group.category.slug}>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-semibold">{group.category.name}</h2>
              <Link
                href={`/c/${group.category.slug}`}
                prefetch={false}
                data-prefetch-on-intent
                className="text-xs text-brand-ink"
              >
                View all →
              </Link>
            </div>
            <ProductScrollRow products={group.products} />
          </section>
        ))}
      </div>
    </section>
  )
}
