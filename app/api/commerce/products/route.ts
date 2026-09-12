import { serverProducts } from '@/lib/commerce/server'
import { catalogQuery, CommerceError } from '@/lib/commerce/woocommerce'

export async function GET(request: Request) {
  try {
    const params = Object.fromEntries(new URL(request.url).searchParams)
    const page = await serverProducts().page(catalogQuery(params))
    return Response.json(page, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    const known = error instanceof CommerceError
    return Response.json({ error: known ? error.message : 'Products are temporarily unavailable.' }, { status: known ? error.status : 502, headers: { 'Cache-Control': 'no-store' } })
  }
}
