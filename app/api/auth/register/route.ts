import { NextRequest, NextResponse } from 'next/server'
import { wpFetch, wpCookieOptions, wpErrorResponse, validatePassword, WpClientError } from '@/lib/wp-client'
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
        { status: 400 },
      )
    }

    const pw = validatePassword(password)
    if ('error' in pw) {
      return NextResponse.json({ error: pw.error }, { status: 400 })
    }

    const { data } = await wpFetch('/shams/v1/register', {
      method: 'POST',
      body: { name, email, phone, password },
    })

    const { user, token } = data as { user: unknown; token: string }

    const response = NextResponse.json({ success: true, user })
    response.cookies.set('shams-auth-token', token, wpCookieOptions())
    return response
  } catch (error) {
    if (error instanceof WpClientError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    return wpErrorResponse(error, 'auth/register')
  }
}
