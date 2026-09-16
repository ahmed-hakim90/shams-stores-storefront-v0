import Link from 'next/link'
import { PageHero } from '@/components/shams/patterns'
import {
  Camera,
  Film,
  Mic,
  Lightbulb,
  Award,
  Users,
  ShieldCheck,
  Target,
  Heart,
  Eye,
  ArrowRight,
  Sparkles,
} from 'lucide-react'

const DOMAINS = [
  { icon: Camera, label: 'Photography', sub: 'Stills & medium format' },
  { icon: Film, label: 'Cinema', sub: 'Production & post' },
  { icon: Mic, label: 'Audio', sub: 'Studio & field recording' },
  { icon: Lightbulb, label: 'Lighting', sub: 'Strobe, LED & modifiers' },
]

const VALUES = [
  {
    icon: Award,
    title: 'Genuine gear, always',
    body: 'Authorized reseller for every brand we carry. No grey imports — only products sourced through official channels with full local warranty.',
  },
  {
    icon: Users,
    title: 'Expert guidance',
    body: 'Our team are working professionals. We help you choose the right setup for your workflow, not just the most expensive option.',
  },
  {
    icon: ShieldCheck,
    title: 'After-sales support',
    body: 'Our relationship does not end at the sale. Warranty service, repairs and technical advice — we keep your gear running at its best.',
  },
  {
    icon: Target,
    title: 'Curated selection',
    body: 'We carry what we use. Every camera, lens and accessory in our catalog is tested by our team and recommended with confidence.',
  },
  {
    icon: Heart,
    title: 'Creator community',
    body: 'From workshops to trade-in programs, we invest in the Egyptian creator community because we are part of it.',
  },
  {
    icon: Eye,
    title: 'Hands-on experience',
    body: 'Visit our showrooms to hold the gear, test the feel and compare options side by side before you commit.',
  },
]

const BRANDS = [
  'Canon',
  'Sony',
  'Fujifilm',
  'Nikon',
  'DJI',
  'Rode',
  'Godox',
  'Profoto',
  'Manfrotto',
  'Peak Design',
  'Atomos',
  'Blackmagic Design',
  'Sennheiser',
  'Tilta',
  'SmallRig',
]

export function AboutPageV2() {
  return (
    <main className="pb-[calc(2rem+var(--mobile-bottom-nav-height))] sm:pb-0">
      <PageHero
        eyebrow="Our story"
        eyebrowIcon={Sparkles}
        title="For the image makers, storytellers and creators"
        description="Shams Stores is Egypt's trusted destination for professional photography, cinema and creator equipment — helping you find the right tools for your next idea since day one."
      />

      <section className="shams-container py-14 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="space-y-5">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Built by photographers, for photographers
            </h2>
            <div className="space-y-4 text-sm leading-7 text-muted-foreground">
              <p>
                Shams Stores started with a simple belief: every creator
                deserves access to professional gear and expert guidance. We are
                not just a store — we are working photographers, cinematographers
                and audio engineers who understand what it takes to make great
                content.
              </p>
              <p>
                That is why every product in our catalog is hand-selected by our
                team. We test the gear, we use it on real shoots, and we only
                carry what we would put our own name behind. From your first
                camera to a complete studio setup, we are with you every step of
                the way.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {DOMAINS.map((item) => (
              <div
                key={item.label}
                className="flex flex-col gap-2.5 rounded-(--radius-card) border border-border bg-card p-5"
              >
                <span className="inline-flex size-10 items-center justify-center rounded-(--radius-control) bg-brand-muted text-brand-ink">
                  <item.icon className="size-5" />
                </span>
                <p className="font-semibold tracking-tight text-foreground">
                  {item.label}
                </p>
                <p className="text-xs text-muted-foreground">{item.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-accent/30">
        <div className="shams-container py-14 sm:py-20">
          <div className="mb-10 max-w-xl space-y-3">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              What we stand for
            </h2>
            <p className="text-sm leading-6 text-muted-foreground">
              The principles that guide every decision we make — from the brands
              we carry to the way we serve you.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {VALUES.map((item) => (
              <div
                key={item.title}
                className="flex flex-col gap-3 rounded-(--radius-card) border border-border bg-card p-6"
              >
                <span className="inline-flex size-10 items-center justify-center rounded-(--radius-control) bg-brand-muted text-brand-ink">
                  <item.icon className="size-5" />
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
        </div>
      </section>

      <section className="shams-container py-14 sm:py-20">
        <div className="mb-10 max-w-xl space-y-3">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Brands we trust
          </h2>
          <p className="text-sm leading-6 text-muted-foreground">
            We partner with the world&apos;s leading manufacturers to bring you
            the best in professional imaging and audio.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {BRANDS.map((brand) => (
            <span
              key={brand}
              className="inline-flex items-center rounded-(--radius-control) border border-border bg-card px-4 py-2 text-sm font-medium text-foreground"
            >
              {brand}
            </span>
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-accent/30">
        <div className="shams-container py-14 sm:py-16">
          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-lg space-y-2">
              <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                Ready to explore?
              </h2>
              <p className="text-sm text-muted-foreground">
                Visit our showrooms or get in touch — our team is here to help
                you find the right gear.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/branches" className="shams-button">
                Visit our stores <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex min-h-11 items-center rounded-(--radius-control) border border-brand/30 px-5 text-sm font-medium text-brand-ink hover:bg-brand-muted"
              >
                Get in touch
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
