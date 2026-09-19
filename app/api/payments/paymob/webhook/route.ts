import { array, record, text } from '@/lib/commerce/live/normalize'
import { getWooOrder, updateWooOrder } from '@/lib/payments/orders'
import { parseTransactionCallback } from '@/lib/payments/paymob/hmac'
import { reconcilePayment } from '@/lib/payments/paymob/reconcile'
import { webhookLock } from '@/lib/payments/session'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 180
const ack = () => Response.json({ received: true }, { headers: { 'Cache-Control': 'no-store' } })
export async function POST(req: Request) {
  let release: (() => Promise<void>) | undefined
  try {
    // Existing payments keep receiving callbacks even if new checkout is disabled.
    const secret = process.env.PAYMOB_HMAC_SECRET?.trim()
    if (!secret) return new Response(null, { status: 503 })
    const parsed = parseTransactionCallback(await req.text(), new URL(req.url).searchParams.get('hmac'), secret)
    if (!parsed.verified) return new Response(null, { status: 400 })
    if (!/^[1-9][0-9]*$/.test(parsed.merchantOrderId)) return ack()
    release = await webhookLock(parsed.merchantOrderId)
    const order = await getWooOrder(parsed.merchantOrderId)
    if (!order) return ack()
    const decision = reconcilePayment(parsed, order)
    if (decision.action === 'retry') return new Response(null, { status: 503 })
    if (decision.action === 'ignore') return ack()
    const next = decision.state
    const current = text(order.meta._payment_status)
    // Never revive manually cancelled/refunded orders or regress a settled payment.
    if (['cancelled', 'refunded', 'completed'].includes(order.status) || current === 'paid' ||
        (text(order.meta._paymob_transaction_id) === parsed.transactionId && current === next) ||
        (current === 'failed' && next === 'processing')) return ack()
    const now = new Date().toISOString()
    const method = text(order.meta._shams_payment_method) === 'installments' ? 'installments' : 'card'
    const attempts = array(order.meta._paymob_attempts).map(record)
    await updateWooOrder(order.orderId, {
      ...(next === 'paid' ? { status: 'processing', set_paid: true, transaction_id: parsed.transactionId, payment_method_title: method === 'installments' ? 'Paymob — Bank installments' : 'Paymob — Card' } : next === 'failed' ? { status: 'failed' } : {}),
      meta_data: [
        { key: '_payment_status', value: next },
        { key: '_paymob_transaction_id', value: parsed.transactionId },
        { key: '_paymob_order_id', value: parsed.paymobOrderId },
        ...(next === 'paid' ? [{ key: '_payment_date', value: now }] : []),
        { key: '_payment_failure_reason', value: next === 'failed' ? 'Payment was not completed. Check with your bank or Shams before retrying.' : '' },
        { key: '_paymob_attempts', value: [...attempts, { id: parsed.transactionId, provider: 'paymob', transactionId: parsed.transactionId, method, status: next, amountCents: parsed.amountCents, currency: parsed.currency, createdAt: now, updatedAt: now }] },
      ],
    })
    return ack()
  } catch {
    // No request bodies, customer details, secrets or gateway URLs in logs.
    console.error('[paymob-webhook] reconciliation unavailable; retry required')
    return new Response(null, { status: 503 })
  } finally {
    if (release) { try { await release() } catch { console.error('[paymob-webhook] payment lock needs operational review') } }
  }
}
