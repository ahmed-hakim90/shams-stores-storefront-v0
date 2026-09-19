import { NextRequest, NextResponse } from 'next/server'
import { wooConfig } from '@/lib/commerce/woocommerce'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('shams-auth-token')?.value
    if (!token) {
      return NextResponse.json({ product_ids: [] })
    }

    const config = wooConfig(process.env)
    const wpRoot = config.endpoint
      .replace(/\/wc\/v3$/, '')
      .replace(/([^:]\/)\/+/g, '$1')

    const res = await fetch(`${wpRoot}/shams/v1/customer/wishlist`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(15000),
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!res.ok) return NextResponse.json({ error: 'Saved products are temporarily unavailable.' }, { status: res.status === 401 ? 401 : 502 })

    const data = await res.json()
    const productIds = (data.products || []).map((id: number | string) => String(id))
    return NextResponse.json({ product_ids: productIds })
  } catch (error) {
    console.error('[customer] wishlist list error', error)
    return NextResponse.json({ error: 'Saved products are temporarily unavailable.' }, { status: 502 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('shams-auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json()
    const { product_id } = body

    if (!product_id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 },
      )
    }

    const config = wooConfig(process.env)
    const wpRoot = config.endpoint
      .replace(/\/wc\/v3$/, '')
      .replace(/([^:]\/)\/+/g, '$1')

    const res = await fetch(`${wpRoot}/shams/v1/customer/wishlist`, {
      method: 'POST',
      cache: 'no-store',
      signal: AbortSignal.timeout(15000),
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ product_id }),
    })

    if (!res.ok) {
      const error = await res.json().catch(() => ({}))
      return NextResponse.json(
        { error: error.message || 'Failed to add to wishlist' },
        { status: res.status },
      )
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('[customer] wishlist add error', error)
    return NextResponse.json(
      { error: 'Failed to add to wishlist' },
      { status: 500 },
    )
  }
}
