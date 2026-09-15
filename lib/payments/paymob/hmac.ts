import { createHmac, timingSafeEqual } from 'node:crypto'
import type { PaymobTransactionObj } from './types'
import type { ParsedWebhook } from '../provider'

// Paymob signs the transaction callback with HMAC-SHA512 over 20 fields taken
// from `obj`, concatenated in this exact order with NO separator, hex-encoded.
// The signature arrives in the `hmac` query parameter of the notification URL.
// Booleans stringify as "true"/"false"; absent nested values contribute "".
export function callbackMessage(obj: PaymobTransactionObj): string {
  const order =
    obj.order && typeof obj.order === 'object' ? obj.order : { id: obj.order }
  const source = obj.source_data ?? {}
  const parts: unknown[] = [
    obj.amount_cents,
    obj.created_at,
    obj.currency,
    obj.error_occured,
    obj.has_parent_transaction,
    obj.id,
    obj.integration_id,
    obj.is_3d_secure,
    obj.is_auth,
    obj.is_capture,
    obj.is_refunded,
    obj.is_standalone_payment,
    obj.is_voided,
    order.id,
    obj.owner,
    obj.pending,
    source.pan,
    source.sub_type,
    source.type,
    obj.success,
  ]
  return parts.map((v) => (v === undefined || v === null ? '' : String(v))).join('')
}

export function computeCallbackHmac(
  obj: PaymobTransactionObj,
  secret: string,
): string {
  return createHmac('sha512', secret).update(callbackMessage(obj)).digest('hex')
}

export function verifyCallbackHmac(
  obj: PaymobTransactionObj,
  receivedHmac: string | null | undefined,
  secret: string,
): boolean {
  if (!receivedHmac || !secret) return false
  const expected = Buffer.from(computeCallbackHmac(obj, secret), 'utf8')
  const actual = Buffer.from(receivedHmac, 'utf8')
  if (expected.length !== actual.length) return false
  return timingSafeEqual(expected, actual)
}

export function merchantOrderIdFrom(obj: PaymobTransactionObj): string {
  const nested =
    obj.order && typeof obj.order === 'object'
      ? obj.order.merchant_order_id
      : undefined
  return String(obj.merchant_order_id ?? nested ?? '')
}

export function paymobOrderIdFrom(obj: PaymobTransactionObj): string {
  const id =
    obj.order && typeof obj.order === 'object' ? obj.order.id : obj.order
  return id === undefined || id === null ? '' : String(id)
}

// Verify + normalize an inbound callback WITHOUT mutating any order. Returns
// { verified: false } for a malformed body or a failed HMAC check, so callers
// can never accidentally act on an unauthenticated payload.
export function parseTransactionCallback(
  rawBody: string,
  receivedHmac: string | null | undefined,
  secret: string,
): ParsedWebhook {
  let payload: unknown
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return { verified: false }
  }
  const obj =
    payload && typeof payload === 'object'
      ? ((payload as Record<string, unknown>).obj as PaymobTransactionObj)
      : undefined
  if (!obj || typeof obj !== 'object') return { verified: false }
  if (!verifyCallbackHmac(obj, receivedHmac, secret)) return { verified: false }
  return {
    verified: true,
    merchantOrderId: merchantOrderIdFrom(obj),
    paymobOrderId: paymobOrderIdFrom(obj),
    transactionId: obj.id === undefined ? '' : String(obj.id),
    amountCents: Number(obj.amount_cents ?? 0),
    currency: String(obj.currency ?? ''),
    success: obj.success === true,
    pending: obj.pending === true,
    refunded: obj.is_refunded === true,
    reason: obj.error_occured
      ? 'Payment provider reported an error.'
      : undefined,
  }
}
