import { NextRequest, NextResponse } from 'next/server'
import { wooConfig } from '@/lib/commerce/woocommerce'
import { rateLimit } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? 'anonymous'
  const limit = rateLimit(`register:${ip}`, { limit: 3, windowMs: 60_000 })
  if (!limit.success) {
    return NextResponse.json(
      { error: 'Too many registration attempts. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((limit.retryAfterMs ?? 0) / 1000)) } },
    )
  }

  try {
    const body = await request.json()
    const { name, email, phone, password } = body

    if (!name || !email || !phone || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    const config = wooConfig(process.env)
    const wpRoot = config.endpoint.replace(/\/wc\/v3$/, '').replace(/([^:]\/)\/+/g, '$1')

    const registerRes = await fetch(`${wpRoot}/shams/v1/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone, password }),
    })

    if (!registerRes.ok) {
      const err = await registerRes.json().catch(() => ({}))
      return NextResponse.json(
        { error: err.message || 'Registration failed. Please try again.' },
        { status: registerRes.status }
      )
    }

    const data = await registerRes.json()

    const response = NextResponse.json({
      success: true,
      user: data.user,
    })

    response.cookies.set('shams-auth-token', data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('[auth] register error', error)
    return NextResponse.json(
      { error: 'Registration failed. Please try again.' },
      { status: 500 }
    )
  }
}
