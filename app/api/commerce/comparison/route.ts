import { comparisonSpecifications } from '@/lib/commerce/live/catalog'
import { errorResponse } from '@/lib/commerce/live/errors'
export async function GET(request: Request) {
  try {
    const ids = [
      ...new Set(
        (new URL(request.url).searchParams.get('ids') ?? '').split(','),
      ),
    ]
      .filter((id) => /^\d+$/.test(id))
      .slice(0, 4)
    return Response.json(await comparisonSpecifications(ids))
  } catch (e) {
    return errorResponse(e)
  }
}
