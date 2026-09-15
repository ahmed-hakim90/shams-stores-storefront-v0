import { CommerceFault } from '../../commerce/live/errors'
import type {
  CreateIntentionRequest,
  CreateIntentionResponse,
  PaymobServerConfig,
} from './types'

// Mirrors createWooClient: a dependency-injected fetcher keeps this testable
// without network access, and secrets only ever live in request headers.
export function createPaymobClient(
  config: PaymobServerConfig,
  fetcher: typeof fetch = fetch,
) {
  async function post<T>(path: string, body: unknown): Promise<T> {
    let response: Response
    try {
      response = await fetcher(`${config.baseUrl}${path}`, {
        method: 'POST',
        headers: {
          Authorization: `Token ${config.secretKey}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(20000),
        redirect: 'error',
        cache: 'no-store',
      })
    } catch {
      throw new CommerceFault(
        'NETWORK_ERROR',
        'We could not reach the payment provider. Please try again.',
        503,
      )
    }
    let data: unknown
    try {
      data = await response.json()
    } catch {
      data = undefined
    }
    if (!response.ok) {
      const detail =
        data && typeof data === 'object'
          ? JSON.stringify((data as Record<string, unknown>).message ?? '')
          : ''
      throw new CommerceFault(
        'PAYMENT_FAILED',
        detail
          ? 'The payment provider rejected this request. Please try again.'
          : 'The payment provider could not complete this request.',
        response.status === 429 ? 429 : 502,
      )
    }
    return data as T
  }

  return {
    async createIntention(
      req: CreateIntentionRequest,
    ): Promise<CreateIntentionResponse> {
      const data = await post<Record<string, unknown>>('/v1/intention/', req)
      const clientSecret = data?.client_secret
      if (typeof clientSecret !== 'string' || !clientSecret)
        throw new CommerceFault(
          'SERVER_ERROR',
          'The payment provider returned an incomplete response.',
          502,
        )
      return {
        id: typeof data.id === 'string' ? data.id : '',
        client_secret: clientSecret,
        intention_order_id:
          typeof data.intention_order_id === 'number'
            ? data.intention_order_id
            : undefined,
        status: typeof data.status === 'string' ? data.status : undefined,
      }
    },
  }
}
