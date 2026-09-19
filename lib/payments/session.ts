import 'server-only'
import { createHash } from 'node:crypto'
import { cookies } from 'next/headers'
import { request } from '../commerce/live/client'
import { CommerceFault } from '../commerce/live/errors'
import { record, text } from '../commerce/live/normalize'

const digest = (value: string) => createHash('sha256').update(value).digest('hex')
const path = '/wc/v3/shams-headless/payment-sessions'
export async function paymentClaim(snapshot: unknown) {
  const cartToken = (await cookies()).get('shams-cart-token')?.value
  if (!cartToken) throw new CommerceFault('SESSION_EXPIRED', 'Refresh your cart before paying.', 409)
  const key = digest(`checkout:${cartToken}`)
  const fingerprint = digest(JSON.stringify(snapshot))
  const result = record((await request(path, { method: 'POST', private: true, body: { action: 'claim', key, fingerprint } })).data)
  return { key, fingerprint, token: text(result.token), orderId: String(result.order_id ?? ''), claimed: result.claimed === true }
}
export async function completeClaim(claim: { key: string; fingerprint: string; token: string }, orderId: string) {
  await request(path, { method: 'POST', private: true, body: { ...claim, action: 'complete', order_id: orderId } })
}
export async function webhookLock(orderId: string) {
  const key = digest(`webhook:${orderId}`), fingerprint = digest('webhook')
  const result = record((await request(path, { method: 'POST', private: true, body: { action: 'claim', key, fingerprint } })).data)
  const token = text(result.token)
  if (!token) throw new CommerceFault('SERVER_ERROR', 'Payment reconciliation is busy.', 503)
  return async () => { await request(path, { method: 'POST', private: true, body: { action: 'release', key, fingerprint, token } }) }
}
