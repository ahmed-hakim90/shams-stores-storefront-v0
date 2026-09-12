export type StockStatus =
  'in_stock' | 'low_stock' | 'out_of_stock' | 'preorder' | 'unknown'

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
  secondaryImage?: string
  highlights?: ProductHighlight[]
  pricing?: ProductPrice
  brandSlug?: string
  hasOptions?: boolean
  description?: string
  sku?: string
  /** Short configuration line, e.g. "Body only" or "with 24-70mm". */
  configuration?: string
  category: string
  price: Money
  /** Was-price for showing a markdown. */
  previousPrice?: Money
  rating: number
  reviewCount: number
  stock: StockStatus
  /** False for products that require unsupported options or external checkout. */
  purchasable?: boolean
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

export type ProductRelationshipType =
  | 'compatible_with'
  | 'accessory_for'
  | 'lens_for'
  | 'battery_for'
  | 'memory_for'
  | 'cage_for'
  | 'gimbal_for'
  | 'microphone_for'
  | 'flash_for'
  | 'monitor_for'
  | 'replacement_for'
  | 'alternative_to'
  | 'frequently_bought_with'
  | 'bundle_with'

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

export type BundleAvailability =
  'available' | 'low_stock' | 'partially_available' | 'unavailable' | 'preorder'

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

export type BundleSummary = Pick<
  Bundle,
  | 'id'
  | 'slug'
  | 'name'
  | 'useCase'
  | 'bundlePrice'
  | 'originalPrice'
  | 'badge'
  | 'availability'
  | 'heroImage'
>
export type BundleDetail = Bundle & { products: Product[] }

export interface Collection {
  slug: string
  name: string
  productIds: string[]
}

/** Listing payload: no gallery, descriptions, inventory or raw metadata. */
export type ProductSummary = Omit<Product, 'description' | 'branches'>

export interface CatalogQuery {
  category?: string
  brand?: string
  query?: string
  sort?:
    | 'featured'
    | 'newest'
    | 'relevance'
    | 'best-selling'
    | 'price-asc'
    | 'price-desc'
    | 'rating'
  stock?: 'instock' | 'outofstock' | 'onbackorder'
  minPrice?: number
  maxPrice?: number
  onSale?: boolean
  tag?: string
  include?: string[]
  cursor?: string
  pageSize?: number
}

export interface CatalogPage {
  items: ProductSummary[]
  nextCursor?: string
  hasNextPage: boolean
  total: number
}

export interface ProductImage {
  url: string
  alt: string
  width?: number
  height?: number
}
export interface ProductPrice {
  amount: number
  regularAmount?: number
  saleAmount?: number
  currency: 'EGP'
  minorUnit: number
  discount?: number
  contactForPrice: boolean
}
export interface ProductStock {
  status: StockStatus
  purchasable: boolean
  quantity?: number
  backordersAllowed: boolean
}
export interface ProductSpecification {
  key: string
  label: string
  value: string
  group?: string
  comparable: boolean
  filterable: boolean
}
export interface ProductHighlight {
  label: string
  value: string
}
export interface ProductVariant {
  id: string
  attributes: { name: string; value: string }[]
  price: ProductPrice
  stock: ProductStock
  image?: ProductImage
}
export interface ProductDetail extends ProductSummary {
  description?: string
  shortDescription?: string
  gallery: ProductImage[]
  specifications: ProductSpecification[]
  warranty?: string
  variants: ProductVariant[]
  relationships: RelationshipGroup[]
  categories: TaxonomyTerm[]
}
export interface TaxonomyTerm {
  id: string
  slug: string
  name: string
  parentId?: string
  description: string
  image?: string
  count: number
}
export interface RelationshipGroup {
  type: 'related' | 'accessories' | 'alternatives' | 'compatible'
  title: string
  source: string
  products: ProductSummary[]
}
export interface FilterOption {
  id: string
  label: string
  count: number
}
export interface FilterDefinition {
  key: string
  label: string
  options: FilterOption[]
}
export interface FacetResult {
  groups: FilterDefinition[]
  minPrice?: number
  maxPrice?: number
}
export interface PaginationMeta {
  nextCursor?: string
  hasNextPage: boolean
  total: number
}
export interface SearchSuggestion {
  kind: 'product' | 'brand' | 'category'
  id: string
  label: string
  href: string
  image?: string
  product?: ProductSummary
}
export interface Branch {
  id: string
  name: string
  address?: string
}
export interface BranchAvailability {
  available: boolean
  branches: (Branch & { status: string })[]
  updatedAt?: string
  message?: string
}
export interface Address {
  firstName: string
  lastName: string
  email: string
  phone: string
  country: 'EG'
  state: string
  city: string
  address1: string
  address2: string
  postcode: string
}
export interface Customer {
  id: string
  email: string
  addresses: Address[]
}
export interface CartLine {
  id: string
  productId: string
  productName: string
  productImage?: string
  quantity: number
  price: number
  total?: number
  maxQuantity?: number
  variationId?: string
  selectedOptions?: string[]
  bundleId?: string
  bundleGroupId?: string
  bundleName?: string
  bundleItemRole?: string
  bundlePricingMetadata?: {
    regularTotal: number
    bundleTotal: number
    savingsAmount: number
    currency: 'EGP'
  }
}
export interface ShippingRate {
  id: string
  packageId: number
  name: string
  price: number
  selected: boolean
}
export interface Cart {
  lines: CartLine[]
  subtotal: number
  total: number
  discount: number
  tax: number
  shipping: number | null
  coupons: string[]
  rates: ShippingRate[]
  paymentMethods: string[]
  needsShipping: boolean
  errors: string[]
}
export interface WishlistItem {
  productId: string
}
export interface CompareItem {
  productId: string
}
export interface OrderItem {
  productId: string
  name: string
  quantity: number
  total: number
}
export interface Order {
  id: string
  status: string
  items: OrderItem[]
  total: number
}
export interface CheckoutResult {
  orderId: string
  status: string
  redirectUrl?: string
}
