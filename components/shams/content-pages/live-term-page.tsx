import { terms } from '@/lib/commerce/live/catalog'
import { LiveCatalogPage } from '@/components/shams/live'
import { notFound } from 'next/navigation'
import type { TaxonomyTerm } from '@/lib/commerce/types'

export async function LiveTermPage({
  section,
  slug,
  query,
}: {
  section: string
  slug: string
  query: Record<string, string | undefined>
}) {
  const kind = section === 'c' ? 'categories' : 'brands'
  const term = (await terms(kind)).find((t) => t.slug === slug)
  if (!term) notFound()
  return (
    <LiveCatalogPage
      query={{
        ...query,
        [kind === 'categories' ? 'category' : 'brand']:
          query[kind === 'categories' ? 'category' : 'brand'] ?? term.slug,
      }}
      title={term.name}
      description={term.description || `Explore ${term.name} at Shams Stores.`}
      hub={{ kind: kind === 'categories' ? 'category' : 'brand', term }}
    />
  )
}
