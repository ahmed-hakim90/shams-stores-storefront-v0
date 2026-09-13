import { byIds, getProduct } from '@/lib/commerce/live/catalog'
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
    const summaries = await byIds(ids)
    const results = await Promise.all(
      summaries.map(async (p) => {
        const detail = await getProduct(p.slug)
        return {
          id: p.id,
          specifications:
            detail?.specifications.filter((s) => s.comparable) ?? [],
        }
      }),
    )
    return Response.json(
      Object.fromEntries(results.map((p) => [p.id, p.specifications])),
    )
  } catch (e) {
    return errorResponse(e)
  }
}
