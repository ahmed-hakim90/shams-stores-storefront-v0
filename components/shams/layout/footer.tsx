import Link from 'next/link'
import { MapPin, Phone, Mail } from 'lucide-react'
import { ShamsLogo } from '../shared/logo'

const columns = [
  {
    heading: 'Shop',
    links: [
      { label: 'Cameras', href: '/c/cameras' },
      { label: 'Lenses', href: '/c/lenses' },
      { label: 'Video & Cinema', href: '/c/video' },
      { label: 'Audio', href: '/c/audio' },
      { label: 'Lighting', href: '/c/lighting' },
      { label: 'Drones', href: '/c/drones' },
    ],
  },
  {
    heading: 'Discover',
    links: [
      { label: 'Workflows', href: '/w' },
      { label: 'Bundles', href: '/bundles' },
      { label: 'Brands', href: '/brands' },
      { label: 'Deals', href: '/deals' },
      { label: 'New Arrivals', href: '/new' },
      { label: 'Best Sellers', href: '/best-sellers' },
    ],
  },
  {
    heading: 'Support',
    links: [
      { label: 'Track your order', href: '/orders' },
      { label: 'Contact us', href: '/contact' },
      { label: 'Talk to Shams', href: '/support' },
      { label: 'Our branches', href: '/branches' },
      { label: 'About Shams', href: '/about' },
    ],
  },
]

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="space-y-4">
            <Link href="/" aria-label="Shams Stores home" className="inline-flex rounded-(--radius-control)">
              <ShamsLogo className="w-[240px] max-w-full" />
            </Link>
            <p className="max-w-xs text-sm text-muted-foreground">
              Egypt&apos;s specialist for photography, cinema and creator gear.
              Authorized products, expert advice and nationwide delivery since
              day one.
            </p>
            <div className="space-y-1.5 text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <MapPin className="size-4 text-brand-ink" /> Downtown · Heliopolis · Alexandria
              </p>
              <p className="flex items-center gap-2">
                <Phone className="size-4 text-brand-ink" /> +201011331666
              </p>
              <p className="flex items-center gap-2">
                <Mail className="size-4 text-brand-ink" /> hello@shamsstores.com
              </p>
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.heading}>
              <p className="mb-3 text-sm font-semibold text-foreground">{col.heading}</p>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors duration-fast hover:text-brand-ink"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-3 px-4 py-5 pb-[max(1.25rem,calc(1.25rem+var(--mobile-bottom-nav-height)))] text-xs text-muted-foreground sm:flex-row sm:px-6 sm:pb-5">
          <p>&copy; 2026 Shams Stores. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-4">
            <span>Prices in EGP · Egypt</span>
            <div className="flex items-center gap-1.5">
              {['VISA', 'Mastercard', 'ValU', 'Fawry'].map((m) => (
                <span
                  key={m}
                  className="rounded border border-border bg-background px-1.5 py-0.5 text-[0.65rem] font-medium text-foreground/70"
                >
                  {m}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-4">
              <Link href="/terms" className="transition-colors hover:text-foreground">Terms & conditions</Link>
              <Link href="/privacy" className="transition-colors hover:text-foreground">Privacy policy</Link>
              <Link href="/cookies" className="transition-colors hover:text-foreground">Cookie policy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
