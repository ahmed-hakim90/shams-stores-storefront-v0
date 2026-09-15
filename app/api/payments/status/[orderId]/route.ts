import { CommerceFault, errorResponse } from '@/lib/commerce/live/errors'
import { text } from '@/lib/commerce/live/normalize'
import { getWooOrder, readOwnershipCookie } from '@/lib/payments/orders'
import { derivePaymentState } from '@/lib/payments/paymob/provider'
import type { PaymentStatusView } from '@/lib/payments/paymob/types'

export const dynamic = 'force-dynamic'

// Server-truth payment status. The success page polls this instead of trusting
// any redirect/query parameter. Access requires the httpOnly order-ownership
// cookie set when the order was created — a bare order id is never enough.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ orderId: string }> },
) {
  try {
    const { orderId } = await params
    if (!/^\d+$/.test(orderId))
      throw new CommerceFault('NOT_FOUND', 'Order not found.', 404)

    const ownership = await readOwnershipCookie()
    if (!ownership || ownership.id !== orderId)
      throw new CommerceFault(
        'UNAUTHORIZED',
        'We could not verify this order on this device.',
        403,
      )

    const order = await getWooOrder(orderId)
    if (!order)
      throw new CommerceFault('NOT_FOUND', 'Order not found.', 404)

    const view: PaymentStatusView = {
      orderId: order.orderId,
      state: derivePaymentState(order.status, text(order.meta._payment_status)),
      wooStatus: order.status,
      total: order.total,
      currency: order.currency,
      provider: text(order.meta.payment_provider) || 'paymob',
      method: text(order.meta._payment_method) || undefined,
      transactionId: text(order.meta._paymob_transaction_id) || undefined,
      paidAt: text(order.meta._payment_date) || undefined,
      reason: text(order.meta._payment_failure_reason) || undefined,
    }
    return Response.json(view, { headers: { 'Cache-Control': 'no-store' } })
  } catch (e) {
    return errorResponse(e)
  }
}
