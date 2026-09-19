import type { CatalogQuery } from './types'

export type ShellVariant = 'store' | 'checkout'
export interface CatalogScope {
  category?: string
  categoryOptions?: string[]
  brand?: string
  onSale?: boolean
  tag?: string
}
export interface PageExperienceConfig {
  id: string
  kind: 'new' | 'deals' | 'best-sellers'
  title: string
  eyebrow: string
  description: string
  href: string
  query: CatalogQuery
  presentation: 'rail' | 'feature'
}
export const homeCollections: PageExperienceConfig[] = [
  {
    id: 'trending',
    kind: 'best-sellers',
    title: 'Best-selling gear',
    eyebrow: 'Popular right now',
    description: 'Explore best-selling gear from the Shams catalogue.',
    href: '/trending',
    query: { pageSize: 20, sort: 'best-selling' },
    presentation: 'rail',
  },
  {
    id: 'new',
    kind: 'new',
    title: 'New arrivals',
    eyebrow: 'Just landed',
    description: 'The latest additions to the Shams catalog.',
    href: '/new',
    query: { pageSize: 20, sort: 'newest' },
    presentation: 'rail',
  },
  {
    id: 'deals',
    kind: 'deals',
    title: 'More possibility. Less to spend.',
    eyebrow: 'Current offers',
    description: 'Explore current savings on gear for your next project.',
    href: '/deals',
    query: { pageSize: 20, onSale: true, sort: 'newest' },
    presentation: 'feature',
  },
  {
    id: 'best-sellers',
    kind: 'best-sellers',
    title: 'Best sellers',
    eyebrow: 'Popular in the Shams catalog',
    description: 'Popular purchases from across the Shams catalog.',
    href: '/best-sellers',
    query: { pageSize: 20, sort: 'best-selling' },
    presentation: 'rail',
  },
]

/** One canonical identity shared by SSR hydration, URL updates and client queries. */
export function catalogParams(
  input: string | URLSearchParams,
  scope: CatalogScope = {},
  defaults: { sort?: string } = {},
) {
  const params = new URLSearchParams(input)
  for (const key of [...params.keys()])
    if (
      ![
        'category',
        'brand',
        'q',
        'stock',
        'minPrice',
        'maxPrice',
        'onSale',
        'sort',
        'tag',
      ].includes(key) ||
      !params.get(key)
    )
      params.delete(key)
  if (
    scope.category &&
    !scope.categoryOptions?.includes(params.get('category') ?? '')
  )
    params.set('category', scope.category)
  if (scope.tag) params.set('tag', scope.tag)
  if (scope.brand) params.set('brand', scope.brand)
  if (scope.onSale) params.set('onSale', 'true')
  if (!params.has('sort'))
    params.set(
      'sort',
      defaults.sort ?? (params.has('q') ? 'relevance' : 'newest'),
    )
  params.sort()
  return params.toString()
}
