import { NextRequest, NextResponse } from 'next/server'
import { wpFetch, wpErrorResponse, WpClientError } from '@/lib/wp-client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('order_id')
    const phone = searchParams.get('phone')

    if (!orderId || !phone) {
      return NextResponse.json(
        { error: 'Order ID and phone are required' },
        { status: 400 },
      )
    }

    const { data } = await wpFetch(
      `/shams/v1/track-order?order_id=${encodeURIComponent(orderId)}&phone=${encodeURIComponent(phone)}`,
    )
    return NextResponse.json(data)
  } catch (error) {
    if (error instanceof WpClientError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    return wpErrorResponse(error, 'customer/track-order')
  }
}
