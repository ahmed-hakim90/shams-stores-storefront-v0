import Link from 'next/link'
import {
  MapPin,
  Phone,
  Clock,
  MessageCircle,
  Mail,
  Camera,
  Film,
  Mic,
  Lightbulb,
  Users,
  Award,
  ShieldCheck,
  Headphones,
  ArrowRight,
  Navigation,
  Store,
  Sparkles,
  Heart,
  Target,
  Eye,
} from 'lucide-react'

const branches = [
  {
    name: 'Downtown',
    address: '5 ElBatal Ahmed Abdel Aziz St',
    landmark: 'off Sabry Abo Alam St',
    city: 'Cairo',
    phones: [
      { label: '022 392 9204', href: 'tel:0223929204' },
      { label: '010 2000 1604', href: 'tel:01020001604' },
      { label: '022 393 7244', href: 'tel:0223937244' },
    ],
    hours: 'Saturday – Thursday · 10 AM – 10 PM',
    closed: 'Friday',
  },
  {
    name: 'Heliopolis',
    address: '24 Omar Ebn El-Khattab St',
    landmark: 'Ismailia Square',
    city: 'Cairo',
    phones: [
      { label: '022 633 7800', href: 'tel:0226337800' },
      { label: '010 2339 9966', href: 'tel:01023399966' },
      { label: '022 633 8070', href: 'tel:0226338070' },
    ],
    hours: 'Saturday – Thursday · 10 AM – 10 PM',
    closed: 'Friday',
  },
]

export function AboutPage() {
  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden bg-foreground text-white">
        <div
          aria-hidden
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'radial-gradient(120% 100% at 80% 20%, rgba(255,255,255,0.12) 0%, transparent 50%), radial-gradient(80% 80% at 10% 80%, rgba(255,165,0,0.08) 0%, transparent 50%)',
          }}
        />
        <div className="shams-container relative py-16 sm:py-24">
          <div className="max-w-2xl space-y-5">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
              <Sparkles className="size-3.5 text-orange-300" />
              Our story
            </span>
            <h1 className="text-balance text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
              For the image makers, storytellers and creators
            </h1>
            <p className="max-w-lg text-pretty text-base leading-7 text-white/70">
              Shams Stores is Egypt&apos;s trusted destination for professional
              photography, cinema and creator equipment — helping you find the
              right tools for your next idea since day one.
            </p>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="shams-container py-14 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="space-y-5">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Built by photographers, for photographers
            </h2>
            <div className="space-y-4 text-sm leading-7 text-muted-foreground">
              <p>
                Shams Stores started with a simple belief: every creator deserves
                access to professional gear and expert guidance. We are not just
                a store — we are working photographers, cinematographers and
                audio engineers who understand what it takes to make great
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
            {[
              { icon: Camera, label: 'Photography', sub: 'Stills & medium format' },
              { icon: Film, label: 'Cinema', sub: 'Production & post' },
              { icon: Mic, label: 'Audio', sub: 'Studio & field recording' },
              { icon: Lightbulb, label: 'Lighting', sub: 'Strobe, LED & modifiers' },
            ].map((item) => (
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

      {/* Values */}
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
            {[
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
            ].map((item) => (
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

      {/* Brands */}
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
          {[
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
          ].map((brand) => (
            <span
              key={brand}
              className="inline-flex items-center rounded-(--radius-control) border border-border bg-card px-4 py-2 text-sm font-medium text-foreground"
            >
              {brand}
            </span>
          ))}
        </div>
      </section>

      {/* CTA */}
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

export function ContactPage() {
  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden bg-foreground text-white">
        <div
          aria-hidden
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'radial-gradient(120% 100% at 80% 20%, rgba(255,255,255,0.12) 0%, transparent 50%)',
          }}
        />
        <div className="shams-container relative py-16 sm:py-20">
          <div className="max-w-2xl space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
              <MessageCircle className="size-3.5 text-orange-300" />
              Get in touch
            </span>
            <h1 className="text-balance text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
              We are here to help
            </h1>
            <p className="max-w-lg text-pretty text-base leading-7 text-white/70">
              Have a question about a product, an order or our services? Reach
              out through any of the channels below — our team typically responds
              within the hour.
            </p>
          </div>
        </div>
      </section>

      {/* Contact methods */}
      <section className="shams-container py-14 sm:py-20">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                href="tel:0223929204"
                className="flex items-center gap-2 text-foreground transition-colors hover:text-brand"
              >
                <Phone className="size-3.5 text-muted-foreground" />
                022 392 9204
              </a>
              <a
                href="tel:01020001604"
                className="flex items-center gap-2 text-foreground transition-colors hover:text-brand"
              >
                <Phone className="size-3.5 text-muted-foreground" />
                010 2000 1604
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
                href="https://wa.me/201020001604"
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
                <span className="font-medium text-muted-foreground">Closed</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick links */}
      <section className="border-t border-border bg-accent/30">
        <div className="shams-container py-14 sm:py-16">
          <h2 className="mb-6 text-lg font-semibold tracking-tight">
            Looking for something specific?
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: 'Track your order',
                desc: 'Check delivery status',
                href: '/orders',
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

export function BranchesPage() {
  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden bg-foreground text-white">
        <div
          aria-hidden
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'radial-gradient(120% 100% at 80% 20%, rgba(255,255,255,0.12) 0%, transparent 50%)',
          }}
        />
        <div className="shams-container relative py-16 sm:py-20">
          <div className="max-w-2xl space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
              <MapPin className="size-3.5 text-orange-300" />
              Our showrooms
            </span>
            <h1 className="text-balance text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
              Visit Shams Stores
            </h1>
            <p className="max-w-lg text-pretty text-base leading-7 text-white/70">
              Two showrooms in Cairo where you can explore gear hands-on, compare
              options side by side and get expert advice from our team.
            </p>
          </div>
        </div>
      </section>

      {/* Branch cards */}
      <section className="shams-container py-14 sm:py-20">
        <div className="grid gap-6 lg:grid-cols-2">
          {branches.map((branch) => (
            <div
              key={branch.name}
              className="flex flex-col overflow-hidden rounded-(--radius-card) border border-border bg-card"
            >
              {/* Branch header */}
              <div className="flex items-center gap-3 border-b border-border bg-accent/40 px-6 py-4">
                <span className="inline-flex size-10 items-center justify-center rounded-(--radius-control) bg-brand-muted text-brand-ink">
                  <Store className="size-5" />
                </span>
                <div>
                  <h2 className="text-lg font-semibold tracking-tight">
                    {branch.name}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Shams Stores · {branch.city}
                  </p>
                </div>
              </div>

              {/* Branch details */}
              <div className="flex flex-1 flex-col gap-5 p-6">
                {/* Address */}
                <div className="flex gap-3">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <div className="text-sm leading-6">
                    <p className="font-medium text-foreground">
                      {branch.address}
                    </p>
                    <p className="text-muted-foreground">
                      {branch.landmark}
                      <br />
                      {branch.city}
                    </p>
                  </div>
                </div>

                {/* Phones */}
                <div className="flex gap-3">
                  <Phone className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <div className="space-y-1.5 text-sm">
                    {branch.phones.map((phone) => (
                      <a
                        key={phone.href}
                        href={phone.href}
                        className="block text-foreground transition-colors hover:text-brand"
                      >
                        {phone.label}
                      </a>
                    ))}
                  </div>
                </div>

                {/* Hours */}
                <div className="flex gap-3">
                  <Clock className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <div className="text-sm">
                    <p className="font-medium text-foreground">
                      {branch.hours}
                    </p>
                    <p className="text-muted-foreground">
                      Closed: {branch.closed}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-auto flex flex-wrap gap-2 pt-3">
                  <a
                    href={branch.phones[0].href}
                    className="inline-flex min-h-9 items-center gap-2 rounded-(--radius-control) bg-brand px-4 text-xs font-semibold text-brand-foreground transition-colors hover:bg-brand-hover"
                  >
                    <Phone className="size-3.5" />
                    Call now
                  </a>
                  <a
                    href="https://wa.me/201020001604"
                    className="inline-flex min-h-9 items-center gap-2 rounded-(--radius-control) border border-border px-4 text-xs font-medium text-foreground transition-colors hover:border-brand/40 hover:text-brand"
                  >
                    <MessageCircle className="size-3.5" />
                    WhatsApp
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* What to expect */}
      <section className="border-t border-border bg-accent/30">
        <div className="shams-container py-14 sm:py-16">
          <h2 className="mb-8 text-lg font-semibold tracking-tight">
            What to expect when you visit
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
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
            ].map((item) => (
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
        </div>
      </section>
    </main>
  )
}

export function SupportPage() {
  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden bg-foreground text-white">
        <div
          aria-hidden
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'radial-gradient(120% 100% at 80% 20%, rgba(255,255,255,0.12) 0%, transparent 50%)',
          }}
        />
        <div className="shams-container relative py-16 sm:py-20">
          <div className="max-w-2xl space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
              <Headphones className="size-3.5 text-orange-300" />
              Support
            </span>
            <h1 className="text-balance text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
              Talk to Shams
            </h1>
            <p className="max-w-lg text-pretty text-base leading-7 text-white/70">
              Our team can help with product availability, selecting the right
              gear for your needs, order status and after-sales support.
            </p>
          </div>
        </div>
      </section>

      {/* How can we help */}
      <section className="shams-container py-14 sm:py-20">
        <h2 className="mb-8 text-lg font-semibold tracking-tight">
          How can we help?
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: Camera,
              title: 'Choosing gear',
              body: 'Not sure which camera, lens or setup is right for you? Our specialists can walk you through the options based on your workflow and budget.',
              action: { label: 'Call us', href: 'tel:0223929204' },
            },
            {
              icon: Navigation,
              title: 'Order & delivery',
              body: 'Track your order, check delivery estimates for your area, or get help with shipping and pickup options.',
              action: { label: 'Track order', href: '/orders' },
            },
            {
              icon: ShieldCheck,
              title: 'Warranty & repairs',
              body: 'All products carry local warranty. Contact us for warranty claims, repair estimates or servicing your gear.',
              action: { label: 'WhatsApp us', href: 'https://wa.me/201020001604' },
            },
            {
              icon: Store,
              title: 'Store pickup',
              body: 'Order online and pick up from our Downtown or Heliopolis showroom the same day — if the item is in stock.',
              action: { label: 'See branches', href: '/branches' },
            },
            {
              icon: CreditCardIcon,
              title: 'Payment & installments',
              body: 'We accept cards, cash and offer installment plans up to 24 months. Ask about current offers and eligibility.',
              action: { label: 'Call us', href: 'tel:0223929204' },
            },
            {
              icon: RotateCcwIcon,
              title: 'Returns & exchanges',
              body: 'Change your mind on boxed gear within 14 days. Contact us to start a return or exchange.',
              action: { label: 'WhatsApp us', href: 'https://wa.me/201020001604' },
            },
          ].map((item) => (
            <div
              key={item.title}
              className="flex flex-col gap-4 rounded-(--radius-card) border border-border bg-card p-6"
            >
              <span className="inline-flex size-10 items-center justify-center rounded-(--radius-control) bg-brand-muted text-brand-ink">
                <item.icon className="size-5" />
              </span>
              <div className="space-y-1">
                <h3 className="font-semibold tracking-tight text-foreground">
                  {item.title}
                </h3>
                <p className="text-sm leading-6 text-muted-foreground">
                  {item.body}
                </p>
              </div>
              <Link
                href={item.action.href}
                className="mt-auto inline-flex items-center gap-1.5 text-sm font-medium text-brand-ink transition-colors hover:text-brand"
              >
                {item.action.label}
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Contact strip */}
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
                  href="tel:0223929204"
                  className="text-sm font-semibold text-foreground hover:text-brand"
                >
                  022 392 9204
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
                  href="https://wa.me/201020001604"
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

export function TermsPage() {
  return (
    <main>
      <section className="relative overflow-hidden bg-foreground text-white">
        <div
          aria-hidden
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'radial-gradient(120% 100% at 80% 20%, rgba(255,255,255,0.12) 0%, transparent 50%)',
          }}
        />
        <div className="shams-container relative py-16 sm:py-20">
          <div className="max-w-2xl space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
              <FileText className="size-3.5 text-orange-300" />
              Legal
            </span>
            <h1 className="text-balance text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
              Terms & conditions
            </h1>
            <p className="max-w-lg text-pretty text-base leading-7 text-white/70">
              Please read these terms carefully before placing an order or using
              our services. By purchasing from Shams Stores, you agree to the
              terms below.
            </p>
            <p className="text-xs text-white/40">Last updated: September 2026</p>
          </div>
        </div>
      </section>

      <section className="shams-container py-14 sm:py-20">
        <div className="mx-auto max-w-3xl space-y-10">
          {[
            {
              title: '1. General information',
              body: 'Shams Stores ("we", "us", "our") operates as a retail business specializing in photography, cinema and creator equipment. All purchases are subject to product availability and acceptance. We reserve the right to refuse or cancel any order at our discretion.',
            },
            {
              title: '2. Pricing & payment',
              body: 'All prices are displayed in Egyptian Pounds (EGP) and include applicable taxes unless stated otherwise. We accept Visa, Mastercard, InstaPay, bank transfer and cash on delivery. Installment plans are available through participating banks and are subject to eligibility. Prices may change without notice; however, confirmed orders will be honored at the price at the time of purchase.',
            },
            {
              title: '3. Orders & delivery',
              body: 'Orders are processed during business hours (Saturday through Thursday, 10 AM – 10 PM). Delivery times vary by location — Cairo orders typically arrive within 1–3 business days, and other governorates within 3–5 business days. Free delivery is available for orders over EGP 5,000. Risk of loss passes to you upon delivery.',
            },
            {
              title: '4. Returns & exchanges',
              body: 'Unopened, boxed gear may be returned or exchanged within 14 days of delivery. Items must be in their original condition with all packaging and accessories. Custom-built or special-order items are non-returnable unless defective. Contact us via phone or WhatsApp to initiate a return.',
            },
            {
              title: '5. Warranty',
              body: 'All products carry the manufacturer\'s warranty applicable in Egypt. Shams Stores provides additional support for warranty claims and repairs. Warranty does not cover damage caused by misuse, accidents or unauthorized modifications. Proof of purchase is required for all warranty service.',
            },
            {
              title: '6. Intellectual property',
              body: 'All content on this website — including text, images, logos and design — is the property of Shams Stores or its licensors. Reproduction, distribution or modification without written permission is prohibited.',
            },
            {
              title: '7. Limitation of liability',
              body: 'Shams Stores is not liable for indirect, incidental or consequential damages arising from the use of products purchased. Our total liability is limited to the purchase price of the product in question.',
            },
            {
              title: '8. Contact',
              body: 'For questions about these terms, contact us at our Downtown Cairo showroom (022 392 9204) or via WhatsApp (010 2000 1604).',
            },
          ].map((item) => (
            <div key={item.title} className="space-y-3">
              <h2 className="text-lg font-semibold tracking-tight text-foreground">
                {item.title}
              </h2>
              <p className="text-sm leading-7 text-muted-foreground">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}

export function PrivacyPage() {
  return (
    <main>
      <section className="relative overflow-hidden bg-foreground text-white">
        <div
          aria-hidden
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'radial-gradient(120% 100% at 80% 20%, rgba(255,255,255,0.12) 0%, transparent 50%)',
          }}
        />
        <div className="shams-container relative py-16 sm:py-20">
          <div className="max-w-2xl space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
              <ShieldCheck className="size-3.5 text-orange-300" />
              Legal
            </span>
            <h1 className="text-balance text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
              Privacy policy
            </h1>
            <p className="max-w-lg text-pretty text-base leading-7 text-white/70">
              Your privacy matters to us. This policy explains what data we
              collect, how we use it and your rights regarding your personal
              information.
            </p>
            <p className="text-xs text-white/40">Last updated: September 2026</p>
          </div>
        </div>
      </section>

      <section className="shams-container py-14 sm:py-20">
        <div className="mx-auto max-w-3xl space-y-10">
          {[
            {
              title: '1. Information we collect',
              body: 'We collect information you provide directly — such as your name, phone number, delivery address and email when you place an order or contact us. We also automatically collect certain technical data including your IP address, browser type and pages visited on our website.',
            },
            {
              title: '2. How we use your data',
              body: 'Your data is used to process and deliver orders, communicate about your purchases, provide customer support, improve our website and services, and comply with legal obligations. We never sell your personal data to third parties.',
            },
            {
              title: '3. Data sharing',
              body: 'We share your information only with trusted partners necessary to fulfill your order — delivery companies, payment processors and warranty service providers. All partners are bound by confidentiality agreements. We may disclose data when required by law.',
            },
            {
              title: '4. Data retention',
              body: 'We retain your personal data only for as long as necessary to fulfill the purposes for which it was collected, or as required by Egyptian law. Order records are kept for accounting and warranty purposes.',
            },
            {
              title: '5. Your rights',
              body: 'You have the right to access, correct or delete your personal data at any time. You may also opt out of marketing communications. To exercise any of these rights, contact us via phone or WhatsApp.',
            },
            {
              title: '6. Security',
              body: 'We implement industry-standard security measures to protect your data. Payment information is processed through PCI-compliant providers and is never stored on our servers in plain text.',
            },
            {
              title: '7. Cookies',
              body: 'Our website uses cookies to enhance your browsing experience, remember your preferences and analyze site traffic. See our Cookie Policy for details on what cookies we use and how to manage them.',
            },
            {
              title: '8. Changes to this policy',
              body: 'We may update this privacy policy from time to time. Any changes will be posted on this page with an updated revision date. We encourage you to review this policy periodically.',
            },
            {
              title: '9. Contact us',
              body: 'If you have questions about this privacy policy or your data, reach out at our Downtown Cairo showroom (022 392 9204) or via WhatsApp (010 2000 1604).',
            },
          ].map((item) => (
            <div key={item.title} className="space-y-3">
              <h2 className="text-lg font-semibold tracking-tight text-foreground">
                {item.title}
              </h2>
              <p className="text-sm leading-7 text-muted-foreground">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}

export function CookiesPage() {
  return (
    <main>
      <section className="relative overflow-hidden bg-foreground text-white">
        <div
          aria-hidden
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'radial-gradient(120% 100% at 80% 20%, rgba(255,255,255,0.12) 0%, transparent 50%)',
          }}
        />
        <div className="shams-container relative py-16 sm:py-20">
          <div className="max-w-2xl space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
              <CookieIcon className="size-3.5 text-orange-300" />
              Legal
            </span>
            <h1 className="text-balance text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
              Cookie policy
            </h1>
            <p className="max-w-lg text-pretty text-base leading-7 text-white/70">
              This policy explains what cookies are, how Shams Stores uses them,
              and how you can manage your preferences.
            </p>
            <p className="text-xs text-white/40">Last updated: September 2026</p>
          </div>
        </div>
      </section>

      <section className="shams-container py-14 sm:py-20">
        <div className="mx-auto max-w-3xl space-y-10">
          <div className="space-y-3">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              What are cookies?
            </h2>
            <p className="text-sm leading-7 text-muted-foreground">
              Cookies are small text files stored on your device when you visit
              a website. They help the site remember your preferences, understand
              how you use it and provide a better experience on future visits.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              How we use cookies
            </h2>
            <p className="text-sm leading-7 text-muted-foreground">
              Shams Stores uses cookies for the following purposes:
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                title: 'Essential',
                body: 'Required for the website to function. These include session cookies, cart contents and security tokens. They cannot be disabled.',
                badge: 'Always active',
              },
              {
                title: 'Functional',
                body: 'Remember your preferences such as language, region and recently viewed products to personalize your experience.',
                badge: 'Optional',
              },
              {
                title: 'Analytics',
                body: 'Help us understand how visitors interact with our website by collecting anonymous usage data. This helps us improve the site.',
                badge: 'Optional',
              },
              {
                title: 'Marketing',
                body: 'Used to deliver relevant advertisements and measure campaign effectiveness. These are set by our advertising partners.',
                badge: 'Optional',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex flex-col gap-3 rounded-(--radius-card) border border-border bg-card p-5"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold tracking-tight text-foreground">
                    {item.title}
                  </h3>
                  <span className="rounded-full bg-brand-muted px-2.5 py-0.5 text-xs font-medium text-brand-ink">
                    {item.badge}
                  </span>
                </div>
                <p className="text-sm leading-6 text-muted-foreground">
                  {item.body}
                </p>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              Managing cookies
            </h2>
            <p className="text-sm leading-7 text-muted-foreground">
              You can control cookies through your browser settings. Most
              browsers allow you to block or delete cookies. Note that disabling
              essential cookies may prevent parts of the website from working
              correctly, including the shopping cart and checkout process.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              Third-party cookies
            </h2>
            <p className="text-sm leading-7 text-muted-foreground">
              Some cookies are placed by third-party services we use, such as
              payment providers and analytics tools. We do not control these
              cookies. Refer to the respective third-party privacy policies for
              more information.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              Contact
            </h2>
            <p className="text-sm leading-7 text-muted-foreground">
              If you have questions about our use of cookies, contact us at our
              Downtown Cairo showroom (022 392 9204) or via WhatsApp (010 2000
              1604).
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}

function FileText({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M10 9H8" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
    </svg>
  )
}

function CookieIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" />
      <path d="M8.5 8.5v.01" />
      <path d="M16 15.5v.01" />
      <path d="M12 12v.01" />
      <path d="M11 17v.01" />
      <path d="M7 14v.01" />
    </svg>
  )
}

function CreditCardIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <line x1="2" x2="22" y1="10" y2="10" />
    </svg>
  )
}

function RotateCcwIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M1 4v6h6" />
      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
    </svg>
  )
}
