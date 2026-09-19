import type { ParsedWebhook } from '../provider'
import type { PaymentState } from './types'

export function reconcilePayment(event: Extract<ParsedWebhook, { verified: true }>, order: {
  amountCents: number; currency: string; meta: Record<string, unknown>
}): { action: 'ignore' } | { action: 'retry' } | { action: 'apply'; state: PaymentState } {
  if (!event.transactionId || event.refunded || event.voided) return { action: 'ignore' }
  // A callback can beat the intention metadata write; ask Paymob to retry.
  if (!order.meta._paymob_intention_order_id || !Array.isArray(order.meta._paymob_integration_ids)) return { action: 'retry' }
  if (order.meta.payment_provider !== 'paymob' || order.meta._shams_checkout !== 'headless' ||
      !Number.isSafeInteger(event.amountCents) || event.amountCents <= 0 || event.amountCents !== order.amountCents ||
      event.currency !== order.currency || String(order.meta._paymob_intention_order_id) !== event.paymobOrderId ||
      !order.meta._paymob_integration_ids.includes(event.integrationId)) return { action: 'ignore' }
  return { action: 'apply', state: event.pending || (event.authorized && !event.captured) ? 'processing' : event.success ? 'paid' : 'failed' }
}
