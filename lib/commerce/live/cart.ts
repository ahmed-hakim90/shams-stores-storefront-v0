import 'server-only'
import { cookies } from 'next/headers'
import { request } from './client'
import { mapCart, mapSummary, record, text, array, numeric } from './normalize'
import { CommerceFault } from './errors'
import type { Address, CheckoutResult } from '../types'
const cookieName = 'shams-cart-token'
export function assertSameOrigin(r: Request) {
  const origin = r.headers.get('origin')
  if (!origin || origin !== new URL(r.url).origin)
    throw new CommerceFault(
      'UNAUTHORIZED',
      'Please refresh this page before continuing.',
      403,
    )
}
export async function cartRequest(path = '/cart', body?: unknown) {
  const jar = await cookies()
  let token = jar.get(cookieName)?.value
  if (!token) {
    const init = await request('/wc/store/v1/cart')
    token = init.headers.get('cart-token') ?? undefined
    if (!token)
      throw new CommerceFault(
        'SESSION_EXPIRED',
        'We could not start your cart. Please try again.',
        503,
      )
    jar.set(cookieName, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 172800,
    })
    if (path === '/cart' && body === undefined) return init.data
  }
  let r
  try {
    r = await request(`/wc/store/v1${path}`, {
      method: body === undefined ? 'GET' : 'POST',
      token,
      body,
    })
  } catch (error) {
    if (error instanceof CommerceFault && error.code === 'SESSION_EXPIRED') {
      jar.delete(cookieName)
      throw new CommerceFault(
        'SESSION_EXPIRED',
        'Your cart session has expired. Please refresh and review your cart.',
        401,
      )
    }
    throw error
  }
  const rotated = r.headers.get('cart-token')
  if (rotated)
    jar.set(cookieName, rotated, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 172800,
    })
  return r.data
}
export async function getCart() {
  return mapCart(await cartRequest())
}
export function addressPayload(v: unknown) {
  const a = record(v)
  const str = (key: string, max = 180) => text(a[key]).slice(0, max)
  return {
    first_name: str('firstName'),
    last_name: str('lastName'),
    email: str('email'),
    phone: str('phone', 30),
    country: 'EG',
    state: str('state', 12),
    city: str('city'),
    address_1: str('address1'),
    address_2: str('address2'),
    postcode: str('postcode', 20),
  }
}
export async function mutateCart(input: unknown) {
  const b = record(input),
    action = text(b.action)
  let path: string, payload: unknown
  if (action === 'add') {
    const id = numeric(b.variationId ?? b.productId),
      quantity = numeric(b.quantity)
    if (
      !Number.isSafeInteger(id) ||
      id < 1 ||
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > 99
    )
      throw new CommerceFault(
        'VALIDATION_ERROR',
        'Choose a valid product and quantity.',
        400,
      )
    const product = mapSummary(
      (await request(`/wc/store/v1/products/${id}`)).data,
    )
    if (!product.purchasable || product.stock === 'out_of_stock')
      throw new CommerceFault(
        'VALIDATION_ERROR',
        'This product cannot be ordered online in its current configuration.',
        400,
      )
    path = '/cart/add-item'
    payload = {
      id,
      quantity,
      variation: array(b.options).map((v) => ({
        attribute: text(record(v).attribute),
        value: text(record(v).value),
      })),
    }
  } else if (action === 'update' || action === 'remove') {
    const key = text(b.key)
    if (!/^[a-f0-9]{32}$/.test(key))
      throw new CommerceFault('VALIDATION_ERROR', 'Select a cart item.', 400)
    path = action === 'update' ? '/cart/update-item' : '/cart/remove-item'
    const quantity = numeric(b.quantity)
    if (
      action === 'update' &&
      (!Number.isInteger(quantity) || quantity < 1 || quantity > 99)
    )
      throw new CommerceFault('VALIDATION_ERROR', 'Check the quantity.', 400)
    payload = { key, ...(action === 'update' ? { quantity } : {}) }
  } else if (action === 'coupon' || action === 'remove-coupon') {
    path = action === 'coupon' ? '/cart/apply-coupon' : '/cart/remove-coupon'
    payload = { code: text(b.code).slice(0, 100) }
  } else if (action === 'address') {
    path = '/cart/update-customer'
    const address = addressPayload(b.address)
    payload = { billing_address: address, shipping_address: address }
  } else if (action === 'shipping') {
    path = '/cart/select-shipping-rate'
    payload = {
      package_id: numeric(b.packageId),
      rate_id: text(b.rateId).slice(0, 120),
    }
  } else
    throw new CommerceFault('VALIDATION_ERROR', 'Unknown cart action.', 400)
  return mapCart(await cartRequest(path, payload))
}
export function checkoutEnabled() {
  return process.env.COMMERCE_CHECKOUT_ENABLED === 'true'
}
export async function placeOrder(input: unknown): Promise<CheckoutResult> {
  if (!checkoutEnabled())
    throw new CommerceFault(
      'VALIDATION_ERROR',
      'Online checkout is being prepared. Please contact Shams to complete your purchase.',
      503,
    )
  const b = record(input),
    address = addressPayload(b.address),
    method = text(b.paymentMethod)
  if (
    !address.first_name ||
    !address.last_name ||
    !/^\S+@\S+\.\S+$/.test(address.email) ||
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
  const cart = await getCart()
  const allowed = (process.env.COMMERCE_VERIFIED_PAYMENT_METHODS ?? '')
    .split(',')
    .filter(Boolean)
  if (
    !allowed.includes(method) ||
    !cart.paymentMethods.includes(method) ||
    !cart.lines.length
  )
    throw new CommerceFault(
      'VALIDATION_ERROR',
      'Select an available payment method.',
      400,
    )
  const result = record(
    await cartRequest('/checkout', {
      billing_address: address,
      shipping_address: address,
      payment_method: method,
      customer_note: text(b.note).slice(0, 500),
      payment_data: [],
    }),
  )
  const payment = record(result.payment_result)
  const id = String(result.order_id ?? '')
  if (!/^\d+$/.test(id))
    throw new CommerceFault(
      'SERVER_ERROR',
      'We could not confirm your order. Please check before trying again.',
    )
  // Retain ownership proof server-side; the browser never receives order keys.
  ;(await cookies()).set(
    'shams-order',
    JSON.stringify({ id, key: text(result.order_key), email: address.email }),
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 86400,
    },
  )
  const redirectUrl = text(payment.redirect_url)
  if (payment.payment_status === 'failure')
    throw new CommerceFault(
      'PAYMENT_FAILED',
      'Payment was not completed. Please check your order before trying again.',
      400,
    )
  return {
    orderId: id,
    status: text(result.status),
    redirectUrl:
      redirectUrl && redirectUrl.startsWith('https://')
        ? redirectUrl
        : undefined,
  }
}
