import { NextRequest, NextResponse } from 'next/server'

const AUTH_COOKIE = 'shams-auth-token'
const ACCOUNT_PATHS = ['/account/profile', '/account/orders', '/account/addresses']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (ACCOUNT_PATHS.some((p) => pathname.startsWith(p))) {
    const token = request.cookies.get(AUTH_COOKIE)?.value
    if (!token) {
      const loginUrl = new URL('/account/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/account/profile/:path*', '/account/orders/:path*', '/account/addresses/:path*'],
}
