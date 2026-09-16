'use client'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { commerceFetch } from '@/lib/commerce/browser'
import { formatEgp } from '@/lib/commerce'
import type { PaymentStatusView } from '@/lib/payments/paymob/types'
import { Package, MapPin } from 'lucide-react'

export function PaymentResult({ orderId }: { orderId: string }) {
  const q = useQuery({
    queryKey: ['payment-status', orderId],
    queryFn: () =>
      commerceFetch<PaymentStatusView>(`/api/payments/status/${orderId}`),
    retry: false,
    refetchInterval: (query) => {
      const d = query.state.data
      if (d && (d.state === 'paid' || d.state === 'failed')) return false
      const polls = query.state.dataUpdateCount
      return polls < 5 ? 1000 : 3000
    },
  })

  const state = q.data?.state
  return (
    <main className="shams-container max-w-2xl py-6 pb-[calc(2rem+var(--mobile-bottom-nav-height))] sm:py-8">
      {q.isLoading || (!state && !q.isError) ? (
        <div className="shams-panel p-6 text-center">
          <h1 className="text-lg font-semibold">Confirming your payment…</h1>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">
            Waiting for your bank to confirm. Please keep this page open.
          </p>
          <div className="mx-auto mt-4 size-7 animate-spin rounded-full border-2 border-brand border-t-transparent" />
        </div>
      ) : state === 'paid' ? (
        <div className="space-y-3">
          <div className="shams-panel p-4 text-center">
            <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-green-50 text-lg text-green-700">
              ✓
            </div>
            <h1 className="mt-3 text-lg font-semibold">Order confirmed</h1>
            <p className="mt-1 text-xs text-muted-foreground">
              #{q.data?.orderId}
            </p>
            <dl className="mx-auto mt-3 max-w-xs space-y-1.5 text-left text-xs">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Total</dt>
                <dd className="font-semibold">
                  {q.data ? formatEgp(q.data.total) : ''}
                </dd>
              </div>
              {q.data?.method && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Payment</dt>
                  <dd className="capitalize">{q.data.method === 'card' ? 'Credit card' : q.data.method === 'cod' ? 'Cash on delivery' : q.data.method}</dd>
                </div>
              )}
              {q.data?.paidAt && (
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Date</dt>
                  <dd>
                    {new Date(q.data.paidAt).toLocaleString('en-EG', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          <section className="rounded-(--radius-card) border bg-card p-3">
            <h2 className="mb-2 text-xs font-semibold">Items</h2>
            <div className="space-y-1.5">
              {q.data?.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between rounded-(--radius-control) border bg-background px-3 py-2 text-xs">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{item.name}</p>
                    <p className="text-[11px] text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <p className="shrink-0 font-semibold">{formatEgp(item.total)}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="grid gap-3 sm:grid-cols-2">
            <section className="rounded-(--radius-card) border bg-card p-3">
              <h2 className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold">
                <MapPin className="size-3 text-brand-ink" /> Shipping
              </h2>
              <address className="text-xs not-italic leading-5">
                <p className="font-medium">
                  {q.data?.shipping.firstName} {q.data?.shipping.lastName}
                </p>
                <p className="text-muted-foreground">{q.data?.shipping.street}</p>
                <p className="text-muted-foreground">
                  {q.data?.shipping.city}
                  {q.data?.shipping.state && `, ${q.data?.shipping.state}`}
                </p>
              </address>
            </section>

            <section className="rounded-(--radius-card) border bg-card p-3">
              <h2 className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold">
                <MapPin className="size-3 text-brand-ink" /> Billing
              </h2>
              <address className="text-xs not-italic leading-5">
                <p className="font-medium">
                  {q.data?.billing.firstName} {q.data?.billing.lastName}
                </p>
                <p className="text-muted-foreground">{q.data?.billing.street}</p>
                <p className="text-muted-foreground">
                  {q.data?.billing.city}
                  {q.data?.billing.state && `, ${q.data?.billing.state}`}
                </p>
                {q.data?.billing.phone && (
                  <p className="text-muted-foreground">{q.data?.billing.phone}</p>
                )}
              </address>
            </section>
          </div>

          <div className="flex flex-wrap justify-center gap-2 pt-1">
            <Link
              href="/account/orders"
              className="inline-flex min-h-9 items-center gap-1.5 rounded-(--radius-control) border px-4 text-xs font-semibold"
            >
              <Package className="size-3.5" /> Track order
            </Link>
            <Link
              href="/shop"
              className="inline-flex min-h-9 items-center rounded-(--radius-control) bg-brand px-4 text-xs font-semibold text-brand-foreground"
            >
              Continue shopping
            </Link>
          </div>
        </div>
      ) : state === 'failed' ? (
        <div className="rounded-(--radius-card) border border-red-200 bg-red-50 p-6 text-center">
          <h1 className="text-lg font-semibold text-red-800">
            Payment failed
          </h1>
          <p className="mt-2 text-xs leading-5 text-red-700">
            {q.data?.reason ??
              'Your payment was not completed. No amount was captured.'}
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <Link
              href="/checkout"
              className="inline-flex min-h-9 items-center rounded-(--radius-control) bg-brand px-4 text-xs font-semibold text-brand-foreground"
            >
              Try again
            </Link>
            <Link
              href="/support"
              className="inline-flex min-h-9 items-center rounded-(--radius-control) border px-4 text-xs font-semibold"
            >
              Contact Shams
            </Link>
          </div>
        </div>
      ) : (
        <div className="rounded-(--radius-card) border p-6 text-center">
          <h1 className="text-lg font-semibold">Still pending</h1>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">
            Your payment is being processed. We will confirm shortly.
          </p>
          <Link
            href="/account/orders"
            className="mt-4 inline-flex min-h-9 items-center text-xs text-brand-ink"
          >
            Track order →
          </Link>
        </div>
      )}
      {q.isError && (
        <p className="mt-4 text-center text-xs text-muted-foreground">
          {q.error?.message ??
            'We could not load this order on this device. Use the confirmation sent by Shams.'}
        </p>
      )}
    </main>
  )
}
