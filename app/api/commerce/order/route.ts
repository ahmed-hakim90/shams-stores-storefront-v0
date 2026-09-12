import { cookies } from 'next/headers'
import { cartRequest } from '@/lib/commerce/live/cart'
import { CommerceFault, errorResponse } from '@/lib/commerce/live/errors'
import { record, text, numeric, array } from '@/lib/commerce/live/normalize'
export async function GET() {
  try {
    const value = (await cookies()).get('shams-order')?.value
    if (!value)
      throw new CommerceFault(
        'NOT_FOUND',
        'No recent order was found on this device.',
        404,
      )
    const order = JSON.parse(value)
    if (
      !/^\d+$/.test(String(order.id)) ||
      typeof order.key !== 'string' ||
      !order.key ||
      typeof order.email !== 'string'
    )
      throw new CommerceFault(
        'NOT_FOUND',
        'No verified recent order was found on this device.',
        404,
      )
    const r = record(
      await cartRequest(
        `/order/${Number(order.id)}?key=${encodeURIComponent(order.key)}&billing_email=${encodeURIComponent(order.email)}`,
      ),
    )
    const totals = record(r.totals)
    return Response.json(
      {
        id: String(r.id),
        status: text(r.status),
        total:
          numeric(totals.total_price) /
          10 ** numeric(totals.currency_minor_unit),
        items: array(r.items).map((v) => ({
          name: text(record(v).name),
          quantity: numeric(record(v).quantity),
        })),
      },
      { headers: { 'Cache-Control': 'no-store' } },
    )
  } catch (e) {
    return errorResponse(e)
  }
}
