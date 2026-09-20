import { NextRequest, NextResponse } from 'next/server'
import { wpFetch, wpAuth, wpErrorResponse, WpClientError } from '@/lib/wp-client'
import { AUTH_COOKIE } from '@/lib/constants/config'

export async function GET(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE)?.value
  if (!token) {
    return NextResponse.json({ product_ids: [] })
  }

  try {
    const { data } = await wpFetch('/shams/v1/customer/wishlist', {
      token,
    })
    const productIds = ((data as { products?: unknown[] })?.products ?? []).map((id) => String(id))
    return NextResponse.json({ product_ids: productIds })
  } catch (error) {
    if (error instanceof WpClientError) {
      return NextResponse.json(
        { error: 'Saved products are temporarily unavailable.' },
        { status: error.status === 401 ? 401 : 502 },
      )
    }
    return wpErrorResponse(error, 'customer/wishlist')
  }
}

export async function POST(request: NextRequest) {
  const auth = wpAuth(request)
  if ('error' in auth) return auth.error

  try {
    const body = await request.json()
    const { product_id } = body

    if (!product_id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 },
      )
    }

    const { data } = await wpFetch('/shams/v1/customer/wishlist', {
      method: 'POST',
      body: { product_id },
      token: auth.token,
    })
    return NextResponse.json(data)
  } catch (error) {
    if (error instanceof WpClientError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    return wpErrorResponse(error, 'customer/wishlist')
  }
}
