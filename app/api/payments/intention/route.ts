import { assertSameOrigin, getCart } from '@/lib/commerce/live/cart'
import { CommerceFault, errorResponse } from '@/lib/commerce/live/errors'
import { array, record, text } from '@/lib/commerce/live/normalize'
import { createPendingOrder, getWooOrder, rememberOrder, updateWooOrder } from '@/lib/payments/orders'
import { createPaymobProvider } from '@/lib/payments/paymob/provider'
import { paymobConfig, paymobEnabled } from '@/lib/payments/paymob/config'
import { paymobOptions } from '@/lib/payments/paymob/settings'
import { paymentCartSnapshot } from '@/lib/payments/order-contract'
import { completeClaim, paymentClaim } from '@/lib/payments/session'
import { rateLimit } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 180
const json = (value: unknown) => Response.json(value, { headers: { 'Cache-Control': 'no-store' } })

export async function POST(r: Request) {
  try {
    assertSameOrigin(r)
    if (!paymobEnabled()) throw new CommerceFault('VALIDATION_ERROR', 'Online payment is currently unavailable.', 503)
    const ip = r.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'anonymous'
    if (!rateLimit(`payment:${ip}`, { limit: 10, windowMs: 60_000 }).success)
      throw new CommerceFault('RATE_LIMITED', 'Too many payment attempts. Please wait before trying again.', 429)
    const body = record(await r.json())
    const option = (await paymobOptions()).find(o => o.id === text(body.paymentMethod))
    if (!option) throw new CommerceFault('VALIDATION_ERROR', 'This payment method is no longer available. Refresh checkout options.', 400)
    const address = record(body.address)
    if (!text(address.firstName) || !text(address.lastName) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text(address.email)) || !/^01[0-9]{9}$/.test(text(address.phone)) || !text(address.state) || !text(address.city) || !text(address.address1))
      throw new CommerceFault('VALIDATION_ERROR', 'Complete your name, email, phone and delivery details for online payment.', 400)
    const cart = await getCart()
    if (!cart.lines.length || cart.errors.length || (cart.needsShipping && !cart.rates.some(r => r.selected)))
      throw new CommerceFault('VALIDATION_ERROR', 'Review your cart and select delivery before paying.', 400)
    const config = paymobConfig(process.env, option.integrationIds)
    // A durable WordPress claim is acquired BEFORE any order/intention write.
    // A lost response never authorizes another order. Changed snapshots fail closed.
    const claim = await paymentClaim({
      lines: cart.lines.map(l => [l.productId, l.quantity, l.total]), total: cart.total,
      coupons: cart.coupons, rates: cart.rates.filter(r => r.selected),
      address: Object.fromEntries(['firstName','lastName','email','phone','state','city','address1','address2','postcode'].map(k => [k, text(address[k])])),
      method: option.id, integrations: option.integrationIds,
    })
    if (!claim.claimed) {
      const order = await getWooOrder(claim.orderId)
      if (!order || !['pending', 'on-hold'].includes(order.status))
        throw new CommerceFault('VALIDATION_ERROR', 'This payment already has a result. Review your order before starting again.', 409)
      const clientSecret = text(order.meta._paymob_client_secret)
      if (!clientSecret || Number(order.meta._paymob_intention_expires) <= Date.now())
        throw new CommerceFault('VALIDATION_ERROR', 'This payment session expired. Contact Shams to review the existing order before retrying.', 409)
      const pixelMethods = array(order.meta._paymob_pixel_methods).map(text).filter(Boolean)
      if (!pixelMethods.length) throw new CommerceFault('SERVER_ERROR', 'This payment needs review before continuing.', 503)
      await rememberOrder(order)
      return json({ orderId: order.orderId, clientSecret, pixelMethods, publicKey: config.publicKey, method: option.kind, amountCents: order.amountCents, currency: order.currency })
    }
    const order = await createPendingOrder({ address, note: body.note, cart })
    if (order.currency !== 'EGP' || order.amountCents !== Math.round(cart.total * 100) || order.amountCents <= 0)
      throw new CommerceFault('PRICE_CHANGED', 'The order total changed. Contact Shams to review the pending order before paying.', 409)
    const intention = await createPaymobProvider(config).createIntention({ orderId: order.orderId, amountCents: order.amountCents, currency: order.currency, items: order.items, billing: order.billing })
    if (!intention.id || !intention.intention_order_id || !intention.pixelMethods?.length)
      throw new CommerceFault('SERVER_ERROR', 'Payment preparation needs review. Do not create another payment.', 502)
    const now = new Date().toISOString()
    await updateWooOrder(order.orderId, { meta_data: [
      { key: '_shams_payment_cart_snapshot', value: paymentCartSnapshot(cart) },
      { key: '_paymob_intention_id', value: intention.id },
      { key: '_paymob_client_secret', value: intention.client_secret },
      { key: '_paymob_intention_order_id', value: String(intention.intention_order_id) },
      { key: '_paymob_intention_expires', value: String(Date.now() + 25 * 60 * 1000) },
      { key: '_paymob_pixel_methods', value: intention.pixelMethods },
      { key: '_paymob_integration_ids', value: option.integrationIds },
      { key: '_shams_payment_method', value: option.kind },
      { key: '_paymob_attempts', value: [...array(order.meta._paymob_attempts), { id: intention.id, provider: 'paymob', intentionId: intention.id, paymobOrderId: String(intention.intention_order_id), method: option.kind, amountCents: order.amountCents, currency: order.currency, status: 'pending', createdAt: now, updatedAt: now }] },
    ] })
    await completeClaim(claim, order.orderId)
    return json({ orderId: order.orderId, clientSecret: intention.client_secret, pixelMethods: intention.pixelMethods, publicKey: config.publicKey, method: option.kind, amountCents: order.amountCents, currency: order.currency })
  } catch (e) { return errorResponse(e) }
}
