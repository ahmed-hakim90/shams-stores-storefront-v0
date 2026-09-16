import Link from 'next/link'
import { ArrowUpRight, MapPin, MessageCircle } from 'lucide-react'
import { primaryCategories } from '@/lib/commerce/navigation'
import { terms } from '@/lib/commerce/live/catalog'
import { ShamsLogo } from './logo'

export async function LiveFooter() {
  const categories = primaryCategories(
    await terms('categories').catch(() => []),
    6,
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
        ['Recent order', '/orders'],
        ['Your account', '/account'],
      ],
    },
    {
      title: 'Here to help',
      links: [
        ['Talk to Shams', '/support', 'Product advice & order support'],
        ['Visit our stores', '/branches', 'Downtown Cairo & Heliopolis'],
        ['Contact Shams', '/contact', 'Call, WhatsApp or visit us'],
        ['About Shams', '/about', 'Our story & what we stand for'],
      ],
    },
  ]
  return (
    <footer className="mt-8 bg-foreground pb-24 text-white md:pb-0">
      <div className="shams-container py-10 sm:py-14">
        <div className="mb-10 flex flex-wrap items-center justify-between gap-6 border-b border-white/15 pb-9">
          <div>
            <Link
              href="/"
              aria-label="Shams Stores home"
              className="inline-flex rounded-(--radius-control)"
            >
              <ShamsLogo className="w-[240px] max-w-full" />
            </Link>
            <p className="mt-4 max-w-md text-sm leading-6 text-white/70">
              For the image makers, storytellers and creators.
              <br />
              Find the right tools for your next idea.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/support"
              className="inline-flex min-h-11 items-center gap-2 rounded-(--radius-control) border border-white/25 px-4 text-sm hover:border-orange-400"
            >
              <MessageCircle className="size-4 text-orange-300" />
              Expert advice
            </Link>
            <Link
              href="/branches"
              className="inline-flex min-h-11 items-center gap-2 rounded-(--radius-control) border border-white/25 px-4 text-sm hover:border-orange-400"
            >
              <MapPin className="size-4 text-orange-300" />
              Visit Shams
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4">
          {groups.map((group) => (
            <div key={group.title}>
              <h2 className="mb-3 text-sm font-semibold">{group.title}</h2>
              <ul>
                {group.links.map(([name, href, desc]) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="group flex min-h-11 flex-col gap-0.5 py-1.5 text-sm transition-colors duration-fast hover:text-orange-300"
                    >
                      <span className="leading-6 text-white/70 group-hover:text-orange-300">
                        {name}
                        {href.startsWith('https') && (
                          <ArrowUpRight className="ml-0.5 inline size-3" />
                        )}
                      </span>
                      {desc && (
                        <span className="text-xs leading-4 text-white/40">
                          {desc}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="shams-container border-t border-white/15 py-6">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          <span className="text-xs font-semibold uppercase tracking-wide text-white/40">
            We accept
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {/* Visa */}
            <span className="inline-flex h-8 items-center rounded border border-white/15 bg-white/5 px-2.5">
              <svg viewBox="0 0 48 16" className="h-3.5 w-auto fill-white/80" aria-label="Visa">
                <path d="M19.2 0.8L14.4 15.2H10.8L8.4 4.2C8.2 3.2 8 2.8 7.2 2.4C5.8 1.6 3.8 1.2 1.4 1L1.6 0.8H8.2C10.2 0.8 11.8 2 12.2 3.4L13.4 10L16.4 0.8H19.2ZM27.6 10.4C27.6 6.4 22 6 22 4.2C22 3.6 22.6 3 23.8 2.8C24.4 2.8 25.8 2.8 27.4 3.6L28 1.4C27.2 1 26.2 0.8 25 0.8C21.6 0.8 19.2 2.8 19.2 5.2C19.2 7 20.8 8 22 8.6C23.2 9.2 23.6 9.6 23.6 10.2C23.6 11.2 22.4 11.6 21.4 11.6C19.4 11.6 18.2 11 17.4 10.6L16.8 12.8C17.6 13.2 19 13.6 20.4 13.6C24.2 13.6 27.6 11.4 27.6 10.4ZM36.4 15.2H39.2L36.6 0.8H34.2C33.2 0.8 32.6 1.2 32.2 2L27.6 15.2H30.6L31.2 13.6H35L35.4 15.2H36.4ZM32 11.2L33.6 5.6L34.4 11.2H32ZM14.8 10.8C14 7.2 10.4 5 6.2 5C2.4 5 0.4 6.8 0.4 8.4C0.4 11.2 4 12.4 6.2 13.4C8.4 14.4 9.2 15 9.2 15.8C9.2 17 7.8 17.4 6.6 17.4C4.2 17.4 2.8 16.8 1.8 16.2L1.2 18.4C2.2 18.8 3.8 19.2 5.6 19.2C9.6 19.2 12 17.2 12 15C12 12.8 9.6 11.6 7.6 10.6C5.8 9.8 4.8 9.2 4.8 8.2C4.8 7.4 5.8 6.6 7.4 6.6C9.4 6.6 10.8 7.4 11.6 7.8L14.8 10.8Z" />
              </svg>
            </span>
            {/* Mastercard */}
            <span className="inline-flex h-8 items-center rounded border border-white/15 bg-white/5 px-2.5">
              <svg viewBox="0 0 36 24" className="h-4 w-auto" aria-label="Mastercard">
                <circle cx="12" cy="12" r="10" fill="#EB001B" fillOpacity="0.9" />
                <circle cx="24" cy="12" r="10" fill="#F79E1B" fillOpacity="0.9" />
                <path d="M18 4.8A9.9 9.9 0 0 0 14.6 12 9.9 9.9 0 0 0 18 19.2 9.9 9.9 0 0 0 21.4 12 9.9 9.9 0 0 0 18 4.8Z" fill="#FF5F00" fillOpacity="0.9" />
              </svg>
            </span>
            {/* InstaPay */}
            <span className="inline-flex h-8 items-center gap-1 rounded border border-white/15 bg-white/5 px-2.5 text-[0.6rem] font-bold tracking-tight text-white/80">
              <svg viewBox="0 0 16 16" className="size-3 fill-orange-300">
                <path d="M8 0L10 5.5H16L11 9L13 15L8 11.5L3 15L5 9L0 5.5H6L8 0Z" />
              </svg>
              InstaPay
            </span>
            {/* Cash on Delivery */}
            <span className="inline-flex h-8 items-center gap-1 rounded border border-white/15 bg-white/5 px-2.5 text-[0.6rem] font-bold tracking-tight text-white/80">
              <svg viewBox="0 0 16 16" className="size-3 fill-emerald-400">
                <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1Zm0 12.5a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11ZM6.5 6h2.3c.7 0 1.2.5 1.2 1.2 0 .5-.3.9-.7 1.1l.9 2.2H8.8l-.7-1.9H7.5v1.9H6.2V6h.3Zm1 3.3h1.1c.3 0 .5-.2.5-.5s-.2-.5-.5-.5H7.5v1Z" />
              </svg>
              Cash
            </span>
            {/* Installments */}
            <span className="inline-flex h-8 items-center gap-1 rounded border border-white/15 bg-white/5 px-2.5 text-[0.6rem] font-bold tracking-tight text-white/80">
              <svg viewBox="0 0 16 16" className="size-3 fill-blue-400">
                <path d="M2 3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3Zm1.5.5v2h9v-2h-9Zm0 3.5v1.5h3V7h-3Zm4.5 0v1.5h4.5V7H8Zm-4.5 3v1.5h3V10h-3Zm4.5 0v1.5h4.5V10H8Z" />
              </svg>
              Installments
            </span>
          </div>
        </div>
      </div>
      <div className="shams-container">
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/15 py-6 text-xs text-white/60">
          <p>© {new Date().getFullYear()} Shams Stores. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/terms" className="transition-colors hover:text-white/90">
              Terms & conditions
            </Link>
            <Link href="/privacy" className="transition-colors hover:text-white/90">
              Privacy policy
            </Link>
            <Link href="/cookies" className="transition-colors hover:text-white/90">
              Cookie policy
            </Link>
          </div>
          <p>Egypt · English · Prices in EGP</p>
        </div>
      </div>
    </footer>
  )
}
