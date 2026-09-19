import { assertSameOrigin, getCart } from '@/lib/commerce/live/cart'
import { CommerceFault, errorResponse } from '@/lib/commerce/live/errors'
import { array, record, text } from '@/lib/commerce/live/normalize'
import { createPendingOrder, getWooOrder, readOwnershipCookie, rememberOrder, updateWooOrder } from '@/lib/payments/orders'
import type { PendingOrder } from '@/lib/payments/orders'
import { createPaymobProvider } from '@/lib/payments/paymob/provider'
import { paymobConfig, paymobEnabled } from '@/lib/payments/paymob/config'
import type { PaymobServerConfig } from '@/lib/payments/paymob/types'
import type { CreateIntentionResponse } from '@/lib/payments/paymob/types'
import { paymobOptions } from '@/lib/payments/paymob/settings'
import { paymentCartSnapshot } from '@/lib/payments/order-contract'
import { completeClaim, paymentClaim } from '@/lib/payments/session'
import { rateLimit } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 180
const json = (value: unknown) => Response.json(value, { headers: { 'Cache-Control': 'no-store' } })

const PREP_COOLDOWN_MS = 20_000
const PREP_ATTEMPT_CAP = 5
const RESUMABLE_STAGES = ['create_intention', 'validate_intention', 'save_intention', 'complete_claim']
// Same-worker double-click guard; the _paymob_prep cooldown meta covers other workers.
const inFlightPrep = new Map<string, Promise<Response>>()

type PaymobOption = { id: string; kind: 'card' | 'installments'; integrationIds: number[] }
type Cart = Awaited<ReturnType<typeof getCart>>

const reviewMessage = (orderId: string) =>
  `Order #${orderId} was created, but payment preparation needs review. Contact Shams before starting another payment.`

const intentionPayload = (order: PendingOrder, clientSecret: string, pixelMethods: string[], option: PaymobOption, publicKey: string | undefined) =>
  json({ orderId: order.orderId, clientSecret, pixelMethods, publicKey, method: option.kind, amountCents: order.amountCents, currency: order.currency })

function pixelMethodNames(intention: CreateIntentionResponse, option: PaymobOption): string[] {
  return intention.pixelMethods?.length ? intention.pixelMethods : [option.kind === 'installments' ? 'installments' : 'card']
}

function validateIntention(intention: CreateIntentionResponse) {
  if (!intention.id || !intention.intention_order_id || !intention.client_secret)
    throw new CommerceFault('SERVER_ERROR', 'Payment preparation needs review. Do not create another payment.', 502)
}

function prepAttempts(order: PendingOrder): number {
  const pendingIntentions = array(order.meta._paymob_attempts)
    .filter(a => { const entry = record(a); return text(entry.intentionId) && String(entry.status) === 'pending' }).length
  return pendingIntentions + Number(record(order.meta._paymob_prep).n ?? 0)
}

async function saveIntentionMeta(order: PendingOrder, intention: CreateIntentionResponse, option: PaymobOption, pixelMethods: string[], cart: Cart) {
  const now = new Date().toISOString()
  const superseded = array(order.meta._paymob_superseded_intentions).map(entry => record(entry))
  const previousOrderId = text(order.meta._paymob_intention_order_id)
  // A payment on a superseded intention must still settle this order (webhook ledger).
  if (previousOrderId && previousOrderId !== String(intention.intention_order_id))
    superseded.push({ intentionId: text(order.meta._paymob_intention_id), paymobOrderId: previousOrderId, supersededAt: now })
  await updateWooOrder(order.orderId, { meta_data: [
    { key: '_shams_payment_cart_snapshot', value: paymentCartSnapshot(cart) },
    { key: '_paymob_intention_id', value: intention.id },
    { key: '_paymob_client_secret', value: intention.client_secret },
    { key: '_paymob_intention_order_id', value: String(intention.intention_order_id) },
    { key: '_paymob_intention_expires', value: String(Date.now() + 25 * 60 * 1000) },
    { key: '_paymob_pixel_methods', value: pixelMethods },
    { key: '_paymob_integration_ids', value: option.integrationIds },
    { key: '_shams_payment_method', value: option.kind },
    { key: '_paymob_superseded_intentions', value: superseded },
    { key: '_paymob_attempts', value: [...array(order.meta._paymob_attempts), { id: intention.id, provider: 'paymob', intentionId: intention.id, paymobOrderId: String(intention.intention_order_id), method: option.kind, amountCents: order.amountCents, currency: order.currency, status: 'pending', createdAt: now, updatedAt: now }] },
  ] })
}

export async function POST(r: Request) {
  let stage = 'validate'
  let claimed = false
  let orderId: string | undefined
  let claim: { key: string; fingerprint: string; token: string } | undefined
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
    stage = 'claim'
    let resume: PendingOrder | null = null
    try {
      const result = await paymentClaim({
        lines: cart.lines.map(l => [l.productId, l.quantity, l.total]), total: cart.total,
        coupons: cart.coupons, rates: cart.rates.filter(r => r.selected),
        address: Object.fromEntries(['firstName','lastName','email','phone','state','city','address1','address2','postcode'].map(k => [k, text(address[k])])),
        method: option.id, integrations: option.integrationIds,
      })
      claim = result
      if (!result.claimed) {
        orderId = result.orderId
        const existing = await getWooOrder(result.orderId)
        if (!existing) throw new CommerceFault('PAYMENT_REVIEW_REQUIRED', reviewMessage(result.orderId), 409)
        if (!['pending', 'on-hold'].includes(existing.status))
          throw new CommerceFault('PAYMENT_REVIEW_REQUIRED', 'This payment already has a result. Review your order before starting again.', 409)
        resume = existing
      }
    } catch (e) {
      // A running claim for this exact fingerprint: the order id is only known from
      // the ownership cookie written when the order was created. Verify ownership
      // (order key) and status before resuming; otherwise stay fail-closed.
      if (!(e instanceof CommerceFault) || e.code !== 'PAYMENT_SESSION_BUSY') throw e
      const ownership = await readOwnershipCookie()
      const owned = ownership ? await getWooOrder(ownership.id) : null
      if (!owned || owned.orderKey !== ownership?.key || !['pending', 'on-hold'].includes(owned.status)) throw e
      orderId = owned.orderId
      resume = owned
    }
    if (resume) return await resumePreparation(resume, option, config, cart)
    if (!claim) throw new CommerceFault('SERVER_ERROR', 'This payment attempt needs review before you retry. Contact Shams to check whether an order was created.', 502)
    claimed = true
    stage = 'create_order'
    const order = await createPendingOrder({ address, note: body.note, cart })
    orderId = order.orderId
    stage = 'validate_total'
    if (order.currency !== 'EGP' || order.amountCents !== Math.round(cart.total * 100) || order.amountCents <= 0)
      throw new CommerceFault('PRICE_CHANGED', 'The order total changed. Contact Shams to review the pending order before paying.', 409)
    stage = 'create_intention'
    const intention = await createPaymobProvider(config).createIntention({ orderId: order.orderId, amountCents: order.amountCents, currency: order.currency, items: order.items, billing: order.billing })
    stage = 'validate_intention'
    validateIntention(intention)
    const pixelMethods = pixelMethodNames(intention, option)
    stage = 'save_intention'
    await saveIntentionMeta(order, intention, option, pixelMethods, cart)
    stage = 'complete_claim'
    await completeClaim(claim, order.orderId)
    return intentionPayload(order, intention.client_secret, pixelMethods, option, config.publicKey)
  } catch (e) {
    // Stage and internal order reference only: never log bodies, credentials or customer data.
    console.error('[payment-preparation]', { stage, orderId, code: e instanceof CommerceFault ? e.code : 'UNKNOWN' })
    if (claimed && claim && orderId && RESUMABLE_STAGES.includes(stage)) {
      // The order exists but preparation failed: bind the running claim to it so the
      // same session can resume instead of locking forever. The atomic in-flight
      // mutex stayed 'running' for the whole preparation, so no parallel intention.
      try { await completeClaim(claim, orderId) } catch { console.error('[payment-preparation]', { stage: 'compensate_claim', orderId, code: 'UNKNOWN' }) }
    }
    if (orderId && !(e instanceof CommerceFault && e.code === 'RATE_LIMITED')) return Response.json({
      error: e instanceof CommerceFault && e.code === 'PAYMENT_REVIEW_REQUIRED' ? e.message : reviewMessage(orderId),
      code: 'PAYMENT_REVIEW_REQUIRED',
      orderId,
      requestId: crypto.randomUUID(),
    }, { status: 409, headers: { 'Cache-Control': 'no-store' } })
    return errorResponse(e)
  }

  // Resumes preparation on an EXISTING pending order. Never creates a second order.
  async function resumePreparation(order: PendingOrder, option: PaymobOption, config: PaymobServerConfig, cart: Cart): Promise<Response> {
    if (order.currency !== 'EGP' || order.amountCents <= 0)
      throw new CommerceFault('PAYMENT_REVIEW_REQUIRED', reviewMessage(order.orderId), 409)
    stage = 'resume'
    const clientSecret = text(order.meta._paymob_client_secret)
    const storedMethods = array(order.meta._paymob_pixel_methods).map(text).filter(Boolean)
    if (clientSecret && Number(order.meta._paymob_intention_expires) > Date.now() && storedMethods.length) {
      await rememberOrder(order)
      return intentionPayload(order, clientSecret, storedMethods, option, config.publicKey)
    }
    const prep = record(order.meta._paymob_prep)
    if (Number(prep.ts) && Date.now() - Number(prep.ts) < PREP_COOLDOWN_MS)
      throw new CommerceFault('RATE_LIMITED', 'Payment is still being prepared. Wait a few seconds, then resume the same order.', 429)
    if (prepAttempts(order) >= PREP_ATTEMPT_CAP)
      throw new CommerceFault('PAYMENT_REVIEW_REQUIRED', reviewMessage(order.orderId), 409)
    const inFlight = inFlightPrep.get(order.orderId)
    if (inFlight) return inFlight
    const tracked = (async () => {
      await updateWooOrder(order.orderId, { meta_data: [{ key: '_paymob_prep', value: { n: Number(prep.n ?? 0) + 1, ts: Date.now() } }] })
      stage = 'create_intention'
      const intention = await createPaymobProvider(config).createIntention({ orderId: order.orderId, amountCents: order.amountCents, currency: order.currency, items: order.items, billing: order.billing })
      stage = 'validate_intention'
      validateIntention(intention)
      const pixelMethods = pixelMethodNames(intention, option)
      stage = 'save_intention'
      await saveIntentionMeta(order, intention, option, pixelMethods, cart)
      await rememberOrder(order)
      return intentionPayload(order, intention.client_secret, pixelMethods, option, config.publicKey)
    })().finally(() => { inFlightPrep.delete(order.orderId) })
    inFlightPrep.set(order.orderId, tracked)
    return tracked
  }
}
