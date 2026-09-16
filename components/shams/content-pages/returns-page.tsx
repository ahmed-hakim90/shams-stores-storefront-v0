import Link from 'next/link'
import { PageHero, ProcessTimeline } from '@/components/shams/patterns'
import {
  RotateCcw,
  MessageCircle,
  ClipboardCheck,
  Package,
  Truck,
  CircleCheck,
  ArrowRight,
} from 'lucide-react'

const RETURN_STEPS = [
  {
    icon: MessageCircle,
    title: 'Contact us',
    description:
      'Reach out by phone or WhatsApp to let us know you want to return or exchange an item.',
  },
  {
    icon: ClipboardCheck,
    title: 'Return authorization',
    description:
      'We will confirm eligibility and provide return instructions.',
  },
  {
    icon: Package,
    title: 'Package the item',
    description:
      'Item must be unopened, boxed and in original condition with all packaging and accessories.',
    detail: 'Custom-built or special-order items are non-returnable unless defective.',
  },
  {
    icon: Truck,
    title: 'Ship or drop off',
    description:
      'Return via our delivery partner or drop off at one of our showrooms.',
  },
  {
    icon: CircleCheck,
    title: 'Refund or exchange processed',
    description:
      'Once received and inspected, we process your refund or ship the exchange item.',
  },
]

export function ReturnsPage() {
  return (
    <main className="pb-[calc(2rem+var(--mobile-bottom-nav-height))] sm:pb-0">
      <PageHero
        eyebrow="Returns"
        eyebrowIcon={RotateCcw}
        title="Returns & exchanges"
        description="How to return or exchange gear — the process, eligibility and what to expect."
        compact
      />

      <section className="shams-container py-10 sm:py-14">
        <div className="grid gap-10 lg:grid-cols-[1fr_18rem]">
          <div>
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-ink">
              Return process
            </p>
            <ProcessTimeline steps={RETURN_STEPS} />
          </div>

          <aside className="space-y-6">
            <div className="rounded-(--radius-card) border border-border bg-card p-5">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-ink">
                Eligibility
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand" />
                  Within 14 days of delivery
                </li>
                <li className="flex gap-2">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand" />
                  Unopened and boxed
                </li>
                <li className="flex gap-2">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand" />
                  Original condition with all accessories
                </li>
                <li className="flex gap-2">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-border" />
                  Custom/special-order items: non-returnable unless defective
                </li>
              </ul>
            </div>

            <div className="rounded-(--radius-card) border border-brand/30 bg-brand-muted p-5">
              <p className="text-sm font-semibold text-brand-ink">
                Start a return
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Contact us by WhatsApp to initiate your return or exchange.
              </p>
              <a
                href="https://wa.me/201011331666"
                className="shams-button mt-3"
              >
                WhatsApp us
              </a>
            </div>

            <div className="rounded-(--radius-card) border border-border bg-card p-5">
              <p className="mb-2 text-sm font-semibold text-foreground">
                Full policy details
              </p>
              <p className="text-xs text-muted-foreground">
                Read the complete returns section in our terms & conditions.
              </p>
              <Link
                href="/terms#returns"
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-brand-ink hover:text-brand"
              >
                View terms <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </main>
  )
}
