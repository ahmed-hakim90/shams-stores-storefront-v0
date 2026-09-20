import { NextRequest, NextResponse } from 'next/server'
import { wpFetch, wpErrorResponse, WpClientError } from '@/lib/wp-client'
import { AUTH_COOKIE } from '@/lib/constants/config'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(AUTH_COOKIE)?.value
    if (!token) {
      return NextResponse.json({ user: null })
    }

    const { data } = await wpFetch('/shams/v1/me', { token })
    return NextResponse.json(data)
  } catch (error) {
    if (error instanceof WpClientError) {
      const response = NextResponse.json({ user: null })
      response.cookies.set(AUTH_COOKIE, '', { maxAge: 0, path: '/' })
      return response
    }
    return wpErrorResponse(error, 'auth/me')
  }
}

export async function DELETE(request: NextRequest) {
  const response = NextResponse.json({ success: true })
  response.cookies.set(AUTH_COOKIE, '', { maxAge: 0, path: '/' })
  return response
}
