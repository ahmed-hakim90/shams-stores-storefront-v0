import { NextRequest, NextResponse } from 'next/server'
import { wooConfig } from '@/lib/commerce/woocommerce'

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('shams-auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json()
    const { current_password, new_password } = body

    if (!current_password || !new_password) {
      return NextResponse.json(
        { error: 'Current and new password are required' },
        { status: 400 },
      )
    }

    if (new_password.length < 6) {
      return NextResponse.json(
        { error: 'New password must be at least 6 characters' },
        { status: 400 },
      )
    }

    const config = wooConfig(process.env)
    const wpRoot = config.endpoint
      .replace(/\/wc\/v3$/, '')
      .replace(/([^:]\/)\/+/g, '$1')

    const res = await fetch(`${wpRoot}/shams/v1/change-password`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ current_password, new_password }),
    })

    if (!res.ok) {
      const error = await res.json().catch(() => ({}))
      return NextResponse.json(
        { error: error.message || 'Failed to change password' },
        { status: res.status },
      )
    }

    const data = await res.json()

    const response = NextResponse.json({ success: true })
    if (data.token) {
      response.cookies.set('shams-auth-token', data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      })
    }
    return response
  } catch (error) {
    console.error('[auth] password change error', error)
    return NextResponse.json(
      { error: 'Failed to change password' },
      { status: 500 },
    )
  }
}
