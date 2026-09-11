import Link from 'next/link'
import { Instagram, Facebook, Youtube, MapPin, Phone, Mail } from 'lucide-react'
import { ShamsLogo } from './logo'

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
      { label: 'Used & Refurbished', href: '/used' },
      { label: 'New Arrivals', href: '/new' },
    ],
  },
  {
    heading: 'Support',
    links: [
      { label: 'Track your order', href: '/orders' },
      { label: 'Shipping & delivery', href: '/shipping' },
      { label: 'Returns & warranty', href: '/returns' },
      { label: 'Installment plans', href: '/installments' },
      { label: 'Contact us', href: '/support' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About Shams', href: '/about' },
      { label: 'Our branches', href: '/branches' },
      { label: 'The Shams Journal', href: '/journal' },
      { label: 'Careers', href: '/careers' },
    ],
  },
]

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div className="space-y-4">
            <ShamsLogo />
            <p className="max-w-xs text-sm text-muted-foreground">
              Egypt&apos;s specialist for photography, cinema and creator gear.
              Authorized products, expert advice and nationwide delivery since
              day one.
            </p>
            <div className="space-y-1.5 text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <MapPin className="size-4 text-brand" /> Downtown · Heliopolis · Alexandria
              </p>
              <p className="flex items-center gap-2">
                <Phone className="size-4 text-brand" /> +20 100 000 0000
              </p>
              <p className="flex items-center gap-2">
                <Mail className="size-4 text-brand" /> hello@shamsstores.com
              </p>
            </div>
            <div className="flex gap-2 pt-1">
              {[Instagram, Facebook, Youtube].map((Icon, i) => (
                <Link
                  key={i}
                  href="#"
                  aria-label="Shams social channel"
                  className="inline-flex size-9 items-center justify-center rounded-lg border border-border text-foreground/70 transition-colors hover:border-brand hover:text-brand"
                >
                  <Icon className="size-4.5" />
                </Link>
              ))}
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
                      className="text-sm text-muted-foreground transition-colors hover:text-brand"
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
        <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-3 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:px-6">
          <p>© {new Date().getFullYear()} Shams Stores. All rights reserved.</p>
          <div className="flex items-center gap-4">
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
          </div>
        </div>
      </div>
    </footer>
  )
}
