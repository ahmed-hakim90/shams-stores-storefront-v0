import { getCart, mutateCart, assertSameOrigin } from '@/lib/commerce/live/cart'
import { errorResponse } from '@/lib/commerce/live/errors'
export async function GET() {
  try {
    return Response.json(await getCart(), {
      headers: { 'Cache-Control': 'no-store' },
    })
  } catch (e) {
    return errorResponse(e)
  }
}
export async function POST(r: Request) {
  try {
    assertSameOrigin(r)
    return Response.json(await mutateCart(await r.json()), {
      headers: { 'Cache-Control': 'no-store' },
    })
  } catch (e) {
    return errorResponse(e)
  }
}
