'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { commerceFetch } from '@/lib/commerce/browser'
import { ArrowLeft, Loader2, Package, MapPin } from 'lucide-react'

type OrderItem = {
  id: string
  productId: string
  name: string
  quantity: number
  total: string
  image: string
}

type OrderDetail = {
  id: string
  number: number
  status: string
  statusLabel: string
  currency: string
  total: string
  subtotal: string
  shippingTotal: string
  taxTotal: string
  discountTotal: string
  paymentMethod: string
  dateCreated: string
  dateCompleted: string | null
  items: OrderItem[]
  billing: {
    firstName: string
    lastName: string
    phone: string
    address1: string
    address2: string
    city: string
    state: string
    postcode: string
  }
  shipping: {
    firstName: string
    lastName: string
    address1: string
    address2: string
    city: string
    state: string
    postcode: string
  }
  notes: string
}

export function OrderDetailPage({ orderId }: { orderId: string }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['customer-order', orderId],
    queryFn: ({ signal }) =>
      commerceFetch<{ order: OrderDetail }>(`/api/customer/orders/${orderId}`, { signal }),
  })

  const order = data?.order

  if (isLoading) {
    return (
      <main className="shams-container flex items-center justify-center py-16 pb-[calc(4rem+var(--mobile-bottom-nav-height))] sm:pb-16">
        <Loader2 className="size-6 animate-spin text-brand-ink" />
      </main>
    )
  }

  if (isError || !order) {
    return (
      <main className="shams-container max-w-md py-16 pb-[calc(4rem+var(--mobile-bottom-nav-height))] text-center sm:pb-16">
        <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-brand-muted">
          <Package className="size-7 text-brand-ink" />
        </div>
        <h1 className="text-2xl font-semibold">Order not found</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          We couldn't find this order. It may have been removed or you don't have access to it.
        </p>
        <Link
          href="/account/orders"
          className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-(--radius-control) border px-5 text-sm"
        >
          <ArrowLeft className="size-4" /> Back to orders
        </Link>
      </main>
    )
  }

  const statusColor =
    order.status === 'completed' || order.status === 'delivered'
      ? 'bg-green-50 text-green-700'
      : 'bg-brand-muted text-brand-ink'

  return (
    <main className="shams-container max-w-3xl py-10 pb-[calc(2.5rem+var(--mobile-bottom-nav-height))] sm:pb-10">
      <Link
        href="/account/orders"
        className="mb-3 inline-flex items-center gap-1 text-sm text-brand-ink"
      >
        <ArrowLeft className="size-4" /> Back to orders
      </Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-ink">
            Order #{order.number}
          </p>
          <h1 className="mt-2 text-2xl font-semibold">Order details</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Placed on {new Date(order.dateCreated).toLocaleDateString('en-EG', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        <span className={`rounded-full px-3 py-1 text-sm font-medium ${statusColor}`}>
          {order.statusLabel}
        </span>
      </div>

      <div className="space-y-4">
        <section className="rounded-(--radius-card) border bg-card p-5">
          <h2 className="mb-4 font-semibold">Items</h2>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex gap-3 rounded-(--radius-control) border bg-background p-3">
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="size-16 rounded-(--radius-control) object-cover"
                  />
                )}
                <div className="flex-1">
                  <p className="font-medium">{item.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Quantity: {item.quantity}
                  </p>
                </div>
                <p className="font-semibold">{parseFloat(item.total).toLocaleString('en-EG')} EGP</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-(--radius-card) border bg-card p-5">
          <h2 className="mb-4 font-semibold">Order summary</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="font-medium">{parseFloat(order.subtotal).toLocaleString('en-EG')} EGP</dd>
            </div>
            {order.shippingTotal && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Shipping</dt>
                <dd className="font-medium">{parseFloat(order.shippingTotal).toLocaleString('en-EG')} EGP</dd>
              </div>
            )}
            {order.taxTotal && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Tax</dt>
                <dd className="font-medium">{parseFloat(order.taxTotal).toLocaleString('en-EG')} EGP</dd>
              </div>
            )}
            {order.discountTotal && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Discount</dt>
                <dd className="font-medium text-green-700">
                  -{parseFloat(order.discountTotal).toLocaleString('en-EG')} EGP
                </dd>
              </div>
            )}
            <div className="flex justify-between border-t pt-2 text-base">
              <dt className="font-semibold">Total</dt>
              <dd className="font-semibold">{parseFloat(order.total).toLocaleString('en-EG')} EGP</dd>
            </div>
          </dl>
          <div className="mt-4 space-y-1 text-sm">
            <p className="text-muted-foreground">
              Payment: <span className="font-medium">{order.paymentMethod}</span>
            </p>
            {order.dateCompleted && (
              <p className="text-muted-foreground">
                Completed:{' '}
                <span className="font-medium">
                  {new Date(order.dateCompleted).toLocaleDateString('en-EG')}
                </span>
              </p>
            )}
          </div>
        </section>

        <div className="grid gap-4 sm:grid-cols-2">
          <section className="rounded-(--radius-card) border bg-card p-5">
            <h2 className="mb-3 flex items-center gap-2 font-semibold">
              <MapPin className="size-5 text-brand-ink" /> Billing address
            </h2>
            <address className="text-sm not-italic">
              <p className="font-medium">
                {order.billing.firstName} {order.billing.lastName}
              </p>
              <p className="mt-1 text-muted-foreground">{order.billing.address1}</p>
              {order.billing.address2 && (
                <p className="text-muted-foreground">{order.billing.address2}</p>
              )}
              <p className="text-muted-foreground">
                {order.billing.city}
                {order.billing.state && `, ${order.billing.state}`}
                {order.billing.postcode && ` ${order.billing.postcode}`}
              </p>
              {order.billing.phone && (
                <p className="mt-2 text-muted-foreground">{order.billing.phone}</p>
              )}
            </address>
          </section>

          <section className="rounded-(--radius-card) border bg-card p-5">
            <h2 className="mb-3 flex items-center gap-2 font-semibold">
              <MapPin className="size-5 text-brand-ink" /> Shipping address
            </h2>
            <address className="text-sm not-italic">
              <p className="font-medium">
                {order.shipping.firstName} {order.shipping.lastName}
              </p>
              <p className="mt-1 text-muted-foreground">{order.shipping.address1}</p>
              {order.shipping.address2 && (
                <p className="text-muted-foreground">{order.shipping.address2}</p>
              )}
              <p className="text-muted-foreground">
                {order.shipping.city}
                {order.shipping.state && `, ${order.shipping.state}`}
                {order.shipping.postcode && ` ${order.shipping.postcode}`}
              </p>
            </address>
          </section>
        </div>

        {order.notes && (
          <section className="rounded-(--radius-card) border bg-card p-5">
            <h2 className="mb-2 font-semibold">Order notes</h2>
            <p className="text-sm text-muted-foreground">{order.notes}</p>
          </section>
        )}
      </div>
    </main>
  )
}
