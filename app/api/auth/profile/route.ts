import { NextRequest, NextResponse } from 'next/server'
import { wooConfig } from '@/lib/commerce/woocommerce'

export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get('shams-auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json()
    const { first_name, last_name, phone, email } = body

    if (!first_name && !last_name && !phone && !email) {
      return NextResponse.json(
        { error: 'At least one field is required' },
        { status: 400 },
      )
    }

    const config = wooConfig(process.env)
    const wpRoot = config.endpoint
      .replace(/\/wc\/v3$/, '')
      .replace(/([^:]\/)\/+/g, '$1')

    const res = await fetch(`${wpRoot}/shams/v1/profile`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const error = await res.json().catch(() => ({}))
      return NextResponse.json(
        { error: error.message || 'Failed to update profile' },
        { status: res.status },
      )
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('[auth] profile update error', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 },
    )
  }
}
