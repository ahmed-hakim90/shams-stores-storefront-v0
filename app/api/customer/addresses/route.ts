import { NextRequest, NextResponse } from 'next/server'
import { wooConfig } from '@/lib/commerce/woocommerce'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('shams-auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const config = wooConfig(process.env)
    const wpRoot = config.endpoint
      .replace(/\/wc\/v3$/, '')
      .replace(/([^:]\/)\/+/g, '$1')

    const res = await fetch(`${wpRoot}/shams/v1/addresses`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!res.ok) {
      const error = await res.json().catch(() => ({}))
      return NextResponse.json(
        { error: error.message || 'Failed to fetch addresses' },
        { status: res.status },
      )
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('[customer] addresses list error', error)
    return NextResponse.json(
      { error: 'Failed to fetch addresses' },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('shams-auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json()

    const config = wooConfig(process.env)
    const wpRoot = config.endpoint
      .replace(/\/wc\/v3$/, '')
      .replace(/([^:]\/)\/+/g, '$1')

    const res = await fetch(`${wpRoot}/shams/v1/addresses`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const error = await res.json().catch(() => ({}))
      return NextResponse.json(
        { error: error.message || 'Failed to add address' },
        { status: res.status },
      )
    }

    const data = await res.json()
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('[customer] addresses create error', error)
    return NextResponse.json(
      { error: 'Failed to add address' },
      { status: 500 },
    )
  }
}
