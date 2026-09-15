'use client'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { commerceFetch } from '@/lib/commerce/browser'
import { formatEgp } from '@/lib/commerce'
export function OrderStatus() {
  const q = useQuery({
    queryKey: ['current-order'],
    queryFn: () =>
      commerceFetch<{
        id: string
        status: string
        total: number
        items: { name: string; quantity: number }[]
      }>('/api/commerce/order'),
    retry: false,
  })
  return (
    <main className="shams-container max-w-2xl py-12">
      <h1 className="text-3xl font-semibold">Your order</h1>
      {q.isLoading ? (
        <p className="mt-6">Checking your order…</p>
      ) : q.data ? (
        <div className="shams-panel mt-6 p-6">
          <h2 className="font-semibold">Order #{q.data.id}</h2>
          <p className="mt-2 capitalize">
            {q.data.status.replaceAll('-', ' ')}
          </p>
          <ul className="mt-5 space-y-3">
            {q.data.items.map((i, n) => (
              <li key={n} className="text-sm">
                {i.quantity} × {i.name}
              </li>
            ))}
          </ul>
          <p className="mt-6 border-t pt-4 font-semibold">
            Total {formatEgp(q.data.total)}
          </p>
        </div>
      ) : (
        <p className="mt-6 text-sm leading-6 text-muted-foreground">
          {q.error?.message ?? 'No recent order is available on this device.'}{' '}
          For an earlier order, use the confirmation sent by Shams.
        </p>
      )}
      <Link
        href="/shop"
        className="mt-6 inline-flex min-h-11 items-center text-sm text-brand-ink"
      >
        Continue shopping →
      </Link>
    </main>
  )
}
