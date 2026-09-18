import Link from 'next/link'
import { MapPin, Phone } from 'lucide-react'
import { primaryCategories } from '@/lib/commerce/navigation'
import { terms } from '@/lib/commerce/live/catalog'
import { ShamsLogo } from '@/components/shams/shared'

export async function LiveFooter() {
  const categories = primaryCategories(
    await terms('categories').catch(() => []),
    8,
  )
  const groups = [
    {
      title: 'Shop',
      links: categories.length
        ? categories.map((c) => [c.name, `/c/${c.slug}`])
        : [
            ['All gear', '/shop'],
            ['Categories', '/categories'],
          ],
    },
    {
      title: 'Discover',
      links: [
        ['Brands', '/brands'],
        ['New arrivals', '/new'],
        ['Best sellers', '/best-sellers'],
        ['Current offers', '/deals'],
        ['Complete setups', '/bundles'],
      ],
    },
    {
      title: 'Your gear',
      links: [
        ['Saved gear', '/wishlist'],
        ['Compare equipment', '/compare'],
        ['Your cart', '/cart'],
        ['Track order', '/orders'],
        ['Your account', '/account'],
      ],
    },
    {
      title: 'Here to help',
      links: [
        ['Help center', '/support'],
        ['FAQ', '/faq'],
        ['Shipping & delivery', '/shipping'],
        ['Returns & exchanges', '/returns'],
        ['Payment methods', '/payment'],
        ['Warranty', '/warranty'],
        ['Visit our stores', '/branches'],
        ['Contact Shams', '/contact'],
        ['Guides', '/guides'],
        ['About Shams', '/about'],
      ],
    },
  ]
  return (
    <footer className="mt-8 bg-[#f2f2f2] pb-24 md:pb-0">
      <div className="shams-container py-8 sm:py-10">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_repeat(4,1fr)]">
          <div className="lg:col-span-1">
            <Link
              href="/"
              aria-label="Shams Stores home"
              className="inline-block"
            >
              <ShamsLogo className="w-[180px] max-w-full" />
            </Link>
            <p className="mt-3 text-xs leading-5 text-muted-foreground">
              Egypt&apos;s specialist for photography, cinema and creator gear.
              Authorized products and nationwide delivery.
            </p>

            <div className="mt-4 space-y-2">
              <a
                href="tel:+201011331666"
                className="flex items-center gap-2 text-sm font-semibold text-foreground"
              >
                <Phone className="size-3.5 text-brand" />
                +01011331666
              </a>
              <p className="flex items-center gap-2 text-xs text-muted-foreground">
                <MapPin className="size-3.5 text-brand" />
                Downtown · Heliopolis 
              </p>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <a
                href="https://www.facebook.com/ShamsStores/"
                aria-label="Facebook"
                className="flex size-8 items-center justify-center rounded-full bg-foreground/10 text-foreground/60 transition-colors hover:bg-foreground/20 hover:text-foreground"
              >
                <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.5 2.9h-2.3v7A10 10 0 0 0 22 12Z"/>
                </svg>
              </a>
              <a
                href="https://www.instagram.com/shamsstores/"
                aria-label="Instagram"
                className="flex size-8 items-center justify-center rounded-full bg-foreground/10 text-foreground/60 transition-colors hover:bg-foreground/20 hover:text-foreground"
              >
                <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <circle cx="12" cy="12" r="5"/>
                  <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/>
                </svg>
              </a>
              <a
                href="https://www.youtube.com/@shamsstores4105"
                aria-label="YouTube"
                className="flex size-8 items-center justify-center rounded-full bg-foreground/10 text-foreground/60 transition-colors hover:bg-foreground/20 hover:text-foreground"
              >
                <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31.5 31.5 0 0 0 0 12a31.5 31.5 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31.5 31.5 0 0 0 24 12a31.5 31.5 0 0 0-.5-5.8ZM9.6 15.6V8.4l6.3 3.6-6.3 3.6Z"/>
                </svg>
              </a>
            </div>

            <div className="mt-6 rounded-(--radius-card) border border-border/60 bg-background/40 p-4">
              <h3 className="text-sm font-semibold tracking-tight text-foreground">Stay in the loop</h3>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">New arrivals, exclusive offers, and creator tips.</p>
              <form className="mt-3 flex gap-2" action="#">
                <input
                  type="email"
                  required
                  placeholder="your@email.com"
                  aria-label="Email address"
                  className="h-10 min-w-0 flex-1 rounded-(--radius-control) border border-border bg-surface-raised px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none"
                />
                <button
                  type="button"
                  className="h-10 shrink-0 rounded-(--radius-control) bg-foreground px-4 text-xs font-semibold text-on-dark transition-colors hover:bg-foreground/90"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>

          {groups.map((group) => (
            <div key={group.title}>
              <h2 className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-foreground">
                {group.title}
              </h2>
              <ul className="space-y-1.5">
                {group.links.map(([name, href]) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="shams-container border-t border-border/60 py-5">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            We accept
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex h-7 items-center rounded border border-border bg-surface-raised px-2">
              <svg viewBox="0 0 48 16" className="h-3 w-auto fill-foreground/70" aria-label="Visa">
                <path d="M19.2 0.8L14.4 15.2H10.8L8.4 4.2C8.2 3.2 8 2.8 7.2 2.4C5.8 1.6 3.8 1.2 1.4 1L1.6 0.8H8.2C10.2 0.8 11.8 2 12.2 3.4L13.4 10L16.4 0.8H19.2ZM27.6 10.4C27.6 6.4 22 6 22 4.2C22 3.6 22.6 3 23.8 2.8C24.4 2.8 25.8 2.8 27.4 3.6L28 1.4C27.2 1 26.2 0.8 25 0.8C21.6 0.8 19.2 2.8 19.2 5.2C19.2 7 20.8 8 22 8.6C23.2 9.2 23.6 9.6 23.6 10.2C23.6 11.2 22.4 11.6 21.4 11.6C19.4 11.6 18.2 11 17.4 10.6L16.8 12.8C17.6 13.2 19 13.6 20.4 13.6C24.2 13.6 27.6 11.4 27.6 10.4ZM36.4 15.2H39.2L36.6 0.8H34.2C33.2 0.8 32.6 1.2 32.2 2L27.6 15.2H30.6L31.2 13.6H35L35.4 15.2H36.4ZM32 11.2L33.6 5.6L34.4 11.2H32ZM14.8 10.8C14 7.2 10.4 5 6.2 5C2.4 5 0.4 6.8 0.4 8.4C0.4 11.2 4 12.4 6.2 13.4C8.4 14.4 9.2 15 9.2 15.8C9.2 17 7.8 17.4 6.6 17.4C4.2 17.4 2.8 16.8 1.8 16.2L1.2 18.4C2.2 18.8 3.8 19.2 5.6 19.2C9.6 19.2 12 17.2 12 15C12 12.8 9.6 11.6 7.6 10.6C5.8 9.8 4.8 9.2 4.8 8.2C4.8 7.4 5.8 6.6 7.4 6.6C9.4 6.6 10.8 7.4 11.6 7.8L14.8 10.8Z" />
              </svg>
            </span>
            <span className="inline-flex h-7 items-center rounded border border-border bg-surface-raised px-2">
              <svg viewBox="0 0 36 24" className="h-3.5 w-auto" aria-label="Mastercard">
                <circle cx="12" cy="12" r="10" fill="#EB001B" fillOpacity="0.9" />
                <circle cx="24" cy="12" r="10" fill="#F79E1B" fillOpacity="0.9" />
                <path d="M18 4.8A9.9 9.9 0 0 0 14.6 12 9.9 9.9 0 0 0 18 19.2 9.9 9.9 0 0 0 21.4 12 9.9 9.9 0 0 0 18 4.8Z" fill="#FF5F00" fillOpacity="0.9" />
              </svg>
            </span>
            <span className="inline-flex h-7 items-center gap-1 rounded border border-border bg-surface-raised px-2 text-[0.55rem] font-bold tracking-tight text-foreground/70">
              InstaPay
            </span>
            <span className="inline-flex h-7 items-center gap-1 rounded border border-border bg-surface-raised px-2 text-[0.55rem] font-bold tracking-tight text-foreground/70">
              Cash
            </span>
            <span className="inline-flex h-7 items-center gap-1 rounded border border-border bg-surface-raised px-2 text-[0.55rem] font-bold tracking-tight text-foreground/70">
              Installments
            </span>
          </div>
        </div>
      </div>

      <div className="shams-container">
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 py-5 text-[11px] text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Shams Stores. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/terms" className="transition-colors hover:text-foreground">
              Terms & conditions
            </Link>
            <Link href="/privacy" className="transition-colors hover:text-foreground">
              Privacy policy
            </Link>
            <Link href="/cookies" className="transition-colors hover:text-foreground">
              Cookie policy
            </Link>
          </div>
          <p>Egypt · English · Prices in EGP</p>
        </div>
      </div>
    </footer>
  )
}
