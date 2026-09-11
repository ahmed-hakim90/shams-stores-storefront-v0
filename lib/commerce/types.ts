export type StockStatus =
  | 'in_stock'
  | 'low_stock'
  | 'out_of_stock'
  | 'preorder'

export type ProductBadge = 'new' | 'best_seller' | 'sale' | 'exclusive'

export type CategorySlug =
  | 'cameras'
  | 'lenses'
  | 'video'
  | 'audio'
  | 'lighting'
  | 'drones'
  | 'creator-gear'
  | 'accessories'

export type UseCaseSlug =
  | 'photography'
  | 'vlogging'
  | 'wedding'
  | 'filmmaking'
  | 'podcasting'
  | 'streaming'
  | 'studio'
  | 'travel'

export interface Money {
  /** Amount in EGP (major units). */
  amount: number
  currency: 'EGP'
}

export interface Product {
  id: string
  slug: string
  name: string
  brand: string
  description?: string
  sku?: string
  /** Short configuration line, e.g. "Body only" or "with 24-70mm". */
  configuration?: string
  category: CategorySlug
  price: Money
  /** Was-price for showing a markdown. */
  previousPrice?: Money
  rating: number
  reviewCount: number
  stock: StockStatus
  image: string
  badges: ProductBadge[]
  useCases: UseCaseSlug[]
  /** Monthly installment starting figure in EGP, if offered. */
  installmentFrom?: number
  official?: boolean
  branches?: string[]
}

export interface CategoryColumn {
  heading: string
  links: { label: string; href: string }[]
}

export interface Category {
  slug: CategorySlug
  name: string
  tagline: string
  itemCount: number
  /** Structured mega-menu content. */
  columns: CategoryColumn[]
  featuredProductId?: string
}

export interface Brand {
  slug: string
  name: string
  tagline: string
  productCount: number
}

export interface UseCase {
  slug: UseCaseSlug
  name: string
  description: string
  image: string
  /** The gear roles that make up a complete setup. */
  gear: string[]
  productCount: number
}

export interface BundleItem {
  role: string
  productId: string
}

export interface Bundle {
  id: string
  slug: string
  name: string
  description: string
  useCase: UseCaseSlug
  items: BundleItem[]
  bundlePrice: Money
  originalPrice: Money
  badge?: string
}

export interface Collection {
  slug: string
  name: string
  productIds: string[]
}

export interface ProductSummary {
  id: string
  slug: string
  name: string
  brand: string
  primaryImage: string
  price: Money
  regularPrice?: Money
  stock: StockStatus
  rating?: number
  reviewCount?: number
  badge?: ProductBadge
  shortVariantLabel?: string
  installmentSummary?: string
}

export interface CatalogQuery {
  category?: string
  brand?: string
  query?: string
  sort?: 'featured' | 'price-asc' | 'price-desc' | 'rating'
  cursor?: string
  pageSize?: number
}

export interface CatalogPage {
  items: Product[]
  nextCursor?: string
  hasNextPage: boolean
  total: number
}
