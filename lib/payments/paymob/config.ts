import { CommerceFault } from '../../commerce/live/errors'
import { integrationIds } from './methods'
import type { PaymobServerConfig } from './types'

type Environment = Record<string, string | undefined>
export const PAYMOB_PUBLIC_KEY_ENV = 'NEXT_PUBLIC_PAYMOB_PUBLIC_KEY'
export function paymobPublicKey(env: Environment = process.env): string {
  return (env.PAYMOB_PUBLIC_KEY || env[PAYMOB_PUBLIC_KEY_ENV] || '').trim()
}

function origin(raw: string | undefined, label: string): string {
  try {
    const url = new URL(raw ?? '')
    if (url.protocol === 'https:' && !url.username && !url.password && !url.search && !url.hash && url.pathname === '/') return url.origin
  } catch {}
  throw new CommerceFault('SERVER_ERROR', `${label} must be an HTTPS origin without a path.`, 503)
}

export function paymobEnabled(env: Environment = process.env): boolean {
  try {
    paymobConfig(env, [])
    return env.COMMERCE_PROVIDER === 'woocommerce' && env.COMMERCE_CHECKOUT_ENABLED === 'true' && env.PAYMOB_ENABLED === 'true'
  } catch { return false }
}

export function paymobConfig(env: Environment = process.env, selectedIds?: number[]): PaymobServerConfig {
  const secretKey = env.PAYMOB_SECRET_KEY?.trim()
  const hmacSecret = env.PAYMOB_HMAC_SECRET?.trim()
  const publicKey = paymobPublicKey(env)
  if (!secretKey || !hmacSecret || !publicKey)
    throw new CommerceFault('SERVER_ERROR', 'Paymob is not configured.', 503)
  const keyMode = /(?:^|_)(test|live)_/.exec(secretKey)?.[1]
  const publicMode = /(?:^|_)(test|live)_/.exec(publicKey)?.[1]
  if (!keyMode || keyMode !== publicMode)
    throw new CommerceFault('SERVER_ERROR', 'Paymob public and secret keys must use the same test/live mode.', 503)
  if (env.VERCEL_ENV === 'preview' && keyMode !== 'test')
    throw new CommerceFault('SERVER_ERROR', 'Preview deployments require Paymob test keys.', 503)
  const baseUrl = origin(env.PAYMOB_BASE_URL || 'https://accept.paymob.com', 'PAYMOB_BASE_URL')
  if (baseUrl !== 'https://accept.paymob.com')
    throw new CommerceFault('SERVER_ERROR', 'This EGP checkout requires the Egypt Paymob endpoint.', 503)
  const app = origin(env.NEXT_PUBLIC_APP_URL, 'NEXT_PUBLIC_APP_URL')
  return {
    baseUrl, secretKey, hmacSecret, publicKey,
    integrationIds: selectedIds ?? integrationIds(env.PAYMOB_INTEGRATION_ID),
    notificationUrl: `${app}/api/payments/paymob/webhook`,
    redirectionUrl: `${app}/order/success`,
  }
}
