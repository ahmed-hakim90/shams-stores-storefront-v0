import { NextRequest, NextResponse } from 'next/server'
import { wpFetch, wpAuth, wpCookieOptions, wpErrorResponse, validatePassword, WpClientError } from '@/lib/wp-client'
import { AUTH_COOKIE } from '@/lib/constants/config'

export async function POST(request: NextRequest) {
  const auth = wpAuth(request)
  if ('error' in auth) return auth.error

  try {
    const body = await request.json()
    const { current_password, new_password } = body

    if (!current_password || !new_password) {
      return NextResponse.json(
        { error: 'Current and new password are required' },
        { status: 400 },
      )
    }

    const pw = validatePassword(new_password)
    if ('error' in pw) {
      return NextResponse.json({ error: pw.error }, { status: 400 })
    }

    const { data } = await wpFetch('/shams/v1/change-password', {
      method: 'POST',
      body: { current_password, new_password },
      token: auth.token,
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
    return wpErrorResponse(error, 'auth/password')
  }
}
