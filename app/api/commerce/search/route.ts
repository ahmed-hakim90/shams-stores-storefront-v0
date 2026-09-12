import { autocomplete } from '@/lib/commerce/live/catalog'
import { errorResponse } from '@/lib/commerce/live/errors'
export async function GET(r: Request) {
  try {
    return Response.json(
      await autocomplete(
        (new URL(r.url).searchParams.get('q') ?? '').trim().slice(0, 180),
      ),
    )
  } catch (e) {
    return errorResponse(e)
  }
}
