import Link from 'next/link'
import { ArrowRight, Tag } from 'lucide-react'
import { commerce } from '@/lib/commerce'
import { ProductRail } from '@/components/shams/product'

export function DealSection() {
  const deals = commerce.collections.get('deals')?.products ?? []

  return (
    <section className="border-y border-border bg-[color-mix(in_oklab,var(--color-sale)_5%,var(--background))]">
      <div className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 sm:py-14">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-1.5">
            <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-sale">
              <Tag className="size-3.5" /> Limited-time deals
            </p>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-[1.7rem]">
              Deals worth the shot
            </h2>
            <p className="max-w-xl text-sm text-muted-foreground">
              Authorized stock, honest markdowns. Prices hold while supplies last
              across all Shams branches.
            </p>
          </div>
          <Link
            href="/deals"
            className="group hidden shrink-0 items-center gap-1.5 rounded-(--radius-control) bg-sale px-4 py-2.5 text-sm font-semibold text-on-dark transition-transform duration-fast hover:-translate-y-0.5 sm:inline-flex"
          >
            Shop all deals
            <ArrowRight className="size-4 transition-transform duration-fast group-hover:translate-x-0.5" />
          </Link>
        </div>
        <div className="mt-8">
          <ProductRail products={deals} />
        </div>
      </div>
    </section>
  )
}
