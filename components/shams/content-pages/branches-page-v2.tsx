import Link from 'next/link'
import { PageHero, StoreLocationPanel } from '@/components/shams/patterns'
import {
  MapPin,
  Eye,
  Users,
  Sparkles,
  ArrowRight,
} from 'lucide-react'

const branches = [
  {
    name: 'Downtown',
    address: '5 Sherif Street',
    landmark: 'Downtown',
    city: 'Cairo',
    phones: [
      { label: '022 390 1870', href: 'tel:0223901870' },
      { label: '022 390 1860', href: 'tel:0223901860' },
      { label: '010 1133 1666', href: 'tel:01011331666' },
    ],
    hours: 'Saturday – Thursday · 10 AM – 10 PM',
    closed: 'Friday',
  },
  {
    name: 'Heliopolis',
    address: '24 Omar Ibn El-Khattab St',
    landmark: 'Ismailia Square, Heliopolis',
    city: 'Cairo',
    phones: [
      { label: '022 633 7800', href: 'tel:0226337800' },
      { label: '010 2339 9966', href: 'tel:01023399966' },
    ],
    hours: 'Saturday – Thursday · 10 AM – 10 PM',
    closed: 'Friday',
  },
]

const EXPECTATIONS = [
  {
    icon: Eye,
    title: 'Hands-on demo',
    body: 'Hold the gear, test the ergonomics and try the controls before you buy.',
  },
  {
    icon: Users,
    title: 'Expert advice',
    body: 'Our team are working professionals — ask anything about specs, compatibility or setups.',
  },
  {
    icon: Sparkles,
    title: 'Same-day pickup',
    body: 'If it is in stock, walk out with it the same day. No waiting for shipping.',
  },
]

export function BranchesPageV2() {
  return (
    <main className="pb-[calc(2rem+var(--mobile-bottom-nav-height))] sm:pb-0">
      <PageHero
        eyebrow="Our showrooms"
        eyebrowIcon={MapPin}
        title="Visit Shams Stores"
        description="Two showrooms in Cairo where you can explore gear hands-on, compare options side by side and get expert advice from our team."
      />

      <section className="shams-container py-10 sm:py-14">
        <div className="grid gap-6 lg:grid-cols-2">
          {branches.map((branch) => (
            <StoreLocationPanel key={branch.name} {...branch} />
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-accent/30">
        <div className="shams-container py-14 sm:py-16">
          <h2 className="mb-8 text-lg font-semibold tracking-tight">
            What to expect when you visit
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {EXPECTATIONS.map((item) => (
              <div
                key={item.title}
                className="flex flex-col gap-3 rounded-(--radius-card) border border-border bg-card p-5"
              >
                <span className="inline-flex size-9 items-center justify-center rounded-(--radius-control) bg-brand-muted text-brand-ink">
                  <item.icon className="size-4" />
                </span>
                <h3 className="font-semibold tracking-tight text-foreground">
                  {item.title}
                </h3>
                <p className="text-sm leading-6 text-muted-foreground">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-8">
            <Link
              href="/contact"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-ink hover:text-brand"
            >
              Get in touch <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
