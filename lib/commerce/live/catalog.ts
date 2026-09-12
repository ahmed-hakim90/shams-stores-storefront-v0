import 'server-only'
import { cache } from 'react'
import { createHash } from 'node:crypto'
import type {
  CatalogQuery,
  CatalogPage,
  FacetResult,
  ProductSummary,
  SearchSuggestion,
  ProductDetail,
} from '../types'
import { request } from './client'
import {
  array,
  record,
  text,
  numeric,
  mapSummary,
  mapDetail,
  mapTerm,
  mapAvailability,
  compatibleProductIds,
} from './normalize'
import { CommerceFault } from './errors'

const summaryFields =
  'id,name,slug,type,sku,variation,prices,on_sale,average_rating,review_count,images,categories,brands,has_options,is_purchasable,is_in_stock,is_on_backorder,low_stock_remaining,short_description'
export function parseQuery(input: Record<string, unknown>): CatalogQuery {
  const str = (key: string, max = 180) => {
    const v = input[key]
    if (v === undefined || v === '') return undefined
    if (typeof v !== 'string' || v.length > max)
      throw new CommerceFault(
        'VALIDATION_ERROR',
        'Invalid catalog filter.',
        400,
      )
    return v.trim()
  }
  const sort =
      str('sort') ?? (str('q') || str('query') ? 'relevance' : 'newest'),
    stock = str('stock'),
    cursor = str('cursor', 1500)
  if (
    ![
      'newest',
      'featured',
      'relevance',
      'best-selling',
      'price-asc',
      'price-desc',
      'rating',
    ].includes(sort) ||
    (stock && !['instock', 'outofstock', 'onbackorder'].includes(stock))
  )
    throw new CommerceFault('VALIDATION_ERROR', 'Invalid catalog filter.', 400)
  const number = (key: string) => {
    const v = str(key)
    if (!v) return undefined
    const n = Number(v)
    if (!Number.isFinite(n) || n < 0 || n > 1e8)
      throw new CommerceFault('VALIDATION_ERROR', 'Invalid price range.', 400)
    return n
  }
  const minPrice = number('minPrice'),
    maxPrice = number('maxPrice'),
    pageSize = Number(input.pageSize ?? 24)
  if (
    !Number.isInteger(pageSize) ||
    pageSize < 1 ||
    pageSize > 40 ||
    (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice)
  )
    throw new CommerceFault('VALIDATION_ERROR', 'Check the price range.', 400)
  return {
    category: str('category'),
    brand: str('brand'),
    query: str('query') ?? str('q'),
    tag: str('tag'),
    sort: sort as CatalogQuery['sort'],
    stock: stock as CatalogQuery['stock'],
    minPrice,
    maxPrice,
    onSale: str('onSale') === 'true' || undefined,
    cursor,
    pageSize,
  }
}
export const terms = cache(async (kind: 'categories' | 'brands' | 'tags') => {
  const first = await request(`/wc/store/v1/products/${kind}?per_page=100`, {
    ttl: 3600,
  })
  const pages = Math.min(10, numeric(first.headers.get('x-wp-totalpages'), 1))
  const rest = await Promise.all(
    Array.from({ length: Math.max(0, pages - 1) }, (_, i) =>
      request(`/wc/store/v1/products/${kind}?per_page=100&page=${i + 2}`, {
        ttl: 3600,
      }),
    ),
  )
  return [...array(first.data), ...rest.flatMap((r) => array(r.data))]
    .map(mapTerm)
    .filter((x) => x.slug && x.count > 0)
})
async function paramsFor(q: CatalogQuery) {
  const p = new URLSearchParams({ catalog_visibility: 'visible' })
  for (const [key, kind] of [
    ['category', 'categories'],
    ['brand', 'brands'],
    ['tag', 'tags'],
  ] as const)
    if (q[key]) {
      const ids = q[key]!.split(',')
      const ts = await terms(kind)
      const found = ids
        .map((id) => ts.find((t) => t.id === id || t.slug === id)?.id)
        .filter(Boolean)
      p.set(key, found.length ? found.join(',') : '999999999')
    }
  if (q.query) p.set('search', q.query)
  const sort = q.sort ?? 'newest'
  p.set(
    'orderby',
    sort.startsWith('price-')
      ? 'price'
      : sort === 'best-selling'
        ? 'popularity'
        : sort === 'rating'
          ? 'rating'
          : 'date',
  )
  p.set('order', sort === 'price-asc' ? 'asc' : 'desc')
  if (q.stock) p.set('stock_status[]', q.stock)
  if (q.onSale) p.set('on_sale', 'true')
  // This store advertises currency_minor_unit=0. Prices in queries therefore use EGP units.
  if (q.minPrice !== undefined)
    p.set('min_price', String(Math.round(q.minPrice)))
  if (q.maxPrice !== undefined)
    p.set('max_price', String(Math.round(q.maxPrice)))
  return p
}
const signature = (q: CatalogQuery) =>
  createHash('sha256')
    .update(JSON.stringify({ ...q, cursor: undefined }))
    .digest('hex')
    .slice(0, 16)
export const listProducts = cache(
  async (q: CatalogQuery = {}): Promise<CatalogPage> => {
    const size = q.pageSize ?? 24,
      sig = signature(q)
    let offset = 0
    let promotedIds: string[] = []
    let promoted: ProductSummary[] = []
    if (q.cursor) {
      try {
        const c = JSON.parse(Buffer.from(q.cursor, 'base64url').toString())
        if (
          c.sig !== sig ||
          !Number.isSafeInteger(c.offset) ||
          c.offset < 0 ||
          c.offset > 1000000
        )
          throw Error()
        if (
          c.promotedIds !== undefined &&
          (!Array.isArray(c.promotedIds) ||
            c.promotedIds.length > 6 ||
            c.promotedIds.some(
              (id: unknown) => typeof id !== 'string' || !/^\d+$/.test(id),
            ))
        )
          throw Error()
        promotedIds = c.promotedIds ?? []
        offset = c.offset
      } catch {
        throw new CommerceFault(
          'VALIDATION_ERROR',
          'This page has expired. Refresh the results.',
          400,
        )
      }
    }
    const params = await paramsFor(q)
    if (
      q.query &&
      (!q.sort || q.sort === 'relevance') &&
      size > 6 &&
      !q.cursor
    ) {
      const result = await request(
        `/shams/v1/search?term=${encodeURIComponent(q.query)}&lang=en`,
        { ttl: 30 },
      ).catch(() => ({ data: {} }))
      const ids = array(record(result.data).items)
        .map((x) => String(record(x).id))
        .filter((id) => /^\d+$/.test(id))
        .slice(0, 6)
      if (ids.length) {
        const selected = new URLSearchParams(params)
        selected.delete('search')
        selected.set('include', ids.join(','))
        selected.set('orderby', 'include')
        selected.set('per_page', '6')
        selected.set('_fields', summaryFields)
        const candidates = await request(`/wc/store/v1/products?${selected}`, {
          ttl: 30,
        })
        promoted = array(candidates.data).flatMap((x) => {
          try {
            return [mapSummary(x)]
          } catch {
            return []
          }
        })
        const normalized=(value:string)=>value.toLowerCase().replace(/[^\p{L}\p{N}]/gu,'')
        const needle=normalized(q.query)
        promoted=promoted.filter(product=>normalized(product.sku??'')===needle||normalized(product.name).includes(needle))
        promotedIds = promoted.map((p) => p.id)
      }
    }
    if (promotedIds.length) params.set('exclude', promotedIds.join(','))
    params.set('per_page', String(size - promoted.length))
    params.set('offset', String(offset))
    params.set('_fields', summaryFields)
    const res = await request(`/wc/store/v1/products?${params}`, {
      ttl: q.query ? 30 : 120,
    })
    if (!Array.isArray(res.data))
      throw new CommerceFault(
        'SERVER_ERROR',
        'Products are temporarily unavailable.',
      )
    const items: ProductSummary[] = [...promoted]
    for (const raw of res.data) {
      try {
        items.push(mapSummary(raw))
      } catch {
        console.warn('[commerce] invalid product omitted', {
          id: record(raw).id,
        })
      }
    }
    const upstreamTotal = numeric(res.headers.get('x-wp-total'), -1)
    if (upstreamTotal < 0)
      throw new CommerceFault(
        'SERVER_ERROR',
        'The store returned incomplete pagination.',
      )
    const total = upstreamTotal + promotedIds.length,
      next = offset + res.data.length,
      hasNextPage = next < upstreamTotal && res.data.length > 0
    return {
      items,
      total,
      hasNextPage,
      nextCursor: hasNextPage
        ? Buffer.from(
            JSON.stringify({ offset: next, sig, promotedIds }),
          ).toString('base64url')
        : undefined,
    }
  },
)
export async function byIds(ids: string[]) {
  const clean = [...new Set(ids)].filter((id) => /^\d+$/.test(id)).slice(0, 100)
  if (!clean.length) return []
  const r = await request(
    `/wc/store/v1/products?include=${clean.join(',')}&per_page=100&orderby=include&_fields=${summaryFields}`,
    { ttl: 60 },
  )
  return array(r.data).flatMap((x) => {
    try {
      return [mapSummary(x)]
    } catch {
      return []
    }
  })
}
export const getProduct = cache(
  async (slug: string): Promise<ProductDetail | null> => {
    const r = await request(
        `/wc/store/v1/products?slug=${encodeURIComponent(slug)}&per_page=1`,
        { ttl: 120 },
      ),
      raw = array(r.data)[0]
    if (!raw) return null
    const id = numeric(record(raw).id)
    const enrichment = await request(`/wc/v3/products/${id}`, {
      private: true,
      ttl: 300,
    }).catch(() => ({ data: {} }))
    let detail: ProductDetail
    try {
      detail = mapDetail(raw, enrichment.data)
    } catch {
      console.warn('[commerce] invalid product detail omitted', { id })
      return null
    }
    const e = record(enrichment.data),
      meta = Object.fromEntries(
        array(e.meta_data).map((x) => [text(record(x).key), record(x).value]),
      )
    const ids = (v: unknown) =>
        array(v)
          .map((x) => String(x))
          .filter((x) => /^\d+$/.test(x)),
      excluded = new Set(ids(meta._shams_compat_manual_exclusions))
    const groups = [
      {
        type: 'compatible' as const,
        title: 'Selected compatible gear',
        source: 'manual',
        ids: compatibleProductIds(enrichment.data),
      },
      {
        type: 'accessories' as const,
        title: 'Recommended accessories',
        source: 'woocommerce-cross-sell',
        ids: ids(e.cross_sell_ids),
      },
      {
        type: 'alternatives' as const,
        title: 'Explore alternatives',
        source: 'woocommerce-upsell',
        ids: ids(e.upsell_ids),
      },
      {
        type: 'related' as const,
        title: 'Related gear',
        source: 'woocommerce-related',
        ids: ids(e.related_ids),
      },
    ]
    detail.relationships = (
      await Promise.all(
        groups
          .filter((g) => g.ids.length)
          .map(async (g) => ({
            ...g,
            products: await byIds(
              g.ids
                .filter((x) => x !== String(id) && !excluded.has(x))
                .slice(0, 6),
            ).catch(() => []),
          })),
      )
    ).filter((g) => g.products.length)
    return detail
  },
)
export async function facets(q: CatalogQuery): Promise<FacetResult> {
  const collect = async (query: CatalogQuery) => {
    const p = await paramsFor(query)
    p.set('calculate_taxonomy_counts', 'product_cat,product_brand')
    p.set('calculate_price_range', 'true')
    p.set('calculate_stock_status_counts', 'true')
    return record(
      (await request(`/wc/store/v1/products/collection-data?${p}`, { ttl: 60 }))
        .data,
    )
  }
  // Each group's counts exclude its own selection so alternatives remain reachable.
  const base = collect(q)
  const [
    data,
    categoryData,
    brandData,
    stockData,
    priceData,
    categories,
    brands,
  ] = await Promise.all([
    base,
    q.category ? collect({ ...q, category: undefined }) : base,
    q.brand ? collect({ ...q, brand: undefined }) : base,
    q.stock ? collect({ ...q, stock: undefined }) : base,
    q.minPrice !== undefined || q.maxPrice !== undefined
      ? collect({ ...q, minPrice: undefined, maxPrice: undefined })
      : base,
    terms('categories'),
    terms('brands'),
  ])
  const counts = (r: Record<string, unknown>) =>
    new Map(
      array(r.taxonomy_counts).map((v) => {
        const x = record(v)
        return [String(x.term), numeric(x.count)]
      }),
    )
  const cc = counts(categoryData),
    bc = counts(brandData)
  return {
    groups: [
      {
        key: 'category',
        label: 'Category',
        options: categories
          .filter((t) => cc.has(t.id))
          .map((t) => ({ id: t.slug, label: t.name, count: cc.get(t.id)! })),
      },
      {
        key: 'brand',
        label: 'Brand',
        options: brands
          .filter((t) => bc.has(t.id))
          .map((t) => ({ id: t.slug, label: t.name, count: bc.get(t.id)! })),
      },
      {
        key: 'stock',
        label: 'Availability',
        options: array(stockData.stock_status_counts).map((v) => {
          const x = record(v),
            id = text(x.status)
          return {
            id,
            label:
              id === 'instock'
                ? 'In stock'
                : id === 'outofstock'
                  ? 'Out of stock'
                  : 'On backorder',
            count: numeric(x.count),
          }
        }),
      },
    ],
    minPrice: numeric(record(priceData.price_range).min_price),
    maxPrice: numeric(record(priceData.price_range).max_price),
  }
}
export async function autocomplete(query: string): Promise<SearchSuggestion[]> {
  if (query.length < 2) return []
  const [custom, categories, brands] = await Promise.all([
    request(`/shams/v1/search?term=${encodeURIComponent(query)}&lang=en`, {
      ttl: 30,
    }).catch(() => ({ data: {} })),
    terms('categories'),
    terms('brands'),
  ])
  const ids = array(record(custom.data).items).map((v) => String(record(v).id))
  const products = ids.length
    ? await byIds(ids.slice(0, 6))
    : (await listProducts({ query, pageSize: 6 })).items
  const needle = query.toLowerCase()
  return [
    ...products.map((p) => ({
      kind: 'product' as const,
      id: p.id,
      label: p.name,
      href: `/p/${p.slug}`,
      image: p.image,
      product: p,
    })),
    ...brands
      .filter((t) => t.name.toLowerCase().includes(needle))
      .slice(0, 2)
      .map((t) => ({
        kind: 'brand' as const,
        id: t.id,
        label: t.name,
        href: `/b/${t.slug}`,
      })),
    ...categories
      .filter((t) => t.name.toLowerCase().includes(needle))
      .slice(0, 2)
      .map((t) => ({
        kind: 'category' as const,
        id: t.id,
        label: t.name,
        href: `/c/${t.slug}`,
      })),
  ]
}
export async function availability(id: string) {
  if (!/^\d+$/.test(id))
    throw new CommerceFault('VALIDATION_ERROR', 'Invalid product.', 400)
  return mapAvailability(
    (await request(`/shams/v1/branch-stock?product_id=${id}`, { ttl: 30 }))
      .data,
  )
}
export async function bundlesForProduct(id: string) {
  return array(
    record(
      (await request(`/shams-bundles/v1/products/${Number(id)}`, { ttl: 120 }))
        .data,
    ).bundles,
  )
}
