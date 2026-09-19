// Paymob API contracts (Intention API + Transaction Processed Callback).
// Field names are verbatim from Paymob's API; do not rename.

export interface PaymobServerConfig {
  baseUrl: string
  publicKey?: string
  secretKey: string
  hmacSecret: string
  integrationIds: number[]
  notificationUrl: string
  redirectionUrl: string
}

export interface IntentionItem {
  name: string
  amount: number // cents; must sum to the intention `amount`
  description?: string
  quantity?: number
  image?: string
}

export interface IntentionBillingData {
  first_name: string
  last_name: string
  email: string
  phone_number: string
  apartment?: string
  building?: string
  street?: string
  floor?: string
  city?: string
  state?: string
  country?: string
  shipping_method?: string
  postal_code?: string
}

export interface CreateIntentionRequest {
  amount: number // cents
  currency: string
  payment_methods: number[] // integration ids
  items: IntentionItem[]
  billing_data: IntentionBillingData
  special_reference: string // echoed back as merchant_order_id in callbacks
  expiration?: number // seconds
  notification_url?: string
  redirection_url?: string
}

export interface CreateIntentionResponse {
  id: string
  client_secret: string
  pixelMethods?: string[]
  intention_order_id?: number
  status?: string
}

// Only fields safe to hand to the browser. The secret key and HMAC secret
// never leave the server; client_secret + public key are the only client inputs.
export interface PaymentIntentClient {
  orderId: string
  clientSecret: string
  publicKey: string
  method: 'card' | 'installments'
  pixelMethods: string[]
  amountCents: number
  currency: string
}

// Paymob transaction callback: POST { type: "TRANSACTION", obj: {...} } with the
// signature in the `hmac` query parameter.
export interface PaymobTransactionObj {
  id?: number | string
  amount_cents?: number
  created_at?: string
  currency?: string
  error_occured?: boolean
  has_parent_transaction?: boolean
  integration_id?: number | string
  is_3d_secure?: boolean
  is_auth?: boolean
  is_capture?: boolean
  is_refunded?: boolean
  is_standalone_payment?: boolean
  is_voided?: boolean
  order?: { id?: number | string; merchant_order_id?: string } | number | string
  owner?: number | string
  pending?: boolean
  source_data?: { pan?: string; sub_type?: string; type?: string }
  success?: boolean
  merchant_order_id?: string
}

export type PaymentState =
  | 'pending'
  | 'processing'
  | 'paid'
  | 'failed'
  | 'unknown'

// Safe, server-derived order/payment view returned by the status endpoint.
export interface PaymentStatusView {
  orderId: string
  state: PaymentState
  wooStatus: string
  total: number
  currency: string
  provider: string
  method?: string
  transactionId?: string
  paidAt?: string
  reason?: string
  items: { name: string; quantity: number; total: number }[]
  billing: {
    firstName: string
    lastName: string
    phone: string
    city: string
    state: string
    street: string
    postalCode: string
  }
  shipping: {
    firstName: string
    lastName: string
    city: string
    state: string
    street: string
    postalCode: string
  }
}

// Append-only attempt entry persisted in Woo order meta `_paymob_attempts`.
export interface PaymentAttempt {
  id: string
  provider: 'paymob'
  intentionId?: string
  paymobOrderId?: string
  transactionId?: string
  method?: string
  amountCents?: number
  currency?: string
  status: PaymentState
  reason?: string
  createdAt: string
  updatedAt: string
}
