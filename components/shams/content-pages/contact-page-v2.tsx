import Link from 'next/link'
import { PageHero, ContactReasonSelector } from '@/components/shams/patterns'
import {
  MessageCircle,
  Phone,
  Clock,
  Navigation,
  Store,
  Headphones,
  Heart,
} from 'lucide-react'

export function ContactPageV2() {
  return (
    <main className="pb-[calc(2rem+var(--mobile-bottom-nav-height))] sm:pb-0">
      <PageHero
        eyebrow="Get in touch"
        eyebrowIcon={MessageCircle}
        title="We are here to help"
        description="Have a question about a product, an order or our services? Select your reason below to find the fastest way to reach us."
        compact
      />

      <section className="shams-container py-10 sm:py-14">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-ink">
          What do you need help with?
        </p>
        <ContactReasonSelector />
      </section>

      <section className="border-t border-border bg-surface">
        <div className="shams-container py-10 sm:py-14">
          <p className="mb-6 text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-ink">
            All channels
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-4 rounded-(--radius-card) border border-border bg-card p-6">
              <span className="inline-flex size-11 items-center justify-center rounded-(--radius-control) bg-brand-muted text-brand-ink">
                <Phone className="size-5" />
              </span>
              <div className="space-y-1">
                <h2 className="font-semibold tracking-tight text-foreground">
                  Call us
                </h2>
                <p className="text-xs text-muted-foreground">
                  Speak directly with our team
                </p>
              </div>
              <div className="mt-auto space-y-2 text-sm">
                <a
                  href="tel:0223901870"
                  className="flex items-center gap-2 text-foreground transition-colors hover:text-brand"
                >
                  <Phone className="size-3.5 text-muted-foreground" />
                  022 390 1870
                </a>
                <a
                  href="tel:01011331666"
                  className="flex items-center gap-2 text-foreground transition-colors hover:text-brand"
                >
                  <Phone className="size-3.5 text-muted-foreground" />
                  010 1133 1666
                </a>
              </div>
            </div>

            <div className="flex flex-col gap-4 rounded-(--radius-card) border border-border bg-card p-6">
              <span className="inline-flex size-11 items-center justify-center rounded-(--radius-control) bg-brand-muted text-brand-ink">
                <MessageCircle className="size-5" />
              </span>
              <div className="space-y-1">
                <h2 className="font-semibold tracking-tight text-foreground">
                  WhatsApp
                </h2>
                <p className="text-xs text-muted-foreground">
                  Quick questions, product photos, order updates
                </p>
              </div>
              <div className="mt-auto">
                <a
                  href="https://wa.me/201011331666"
                  className="inline-flex items-center gap-2 text-sm font-medium text-foreground transition-colors hover:text-brand"
                >
                  <MessageCircle className="size-3.5 text-muted-foreground" />
                  Chat with us →
                </a>
              </div>
            </div>

            <div className="flex flex-col gap-4 rounded-(--radius-card) border border-border bg-card p-6">
              <span className="inline-flex size-11 items-center justify-center rounded-(--radius-control) bg-brand-muted text-brand-ink">
                <Clock className="size-5" />
              </span>
              <div className="space-y-1">
                <h2 className="font-semibold tracking-tight text-foreground">
                  Working hours
                </h2>
                <p className="text-xs text-muted-foreground">
                  Visit us or call during these times
                </p>
              </div>
              <div className="mt-auto space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sat – Thu</span>
                  <span className="font-medium">10 AM – 10 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Friday</span>
                  <span className="font-medium text-muted-foreground">
                    Closed
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-accent/30">
        <div className="shams-container py-10 sm:py-14">
          <h2 className="mb-6 text-lg font-semibold tracking-tight">
            Looking for something specific?
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: 'Track your order',
                desc: 'Check delivery status',
                href: '/track-order',
                icon: Navigation,
              },
              {
                title: 'Visit our stores',
                desc: 'Downtown & Heliopolis',
                href: '/branches',
                icon: Store,
              },
              {
                title: 'Expert advice',
                desc: 'Talk to a specialist',
                href: '/support',
                icon: Headphones,
              },
              {
                title: 'Saved gear',
                desc: 'Your wishlist',
                href: '/wishlist',
                icon: Heart,
              },
            ].map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="group flex items-start gap-3 rounded-(--radius-card) border border-border bg-card p-5 transition-colors hover:border-brand/40"
              >
                <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-(--radius-control) bg-brand-muted text-brand-ink transition-colors group-hover:bg-brand group-hover:text-brand-foreground">
                  <item.icon className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    {item.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
