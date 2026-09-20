import { NextRequest, NextResponse } from 'next/server'
import { wpFetch, wpCookieOptions, wpErrorResponse, WpClientError } from '@/lib/wp-client'
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
        { status: 400 },
      )
    }

    const { data } = await wpFetch('/shams/v1/login', {
      method: 'POST',
      body: { username: identifier, password },
    })

    const { user, token } = data as { user: unknown; token: string }

    const response = NextResponse.json({ success: true, user })
    response.cookies.set('shams-auth-token', token, wpCookieOptions())
    return response
  } catch (error) {
    if (error instanceof WpClientError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    return wpErrorResponse(error, 'auth/login')
  }
}
