'use client'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { commerceFetch } from '@/lib/commerce/browser'
import { formatEgp } from '@/lib/commerce'
import type { PaymentStatusView } from '@/lib/payments/paymob/types'

// Polls the server-truth status endpoint. Never reads success from the URL or a
// redirect flag — the backend (driven by the verified webhook) decides.
export function PaymentResult({ orderId }: { orderId: string }) {
  const q = useQuery({
    queryKey: ['payment-status', orderId],
    queryFn: () =>
      commerceFetch<PaymentStatusView>(`/api/payments/status/${orderId}`),
    retry: false,
    refetchInterval: (query) => {
      const d = query.state.data
      return d && (d.state === 'paid' || d.state === 'failed') ? false : 3000
    },
  })

  const state = q.data?.state
  return (
    <main className="shams-container max-w-2xl py-12">
      {q.isLoading || (!state && !q.isError) ? (
        <div className="shams-panel p-8 text-center">
          <h1 className="text-2xl font-semibold">Confirming your payment…</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            We are waiting for your bank to confirm. This usually takes a few
            seconds. Please keep this page open.
          </p>
          <div className="mx-auto mt-6 size-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
        </div>
      ) : state === 'paid' ? (
        <div className="shams-panel p-8 text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-green-50 text-2xl text-green-700">
            ✓
          </div>
          <h1 className="mt-5 text-2xl font-semibold">Payment successful</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Order #{q.data?.orderId}
          </p>
          <dl className="mx-auto mt-6 max-w-sm space-y-2 text-left text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Total</dt>
              <dd className="font-semibold">
                {q.data ? formatEgp(q.data.total) : ''}
              </dd>
            </div>
            {q.data?.method && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Paid by</dt>
                <dd className="capitalize">{q.data.method}</dd>
              </div>
            )}
            {q.data?.paidAt && (
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Paid at</dt>
                <dd>
                  {new Date(q.data.paidAt).toLocaleString('en-EG', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </dd>
              </div>
            )}
            {q.data?.transactionId && (
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Transaction</dt>
                <dd className="truncate">#{q.data.transactionId}</dd>
              </div>
            )}
          </dl>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/orders"
              className="inline-flex min-h-11 items-center rounded-lg border px-5 text-sm font-semibold"
            >
              Track order
            </Link>
            <Link
              href="/shop"
              className="inline-flex min-h-11 items-center rounded-lg bg-brand px-5 text-sm font-semibold text-brand-foreground"
            >
              Continue shopping
            </Link>
          </div>
        </div>
      ) : state === 'failed' ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
          <h1 className="text-2xl font-semibold text-red-800">
            Payment failed
          </h1>
          <p className="mt-3 text-sm leading-6 text-red-700">
            {q.data?.reason ??
              'Your payment was not completed. No amount was captured.'}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/checkout"
              className="inline-flex min-h-11 items-center rounded-lg bg-brand px-5 text-sm font-semibold text-brand-foreground"
            >
              Try again
            </Link>
            <Link
              href="/support"
              className="inline-flex min-h-11 items-center rounded-lg border px-5 text-sm font-semibold"
            >
              Contact Shams
            </Link>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border p-8 text-center">
          <h1 className="text-2xl font-semibold">Still pending</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Your payment is being processed. We will confirm shortly — you can
            safely check your order status.
          </p>
          <Link
            href="/orders"
            className="mt-6 inline-flex min-h-11 items-center text-sm text-brand-ink"
          >
            Track order →
          </Link>
        </div>
      )}
      {q.isError && (
        <p className="mt-6 text-center text-sm text-muted-foreground">
          {q.error?.message ??
            'We could not load this order on this device. Use the confirmation sent by Shams.'}
        </p>
      )}
    </main>
  )
}
