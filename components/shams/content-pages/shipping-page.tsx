import Link from 'next/link'
import { PageHero, ProcessTimeline } from '@/components/shams/patterns'
import {
  Truck,
  PackageCheck,
  ClipboardList,
  Route,
  CircleCheck,
  MapPin,
  ArrowRight,
} from 'lucide-react'

const DELIVERY_STEPS = [
  {
    icon: ClipboardList,
    title: 'Order placed',
    description:
      'Orders are processed Saturday through Thursday, 10 AM – 10 PM.',
    detail: 'Orders placed outside business hours are processed the next business day.',
  },
  {
    icon: PackageCheck,
    title: 'Processing',
    description:
      'We pick and pack your items at our Cairo warehouse.',
  },
  {
    icon: Truck,
    title: 'Dispatched',
    description:
      'Your order is handed to our delivery partner and you receive a tracking notification.',
  },
  {
    icon: Route,
    title: 'In transit',
    description:
      'Delivery times depend on your location — see estimates below.',
  },
  {
    icon: CircleCheck,
    title: 'Delivered',
    description:
      'Your order arrives. Inspect items on delivery and report any damage immediately.',
  },
]

export function ShippingPage() {
  return (
    <main className="pb-[calc(2rem+var(--mobile-bottom-nav-height))] sm:pb-0">
      <PageHero
        eyebrow="Delivery"
        eyebrowIcon={Truck}
        title="Shipping & delivery"
        description="How we get your gear from our warehouse to your door — delivery times, costs and tracking."
        compact
      />

      <section className="shams-container py-10 sm:py-14">
        <div className="grid gap-10 lg:grid-cols-[1fr_18rem]">
          <div>
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-ink">
              Your delivery journey
            </p>
            <ProcessTimeline steps={DELIVERY_STEPS} />
          </div>

          <aside className="space-y-6">
            <div className="rounded-(--radius-card) border border-border bg-card p-5">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-ink">
                Delivery estimates
              </p>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between border-b border-border pb-3">
                  <span className="text-muted-foreground">Cairo</span>
                  <span className="font-medium">1–3 business days</span>
                </div>
                <div className="flex justify-between border-b border-border pb-3">
                  <span className="text-muted-foreground">
                    Other governorates
                  </span>
                  <span className="font-medium">3–5 business days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Free delivery</span>
                  <span className="font-medium">Over EGP 5,000</span>
                </div>
              </div>
            </div>

            <div className="rounded-(--radius-card) border border-border bg-card p-5">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-ink">
                Store pickup
              </p>
              <p className="text-sm leading-6 text-muted-foreground">
                Order online and pick up from our Downtown or Heliopolis
                showroom the same day if the item is in stock.
              </p>
              <Link
                href="/branches"
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-brand-ink hover:text-brand"
              >
                See branches <ArrowRight className="size-3.5" />
              </Link>
            </div>

            <div className="rounded-(--radius-card) border border-brand/30 bg-brand-muted p-5">
              <div className="flex items-center gap-2">
                <MapPin className="size-4 text-brand-ink" />
                <p className="text-sm font-semibold text-brand-ink">
                  Track your order
                </p>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Use your order number and email to check real-time status.
              </p>
              <Link
                href="/track-order"
                className="shams-button mt-3"
              >
                Track order
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </main>
  )
}
