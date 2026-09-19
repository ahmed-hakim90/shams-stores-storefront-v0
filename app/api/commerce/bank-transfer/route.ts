import { request } from '@/lib/commerce/live/client'
import { record } from '@/lib/commerce/live/normalize'
import { errorResponse } from '@/lib/commerce/live/errors'
import { mapBankTransfer } from '@/lib/payments/bank-transfer'
export async function GET() {
  try {
    const enabled = process.env.COMMERCE_CHECKOUT_ENABLED === 'true' && (process.env.COMMERCE_VERIFIED_PAYMENT_METHODS ?? '').split(',').includes('bacs')
    const data = enabled ? record((await request('/shams/v1/site-content')).data).bank_transfer : null
    return Response.json(mapBankTransfer(data), { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) { return errorResponse(error) }
}
