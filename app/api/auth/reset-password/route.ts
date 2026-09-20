import { NextRequest, NextResponse } from 'next/server'
import { wpFetch, wpCookieOptions, wpErrorResponse, validatePassword, WpClientError } from '@/lib/wp-client'
import { AUTH_COOKIE } from '@/lib/constants/config'

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

    const pw = validatePassword(password)
    if ('error' in pw) {
      return NextResponse.json({ error: pw.error }, { status: 400 })
    }

    const { data } = await wpFetch('/shams/v1/reset-password', {
      method: 'POST',
      body: { key, login, password },
    })

    const response = NextResponse.json({ success: true })
    const token = (data as { token?: string })?.token
    if (token) {
      response.cookies.set(AUTH_COOKIE, token, wpCookieOptions())
    }
    return response
  } catch (error) {
    if (error instanceof WpClientError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    return wpErrorResponse(error, 'auth/reset-password')
  }
}
