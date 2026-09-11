import {
  brands,
  bundles,
  categories,
  collections,
  products,
  useCases,
} from './data'
import type { Bundle, CatalogPage, CatalogQuery, Money, Product, StockStatus, UseCaseSlug } from './types'

export * from './types'

/**
 * Lightweight commerce service abstraction. Today it resolves against typed
 * mock data; later each method can be swapped to call the real Shams API
 * without touching component code.
 */
export const commerce = {
  products: {
    list: () => products,
    page: (params: CatalogQuery = {}): CatalogPage => {
      const pageSize = Math.min(Math.max(params.pageSize ?? 20, 1), 40)
      const offset = Number(params.cursor ?? 0)
      const query = params.query?.trim().toLowerCase()
      let result = products.filter((product) => (!params.category || product.category === params.category) && (!params.brand || product.brand.toLowerCase() === params.brand.toLowerCase()) && (!query || [product.name, product.brand, product.category, product.configuration ?? '', product.sku ?? ''].join(' ').toLowerCase().includes(query)))
      if (params.sort === 'price-asc') result = result.sort((a, b) => a.price.amount - b.price.amount)
      if (params.sort === 'price-desc') result = result.sort((a, b) => b.price.amount - a.price.amount)
      if (params.sort === 'rating') result = result.sort((a, b) => b.rating - a.rating)
      const items = result.slice(offset, offset + pageSize)
      const next = offset + pageSize < result.length ? String(offset + pageSize) : undefined
      return { items, nextCursor: next, hasNextPage: Boolean(next), total: result.length }
    },
    byId: (id: string) => products.find((p) => p.id === id),
    bySlug: (slug: string) => products.find((p) => p.slug === slug),
    getBySlug: (slug: string) => products.find((p) => p.slug === slug),
    related: (product: Product) => products.filter((p) => p.id !== product.id && (p.category === product.category || p.useCases.some((useCase) => product.useCases.includes(useCase)))).slice(0, 4),
    recommendations: (product: Product) => products.filter((p) => p.id !== product.id && p.useCases.some((useCase) => product.useCases.includes(useCase))).slice(0, 4),
    byIds: (ids: string[]) =>
      ids
        .map((id) => products.find((p) => p.id === id))
        .filter((p): p is Product => Boolean(p)),
    byCategory: (category: string) =>
      products.filter((p) => p.category === category),
    byUseCase: (useCase: UseCaseSlug) =>
      products.filter((p) => p.useCases.includes(useCase)),
    featured: () => products.filter((p) => p.badges.includes('exclusive')),
    deals: () => products.filter((p) => p.previousPrice),
    trending: () =>
      commerce.collections.get('trending')?.products ?? products.slice(0, 6),
  },
  categories: {
    list: () => categories,
    bySlug: (slug: string) => categories.find((c) => c.slug === slug),
  },
  brands: {
    list: () => brands,
    bySlug: (slug: string) => brands.find((b) => b.slug === slug),
  },
  useCases: {
    list: () => useCases,
    bySlug: (slug: string) => useCases.find((u) => u.slug === slug),
  },
  bundles: {
    list: () => bundles,
    withProducts: (): (Bundle & { products: Product[] })[] =>
      bundles.map((b) => ({
        ...b,
        products: commerce.products.byIds(b.items.map((i) => i.productId)),
      })),
  },
  collections: {
    get: (slug: string) => {
      const collection = collections.find((c) => c.slug === slug)
      if (!collection) return undefined
      return {
        ...collection,
        products: commerce.products.byIds(collection.productIds),
      }
    },
  },
  search: (query: string) => {
    const q = query.trim().toLowerCase()
    if (!q) return [] as Product[]
    return products.filter((p) =>
      [p.name, p.brand, p.category, p.configuration ?? '']
        .join(' ')
        .toLowerCase()
        .includes(q),
    )
  },
}

const egpFormatter = new Intl.NumberFormat('en-EG', {
  style: 'currency',
  currency: 'EGP',
  maximumFractionDigits: 0,
})

export function formatMoney(money: Money): string {
  return egpFormatter.format(money.amount)
}

export function formatEgp(amount: number): string {
  return egpFormatter.format(amount)
}

export function discountPercent(
  price: Money,
  previousPrice?: Money,
): number | null {
  if (!previousPrice || previousPrice.amount <= price.amount) return null
  return Math.round((1 - price.amount / previousPrice.amount) * 100)
}

export const stockMeta: Record<
  StockStatus,
  { label: string; tone: 'success' | 'warning' | 'muted' | 'brand' }
> = {
  in_stock: { label: 'In stock', tone: 'success' },
  low_stock: { label: 'Low stock', tone: 'warning' },
  out_of_stock: { label: 'Out of stock', tone: 'muted' },
  preorder: { label: 'Pre-order', tone: 'brand' },
}
