import Link from 'next/link'
import { CreditCard, ArrowRight } from 'lucide-react'

const METHODS = [
  {
    name: 'Visa',
    description: 'Credit and debit cards accepted at checkout and in-store.',
    badge: 'Online & in-store',
  },
  {
    name: 'Mastercard',
    description: 'Credit and debit cards accepted at checkout and in-store.',
    badge: 'Online & in-store',
  },
  {
    name: 'InstaPay',
    description: 'Instant bank transfer via the InstaPay app.',
    badge: 'Online',
  },
  {
    name: 'ValU',
    description: 'Buy now and pay in installments through ValU.',
    badge: 'Installments',
  },
  {
    name: 'Fawry',
    description: 'Pay cash at any Fawry payment location across Egypt.',
    badge: 'Cash',
  },
  {
    name: 'Cash on delivery',
    description: 'Pay in cash when your order is delivered to your door.',
    badge: 'COD',
  },
  {
    name: 'Bank installments',
    description:
      'Installment plans for up to 24 months through participating banks. Subject to eligibility.',
    badge: 'Up to 24 months',
  },
]

export function PaymentPage() {
  return (
    <main className="pb-[calc(2rem+var(--mobile-bottom-nav-height))] sm:pb-0">
      <div className="border-b border-border bg-surface">
        <div className="shams-container py-8 sm:py-10">
          <div className="flex items-center gap-3">
            <span className="inline-flex size-10 items-center justify-center rounded-(--radius-control) bg-brand-muted text-brand-ink">
              <CreditCard className="size-5" />
            </span>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                Payment & installments
              </h1>
              <p className="text-sm text-muted-foreground">
                All the ways you can pay at Shams Stores
              </p>
            </div>
          </div>
        </div>
      </div>

      <section className="shams-container py-10 sm:py-14">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {METHODS.map((method) => (
            <div
              key={method.name}
              className="flex flex-col gap-3 rounded-(--radius-card) border border-border bg-card p-5"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-semibold tracking-tight text-foreground">
                  {method.name}
                </h2>
                <span className="rounded-full bg-brand-muted px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-ink">
                  {method.badge}
                </span>
              </div>
              <p className="text-sm leading-6 text-muted-foreground">
                {method.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-(--radius-card) border border-brand/30 bg-brand-muted p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-brand-ink">
                Questions about payment or installments?
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Our team can help with eligibility, current offers and bank
                options.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a href="tel:0223901870" className="shams-button">
                Call us
              </a>
              <Link
                href="/contact"
                className="inline-flex min-h-9 items-center gap-2 rounded-(--radius-control) border border-brand/30 px-4 text-xs font-medium text-brand-ink hover:bg-brand-muted"
              >
                All contact options <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
