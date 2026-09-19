import 'server-only'
import { wooConfig } from '../woocommerce'
import { CommerceFault } from './errors'

export function apiRoot() {
  return wooConfig(process.env)
    .endpoint.replace(/\/wc\/v3$/, '')
    .replace(/([^:]\/)\/+/g, '$1')
}
export async function request(
  path: string,
  options: {
    method?: string
    body?: unknown
    token?: string
    private?: boolean
    ttl?: number
    signal?: AbortSignal
  } = {},
) {
  const method = options.method ?? 'GET',
    headers: Record<string, string> = { Accept: 'application/json' }
  if (options.private)
    headers.Authorization = wooConfig(process.env).authorization
  if (options.token) headers['Cart-Token'] = options.token
  if (options.body !== undefined) headers['Content-Type'] = 'application/json'
  let response: Response
  try {
    response = await fetch(`${apiRoot()}${path}`, {
      method,
      headers,
      body:
        options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: options.signal
        ? AbortSignal.any([options.signal, AbortSignal.timeout(20000)])
        : AbortSignal.timeout(20000),
      redirect: 'error',
      ...(method === 'GET' && options.ttl && !options.token
        ? { next: { revalidate: options.ttl, tags: ['commerce-catalog'] } }
        : { cache: 'no-store' as const }),
    })
  } catch {
    throw new CommerceFault(
      'NETWORK_ERROR',
      'We could not reach the store. Please try again.',
      503,
    )
  }
  if (!response.ok) {
    let code = ''
    let message = ''
    try {
      const body = await response.json()
      code = body.code ?? ''
      message = body.message ?? ''
    } catch {}
    const status = response.status
    const paymentReview = ['payment_session_changed', 'payment_order_conflict'].includes(code)
    const sessionBusy = code === 'payment_session_busy'
    const kind = paymentReview ? 'PAYMENT_REVIEW_REQUIRED' : sessionBusy ? 'PAYMENT_SESSION_BUSY' : /cart.*token|token.*cart/.test(code)
      ? 'SESSION_EXPIRED'
      : status === 429
        ? 'RATE_LIMITED'
        : status === 401 || status === 403
          ? 'UNAUTHORIZED'
          : status === 404
            ? 'NOT_FOUND'
            : /stock/.test(code)
              ? 'OUT_OF_STOCK'
              : status === 400
                ? 'VALIDATION_ERROR'
                : 'SERVER_ERROR'
    throw new CommerceFault(
      kind,
      message || (
        kind === 'OUT_OF_STOCK'
          ? 'This quantity is no longer available. Please review your cart.'
          : kind === 'VALIDATION_ERROR'
            ? 'Please check your selection and try again.'
            : kind === 'UNAUTHORIZED'
              ? 'Your session could not be verified. Please refresh and try again.'
              : 'The store could not complete this request. Please try again.'
      ),
      paymentReview || sessionBusy ? 409 : status === 404 ? 404 : status === 400 ? 400 : status === 429 ? 429 : 502,
    )
  }
  let data: unknown
  try {
    data = await response.json()
  } catch {
    throw new CommerceFault(
      'SERVER_ERROR',
      'The store returned an incomplete response.',
    )
  }
  return { data, headers: response.headers }
}
