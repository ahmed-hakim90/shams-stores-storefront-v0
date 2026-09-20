import 'server-only'
import { wooConfig } from '@/lib/commerce/woocommerce'
import { AUTH_COOKIE } from '@/lib/constants/config'
import type { NextRequest } from 'next/server'

export function wpRoot(): string {
  return wooConfig(process.env)
    .endpoint.replace(/\/wc\/v3$/, '')
    .replace(/([^:]\/)\/+/g, '$1')
}

export async function wpFetch(
  path: string,
  options: {
    method?: string
    body?: unknown
    token?: string
    signal?: AbortSignal
  } = {},
): Promise<{ data: unknown; status: number }> {
  const method = options.method ?? 'GET'
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  }
  if (options.token) headers.Authorization = `Bearer ${options.token}`

  let response: Response
  try {
    response = await fetch(`${wpRoot()}${path}`, {
      method,
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: options.signal
        ? AbortSignal.any([options.signal, AbortSignal.timeout(20000)])
        : AbortSignal.timeout(20000),
      cache: 'no-store',
    })
  } catch (err) {
    throw new WpClientError(
      'NETWORK_ERROR',
      'Could not reach the store service.',
      503,
      err instanceof Error ? err : undefined,
    )
  }

  let data: unknown
  try {
    data = await response.json()
  } catch {
    data = null
  }

  if (!response.ok) {
    const message =
      (data as { message?: string } | null)?.message ??
      `Upstream service returned ${response.status}`
    throw new WpClientError('UPSTREAM_ERROR', message, response.status)
  }

  return { data, status: response.status }
}

export function wpAuth(
  request: NextRequest,
): { token: string } | { error: Response } {
  const token = request.cookies.get(AUTH_COOKIE)?.value
  if (!token) {
    return {
      error: Response.json(
        { error: 'Not authenticated' },
        { status: 401, headers: { 'Cache-Control': 'no-store' } },
      ),
    }
  }
  return { token }
}

export function wpErrorResponse(error: unknown, tag: string): Response {
  const requestId = crypto.randomUUID()
  if (error instanceof WpClientError) {
    console.error(`[${tag}]`, {
      requestId,
      code: error.code,
      status: error.status,
      message: error.message,
    })
    return Response.json(
      { error: error.message, code: error.code, requestId },
      { status: error.status, headers: { 'Cache-Control': 'no-store' } },
    )
  }
  console.error(`[${tag}]`, { requestId, error })
  return Response.json(
    { error: 'An unexpected error occurred.', code: 'UNKNOWN', requestId },
    { status: 500, headers: { 'Cache-Control': 'no-store' } },
  )
}

export function wpCookieOptions(): {
  httpOnly: boolean
  secure: boolean
  sameSite: 'lax'
  maxAge: number
  path: string
} {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  }
}

export function validatePassword(
  password: string,
): { valid: true } | { error: string } {
  if (!password || password.length < 6) {
    return { error: 'Password must be at least 6 characters' }
  }
  return { valid: true }
}

export class WpClientError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number,
    public cause?: Error,
  ) {
    super(message)
  }
}
