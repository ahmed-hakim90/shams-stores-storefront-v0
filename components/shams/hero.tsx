import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Layers, Tag, Truck } from 'lucide-react'
import { commerce, formatMoney, formatEgp } from '@/lib/commerce'
import { StockStatus } from './stock-status'

export function Hero() {
  const featured = commerce.products.byId('p-hero')
  const deal = commerce.products.byId('p-mic')
  if (!featured) return null

  return (
    <section className="mx-auto max-w-[1440px] px-4 pt-3 sm:px-6 sm:pt-4">
      <div className="grid gap-3 lg:grid-cols-12">
        {/* Main feature */}
        <div className="relative overflow-hidden border border-border bg-brand text-brand-foreground lg:col-span-8">
          <div
            aria-hidden
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                'radial-gradient(120% 120% at 85% 15%, rgba(255,255,255,0.18) 0%, transparent 55%)',
            }}
          />
          <div className="relative flex flex-col gap-4 p-5 sm:p-7 md:flex-row md:items-center">
            <div className="flex-1 space-y-3">
              <span className="inline-flex items-center gap-1.5 border border-brand-foreground/25 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
                New arrival · Shams exclusive
              </span>
              <div className="space-y-2">
                <h1 className="text-balance text-2xl font-semibold leading-[1.05] tracking-tight sm:text-3xl md:text-[2.25rem]">
                  {featured.brand} {featured.name}
                </h1>
                <p className="max-w-md text-pretty text-xs text-brand-foreground/80 sm:text-sm">
                  61MP of full-frame resolution, {featured.configuration}. Built
                  for studio, wedding and commercial work — reserved for creators
                  who never crop twice.
                </p>
              </div>

              <div className="flex flex-wrap items-end gap-x-5 gap-y-2">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-semibold tracking-tight sm:text-2xl">
                      {formatMoney(featured.price)}
                    </span>
                    {featured.previousPrice && (
                      <span className="text-xs text-brand-foreground/60 line-through">
                        {formatMoney(featured.previousPrice)}
                      </span>
                    )}
                  </div>
                  {featured.installmentFrom && (
                    <p className="text-[11px] text-brand-foreground/70">
                      or {formatEgp(featured.installmentFrom)}/mo over 24 months
                    </p>
                  )}
                </div>
                <span className="inline-flex items-center gap-1 border border-brand-foreground/20 px-2 py-0.5 text-[10px] font-medium">
                  <span className="size-1 rounded-full bg-emerald-300" />
                  In stock · ships today
                </span>
              </div>

              <div className="flex flex-wrap gap-2 pt-0.5">
                <Link
                  href={`/p/${featured.slug}`}
                  className="inline-flex h-9 items-center justify-center gap-1.5 border border-brand-foreground bg-brand-foreground px-5 text-xs font-semibold text-brand"
                >
                  Shop this camera <ArrowRight className="size-3.5" />
                </Link>
                <Link
                  href="/c/cameras"
                  className="inline-flex h-9 items-center justify-center border border-brand-foreground/30 px-5 text-xs font-semibold text-brand-foreground"
                >
                  Browse all cameras
                </Link>
              </div>
            </div>

            <div className="relative aspect-square w-full max-w-xs shrink-0 self-center md:w-2/5">
              <Image
                src={featured.image || '/placeholder.svg'}
                alt={`${featured.brand} ${featured.name}`}
                fill
                priority
                sizes="(max-width: 768px) 80vw, 420px"
                className="object-contain drop-shadow-2xl"
              />
            </div>
          </div>
        </div>

        {/* Side rail */}
        <div className="flex flex-col gap-3 lg:col-span-4">
          {/* Deal card */}
          {deal && (
            <Link
              href={`/p/${deal.slug}`}
              className="group flex flex-1 items-center gap-3 overflow-hidden border border-border bg-card p-4 transition-colors hover:border-brand/40"
            >
              <div className="relative size-20 shrink-0">
                <Image
                  src={deal.image || '/placeholder.svg'}
                  alt={deal.name}
                  fill
                  sizes="80px"
                  className="object-contain transition-transform duration-standard group-hover:scale-[1.04]"
                />
              </div>
              <div className="min-w-0 space-y-1">
                <span className="inline-flex items-center gap-1 bg-[color-mix(in_oklab,var(--color-sale)_12%,transparent)] px-1.5 py-0.5 text-[10px] font-semibold uppercase text-sale">
                  <Tag className="size-2.5" /> Deal of the week
                </span>
                <p className="truncate text-xs font-medium text-foreground">
                  {deal.brand} {deal.name}
                </p>
                <p className="text-xs font-semibold text-foreground">
                  {formatMoney(deal.price)}{' '}
                  {deal.previousPrice && (
                    <span className="text-[11px] font-normal text-muted-foreground line-through">
                      {formatMoney(deal.previousPrice)}
                    </span>
                  )}
                </p>
                <StockStatus status={deal.stock} compact />
              </div>
            </Link>
          )}

          {/* Workflow entry */}
          <Link
            href="#workflows"
            className="group relative flex flex-1 flex-col justify-between overflow-hidden border border-border bg-accent p-4 sm:p-5"
          >
            <div className="space-y-1">
              <Layers className="size-5 text-brand-ink" />
              <p className="text-base font-semibold tracking-tight text-foreground">
                Build a complete setup
              </p>
              <p className="text-xs text-muted-foreground">
                Tell us what you create — we&apos;ll match the camera, glass,
                audio and support that work together.
              </p>
            </div>
            <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-brand-ink">
              Start with your workflow
              <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        </div>
      </div>

      {/* Trust strip */}
      <div className="mt-3 grid grid-cols-2 gap-px border border-border bg-border md:grid-cols-4">
        {[
          { icon: Truck, title: 'Nationwide delivery', sub: 'Free over EGP 5,000' },
          { icon: Tag, title: 'Installments', sub: 'Up to 24 months' },
          { icon: Layers, title: 'Trade-in & used', sub: 'Certified pre-owned' },
          { icon: ArrowRight, title: 'Expert setup', sub: 'Talk to a specialist' },
        ].map((item) => (
          <div key={item.title} className="flex items-center gap-2.5 bg-card px-3 py-2.5">
            <item.icon className="size-4 shrink-0 text-brand-ink" />
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-foreground">{item.title}</p>
              <p className="truncate text-[11px] text-muted-foreground">{item.sub}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
