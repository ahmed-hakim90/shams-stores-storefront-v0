import type { Bundle, BundleAvailability, BundleItem, Money, Product } from './types'

type WooBundlePayload = Record<string, unknown> & {
  id?: string | number
  slug?: string
  name?: string
  description?: string
  price?: string | number
  regular_price?: string | number
  bundle_price?: string | number
  meta_data?: { key: string; value: unknown }[]
}

const money = (value: unknown): Money => ({ amount: Number(value ?? 0), currency: 'EGP' })
const meta = (payload: WooBundlePayload, key: string) => payload.meta_data?.find((item) => item.key === key)?.value

export function mapWooBundleToBundle(payload: WooBundlePayload, products: Product[] = []): Bundle {
  const rawItems = (payload.items ?? meta(payload, 'bundle_items') ?? []) as Record<string, unknown>[]
  const items: BundleItem[] = rawItems.map((item, index) => ({
    productId: String(item.product_id ?? item.productId ?? ''),
    variationId: item.variation_id ? String(item.variation_id) : undefined,
    role: String(item.role ?? 'Included item'),
    required: item.required !== false,
    quantity: Number(item.quantity ?? 1),
    selectable: item.selectable === true,
    sortOrder: index,
    individualPrice: products.find((product) => product.id === String(item.product_id ?? item.productId))?.price,
  })).filter((item) => item.productId)
  const originalPrice = money(payload.regular_price ?? payload.original_price ?? payload.price)
  const bundlePrice = money(payload.bundle_price ?? payload.price)
  const availability: BundleAvailability = String(payload.availability ?? 'available') as BundleAvailability

  return {
    id: String(payload.id ?? payload.slug ?? ''),
    slug: String(payload.slug ?? payload.id ?? ''),
    name: String(payload.name ?? 'Bundle'),
    description: String(payload.description ?? ''),
    useCase: String(payload.use_case ?? meta(payload, 'use_case') ?? 'studio') as Bundle['useCase'],
    items,
    originalPrice,
    bundlePrice,
    availability,
    heroImage: typeof payload.hero_image === 'string' ? payload.hero_image : undefined,
    gallery: Array.isArray(payload.gallery) ? payload.gallery.filter((image): image is string => typeof image === 'string') : undefined,
    badge: typeof payload.badge === 'string' ? payload.badge : undefined,
  }
}
