import type {
  CreateIntentionResponse,
  PaymentStatusView,
} from './paymob/types'

// Provider-agnostic payment contract (Phase 14 of the blueprint). Paymob is the
// only implementation today; Geidea/Valu/COD can be added without rebuilding
// checkout. Keep this surface small and server-only.
export interface PaymentProvider {
  readonly id: string
  // Create a payment intention for an already-priced, pending commerce order.
  createIntention(input: CreateIntentionInput): Promise<CreateIntentionResponse>
  // Verify + normalize an inbound webhook WITHOUT mutating any order.
  parseWebhook(input: ParseWebhookInput): Promise<ParsedWebhook>
  // Refunds are designed but deferred to a later release.
  refund(input: RefundInput): Promise<never>
}

export interface CreateIntentionInput {
  orderId: string
  amountCents: number
  currency: string
  items: { name: string; amountCents: number; quantity?: number }[]
  billing: {
    firstName: string
    lastName: string
    email: string
    phone: string
    city?: string
    state?: string
    street?: string
    country?: string
    postalCode?: string
  }
}

export interface ParseWebhookInput {
  rawBody: string
  hmac: string | null | undefined
}

export type ParsedWebhook =
  | {
      verified: true
      merchantOrderId: string
      paymobOrderId: string
      transactionId: string
      amountCents: number
      currency: string
      success: boolean
      pending: boolean
      refunded: boolean
      voided: boolean
      authorized: boolean
      captured: boolean
      integrationId: number
      reason?: string
    }
  | { verified: false }

export interface RefundInput {
  orderId: string
  transactionId: string
  amountCents?: number
}

export type { PaymentStatusView }
