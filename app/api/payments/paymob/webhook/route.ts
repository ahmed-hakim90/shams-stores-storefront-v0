import { text } from '@/lib/commerce/live/normalize'
import {
  appendPaymentAttempt,
  getWooOrder,
  updateWooOrder,
} from '@/lib/payments/orders'
import {
  createPaymobProvider,
  derivePaymentState,
} from '@/lib/payments/paymob/provider'
import type { PaymentState } from '@/lib/payments/paymob/types'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const ack = (extra: Record<string, unknown> = {}) =>
  Response.json({ received: true, ...extra }, { status: 200 })

// Paymob Transaction Processed Callback. The signature arrives in the `hmac`
// query parameter; the body is { type: "TRANSACTION", obj: {...} }.
// HARD RULE: verify HMAC before touching any order, and reconcile amount /
// currency / order reference / transaction before marking anything paid.
export async function POST(req: Request) {
  const hmac = new URL(req.url).searchParams.get('hmac')
  const rawBody = await req.text()

  const parsed = await createPaymobProvider().parseWebhook({ rawBody, hmac })
  if (!parsed.verified) {
    console.error('[paymob-webhook] HMAC verification failed; ignoring callback')
    return Response.json({ received: false }, { status: 400 })
  }

  const orderId = parsed.merchantOrderId
  if (!/^\d+$/.test(orderId)) {
    console.error('[paymob-webhook] callback missing a valid merchant order id')
    return ack({ applied: false })
  }

  const order = await getWooOrder(orderId)
  if (!order) return ack({ applied: false })

  // Reconciliation — refuse to act if the callback disagrees with Woo.
  const storedPaymobOrder = text(order.meta._paymob_intention_order_id)
  const amountMismatch = parsed.amountCents !== order.amountCents
  const currencyMismatch =
    !!parsed.currency && !!order.currency && parsed.currency !== order.currency
  const referenceMismatch =
    !!storedPaymobOrder &&
    !!parsed.paymobOrderId &&
    storedPaymobOrder !== parsed.paymobOrderId
  if (amountMismatch || currencyMismatch || referenceMismatch) {
    console.error('[paymob-webhook] reconciliation failed', {
      orderId,
      amountMismatch,
      currencyMismatch,
      referenceMismatch,
      callbackAmount: parsed.amountCents,
      orderAmount: order.amountCents,
    })
    return ack({ applied: false, reconciled: false })
  }

  const current = derivePaymentState(order.status, text(order.meta._payment_status))
  const next: PaymentState = parsed.success
    ? 'paid'
    : parsed.pending
      ? 'processing'
      : 'failed'

  // Idempotency: a terminal order, or a repeat of the same transaction, is a
  // no-op so Paymob retries never double-apply or duplicate the ledger.
  const seenTransaction = text(order.meta._paymob_transaction_id)
  if (current === 'paid' || (seenTransaction && seenTransaction === parsed.transactionId && current === next))
    return ack({ applied: false, duplicate: true })

  const now = new Date().toISOString()
  if (next === 'paid') {
    await updateWooOrder(orderId, {
      status: 'processing',
      set_paid: true,
      payment_method: 'paymob',
      payment_method_title: 'Paymob (card)',
      meta_data: [
        { key: '_payment_status', value: 'paid' },
        { key: '_paymob_transaction_id', value: parsed.transactionId },
        { key: '_paymob_order_id', value: parsed.paymobOrderId },
        { key: '_payment_method', value: 'card' },
        { key: '_payment_date', value: now },
      ],
    })
  } else if (next === 'failed') {
    await updateWooOrder(orderId, {
      status: 'failed',
      meta_data: [
        { key: '_payment_status', value: 'failed' },
        { key: '_paymob_transaction_id', value: parsed.transactionId },
        { key: '_paymob_order_id', value: parsed.paymobOrderId },
        {
          key: '_payment_failure_reason',
          value: parsed.reason ?? 'Payment was not completed.',
        },
      ],
    })
  } else {
    // Still pending at the provider — record but leave the Woo order pending.
    await updateWooOrder(orderId, {
      meta_data: [
        { key: '_payment_status', value: 'processing' },
        { key: '_paymob_transaction_id', value: parsed.transactionId },
      ],
    })
  }

  await appendPaymentAttempt(orderId, {
    id: parsed.transactionId || crypto.randomUUID(),
    provider: 'paymob',
    paymobOrderId: parsed.paymobOrderId || undefined,
    transactionId: parsed.transactionId || undefined,
    method: 'card',
    amountCents: parsed.amountCents,
    currency: parsed.currency || order.currency,
    status: next,
    reason: next === 'failed' ? parsed.reason : undefined,
    createdAt: now,
    updatedAt: now,
  })

  return ack({ applied: true, state: next })
}
