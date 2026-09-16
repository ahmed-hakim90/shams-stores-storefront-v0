'use client'

import Link from 'next/link'
import { ArrowLeft, Loader2, Package } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { commerceFetch } from '@/lib/commerce/browser'

type OrderSummary = {
  id: number | string
  date: string
  status: string
  total: number
  items: number
}

function SectionHeader({ title, subtitle, onBack }: { title: string; subtitle?: string; onBack?: string }) {
  return (
    <div className="mb-6">
      {onBack && (
        <Link href={onBack} className="mb-3 inline-flex items-center gap-1 text-sm text-brand-ink">
          <ArrowLeft className="size-4" /> Back to account
        </Link>
      )}
      <h1 className="text-2xl font-semibold">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
    </div>
  )
}

export function OrdersSection() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['customer-orders'],
    queryFn: ({ signal }) =>
      commerceFetch<{ orders: Array<{ id: string; dateCreated: string; status: string; total: string; itemCount: number }> }>(
        '/api/customer/orders',
        { signal },
      ),
  })

  const orders: OrderSummary[] = (data?.orders || []).map((order) => ({
    id: order.id,
    date: order.dateCreated,
    status: order.status,
    total: parseFloat(order.total),
    items: order.itemCount,
  }))

  return (
    <main className="shams-container max-w-3xl py-10 pb-[calc(2.5rem+var(--mobile-bottom-nav-height))] sm:pb-10">
      <SectionHeader title="Orders" subtitle="Your order history and current status" onBack="/account" />
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-6 animate-spin text-brand-ink" />
        </div>
      ) : isError ? (
        <div className="rounded-(--radius-card) border border-dashed p-10 text-center">
          <p className="text-muted-foreground">Could not load your orders.</p>
          <button onClick={() => refetch()} className="mt-4 min-h-11 rounded-(--radius-control) border px-5 text-sm">
            Retry
          </button>
        </div>
      ) : !orders?.length ? (
        <div className="rounded-(--radius-card) border border-dashed p-10 text-center">
          <p className="text-muted-foreground">No orders yet.</p>
          <Link href="/shop" className="mt-4 inline-flex min-h-11 items-center rounded-(--radius-control) bg-brand px-6 text-sm font-semibold text-brand-foreground">
            Browse products
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="rounded-(--radius-card) border bg-card p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">Order #{order.id}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{new Date(order.date).toLocaleDateString('en-EG')}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${order.status === 'completed' || order.status === 'Delivered' ? 'bg-success-muted text-success' : 'bg-brand-muted text-brand-ink'}`}>
                  {order.status}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between border-t pt-3 text-sm">
                <span className="text-muted-foreground">{order.items} {order.items === 1 ? 'item' : 'items'}</span>
                <span className="font-semibold">{order.total.toLocaleString('en-EG')} EGP</span>
              </div>
              <div className="mt-3 border-t pt-3">
                <Link
                  href={`/account/orders/${order.id}`}
                  className="inline-flex items-center gap-1 text-sm text-brand-ink hover:underline"
                >
                  View details <ArrowLeft className="size-3 rotate-180" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
