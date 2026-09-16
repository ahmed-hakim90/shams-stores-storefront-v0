import Link from 'next/link'
import { ArrowRight, Headset, PackageCheck, Repeat } from 'lucide-react'
import { BranchAvailability } from '@/components/shams/product'

const perks = [
  { icon: PackageCheck, label: 'Reserve online, collect in-store the same day' },
  { icon: Headset, label: 'Hands-on demos with working photographers' },
  { icon: Repeat, label: 'Trade in your old gear against new kit' },
]

export function StoreSection() {
  return (
    <section className="mobile-store-section mx-auto max-w-[1440px] px-4 py-12 sm:px-6 sm:py-16">
      <div className="grid gap-8 overflow-hidden rounded-(--radius-editorial) border border-border bg-card p-6 sm:p-10 lg:grid-cols-2 lg:items-center">
        <div className="space-y-6">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-ink">
              More than a website
            </p>
            <h2 className="text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-[1.9rem]">
              Buy online, or visit the people who shoot what they sell
            </h2>
            <p className="max-w-lg text-pretty text-sm text-muted-foreground">
              Every Shams branch is staffed by working photographers and
              filmmakers. Check live stock, handle the gear, and walk out ready
              to shoot — or have it delivered anywhere in Egypt.
            </p>
          </div>

          <ul className="space-y-3">
            {perks.map((perk) => (
              <li key={perk.label} className="flex items-center gap-3 text-sm text-foreground">
                <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-(--radius-control) bg-brand-muted text-brand-ink">
                  <perk.icon className="size-4.5" />
                </span>
                {perk.label}
              </li>
            ))}
          </ul>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href="/branches"
              className="inline-flex h-11 items-center gap-2 rounded-(--radius-control) bg-brand px-5 text-sm font-semibold text-brand-foreground transition-transform duration-fast hover:-translate-y-0.5"
            >
              Find a branch <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/support"
              className="inline-flex h-11 items-center rounded-(--radius-control) border border-border px-5 text-sm font-semibold text-foreground transition-colors duration-fast hover:border-brand hover:text-brand-ink"
            >
              Talk to a specialist
            </Link>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Live branch availability
          </p>
          <BranchAvailability />
        </div>
      </div>
    </section>
  )
}
