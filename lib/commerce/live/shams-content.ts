import 'server-only'
import { cache } from 'react'
import { request } from './client'
import { array, record, text } from './normalize'
import { contentBatches, mergeAssurances } from './shams-contract'
import type { ProductSummary } from '../types'

// Only public editorial routes opt into the Next Data Cache. Unknown routes stay live.
export function contentTtl(path: string): number | undefined {
  const route = path.split('?')[0]
  if (route === 'site-content' || /^pages\/\d+\/content$/.test(route)) return 300
  if (route === 'catalog/terms') return 3600
  if (route === 'products/content' || /^products\/\d+\/(content|accessories|reviews)$/.test(route)) return 120
  return undefined
}

// Share concurrent reads within this process; Next owns persistence and revalidation.
const inFlight = new Map<string, Promise<Record<string, unknown> | null>>()
export const shamsContent = cache(
  async (path: string): Promise<Record<string, unknown> | null> => {
    if (process.env.SHAMS_CONTENT_API_ENABLED === 'false') return null
    const existing = inFlight.get(path)
    if (existing) return existing
    const operation = request(`/shams/v1/${path}`, {
      signal: AbortSignal.timeout(8000),
      ttl: contentTtl(path),
    })
      .then((result) => record(result.data))
      .catch(() => null)
      .finally(() => inFlight.delete(path))
    inFlight.set(path, operation)
    return operation
  },
)
export const siteContent = () => shamsContent('site-content')
export async function enrichProducts(
  products: ProductSummary[],
): Promise<ProductSummary[]> {
  const batches = await Promise.all(
    contentBatches(products.map((p) => p.id)).map(async (ids) => {
      const query = new URLSearchParams()
      ids.forEach((id) => query.append('ids[]', id))
      return array((await shamsContent(`products/content?${query}`))?.items)
    }),
  )
  const byId = new Map(
    batches
      .flat()
      .map((item) => [String(record(record(item).product).id), item]),
  )
  return products.map((product) =>
    mergeAssurances(product, byId.get(product.id)),
  )
}
export const contentPage = cache(async (slug: string) => {
  if (!/^[a-z0-9-]+$/.test(slug)) return null
  try {
    const core = array(
      (
        await request(
          `/wp/v2/pages?slug=${encodeURIComponent(slug)}&_fields=id&per_page=1`,
          { signal: AbortSignal.timeout(8000), ttl: 300 },
        )
      ).data,
    )[0]
    const id = Number(record(core).id)
    if (!Number.isSafeInteger(id) || id < 1) return null
    const page = await shamsContent(`pages/${id}/content`)
    return page && text(page.title) && typeof page.content_html === 'string'
      ? page
      : null
  } catch {
    return null
  }
})
