import Link from 'next/link'
import { PageHero, SupportHub } from '@/components/shams/patterns'
import { Headphones, Phone, MessageCircle, Clock } from 'lucide-react'

export function HelpCenterPage() {
  return (
    <main className="pb-[calc(2rem+var(--mobile-bottom-nav-height))] sm:pb-0">
      <PageHero
        eyebrow="Help Center"
        eyebrowIcon={Headphones}
        title="How can we help?"
        description="Find answers, track orders, learn about shipping and returns, or get in touch with our team."
        compact
      />

      <section className="shams-container py-10 sm:py-14">
        <SupportHub />
      </section>

      <section className="border-t border-border bg-accent/30">
        <div className="shams-container py-12 sm:py-14">
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="flex items-center gap-4">
              <span className="inline-flex size-11 items-center justify-center rounded-(--radius-control) bg-brand-muted text-brand-ink">
                <Phone className="size-5" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Call
                </p>
                <a
                  href="tel:0223901870"
                  className="text-sm font-semibold text-foreground hover:text-brand"
                >
                  022 390 1870
                </a>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="inline-flex size-11 items-center justify-center rounded-(--radius-control) bg-brand-muted text-brand-ink">
                <MessageCircle className="size-5" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  WhatsApp
                </p>
                <a
                  href="https://wa.me/201011331666"
                  className="text-sm font-semibold text-foreground hover:text-brand"
                >
                  Chat with us
                </a>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="inline-flex size-11 items-center justify-center rounded-(--radius-control) bg-brand-muted text-brand-ink">
                <Clock className="size-5" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Hours
                </p>
                <p className="text-sm font-semibold text-foreground">
                  Sat–Thu · 10 AM – 10 PM
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
