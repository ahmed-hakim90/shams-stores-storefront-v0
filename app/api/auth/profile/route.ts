import { NextRequest, NextResponse } from 'next/server'
import { wpFetch, wpAuth, wpErrorResponse, WpClientError } from '@/lib/wp-client'

export async function PUT(request: NextRequest) {
  const auth = wpAuth(request)
  if ('error' in auth) return auth.error

  try {
    const body = await request.json()
    const { first_name, last_name, phone, email } = body

    if (!first_name && !last_name && !phone && !email) {
      return NextResponse.json(
        { error: 'At least one field is required' },
        { status: 400 },
      )
    }

    const { data } = await wpFetch('/shams/v1/profile', {
      method: 'PUT',
      body,
      token: auth.token,
    })

    return NextResponse.json(data)
  } catch (error) {
    if (error instanceof WpClientError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    return wpErrorResponse(error, 'auth/profile')
  }
}
