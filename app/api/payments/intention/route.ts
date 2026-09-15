import { assertSameOrigin } from '@/lib/commerce/live/cart'
import { CommerceFault, errorResponse } from '@/lib/commerce/live/errors'
import { record, text } from '@/lib/commerce/live/normalize'
import {
  appendPaymentAttempt,
  ensurePendingOrder,
  setOrderMeta,
} from '@/lib/payments/orders'
import { createPaymobProvider } from '@/lib/payments/paymob/provider'
import type { PaymentIntentClient } from '@/lib/payments/paymob/types'

export const dynamic = 'force-dynamic'

const json = (value: PaymentIntentClient) =>
  Response.json(value, { headers: { 'Cache-Control': 'no-store' } })

// Creates (or reuses) a pending WooCommerce order from the trusted cart, then
// creates a Paymob intention for the Woo-authoritative total. Returns ONLY the
// client_secret + order id — never the secret key, HMAC secret, or order key.
export async function POST(r: Request) {
  try {
    assertSameOrigin(r)
    const body = record(await r.json())
    const order = await ensurePendingOrder({
      address: body.address,
      note: body.note,
    })

    if (order.status !== 'pending')
      throw new CommerceFault(
        'VALIDATION_ERROR',
        'This order is no longer awaiting payment. Please review it before trying again.',
        409,
      )

    // Idempotency: a double-submit / retry reuses the live intention instead of
    // creating a second one. Expiry is kept just under the intention TTL.
    const existingSecret = text(order.meta._paymob_client_secret)
    const expires = Number(order.meta._paymob_intention_expires ?? 0)
    if (existingSecret && Number.isFinite(expires) && expires > Date.now())
      return json({
        orderId: order.orderId,
        clientSecret: existingSecret,
        amountCents: order.amountCents,
        currency: order.currency,
      })

    const intention = await createPaymobProvider().createIntention({
      orderId: order.orderId,
      amountCents: order.amountCents,
      currency: order.currency,
      items: order.items,
      billing: order.billing,
    })

    const now = new Date().toISOString()
    const expiresAt = Date.now() + 25 * 60 * 1000
    await setOrderMeta(order.orderId, [
      { key: '_paymob_intention_id', value: intention.id },
      { key: '_paymob_client_secret', value: intention.client_secret },
      {
        key: '_paymob_intention_order_id',
        value: intention.intention_order_id === undefined ? '' : String(intention.intention_order_id),
      },
      { key: '_paymob_intention_expires', value: String(expiresAt) },
      { key: '_payment_method', value: 'card' },
    ])
    await appendPaymentAttempt(order.orderId, {
      id: intention.id || crypto.randomUUID(),
      provider: 'paymob',
      intentionId: intention.id || undefined,
      paymobOrderId:
        intention.intention_order_id === undefined
          ? undefined
          : String(intention.intention_order_id),
      method: 'card',
      amountCents: order.amountCents,
      currency: order.currency,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    })

    return json({
      orderId: order.orderId,
      clientSecret: intention.client_secret,
      amountCents: order.amountCents,
      currency: order.currency,
    })
  } catch (e) {
    return errorResponse(e)
  }
}
