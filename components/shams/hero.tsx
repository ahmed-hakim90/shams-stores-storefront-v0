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
    <section className="mx-auto max-w-[1400px] px-4 pt-5 sm:px-6">
      <div className="grid gap-4 lg:grid-cols-12">
        {/* Main feature */}
        <div className="relative overflow-hidden rounded-3xl bg-brand text-brand-foreground lg:col-span-8">
          <div
            aria-hidden
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                'radial-gradient(120% 120% at 85% 15%, rgba(255,255,255,0.18) 0%, transparent 55%)',
            }}
          />
          <div className="relative flex flex-col gap-6 p-7 sm:p-10 md:flex-row md:items-center">
            <div className="flex-1 space-y-5">
              <span className="inline-flex items-center gap-2 rounded-full bg-brand-foreground/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                New arrival · Shams exclusive
              </span>
              <div className="space-y-3">
                <h1 className="text-balance text-3xl font-semibold leading-[1.05] tracking-tight sm:text-4xl md:text-[2.75rem]">
                  {featured.brand} {featured.name}
                </h1>
                <p className="max-w-md text-pretty text-sm text-brand-foreground/80 sm:text-base">
                  61MP of full-frame resolution, {featured.configuration}. Built
                  for studio, wedding and commercial work — reserved for creators
                  who never crop twice.
                </p>
              </div>

              <div className="flex flex-wrap items-end gap-x-6 gap-y-2">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-semibold tracking-tight sm:text-3xl">
                      {formatMoney(featured.price)}
                    </span>
                    {featured.previousPrice && (
                      <span className="text-sm text-brand-foreground/60 line-through">
                        {formatMoney(featured.previousPrice)}
                      </span>
                    )}
                  </div>
                  {featured.installmentFrom && (
                    <p className="text-xs text-brand-foreground/70">
                      or {formatEgp(featured.installmentFrom)}/mo over 24 months
                    </p>
                  )}
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-foreground/15 px-2.5 py-1 text-xs font-medium">
                  <span className="size-1.5 rounded-full bg-emerald-300" />
                  In stock · ships today
                </span>
              </div>

              <div className="flex flex-wrap gap-3 pt-1">
                <Link
                  href={`/p/${featured.slug}`}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-foreground px-6 text-sm font-semibold text-brand transition-transform hover:-translate-y-0.5"
                >
                  Shop this camera <ArrowRight className="size-4" />
                </Link>
                <Link
                  href="/c/cameras"
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-brand-foreground/30 px-6 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand-foreground/10"
                >
                  Browse all cameras
                </Link>
              </div>
            </div>

            <div className="relative aspect-square w-full max-w-sm shrink-0 self-center md:w-2/5">
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
        <div className="flex flex-col gap-4 lg:col-span-4">
          {/* Deal card */}
          {deal && (
            <Link
              href={`/p/${deal.slug}`}
              className="group flex flex-1 items-center gap-4 overflow-hidden rounded-3xl border border-border bg-card p-5 transition-colors hover:border-brand/40"
            >
              <div className="relative size-24 shrink-0">
                <Image
                  src={deal.image || '/placeholder.svg'}
                  alt={deal.name}
                  fill
                  sizes="96px"
                  className="object-contain transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="min-w-0 space-y-1">
                <span className="inline-flex items-center gap-1 rounded bg-[color-mix(in_oklab,var(--color-sale)_12%,transparent)] px-1.5 py-0.5 text-[0.65rem] font-semibold uppercase text-sale">
                  <Tag className="size-3" /> Deal of the week
                </span>
                <p className="truncate text-sm font-medium text-foreground">
                  {deal.brand} {deal.name}
                </p>
                <p className="text-sm font-semibold text-foreground">
                  {formatMoney(deal.price)}{' '}
                  {deal.previousPrice && (
                    <span className="text-xs font-normal text-muted-foreground line-through">
                      {formatMoney(deal.previousPrice)}
                    </span>
                  )}
                </p>
                <StockStatus status={deal.stock} />
              </div>
            </Link>
          )}

          {/* Workflow entry */}
          <Link
            href="#workflows"
            className="group relative flex flex-1 flex-col justify-between overflow-hidden rounded-3xl border border-border bg-accent p-6"
          >
            <div className="space-y-1.5">
              <Layers className="size-6 text-brand" />
              <p className="text-lg font-semibold tracking-tight text-foreground">
                Build a complete setup
              </p>
              <p className="text-sm text-muted-foreground">
                Tell us what you create — we&apos;ll match the camera, glass,
                audio and support that work together.
              </p>
            </div>
            <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand">
              Start with your workflow
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        </div>
      </div>

      {/* Trust strip */}
      <div className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-4">
        {[
          { icon: Truck, title: 'Nationwide delivery', sub: 'Free over EGP 5,000' },
          { icon: Tag, title: 'Installments', sub: 'Up to 24 months' },
          { icon: Layers, title: 'Trade-in & used', sub: 'Certified pre-owned' },
          { icon: ArrowRight, title: 'Expert setup', sub: 'Talk to a specialist' },
        ].map((item) => (
          <div key={item.title} className="flex items-center gap-3 bg-card px-4 py-3.5">
            <item.icon className="size-5 shrink-0 text-brand" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">{item.title}</p>
              <p className="truncate text-xs text-muted-foreground">{item.sub}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
