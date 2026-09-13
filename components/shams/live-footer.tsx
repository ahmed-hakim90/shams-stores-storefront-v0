import Link from 'next/link'
import { ShamsLogo } from './logo'

export function LiveFooter() {
  const groups = [
    {
      title: 'Explore',
      links: [
        ['All gear', '/shop'],
        ['Categories', '/categories'],
        ['Brands', '/brands'],
        ['Current offers', '/deals'],
        ['New arrivals', '/new'],
      ],
    },
    {
      title: 'Your Shams',
      links: [
        ['Saved gear', '/wishlist'],
        ['Compare', '/compare'],
        ['Cart', '/cart'],
        ['Recent order', '/orders'],
      ],
    },
    {
      title: 'Here to help',
      links: [
        ['Contact Shams', 'https://www.shams-stores.com/shams-contact-2026/'],
        ['About Shams', 'https://www.shams-stores.com/shams-about-2026/'],
      ],
    },
  ]
  return (
    <footer className="border-t bg-card pb-24 md:pb-0">
      <div className="mx-auto grid max-w-[1440px] gap-8 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div>
          <ShamsLogo />
          <p className="mt-4 max-w-xs text-sm leading-6 text-muted-foreground">
            Photography, cinema and creator equipment. Find the right tools for
            your next idea.
          </p>
        </div>
        {groups.map((g) => (
          <div key={g.title}>
            <h2 className="mb-4 text-sm font-semibold">{g.title}</h2>
            <ul className="space-y-3">
              {g.links.map(([name, href]) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-muted-foreground hover:text-brand-ink"
                  >
                    {name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mx-auto flex max-w-[1440px] flex-wrap justify-between gap-3 border-t px-4 py-5 text-xs text-muted-foreground sm:px-6">
        <p>© {new Date().getFullYear()} Shams Stores.</p>
        <p>Egypt · Prices in EGP</p>
      </div>
    </footer>
  )
}
