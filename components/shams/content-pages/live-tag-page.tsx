import { terms } from '@/lib/commerce/live/catalog'
import { LiveCatalogPage } from '@/components/shams/live'
import { redirect } from 'next/navigation'

export async function LiveTagPage({
  slug,
  query,
}: {
  slug: string
  query: Record<string, string | undefined>
}) {
  const tags = await terms('tags')
  const selected = tags.find((t) => t.slug === slug)
  if (!selected) redirect('/categories')
  return (
    <LiveCatalogPage
      query={{ ...query, tag: selected.slug }}
      title={selected.name}
      discovery={false}
    />
  )
}
