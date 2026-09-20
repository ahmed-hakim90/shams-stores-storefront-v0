import { NextRequest, NextResponse } from 'next/server'
import { wpFetch, wpErrorResponse, WpClientError } from '@/lib/wp-client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 },
      )
    }

    const { data } = await wpFetch('/shams/v1/forgot-password', {
      method: 'POST',
      body: { email },
    })

    return NextResponse.json(data)
  } catch (error) {
    if (error instanceof WpClientError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    return wpErrorResponse(error, 'auth/forgot-password')
  }
}
