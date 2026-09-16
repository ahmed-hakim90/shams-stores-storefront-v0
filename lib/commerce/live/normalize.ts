import type {
  ProductSummary,
  ProductDetail,
  ProductPrice,
  ProductSpecification,
  ProductVariant,
  StockStatus,
  TaxonomyTerm,
  Cart,
  BranchAvailability,
} from '../types'

export type RecordData = Record<string, unknown>
export const record = (v: unknown): RecordData =>
  v && typeof v === 'object' && !Array.isArray(v) ? (v as RecordData) : {}
export const array = (v: unknown): unknown[] => (Array.isArray(v) ? v : [])
export function text(v: unknown): string {
  if (typeof v !== 'string' && typeof v !== 'number') return ''
  return String(v)
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&#(x[\da-f]+|\d+);/gi, (_, n: string) => {
      const code =
        n[0].toLowerCase() === 'x' ? parseInt(n.slice(1), 16) : Number(n)
      return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : ''
    })
    .replace(
      /&(?:amp|quot|apos|nbsp|lt|gt|#39);/g,
      (m) =>
        ({
          '&amp;': '&',
          '&quot;': '"',
          '&apos;': "'",
          '&#39;': "'",
          '&nbsp;': ' ',
          '&lt;': '<',
          '&gt;': '>',
        })[m] ?? '',
    )
    .replace(/\s+/g, ' ')
    .trim()
}
export const numeric = (v: unknown, fallback = 0): number =>
  v !== '' && v !== null && v !== undefined && Number.isFinite(Number(v))
    ? Number(v)
    : fallback
export function safeImage(v: unknown): string | undefined {
  if (typeof v !== 'string') return undefined
  try {
    const u = new URL(v)
    return u.protocol === 'https:' &&
      ['www.shams-stores.com', 'shams-stores.com'].includes(u.hostname) &&
      u.pathname.startsWith('/wp-content/uploads/')
      ? u.href
      : undefined
  } catch {
    return undefined
  }
}
export function price(v: unknown): ProductPrice {
  const r = record(v),
    minorUnit = numeric(r.currency_minor_unit, 0)
  const amount = numeric(r.price, -1),
    regular = numeric(r.regular_price, -1)
  if (
    r.currency_code !== 'EGP' ||
    !Number.isSafeInteger(amount) ||
    amount < 0 ||
    !Number.isInteger(minorUnit) ||
    minorUnit < 0 ||
    minorUnit > 4
  )
    throw new Error('Invalid product price')
  return {
    amount,
    currency: 'EGP',
    minorUnit,
    regularAmount:
      Number.isSafeInteger(regular) && regular > amount ? regular : undefined,
    saleAmount:
      Number.isSafeInteger(regular) && regular > amount ? amount : undefined,
    discount:
      Number.isSafeInteger(regular) && regular > amount && amount > 0
        ? Math.round((1 - amount / regular) * 100)
        : undefined,
    contactForPrice: amount === 0,
  }
}
export function highlights(v: unknown) {
  if (typeof v !== 'string') return []
  const lines = [...v.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)]
    .map((m) => text(m[1]))
    .filter((x) => x.length > 2 && x.length <= 100)
  return lines
    .filter((line) =>
      /\b(?:sensor|full.frame|APS.C|mount|mm|f\/|MP|megapixel|4K|6K|8K|wireless|channel|TX|RX|USB|XLR|flight|battery|watt|RGB|bi.color|CRI|TLCI|autofocus|stabiliz)/i.test(
        line,
      ),
    )
    .slice(0, 3)
    .map((value) => ({ label: '', value }))
}
export function mapSummary(v: unknown): ProductSummary {
  const r = record(v),
    id = numeric(r.id),
    name = text(r.name),
    slug = text(r.slug)
  if (
    !Number.isSafeInteger(id) ||
    id < 1 ||
    !name ||
    /^\d+$/.test(name) ||
    !slug
  )
    throw new Error('Invalid product identity')
  const pricing = price(r.prices),
    images = array(r.images)
      .map((x) => safeImage(record(x).src))
      .filter(Boolean) as string[]
  const brand = record(array(r.brands)[0]),
    category = record(array(r.categories)[0])
  const stock =
    r.is_on_backorder === true
      ? 'preorder'
      : r.is_in_stock === false
        ? 'out_of_stock'
        : r.is_in_stock === true
          ? numeric(r.low_stock_remaining) > 0
            ? 'low_stock'
            : 'in_stock'
          : 'unknown'
  const reviewCount = Math.max(0, Math.floor(numeric(r.review_count))),
    rating = numeric(r.average_rating)
  return {
    id: String(id),
    slug,
    name,
    brand: text(brand.name),
    brandSlug: text(brand.slug),
    category: text(category.slug),
    sku: text(r.sku),
    configuration: text(r.variation) || undefined,
    image: images[0] || '/placeholder.svg',
    secondaryImage: images[1],
    price: {
      amount: pricing.amount / 10 ** pricing.minorUnit,
      currency: 'EGP',
    },
    previousPrice: pricing.regularAmount
      ? {
          amount: pricing.regularAmount / 10 ** pricing.minorUnit,
          currency: 'EGP',
        }
      : undefined,
    pricing,
    stock,
    purchasable:
      r.is_purchasable === true &&
      !pricing.contactForPrice &&
      !r.has_options &&
      r.type === 'simple',
    hasOptions: r.has_options === true,
    rating: reviewCount > 0 ? Math.min(5, Math.max(0, rating)) : 0,
    reviewCount,
    badges: pricing.discount ? ['sale'] : [],
    useCases: [],
    highlights: highlights(r.short_description),
  }
}
export function mapTerm(v: unknown): TaxonomyTerm {
  const r = record(v)
  return {
    id: String(r.id),
    name: text(r.name),
    slug: text(r.slug),
    parentId: numeric(r.parent) > 0 ? String(r.parent) : undefined,
    description: text(r.description),
    image: safeImage(record(r.image).src),
    count: Math.max(0, numeric(r.count)),
  }
}
export function specifications(raw: RecordData): ProductSpecification[] {
  const result: ProductSpecification[] = []
  for (const value of array(raw.attributes)) {
    const a = record(value),
      label = text(a.name),
      vals = array(a.options ?? a.terms)
        .map((v) => text(record(v).name ?? v))
        .filter(Boolean)
    if (label && vals.length)
      result.push({
        key: label.toLowerCase(),
        label,
        value: vals.join(' · '),
        comparable: true,
        filterable: numeric(a.id) > 0,
      })
  }
  const meta = Object.fromEntries(
    array(raw.meta_data).map((x) => {
      const m = record(x)
      return [String(m.key), m.value]
    }),
  )
  const html =
    typeof meta._specifications === 'string' ? meta._specifications : ''
  for (const row of html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)) {
    const cells = [...row[1].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)].map(
      (x) => text(x[1]),
    )
    if (cells.length >= 2 && cells[0] && cells[1])
      result.push({
        key: cells[0].toLowerCase(),
        label: cells[0],
        value: cells.slice(1).join(' · '),
        comparable: true,
        filterable: false,
      })
  }
  return [...new Map(result.map((x) => [x.key, x])).values()].slice(0, 100)
}
export function mapVariant(v: unknown): ProductVariant {
  const r = record(v),
    id = numeric(r.id)
  if (!id) throw new Error('Invalid variant')
  const p = price(r.prices)
  const stock: StockStatus =
    r.is_on_backorder === true
      ? 'preorder'
      : r.is_in_stock === false
        ? 'out_of_stock'
        : 'in_stock'
  const img = record(array(r.images)[0])
  return {
    id: String(id),
    attributes: array(r.attributes)
      .map((a) => {
        const at = record(a)
        return { name: text(at.name), value: text(at.option) }
      })
      .filter((a) => a.name && a.value),
    price: {
      ...p,
      amount: p.amount / 10 ** p.minorUnit,
      regularAmount: p.regularAmount ? p.regularAmount / 10 ** p.minorUnit : undefined,
      saleAmount: p.saleAmount ? p.saleAmount / 10 ** p.minorUnit : undefined,
    },
    stock: {
      status: stock,
      purchasable: r.is_purchasable === true,
      backordersAllowed: r.is_on_backorder === true,
    },
    image:
      safeImage(img.src)
        ? { url: safeImage(img.src)!, alt: text(img.alt) || '' }
        : undefined,
  }
}
export function mapDetail(
  store: unknown,
  enrichment: unknown,
  variants: ProductVariant[] = [],
): ProductDetail {
  const r = record(store),
    raw = record(enrichment),
    base = mapSummary(r)
  const meta = Object.fromEntries(
    array(raw.meta_data).map((x) => {
      const m = record(x)
      return [String(m.key), m.value]
    }),
  )
  const installmentRaw = meta._shams_installment_from
  const installmentFrom =
    typeof installmentRaw === 'string' && /^\d+$/.test(installmentRaw)
      ? Number(installmentRaw)
      : typeof installmentRaw === 'number' && installmentRaw > 0
        ? installmentRaw
        : undefined

  return {
    ...base,
    installmentFrom,
    official: meta._shams_official === 'yes' || undefined,
    description:
      typeof (raw.description ?? r.description) === 'string'
        ? String(raw.description ?? r.description)
            .replace(/<(script|style)[\s\S]*?<\/\1>/gi, '')
            .trim() || undefined
        : undefined,
    shortDescription: text(r.short_description),
    gallery: array(r.images)
      .map((x) => {
        const i = record(x)
        return {
          url: safeImage(i.src) || '',
          alt: text(i.alt) || base.name,
          width: numeric(i.width) || undefined,
          height: numeric(i.height) || undefined,
        }
      })
      .filter((x) => x.url),
    specifications: specifications(raw),
    warranty:
      meta._shams_product_warranty === 'yes'
        ? 'Warranty included'
        : meta._shams_product_warranty === 'no'
          ? undefined
          : text(meta._shams_product_warranty) || undefined,
    variants,
    relationships: [],
    categories: array(r.categories).map(mapTerm),
  }
}
export function mapCart(v: unknown): Cart {
  const r = record(v),
    t = record(r.totals)
  if (!Array.isArray(r.items) || t.currency_code !== 'EGP')
    throw new Error('Invalid cart')
  const exponent = numeric(t.currency_minor_unit, -1)
  if (!Number.isInteger(exponent) || exponent < 0 || exponent > 4)
    throw new Error('Invalid cart currency precision')
  const unit = 10 ** exponent,
    amount = (v: unknown) => {
      const n = numeric(v, -1)
      if (!Number.isSafeInteger(n) || n < 0)
        throw new Error('Invalid cart total')
      return n / unit
    }
  return {
    lines: array(r.items).map((x) => {
      const i = record(x),
        p = record(i.prices)
      return {
        id: text(i.key),
        productId: String(i.id),
        productName: text(i.name),
        productImage: safeImage(record(array(i.images)[0]).src),
        quantity: numeric(i.quantity),
        price: numeric(p.price) / 10 ** numeric(p.currency_minor_unit),
        total: amount(record(i.totals).line_total),
        maxQuantity: numeric(record(i.quantity_limits).maximum, 99),
        selectedOptions: array(i.variation).map(
          (v) => text(record(v).attribute) + ': ' + text(record(v).value),
        ),
      }
    }),
    subtotal: amount(t.total_items) + amount(t.total_discount),
    total: amount(t.total_price),
    discount: amount(t.total_discount),
    tax: amount(t.total_tax),
    shipping: t.total_shipping === null ? null : amount(t.total_shipping),
    coupons: array(r.coupons).map((x) => text(record(x).code)),
    rates: array(r.shipping_rates).flatMap((x) => {
      const p = record(x)
      return array(p.shipping_rates).map((v) => {
        const rate = record(v)
        return {
          id: text(rate.rate_id),
          packageId: numeric(p.package_id),
          name: text(rate.name),
          price: numeric(rate.price) / 10 ** numeric(rate.currency_minor_unit),
          selected: rate.selected === true,
        }
      })
    }),
    paymentMethods: array(r.payment_methods).map(text),
    needsShipping: r.needs_shipping === true,
    errors: array(r.errors).map((x) => text(record(x).message)),
  }
}
export function mapAvailability(v: unknown): BranchAvailability {
  const r = record(v)
  return {
    available: r.available === true,
    updatedAt: text(r.updated_at) || undefined,
    message: text(r.message),
    branches: array(r.branches)
      .map((x) => {
        const b = record(x)
        return {
          id: text(b.id),
          name: text(b.name),
          address: text(b.address) || undefined,
          status: text(b.stock_status ?? b.status),
        }
      })
      .filter((x) => x.id && x.name),
  }
}

export function compatibleProductIds(raw: unknown): string[] {
  const metadata = Object.fromEntries(
    array(record(raw).meta_data).map((v) => [
      text(record(v).key),
      record(v).value,
    ]),
  )
  if (metadata._shams_compat_level !== 'compatible') return []
  const ids = (v: unknown) =>
    array(v)
      .map(String)
      .filter((id) => /^\d+$/.test(id))
  const excluded = new Set(ids(metadata._shams_compat_manual_exclusions))
  return [...new Set(ids(metadata._shams_compat_manual_includes))].filter(
    (id) => !excluded.has(id),
  )
}
