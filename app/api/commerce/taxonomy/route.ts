import { terms } from '@/lib/commerce/live/catalog'
import { errorResponse } from '@/lib/commerce/live/errors'
export async function GET() {
  try {
    const [categories, brands] = await Promise.all([
      terms('categories'),
      terms('brands'),
    ])
    return Response.json({ categories, brands })
  } catch (e) {
    return errorResponse(e)
  }
}
