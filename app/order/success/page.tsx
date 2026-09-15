import Link from 'next/link'
import { readOwnershipCookie } from '@/lib/payments/orders'
import { PaymentResult } from '@/components/shams/payment-result'

export const dynamic = 'force-dynamic'
export const metadata = {
  title: 'Your order',
  robots: { index: false, follow: false },
}

// Single success route. The order id is resolved server-side from the httpOnly
// ownership cookie (set when the order was created) — it never appears in the
// URL and is never trusted from the client. PaymentResult then polls the
// cookie-authorized status endpoint for the real, webhook-driven state.
export default async function Page() {
  const ownership = await readOwnershipCookie()
  if (!ownership)
    return (
      <main className="shams-container max-w-2xl py-12">
        <h1 className="text-3xl font-semibold">Your order</h1>
        <p className="mt-6 text-sm leading-6 text-muted-foreground">
          No recent order was found on this device. For an earlier order, use
          the confirmation sent by Shams.
        </p>
        <Link
          href="/shop"
          className="mt-6 inline-flex min-h-11 items-center text-sm text-brand-ink"
        >
          Continue shopping →
        </Link>
      </main>
    )
  return <PaymentResult orderId={ownership.id} />
}
