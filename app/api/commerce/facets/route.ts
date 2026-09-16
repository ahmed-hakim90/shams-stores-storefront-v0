import { facets, parseQuery } from '@/lib/commerce/live/catalog'
import { errorResponse } from '@/lib/commerce/live/errors'
export async function GET(r: Request) {
  try {
    return Response.json(
      await facets(parseQuery(Object.fromEntries(new URL(r.url).searchParams))),
      {
        headers: {
          'Cache-Control':
            'public, max-age=30, s-maxage=60, stale-while-revalidate=300',
        },
      },
    )
  } catch (e) {
    return errorResponse(e)
  }
}
