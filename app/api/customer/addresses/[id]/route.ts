import { NextRequest, NextResponse } from 'next/server'
import { wpFetch, wpAuth, wpErrorResponse, WpClientError } from '@/lib/wp-client'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = wpAuth(request)
  if ('error' in auth) return auth.error

  try {
    const { id } = await params
    const body = await request.json()

    const { data } = await wpFetch(`/shams/v1/addresses/${id}`, {
      method: 'PUT',
      body,
      token: auth.token,
    })
    return NextResponse.json(data)
  } catch (error) {
    if (error instanceof WpClientError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    return wpErrorResponse(error, 'customer/addresses/[id]')
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = wpAuth(request)
  if ('error' in auth) return auth.error

  try {
    const { id } = await params

    await wpFetch(`/shams/v1/addresses/${id}`, {
      method: 'DELETE',
      token: auth.token,
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof WpClientError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    return wpErrorResponse(error, 'customer/addresses/[id]')
  }
}
