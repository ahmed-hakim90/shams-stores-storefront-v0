import { NextRequest, NextResponse } from 'next/server'
import { wooConfig } from '@/lib/commerce/woocommerce'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('shams-auth-token')?.value
    if (!token) {
      return NextResponse.json({ user: null })
    }

    const config = wooConfig(process.env)
    const wpRoot = config.endpoint.replace(/\/wc\/v3$/, '').replace(/([^:]\/)\/+/g, '$1')

    const userRes = await fetch(`${wpRoot}/shams/v1/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!userRes.ok) {
      const response = NextResponse.json({ user: null })
      response.cookies.set('shams-auth-token', '', { maxAge: 0, path: '/' })
      return response
    }

    const data = await userRes.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('[auth] me error', error)
    return NextResponse.json({ user: null })
  }
}

export async function DELETE(request: NextRequest) {
  const response = NextResponse.json({ success: true })
  response.cookies.set('shams-auth-token', '', { maxAge: 0, path: '/' })
  return response
}
