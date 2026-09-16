'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, Loader2, Package, CheckCircle2, Truck, ArrowLeft } from 'lucide-react'

type TrackOrderItem = {
  name: string
  quantity: number
  total: string
  image: string
}

type TrackOrderResult = {
  id: string
  number: number
  status: string
  statusLabel: string
  total: string
  currency: string
  dateCreated: string | null
  items: TrackOrderItem[]
  paymentMethod: string
}

const STATUS_STEPS = [
  { key: 'pending', label: 'Confirmed', icon: CheckCircle2 },
  { key: 'processing', label: 'Preparing', icon: Package },
  { key: 'completed', label: 'Shipped', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle2 },
]

const STATUS_ORDER: Record<string, number> = {
  pending: 0,
  'on-hold': 0,
  processing: 1,
  completed: 3,
  delivered: 3,
  cancelled: -1,
  refunded: -1,
  failed: -1,
}

function getStepIndex(status: string): number {
  if (status in STATUS_ORDER) return STATUS_ORDER[status]
  return 0
}

export function TrackOrderForm() {
  const [orderId, setOrderId] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const [result, setResult] = useState<TrackOrderResult | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setResult(null)

    if (!orderId.trim()) {
      setError('Enter your order number')
      return
    }
    if (!email.trim()) {
      setError('Enter the email address used for this order')
      return
    }

    setPending(true)
    try {
      const res = await fetch(
        `/api/customer/track-order?order_id=${encodeURIComponent(orderId.trim())}&email=${encodeURIComponent(email.trim())}`,
      )
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Order not found. Check the details and try again.')
        return
      }

      setResult(data.order)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setPending(false)
    }
  }

  return (
    <main className="shams-container max-w-2xl py-12 pb-[calc(3rem+var(--mobile-bottom-nav-height))] sm:pb-12">
      <Link href="/account/login" className="text-sm text-brand-ink">
        &larr; Back to sign in
      </Link>

      <h1 className="mt-6 text-3xl font-semibold">Track your order</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Enter your order number and the email address used when placing the
        order.
      </p>

      {!result ? (
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {error && (
            <div
              role="alert"
              className="rounded-(--radius-control) bg-red-50 p-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium">Order number</label>
            <div className="relative mt-2">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="e.g. 10482"
                className="min-h-12 w-full rounded-(--radius-control) border bg-background py-3 pr-3 pl-10 text-base"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium">Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              placeholder="The email you used at checkout"
              className="min-h-12 w-full rounded-(--radius-control) border bg-background px-4 py-3 text-base"
              required
            />
          </div>

          <button
            type="submit"
            disabled={pending}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-(--radius-control) bg-brand text-sm font-semibold text-brand-foreground disabled:opacity-60"
          >
            {pending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              'Track order'
            )}
          </button>
        </form>
      ) : (
        <div className="mt-8 space-y-4">
          <button
            onClick={() => {
              setResult(null)
              setOrderId('')
              setEmail('')
            }}
            className="inline-flex items-center gap-1 text-sm text-brand-ink"
          >
            <ArrowLeft className="size-4" /> Track another order
          </button>

          <div className="rounded-(--radius-card) border bg-card p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-ink">
                  Order #{result.number}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Placed on{' '}
                  {result.dateCreated
                    ? new Date(result.dateCreated).toLocaleDateString('en-EG', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : '—'}
                </p>
              </div>
              <span className="rounded-full bg-brand-muted px-3 py-1 text-sm font-medium text-brand-ink">
                {result.statusLabel}
              </span>
            </div>

            <OrderTimeline status={result.status} />

            <div className="mt-6 space-y-3 border-t pt-5">
              {result.items.map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="size-12 rounded-(--radius-control) object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-muted-foreground">Qty {item.quantity}</p>
                  </div>
                  <p className="font-semibold">
                    {parseFloat(item.total).toLocaleString('en-EG')} EGP
                  </p>
                </div>
              ))}
            </div>

            <dl className="mt-5 space-y-2 border-t pt-5 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Payment</dt>
                <dd className="font-medium">{result.paymentMethod}</dd>
              </div>
              <div className="flex justify-between text-base">
                <dt className="font-semibold">Total</dt>
                <dd className="font-semibold">
                  {parseFloat(result.total).toLocaleString('en-EG')} EGP
                </dd>
              </div>
            </dl>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/shop"
              className="inline-flex min-h-11 items-center rounded-(--radius-control) bg-brand px-5 text-sm font-semibold text-brand-foreground"
            >
              Continue shopping
            </Link>
            <Link
              href="/support"
              className="inline-flex min-h-11 items-center rounded-(--radius-control) border px-5 text-sm font-semibold"
            >
              Need help?
            </Link>
          </div>
        </div>
      )}
    </main>
  )
}

function OrderTimeline({ status }: { status: string }) {
  const currentStep = getStepIndex(status)
  const isCancelled = ['cancelled', 'refunded', 'failed'].includes(status)

  if (isCancelled) {
    return (
      <div className="mt-5 rounded-(--radius-control) bg-red-50 p-4 text-sm text-red-700">
        <p className="font-medium">This order has been {status}.</p>
        <p className="mt-1">Contact Shams support if you have questions.</p>
      </div>
    )
  }

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between">
        {STATUS_STEPS.map((step, i) => {
          const Icon = step.icon
          const isDone = i <= currentStep
          const isCurrent = i === currentStep

          return (
            <div key={step.key} className="flex flex-1 items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`flex size-8 items-center justify-center rounded-full ${
                    isDone
                      ? 'bg-brand text-brand-foreground'
                      : 'bg-muted text-muted-foreground'
                  } ${isCurrent ? 'ring-2 ring-brand ring-offset-2' : ''}`}
                >
                  <Icon className="size-4" />
                </div>
                <span
                  className={`mt-1.5 text-[11px] font-medium ${
                    isDone ? 'text-brand-ink' : 'text-muted-foreground'
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {i < STATUS_STEPS.length - 1 && (
                <div
                  className={`mx-1 h-0.5 flex-1 ${
                    i < currentStep ? 'bg-brand' : 'bg-muted'
                  }`}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
