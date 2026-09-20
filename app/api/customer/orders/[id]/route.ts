import { NextRequest, NextResponse } from 'next/server'
import { wpFetch, wpAuth, wpErrorResponse, WpClientError } from '@/lib/wp-client'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = wpAuth(request)
  if ('error' in auth) return auth.error

  try {
    const { id } = await params

    const { data } = await wpFetch(`/shams/v1/orders/${id}`, {
      token: auth.token,
    })
    return NextResponse.json(data)
  } catch (error) {
    if (error instanceof WpClientError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    return wpErrorResponse(error, 'customer/orders/[id]')
  }
}
