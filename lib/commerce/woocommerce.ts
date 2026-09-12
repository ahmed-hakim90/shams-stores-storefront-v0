import type { CatalogPage, CatalogQuery, Product } from './types'

export class CommerceError extends Error {
  status: number
  constructor(message: string, status = 502) { super(message); this.status = status }
}

type Environment = Record<string, string | undefined>
export function wooConfig(env: Environment) {
  const endpoint = env.WOOCOMMERCE_API_URL
  const key = env.WOOCOMMERCE_API_KEY
  const secret = env.WOOCOMMERCE_API_SECRET
  if (!endpoint || !key?.startsWith('ck_') || !secret?.startsWith('cs_')) {
    throw new CommerceError('WooCommerce connection is not configured.', 503)
  }
  let url: URL
  try { url = new URL(endpoint) } catch { throw new CommerceError('Invalid WooCommerce URL.', 503) }
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash || !url.pathname.replace(/\/$/, '').endsWith('/wp-json/wc/v3')) {
    throw new CommerceError('WooCommerce requires an HTTPS wc/v3 endpoint without credentials or query parameters.', 503)
  }
  if (env.WOOCOMMERCE_CURRENCY !== 'EGP') throw new CommerceError('Confirm the WooCommerce store currency is EGP.', 503)
  return { endpoint: url.href.replace(/\/$/, ''), authorization: `Basic ${Buffer.from(`${key}:${secret}`).toString('base64')}` }
}

export function catalogQuery(input: Record<string, unknown>): CatalogQuery {
  const string = (key: string, limit = 120) => {
    const value = input[key]
    if (value === undefined || value === '') return undefined
    if (typeof value !== 'string' || value.length > limit) throw new CommerceError(`Invalid ${key}.`, 400)
    return value
  }
  const sort = string('sort')
  if (sort && !['featured', 'price-asc', 'price-desc', 'rating'].includes(sort)) throw new CommerceError('Invalid sort.', 400)
  const cursor = string('cursor')
  if (cursor && !/^\d+$/.test(cursor)) throw new CommerceError('Invalid cursor.', 400)
  if (cursor && (!Number.isSafeInteger(Number(cursor)) || Number(cursor) > 100000)) throw new CommerceError('Invalid cursor.', 400)
  const pageSize = input.pageSize === undefined ? 20 : Number(input.pageSize)
  if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > 40) throw new CommerceError('Invalid page size.', 400)
  return { category: string('category'), brand: string('brand'), query: string('query', 200)?.trim(), sort: sort as CatalogQuery['sort'], cursor, pageSize }
}

type WooProduct = {
  id: number; slug: string; name: string; type: string; status: string; catalog_visibility?: string
  price: string; regular_price: string; on_sale: boolean; purchasable: boolean
  stock_status: string; stock_quantity?: number | null; sku?: string; description?: string
  average_rating: string; rating_count: number
  images: { src: string }[]; categories: { slug: string }[]; brands?: { name: string }[]
}
const plainText = (text: string) => text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
export function mapWooProduct(raw: WooProduct): Product {
  const price = Number(raw.price)
  if (!Number.isSafeInteger(raw.id) || raw.id < 1 || !raw.slug || !raw.name || !Array.isArray(raw.images) || !Array.isArray(raw.categories) || raw.price === '' || !Number.isFinite(price) || price < 0) {
    throw new CommerceError('WooCommerce returned invalid product data.')
  }
  const regular = Number(raw.regular_price)
  const canPurchase = raw.type === 'simple' && raw.purchasable === true
  return {
    id: String(raw.id), slug: raw.slug, name: plainText(raw.name), sku: raw.sku,
    description: plainText(raw.description ?? ''), brand: raw.brands?.[0]?.name ?? '',
    category: raw.categories[0]?.slug ?? 'uncategorized',
    price: { amount: price, currency: 'EGP' },
    previousPrice: raw.on_sale && Number.isFinite(regular) && regular > price ? { amount: regular, currency: 'EGP' } : undefined,
    rating: Number(raw.average_rating) || 0, reviewCount: raw.rating_count || 0,
    stock: raw.stock_status === 'outofstock' ? 'out_of_stock' : raw.stock_status === 'onbackorder' ? 'preorder' : typeof raw.stock_quantity === 'number' && raw.stock_quantity > 0 && raw.stock_quantity <= 3 ? 'low_stock' : 'in_stock',
    image: raw.images.find((image) => /^https:\/\//.test(image.src))?.src ?? '/placeholder.svg',
    badges: raw.on_sale ? ['sale'] : [], useCases: [], purchasable: canPurchase,
  }
}

export function createWooClient(env: Environment, fetcher: typeof fetch = fetch) {
  async function request(path: string, params: URLSearchParams) {
    const config = wooConfig(env)
    let response: Response
    try {
      response = await fetcher(`${config.endpoint}/${path}?${params}`, {
        headers: { Authorization: config.authorization, Accept: 'application/json' },
        signal: AbortSignal.timeout(10000), redirect: 'error', cache: 'no-store',
      })
    } catch { throw new CommerceError('WooCommerce is temporarily unavailable.', 503) }
    if (!response.ok) throw new CommerceError('WooCommerce could not complete the request.', response.status === 429 ? 503 : 502)
    let body: unknown
    try { body = await response.json() } catch { throw new CommerceError('WooCommerce returned an invalid response.') }
    if (!Array.isArray(body)) throw new CommerceError('WooCommerce returned an invalid response.')
    return { body, response }
  }
  async function termId(taxonomy: 'categories' | 'brands', slug: string) {
    if (/^\d+$/.test(slug)) return slug
    const { body } = await request(`products/${taxonomy}`, new URLSearchParams({ slug, per_page: '1' }))
    const term = body[0] as { id?: number } | undefined
    return term?.id ? String(term.id) : undefined
  }
  return {
    async page(input: CatalogQuery = {}): Promise<CatalogPage> {
      const query = catalogQuery(input as Record<string, unknown>)
      const params = new URLSearchParams({ status: 'publish', catalog_visibility: 'visible', per_page: String(query.pageSize), offset: query.cursor ?? '0' })
      if (query.query) params.set('search', query.query)
      for (const [key, taxonomy] of [['category', 'categories'], ['brand', 'brands']] as const) {
        if (query[key]) {
          const id = await termId(taxonomy, query[key])
          if (!id) return { items: [], total: 0, hasNextPage: false }
          params.set(key, id)
        }
      }
      params.set('orderby', query.sort?.startsWith('price-') ? 'price' : query.sort === 'rating' ? 'rating' : 'date')
      params.set('order', query.sort === 'price-asc' ? 'asc' : 'desc')
      const { body, response } = await request('products', params)
      const items = body.map((raw) => mapWooProduct(raw as WooProduct))
      const totalHeader = response.headers.get('x-wp-total')
      const total = Number(totalHeader)
      if (totalHeader === null || !Number.isSafeInteger(total) || total < 0) throw new CommerceError('WooCommerce pagination metadata is missing.')
      const nextOffset = Number(query.cursor ?? 0) + items.length
      const hasNextPage = items.length > 0 && nextOffset < total
      return { items, total, hasNextPage, nextCursor: hasNextPage ? String(nextOffset) : undefined }
    },
    async bySlug(slug: string): Promise<Product | undefined> {
      const { body } = await request('products', new URLSearchParams({ slug, status: 'publish', catalog_visibility: 'visible', per_page: '1' }))
      return body[0] ? mapWooProduct(body[0] as WooProduct) : undefined
    },
  }
}
