import { NextRequest, NextResponse } from 'next/server'
import { wpFetch, wpAuth, wpErrorResponse, WpClientError } from '@/lib/wp-client'

export async function GET(request: NextRequest) {
  const auth = wpAuth(request)
  if ('error' in auth) return auth.error

  try {
    const { data } = await wpFetch('/shams/v1/addresses', {
      token: auth.token,
    })
    return NextResponse.json(data)
  } catch (error) {
    if (error instanceof WpClientError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    return wpErrorResponse(error, 'customer/addresses')
  }
}

export async function POST(request: NextRequest) {
  const auth = wpAuth(request)
  if ('error' in auth) return auth.error

  try {
    const body = await request.json()

    const { data } = await wpFetch('/shams/v1/addresses', {
      method: 'POST',
      body,
      token: auth.token,
    })
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    if (error instanceof WpClientError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    return wpErrorResponse(error, 'customer/addresses')
  }
}
