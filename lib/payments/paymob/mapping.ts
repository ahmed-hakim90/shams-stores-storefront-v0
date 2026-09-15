import type { CreateIntentionInput } from '../provider'
import type {
  CreateIntentionRequest,
  PaymentState,
  PaymobServerConfig,
} from './types'

// Woo order totals are decimal pounds; Paymob `amount`/`amount_cents` are
// integer piastres. Round half-up to avoid off-by-one reconciliation failures.
export function toAmountCents(wooTotal: number | string): number {
  const n = typeof wooTotal === 'string' ? Number(wooTotal) : wooTotal
  if (!Number.isFinite(n) || n < 0)
    throw new Error('Invalid order total for payment conversion')
  return Math.round(n * 100)
}

export function buildIntentionRequest(
  input: CreateIntentionInput,
  config: PaymobServerConfig,
): CreateIntentionRequest {
  const sum = input.items.reduce((acc, i) => acc + i.amountCents, 0)
  // Items are informational; the authoritative charge is the Woo order total.
  // If the per-item amounts do not sum to the total (discounts/shipping), send
  // a single aggregate line so Paymob's item-sum validation passes.
  const items =
    input.items.length && sum === input.amountCents
      ? input.items.map((i) => ({
          name: i.name.slice(0, 50) || 'Order item',
          amount: i.amountCents,
          quantity: i.quantity ?? 1,
        }))
      : [{ name: 'Shams order', amount: input.amountCents, quantity: 1 }]
  return {
    amount: input.amountCents,
    currency: input.currency,
    payment_methods: config.integrationIds,
    items,
    billing_data: {
      first_name: input.billing.firstName.slice(0, 50),
      last_name: input.billing.lastName.slice(0, 50),
      email: input.billing.email,
      phone_number: input.billing.phone,
      city: input.billing.city,
      state: input.billing.state,
      street: input.billing.street,
      country: input.billing.country ?? 'EGY',
      postal_code: input.billing.postalCode,
    },
    // Echoes back as merchant_order_id in the callback → maps to our Woo order.
    special_reference: input.orderId,
    expiration: 1800,
    notification_url: config.notificationUrl,
    redirection_url: config.redirectionUrl,
  }
}

// Map a Woo order status + our payment meta to a single client-safe state.
export function derivePaymentState(
  wooStatus: string,
  paymentStatus: string,
): PaymentState {
  if (
    paymentStatus === 'paid' ||
    wooStatus === 'processing' ||
    wooStatus === 'completed'
  )
    return 'paid'
  if (
    paymentStatus === 'failed' ||
    wooStatus === 'failed' ||
    wooStatus === 'cancelled'
  )
    return 'failed'
  if (paymentStatus === 'processing' || wooStatus === 'on-hold')
    return 'processing'
  if (wooStatus === 'pending') return 'pending'
  return 'unknown'
}
