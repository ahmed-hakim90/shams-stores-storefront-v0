import { availability } from '@/lib/commerce/live/catalog'
import { errorResponse } from '@/lib/commerce/live/errors'
export async function GET(r: Request) {
  try {
    return Response.json(
      await availability(new URL(r.url).searchParams.get('id') ?? ''),
    )
  } catch (e) {
    return errorResponse(e)
  }
}
