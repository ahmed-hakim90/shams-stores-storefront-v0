'use client'

import { useRouter } from 'next/navigation'
import { catalogParams } from '@/lib/commerce/experience'
import type { TaxonomyTerm } from '@/lib/commerce/types'
import { CatalogDiscovery } from '@/components/shams/marketing'
import {
  CategorySections,
  type CategorySectionGroup,
} from './category-sections'

export function CatalogLanding({
  params,
  categories,
  brands,
  categoryGroups,
  remainingCategories = [],
}: {
  params: string
  categories: TaxonomyTerm[]
  brands: TaxonomyTerm[]
  categoryGroups: CategorySectionGroup[]
  remainingCategories?: TaxonomyTerm[]
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
      <div className="mt-6">
        <CategorySections groups={categoryGroups} remaining={remainingCategories} />
      </div>
    </section>
  )
}
