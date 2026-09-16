import { NextRequest, NextResponse } from 'next/server'
import { wooConfig } from '@/lib/commerce/woocommerce'
import { rateLimit } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? 'anonymous'
  const limit = rateLimit(`login:${ip}`, { limit: 5, windowMs: 60_000 })
  if (!limit.success) {
    return NextResponse.json(
      { error: 'Too many login attempts. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((limit.retryAfterMs ?? 0) / 1000)) } },
    )
  }

  try {
    const body = await request.json()
    const { identifier, password } = body

    if (!identifier || !password) {
      return NextResponse.json(
        { error: 'Email/phone and password are required' },
        { status: 400 }
      )
    }

    const config = wooConfig(process.env)
    const wpRoot = config.endpoint.replace(/\/wc\/v3$/, '').replace(/([^:]\/)\/+/g, '$1')

    const loginRes = await fetch(`${wpRoot}/shams/v1/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: identifier, password }),
    })

    if (!loginRes.ok) {
      const error = await loginRes.json().catch(() => ({}))
      return NextResponse.json(
        { error: error.message || 'Invalid email/phone or password' },
        { status: loginRes.status }
      )
    }

    const data = await loginRes.json()

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
    console.error('[auth] login error', error)
    return NextResponse.json(
      { error: 'Login failed. Please try again.' },
      { status: 500 }
    )
  }
}
