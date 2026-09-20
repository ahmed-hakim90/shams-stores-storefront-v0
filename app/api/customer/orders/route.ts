import { NextRequest, NextResponse } from 'next/server'
import { wpFetch, wpErrorResponse, WpClientError } from '@/lib/wp-client'
import { AUTH_COOKIE } from '@/lib/constants/config'

export async function GET(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE)?.value
  if (!token) {
    return NextResponse.json({ orders: [] })
  }

  try {
    const { searchParams } = new URL(request.url)
    const page = searchParams.get('page') ?? '1'
    const perPage = searchParams.get('per_page') ?? '10'

    const { data } = await wpFetch(
      `/shams/v1/orders?page=${encodeURIComponent(page)}&per_page=${encodeURIComponent(perPage)}`,
      { token },
    )
    return NextResponse.json(data)
  } catch (error) {
    if (error instanceof WpClientError) {
      return NextResponse.json({ orders: [] })
    }
    return wpErrorResponse(error, 'customer/orders')
  }
}
