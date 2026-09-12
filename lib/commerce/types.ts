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
  id?: string
  slug: CategorySlug
  name: string
  tagline: string
  description?: string
  image?: string
  mobileImage?: string
  heroImage?: string
  parentId?: string
  children?: string[]
  featured?: boolean
  itemCount: number
  productCount?: number
  relatedBrandIds?: string[]
  relatedAccessoryGroupIds?: string[]
  /** Structured mega-menu content. */
  columns: CategoryColumn[]
  featuredProductId?: string
}

export interface Brand {
  id?: string
  slug: string
  name: string
  tagline: string
  description?: string
  logo?: string
  image?: string
  heroImage?: string
  featured?: boolean
  productCount: number
  associatedCategoryIds?: string[]
  associatedSystemIds?: string[]
}

export interface ProductSystem {
  id: string
  slug: string
  name: string
  brandId?: string
  categoryIds: string[]
}

export type ProductRelationshipType = 'compatible_with' | 'accessory_for' | 'lens_for' | 'battery_for' | 'memory_for' | 'cage_for' | 'gimbal_for' | 'microphone_for' | 'flash_for' | 'monitor_for' | 'replacement_for' | 'alternative_to' | 'frequently_bought_with' | 'bundle_with'

export interface ProductRelationship {
  sourceProductId: string
  targetProductId: string
  type: ProductRelationshipType
  status: 'compatible' | 'recommended' | 'alternative'
  priority: number
  notes?: string
}

export interface AccessoryGroup {
  id: string
  slug: string
  name: string
  categoryIds: string[]
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

export type BundleAvailability = 'available' | 'low_stock' | 'partially_available' | 'unavailable' | 'preorder'

export interface BundleOption {
  id: string
  label: string
  choices: { id: string; label: string; productId?: string }[]
  required: boolean
}

export interface BundleItem {
  role: string
  productId: string
  variationId?: string
  required?: boolean
  quantity?: number
  selectable?: boolean
  selectedOption?: string
  individualPrice?: Money
  bundleAllocatedPrice?: Money
  sortOrder?: number
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
  heroImage?: string
  gallery?: string[]
  availability?: BundleAvailability
  options?: BundleOption[]
  badge?: string
  categories?: CategorySlug[]
  brands?: string[]
  seo?: { title?: string; description?: string }
}

export type BundleSummary = Pick<Bundle, 'id' | 'slug' | 'name' | 'useCase' | 'bundlePrice' | 'originalPrice' | 'badge' | 'availability' | 'heroImage'>
export type BundleDetail = Bundle & { products: Product[] }


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
