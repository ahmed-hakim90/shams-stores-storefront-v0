import { facets, parseQuery } from '@/lib/commerce/live/catalog'
import { errorResponse } from '@/lib/commerce/live/errors'
export async function GET(r: Request) {
  try {
    return Response.json(
      await facets(parseQuery(Object.fromEntries(new URL(r.url).searchParams))),
    )
  } catch (e) {
    return errorResponse(e)
  }
}
