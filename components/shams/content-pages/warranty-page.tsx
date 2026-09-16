import Link from 'next/link'
import { ShieldCheck, ArrowRight } from 'lucide-react'

export function WarrantyPage() {
  return (
    <main className="pb-[calc(2rem+var(--mobile-bottom-nav-height))] sm:pb-0">
      <div className="border-b border-border bg-surface">
        <div className="shams-container py-8 sm:py-10">
          <div className="flex items-center gap-3">
            <span className="inline-flex size-10 items-center justify-center rounded-(--radius-control) bg-brand-muted text-brand-ink">
              <ShieldCheck className="size-5" />
            </span>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                Warranty & product support
              </h1>
              <p className="text-sm text-muted-foreground">
                Coverage, claims and repair support for your gear
              </p>
            </div>
          </div>
        </div>
      </div>

      <section className="shams-container py-10 sm:py-14">
        <div className="grid gap-10 lg:grid-cols-[1fr_18rem]">
          <div className="space-y-8">
            <div className="space-y-3">
              <h2 className="text-lg font-semibold tracking-tight text-foreground">
                Manufacturer warranty
              </h2>
              <p className="text-sm leading-7 text-muted-foreground">
                All products carry the manufacturer&apos;s warranty applicable
                in Egypt. Shams Stores provides additional support for warranty
                claims and repairs — we handle the process on your behalf so you
                do not have to deal with manufacturers directly.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-lg font-semibold tracking-tight text-foreground">
                What is covered
              </h2>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand" />
                  Manufacturing defects in materials and workmanship
                </li>
                <li className="flex gap-2">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand" />
                  Hardware failures under normal use
                </li>
                <li className="flex gap-2">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand" />
                  Support from Shams Stores for the full claims process
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h2 className="text-lg font-semibold tracking-tight text-foreground">
                What is not covered
              </h2>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-border" />
                  Damage caused by misuse or accidents
                </li>
                <li className="flex gap-2">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-border" />
                  Unauthorized modifications or repairs
                </li>
                <li className="flex gap-2">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-border" />
                  Normal wear and tear
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h2 className="text-lg font-semibold tracking-tight text-foreground">
                Proof of purchase
              </h2>
              <p className="text-sm leading-7 text-muted-foreground">
                Proof of purchase is required for all warranty service. Keep
                your order confirmation email or receipt. If you purchased from
                Shams Stores, we can look up your order with your email address
                or phone number.
              </p>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-(--radius-card) border border-brand/30 bg-brand-muted p-5">
              <p className="text-sm font-semibold text-brand-ink">
                File a warranty claim
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Contact us by WhatsApp with your order number and a description
                of the issue.
              </p>
              <a
                href="https://wa.me/201011331666"
                className="shams-button mt-3"
              >
                WhatsApp us
              </a>
            </div>

            <div className="rounded-(--radius-card) border border-border bg-card p-5">
              <p className="text-sm font-semibold text-foreground">
                Need repair help?
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Call our team for repair estimates and service options.
              </p>
              <a
                href="tel:0223901870"
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-brand-ink hover:text-brand"
              >
                022 390 1870 <ArrowRight className="size-3.5" />
              </a>
            </div>
          </aside>
        </div>
      </section>
    </main>
  )
}
