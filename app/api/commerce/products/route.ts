import { commerceProvider, serverProducts } from '@/lib/commerce/server'
import { listProducts, byIds, parseQuery } from '@/lib/commerce/live/catalog'
import { errorResponse } from '@/lib/commerce/live/errors'
export async function GET(request: Request) {
  try {
    const p = Object.fromEntries(new URL(request.url).searchParams)
    if (p.ids) return Response.json(await byIds(p.ids.split(',')))
    const q = parseQuery(p)
    return Response.json(
      commerceProvider() === 'woocommerce'
        ? await listProducts(q)
        : await serverProducts().page(q),
    )
  } catch (e) {
    return errorResponse(e)
  }
}
