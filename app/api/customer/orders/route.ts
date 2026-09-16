import { NextRequest, NextResponse } from 'next/server'
import { wooConfig } from '@/lib/commerce/woocommerce'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('shams-auth-token')?.value
    if (!token) {
      return NextResponse.json({ orders: [] })
    }

    const config = wooConfig(process.env)
    const wpRoot = config.endpoint
      .replace(/\/wc\/v3$/, '')
      .replace(/([^:]\/)\/+/g, '$1')

    const { searchParams } = new URL(request.url)
    const page = searchParams.get('page') ?? '1'
    const perPage = searchParams.get('per_page') ?? '10'

    const res = await fetch(
      `${wpRoot}/shams/v1/orders?page=${encodeURIComponent(page)}&per_page=${encodeURIComponent(perPage)}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    )

    if (!res.ok) {
      return NextResponse.json({ orders: [] })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('[customer] orders list error', error)
    return NextResponse.json({ orders: [] })
  }
}
