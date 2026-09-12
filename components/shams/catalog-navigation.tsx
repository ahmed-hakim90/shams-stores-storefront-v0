'use client'
import { primaryCategories } from '@/lib/commerce/navigation'
import { useQuery } from '@tanstack/react-query'
import { useInteractions } from './interaction-provider'
import { commerceFetch } from '@/lib/commerce/browser'
import { commerce } from '@/lib/commerce'
import type { Category, TaxonomyTerm } from '@/lib/commerce/types'
export function useCatalogNavigation() {
  const { liveMode } = useInteractions()
  const q = useQuery({
    queryKey: ['taxonomy'],
    queryFn: ({ signal }) =>
      commerceFetch<{ categories: TaxonomyTerm[]; brands: TaxonomyTerm[] }>(
        '/api/commerce/taxonomy',
        { signal },
      ),
    enabled: liveMode,
    staleTime: 3600000,
  })
  const all = q.data?.categories ?? []
  const roots = primaryCategories(all, 6)
  const categories: Category[] = liveMode
    ? roots.map((t) => ({
        id: t.id,
        slug: t.slug as Category['slug'],
        name: t.name,
        tagline: t.description,
        image: t.image,
        itemCount: t.count,
        columns: [
          {
            heading: t.name,
            links: all
              .filter((x) => x.parentId === t.id)
              .slice(0, 12)
              .map((c) => ({ label: c.name, href: `/c/${c.slug}` })),
          },
        ],
      }))
    : commerce.categories.list()
  return { categories, brands: q.data?.brands ?? [], liveMode }
}
