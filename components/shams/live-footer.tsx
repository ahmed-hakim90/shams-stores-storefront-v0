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
        ['Talk to a specialist', '/support'],
        ['Visit our stores', '/branches'],
        ['Contact Shams', 'https://www.shams-stores.com/shams-contact-2026/'],
        ['About Shams', 'https://www.shams-stores.com/shams-about-2026/'],
      ],
    },
  ]
  return (
    <footer className="mt-5 bg-[#181b19] pb-24 text-white md:pb-0">
      <div className="shams-container py-9 sm:py-12">
        <div className="mb-9 flex flex-wrap items-center justify-between gap-6 border-b border-white/15 pb-8">
          <div>
            <Link
              href="/"
              aria-label="Shams Stores home"
              className="inline-flex rounded-lg"
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
              className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-white/25 px-4 text-sm hover:border-orange-400"
            >
              <MessageCircle className="size-4 text-orange-300" />
              Expert advice
            </Link>
            <Link
              href="/branches"
              className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-white/25 px-4 text-sm hover:border-orange-400"
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
                {group.links.map(([name, href]) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="inline-flex min-h-11 items-center gap-1 text-sm leading-6 text-white/70 transition-colors hover:text-orange-300"
                    >
                      {name}
                      {href.startsWith('https') && (
                        <ArrowUpRight className="size-3" />
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="shams-container">
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/15 py-6 text-xs text-white/60">
          <p>© {new Date().getFullYear()} Shams Stores. All rights reserved.</p>
          <p>Egypt · English · Prices in EGP</p>
        </div>
      </div>
    </footer>
  )
}
