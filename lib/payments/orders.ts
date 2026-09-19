import 'server-only'
import { orderMeta } from './order-contract'
import { cookies } from 'next/headers'
import { request } from '../commerce/live/client'
import { addressPayload, getCart } from '../commerce/live/cart'
import { CommerceFault } from '../commerce/live/errors'
import { array, numeric, record, text } from '../commerce/live/normalize'
import { toAmountCents } from './paymob/provider'
import type { PaymentAttempt } from './paymob/types'

const sessionCookie = 'shams-checkout-session'
const orderCookie = 'shams-order'

export interface PendingOrder {
  orderId: string
  orderKey: string
  status: string
  total: number // decimal EGP, authoritative from WooCommerce
  amountCents: number
  currency: string
  email: string
  meta: Record<string, unknown>
  items: { name: string; amountCents: number; quantity: number }[]
  billing: {
    firstName: string
    lastName: string
    email: string
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

function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 86400,
  }
}

async function readMeta(raw: unknown): Promise<Record<string, unknown>> {
  return orderMeta(raw)
}

function normalizeWooOrder(raw: unknown): PendingOrder {
  const r = record(raw)
  const billing = record(r.billing)
  const shipping = record(r.shipping)
  return {
    orderId: String(r.id ?? ''),
    orderKey: text(r.order_key),
    status: text(r.status),
    total: numeric(r.total),
    amountCents: toAmountCents(numeric(r.total)),
    currency: text(r.currency) || 'EGP',
    email: text(billing.email),
    meta: {},
    items: array(r.line_items).map((li) => {
      const l = record(li)
      return {
        name: text(l.name) || 'Order item',
        amountCents: toAmountCents(numeric(l.total)),
        quantity: numeric(l.quantity, 1),
      }
    }),
    billing: {
      firstName: text(billing.first_name),
      lastName: text(billing.last_name),
      email: text(billing.email),
      phone: text(billing.phone),
      city: text(billing.city),
      state: text(billing.state),
      street: text(billing.address_1),
      postalCode: text(billing.postcode),
    },
    shipping: {
      firstName: text(shipping.first_name),
      lastName: text(shipping.last_name),
      city: text(shipping.city),
      state: text(shipping.state),
      street: text(shipping.address_1),
      postalCode: text(shipping.postcode),
    },
  }
}

// Read an order straight from WooCommerce v3 (server truth). Never trust a
// total/status that originated in the browser.
export async function getWooOrder(id: string): Promise<PendingOrder | null> {
  if (!/^\d+$/.test(id)) return null
  let data: unknown
  try {
    data = (await request(`/wc/v3/orders/${id}`, { private: true })).data
  } catch (e) {
    if (e instanceof CommerceFault && e.code === 'NOT_FOUND') return null
    throw e
  }
  const order = normalizeWooOrder(data)
  order.meta = await readMeta(record(data).meta_data)
  return order
}

export async function updateWooOrder(
  id: string,
  patch: Record<string, unknown>,
): Promise<void> {
  if (!/^\d+$/.test(id))
    throw new CommerceFault('VALIDATION_ERROR', 'Invalid order reference.', 400)
  await request(`/wc/v3/orders/${id}`, {
    method: 'PUT',
    private: true,
    body: patch,
  })
}

// Create a pending WooCommerce order from the trusted server-side guest cart.
// Line items, coupons and the selected shipping rate come from the cart, and
// WooCommerce recomputes totals from its own catalog prices — the browser never
// supplies a price. Returns the authoritative order.
export async function createPendingOrder(input: {
  address: unknown
  note?: unknown
  cart?: Awaited<ReturnType<typeof getCart>>
}): Promise<PendingOrder> {
  const address = addressPayload(input.address)
  if (
    !address.first_name ||
    !address.phone ||
    !address.state ||
    !address.city ||
    !address.address_1
  )
    throw new CommerceFault(
      'VALIDATION_ERROR',
      'Complete your contact and delivery details.',
      400,
    )

  const cart = input.cart ?? await getCart()
  if (!cart.lines.length)
    throw new CommerceFault('VALIDATION_ERROR', 'Your cart is empty.', 400)
  if (cart.needsShipping && !cart.rates.some((r) => r.selected))
    throw new CommerceFault(
      'VALIDATION_ERROR',
      'Choose a delivery method before paying.',
      400,
    )

  if (cart.errors.length) throw new CommerceFault('VALIDATION_ERROR', 'Review the errors in your cart before paying.', 400)
  const selectedRates = cart.rates.filter((r) => r.selected)
  const body: Record<string, unknown> = {
    payment_method: 'paymob',
    payment_method_title: 'Paymob',
    status: 'pending',
    set_paid: false,
    currency: 'EGP',
    billing: address,
    shipping: address,
    customer_note: text(input.note).slice(0, 500),
    line_items: await Promise.all(cart.lines.map(async (l) => {
      const product = record((await request(`/wc/store/v1/products/${l.productId}`)).data)
      const isVariation = product.type === 'variation'
      const parentId = numeric(product.parent)
      if (isVariation && !parentId) throw new CommerceFault('VALIDATION_ERROR', 'Review this product option before paying.', 400)
      return { product_id: isVariation ? parentId : numeric(l.productId), ...(isVariation ? { variation_id: numeric(l.productId) } : {}), quantity: l.quantity }
    })),
    meta_data: [
      { key: 'payment_provider', value: 'paymob' },
      { key: '_payment_status', value: 'pending' },
      { key: '_shams_checkout', value: 'headless' },
    ],
  }
  if (cart.coupons.length)
    body.coupon_lines = cart.coupons.map((code) => ({ code }))
  if (cart.needsShipping)
    body.shipping_lines = selectedRates.map(rate => ({
      method_id: rate.id.split(':')[0],
      // Woo REST order schema requires a string, unlike Store API rate IDs.
      instance_id: rate.id.split(':')[1] || '0',
      method_title: rate.name,
      total: rate.price.toFixed(2),
    }))

  const created = record(
    (
      await request('/wc/v3/orders', {
        method: 'POST',
        private: true,
        body,
      })
    ).data,
  )
  const id = String(created.id ?? '')
  const orderKey = text(created.order_key)
  if (!/^\d+$/.test(id) || !orderKey)
    throw new CommerceFault(
      'SERVER_ERROR',
      'We could not create your order. Please check before trying again.',
      502,
    )

  const jar = await cookies()
  // Ownership proof: the browser never receives the order key directly.
  jar.set(
    orderCookie,
    JSON.stringify({ id, key: orderKey, email: address.email }),
    cookieOptions(),
  )
  jar.set(sessionCookie, id, cookieOptions())

  const order = normalizeWooOrder(created)
  order.meta = await readMeta(record(created).meta_data)
  if (!order.orderId || !order.orderKey)
    throw new CommerceFault(
      'SERVER_ERROR',
      'We could not confirm your order. Please check before trying again.',
      502,
    )
  return order
}

export async function readOwnershipCookie(): Promise<{
  id: string
  key: string
  email: string
} | null> {
  const value = (await cookies()).get(orderCookie)?.value
  if (!value) return null
  try {
    const parsed = JSON.parse(value)
    if (
      !/^\d+$/.test(String(parsed.id)) ||
      typeof parsed.key !== 'string' ||
      !parsed.key ||
      typeof parsed.email !== 'string'
    )
      return null
    return { id: String(parsed.id), key: parsed.key, email: parsed.email }
  } catch {
    return null
  }
}

export { readMeta }

// Write/overwrite arbitrary Woo order meta (used for Paymob identifiers).
export async function setOrderMeta(
  orderId: string,
  entries: { key: string; value: unknown }[],
): Promise<void> {
  await updateWooOrder(orderId, { meta_data: entries })
}

// Append-only payment attempt ledger stored in Woo order meta `_paymob_attempts`.
export async function appendPaymentAttempt(
  orderId: string,
  attempt: PaymentAttempt,
): Promise<void> {
  const order = await getWooOrder(orderId)
  const existing = order ? array(order.meta._paymob_attempts) : []
  const attempts = [...existing.map((a) => record(a)), attempt]
  await updateWooOrder(orderId, {
    meta_data: [{ key: '_paymob_attempts', value: attempts }],
  })
}


export async function rememberOrder(order: PendingOrder) {
  const jar = await cookies()
  jar.set(orderCookie, JSON.stringify({ id: order.orderId, key: order.orderKey, email: order.email }), cookieOptions())
  jar.set(sessionCookie, order.orderId, cookieOptions())
}
