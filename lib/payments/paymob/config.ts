import { CommerceFault } from '../../commerce/live/errors'
import type { PaymobServerConfig } from './types'

type Environment = Record<string, string | undefined>

export const PAYMOB_PUBLIC_KEY_ENV = 'NEXT_PUBLIC_PAYMOB_PUBLIC_KEY'

// The merchant public key is the ONLY Paymob value the browser may see; it is
// used by the Pixel SDK alongside a per-intention client_secret.
export function paymobPublicKey(env: Environment = process.env): string {
  return env[PAYMOB_PUBLIC_KEY_ENV] ?? ''
}

function positiveInts(raw: string | undefined): number[] {
  return (raw ?? '')
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean)
    .map(Number)
    .filter((n) => Number.isSafeInteger(n) && n > 0)
}

function httpsUrl(raw: string | undefined, label: string): URL {
  let url: URL
  try {
    url = new URL(raw ?? '')
  } catch {
    throw new CommerceFault('VALIDATION_ERROR', `Invalid ${label}.`, 503)
  }
  if (url.protocol !== 'https:')
    throw new CommerceFault(
      'VALIDATION_ERROR',
      `${label} must use HTTPS.`,
      503,
    )
  return url
}

// True only when every server secret + the client public key + a checkout flag
// are present. Used to decide whether to surface the card option at all.
export function paymobEnabled(env: Environment = process.env): boolean {
  try {
    paymobConfig(env)
    return !!paymobPublicKey(env) && env.COMMERCE_CHECKOUT_ENABLED === 'true'
  } catch {
    return false
  }
}

export function paymobConfig(env: Environment = process.env): PaymobServerConfig {
  const secretKey = env.PAYMOB_SECRET_KEY?.trim()
  const hmacSecret = env.PAYMOB_HMAC_SECRET?.trim()
  if (!secretKey || !hmacSecret)
    throw new CommerceFault('SERVER_ERROR', 'Paymob is not configured.', 503)

  const integrationIds = positiveInts(env.PAYMOB_INTEGRATION_ID)
  if (!integrationIds.length)
    throw new CommerceFault(
      'SERVER_ERROR',
      'Paymob card integration id is not configured.',
      503,
    )

  const base = httpsUrl(
    env.PAYMOB_BASE_URL?.trim() || 'https://accept.paymob.com',
    'Paymob base URL',
  )
  const app = httpsUrl(env.NEXT_PUBLIC_APP_URL, 'NEXT_PUBLIC_APP_URL')

  return {
    baseUrl: base.href.replace(/\/$/, ''),
    secretKey,
    hmacSecret,
    integrationIds,
    notificationUrl: `${app.href.replace(/\/$/, '')}/api/payments/paymob/webhook`,
    redirectionUrl: `${app.href.replace(/\/$/, '')}/order/success`,
  }
}
