import {
  assertSameOrigin,
  checkoutEnabled,
  placeOrder,
} from '@/lib/commerce/live/cart'
import { request } from '@/lib/commerce/live/client'
import { array, record, text } from '@/lib/commerce/live/normalize'
import { errorResponse } from '@/lib/commerce/live/errors'
import { paymobOptions, availablePaymobOptions, installmentDisplayEnabled } from '@/lib/payments/paymob/settings'
export async function GET() {
  try {
    const r = await request('/wc/v3/data/countries/EG', {
      private: true,
      ttl: 86400,
    })
    let options: Awaited<ReturnType<typeof paymobOptions>> = []
    let paymobUnavailable = false
    try { options = await paymobOptions() } catch { paymobUnavailable = true }
    let installmentAvailable = options.some(option => option.kind === 'installments')
    if (!installmentAvailable && installmentDisplayEnabled()) {
      try { installmentAvailable = (await availablePaymobOptions()).some(option => option.kind === 'installments') } catch { /* Optional catalog notice fails closed. */ }
    }
    return Response.json(
      {
        enabled: checkoutEnabled(),
        paymob: options.length > 0,
        installmentAvailable,
        paymobOptions: options.map(({ integrationIds: _, ...option }) => option),
        paymobUnavailable,
        verifiedMethods: (process.env.COMMERCE_VERIFIED_PAYMENT_METHODS ?? '')
          .split(',')
          .filter(Boolean),
        states: array(record(r.data).states).map((v) => ({
          code: text(record(v).code),
          name: text(record(v).name),
        })),
      },
      { headers: { 'Cache-Control': 'no-store' } },
    )
  } catch (e) {
    return errorResponse(e)
  }
}
export async function POST(r: Request) {
  try {
    assertSameOrigin(r)
    return Response.json(await placeOrder(await r.json()), {
      headers: { 'Cache-Control': 'no-store' },
    })
  } catch (e) {
    return errorResponse(e)
  }
}
