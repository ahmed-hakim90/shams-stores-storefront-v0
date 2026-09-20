import { terms } from '@/lib/commerce/live/catalog'
import { CategoriesIndexPage } from './categories-index-page'
import type { Category } from '@/lib/commerce/types'

export async function LiveCategoriesIndexPage() {
  const allCats = await terms('categories')
  const allBrands = await terms('brands')
  const roots = allCats.filter((t) => !t.parentId)
  const enriched = roots.map((root) => {
    const children = allCats.filter((t) => t.parentId === root.id)
    const topBrands = allBrands
      .filter((b) => b.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
    return {
      id: root.id,
      slug: root.slug as Category['slug'],
      name: root.name,
      tagline: root.description || '',
      image: root.image,
      itemCount: root.count,
      productCount: root.count,
      columns: children.length
        ? [
            {
              heading: 'Subcategories',
              links: children.map((c) => ({
                label: c.name,
                href: `/c/${c.slug}`,
              })),
            },
            {
              heading: 'Top brands',
              links: topBrands.map((b) => ({
                label: b.name,
                href: `/b/${b.slug}`,
              })),
            },
          ]
        : [],
    }
  })
  return <CategoriesIndexPage categories={enriched} />
}
