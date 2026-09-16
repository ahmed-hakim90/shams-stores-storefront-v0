import { NextRequest, NextResponse } from 'next/server'
import { wooConfig } from '@/lib/commerce/woocommerce'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { key, login, password } = body

    if (!key || !login) {
      return NextResponse.json(
        { error: 'Reset key and login are required' },
        { status: 400 },
      )
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 },
      )
    }

    const config = wooConfig(process.env)
    const wpRoot = config.endpoint
      .replace(/\/wc\/v3$/, '')
      .replace(/([^:]\/)\/+/g, '$1')

    const res = await fetch(`${wpRoot}/shams/v1/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, login, password }),
    })

    if (!res.ok) {
      const error = await res.json().catch(() => ({}))
      return NextResponse.json(
        { error: error.message || 'Failed to reset password' },
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
    console.error('[auth] reset-password error', error)
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 },
    )
  }
}
