import {
  brands,
  bundles,
  productRelationships,
  productSystems,
  categories,
  collections,
  products,
  accessoryGroups,
  useCases,
} from './data'
import type { Bundle, BundleAvailability, BundleDetail, CatalogPage, CatalogQuery, Money, Product, ProductRelationshipType, StockStatus, UseCaseSlug } from './types'

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
    getChildren: (id: string) => categories.filter((category) => category.parentId === id),
    getBrands: (id: string) => {
      const category = categories.find((item) => item.id === id || item.slug === id)
      const ids = category?.relatedBrandIds ?? []
      if (ids.length) return brands.filter((brand) => ids.includes(brand.id ?? brand.slug))
      const names = new Set(products.filter((product) => product.category === category?.slug).map((product) => product.brand))
      return brands.filter((brand) => names.has(brand.name))
    },
    getAccessoryGroups: (id: string) => accessoryGroups.filter((group) => group.categoryIds.includes(id)),
    getProducts: (id: string, params: Omit<CatalogQuery, 'category'> = {}) => commerce.products.page({ ...params, category: id }),
  },
  brands: {
    list: () => brands,
    bySlug: (slug: string) => brands.find((b) => b.slug === slug),
    getCategories: (id: string) => {
      const brand = brands.find((item) => item.id === id || item.slug === id)
      const ids = brand?.associatedCategoryIds ?? []
      if (ids.length) return categories.filter((category) => ids.includes(category.id ?? category.slug))
      const categorySlugs = new Set(products.filter((product) => product.brand === brand?.name).map((product) => product.category))
      return categories.filter((category) => categorySlugs.has(category.slug))
    },
    getProducts: (id: string, params: Omit<CatalogQuery, 'brand'> = {}) => {
      const brand = brands.find((item) => item.id === id || item.slug === id)
      return commerce.products.page({ ...params, brand: brand?.name ?? id })
    },
  },
  systems: {
    list: (params?: { brandId?: string; categoryId?: string }) => productSystems.filter((system) => (!params?.brandId || system.brandId === params.brandId) && (!params?.categoryId || system.categoryIds.includes(params.categoryId))),
    bySlug: (slug: string) => productSystems.find((system) => system.slug === slug),
    getProducts: (id: string) => products.filter((product) => productSystems.find((system) => system.id === id)?.categoryIds.includes(product.category)),
  },
  relationships: {
    getForProduct: (productId: string, type?: ProductRelationshipType) => productRelationships.filter((relationship) => relationship.sourceProductId === productId && (!type || relationship.type === type)).sort((a, b) => a.priority - b.priority),
    summaries: (productId: string, type?: ProductRelationshipType, limit = 8) => commerce.products.byIds(commerce.relationships.getForProduct(productId, type).slice(0, limit).map((relationship) => relationship.targetProductId)),
    getProducts: (productId: string, type?: ProductRelationshipType, limit = 8) => commerce.products.byIds(commerce.relationships.getForProduct(productId, type).slice(0, limit).map((relationship) => relationship.targetProductId)),
  },
  useCases: {
    list: () => useCases,
    bySlug: (slug: string) => useCases.find((u) => u.slug === slug),
  },
  bundles: {
    list: () => bundles,
    getBySlug: (slug: string): BundleDetail | undefined => {
      const bundle = bundles.find((item) => item.slug === slug)
      if (!bundle) return undefined
      const productsForBundle = commerce.products.byIds(bundle.items.map((item) => item.productId))
      const statuses = bundle.items.map((item) => productsForBundle.find((product) => product.id === item.productId)?.stock ?? 'out_of_stock')
      const availability: BundleAvailability = statuses.some((status) => status === 'out_of_stock') ? 'partially_available' : statuses.some((status) => status === 'low_stock') ? 'low_stock' : statuses.some((status) => status === 'preorder') ? 'preorder' : 'available'
      return { ...bundle, availability, products: productsForBundle }
    },
    getFeatured: () => bundles.slice(0, 3),
    getByUseCase: (useCase: UseCaseSlug) => bundles.filter((bundle) => bundle.useCase === useCase),
    getRelated: (productId: string) => bundles.filter((bundle) => bundle.items.some((item) => item.productId === productId)),
    validateSelection: (bundleId: string) => {
      const bundle = bundles.find((item) => item.id === bundleId)
      if (!bundle) return { valid: false, missingProductIds: [] as string[] }
      const missingProductIds = bundle.items.filter((item) => item.required !== false).filter((item) => products.find((product) => product.id === item.productId)?.stock === 'out_of_stock').map((item) => item.productId)
      return { valid: missingProductIds.length === 0, missingProductIds }
    },
    withProducts: (): (BundleDetail)[] => bundles.map((bundle) => commerce.bundles.getBySlug(bundle.slug)).filter((bundle): bundle is BundleDetail => Boolean(bundle)),
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
