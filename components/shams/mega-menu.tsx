'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ChevronDown, Tag } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCatalogNavigation } from './catalog-navigation'
import { commerce, formatMoney } from '@/lib/commerce'
import type { Category } from '@/lib/commerce'

const extraLinks = [
  { label: 'Deals', href: '/deals', accent: true },
  { label: 'Bundles', href: '/bundles' },
  { label: 'Brands', href: '/brands' },
  { label: 'Used & Refurb', href: '/used' },
]

export function MegaMenu() {
  const { categories, liveMode } = useCatalogNavigation()
  const [active, setActive] = useState<string | null>(null)
  const closeTimer = useRef<number | undefined>(undefined)

  const open = (slug: string) => {
    window.clearTimeout(closeTimer.current)
    setActive(slug)
  }
  const scheduleClose = () => {
    closeTimer.current = window.setTimeout(() => setActive(null), 120)
  }

  return (
    <nav aria-label="Primary" className="relative hidden lg:block">
      <ul className="flex items-center gap-1">
        {categories.map((cat) => (
          <li
            key={cat.slug}
            onMouseEnter={() => open(cat.slug)}
            onMouseLeave={scheduleClose}
          >
            <Link
              href={`/c/${cat.slug}`}
              onFocus={() => open(cat.slug)}
              className={cn(
                'inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:text-brand',
                active === cat.slug && 'text-brand',
              )}
              aria-expanded={active === cat.slug}
            >
              {cat.name}
              <ChevronDown
                className={cn(
                  'size-3.5 transition-transform',
                  active === cat.slug && 'rotate-180',
                )}
              />
            </Link>

            {active === cat.slug && (
              <div
                onMouseEnter={() => open(cat.slug)}
                onMouseLeave={scheduleClose}
                className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50"
              >
                <MegaPanel category={cat} />
              </div>
            )}
          </li>
        ))}

        <li aria-hidden className="mx-1 h-5 w-px bg-border" />

        {extraLinks
          .filter((x) => !liveMode || x.href !== '/used')
          .map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  link.accent
                    ? 'text-sale hover:text-sale/80'
                    : 'text-foreground/80 hover:text-brand',
                )}
              >
                {link.accent && <Tag className="size-3.5" />}
                {link.label}
              </Link>
            </li>
          ))}
      </ul>
    </nav>
  )
}

function MegaPanel({ category }: { category: Category }) {
  const featured = category.featuredProductId
    ? commerce.products.byId(category.featuredProductId)
    : undefined

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-popover shadow-2xl">
      <div className="grid grid-cols-[1fr_18rem]">
        <div className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">
                {category.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {category.tagline}
              </p>
            </div>
            <Link
              href={`/c/${category.slug}`}
              className="inline-flex items-center gap-1 text-xs font-medium text-brand hover:underline"
            >
              Shop all {category.itemCount} <ArrowRight className="size-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-6">
            {category.columns.map((col) => (
              <div key={col.heading}>
                <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {col.heading}
                </p>
                <ul className="space-y-1">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="block rounded-md py-1 text-sm text-foreground/80 transition-colors hover:text-brand"
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

        {featured && (
          <Link
            href={`/p/${featured.slug}`}
            className="group flex flex-col justify-between border-l border-border bg-brand-muted/50 p-6"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-brand">
                Featured
              </p>
              <p className="mt-1 text-sm font-medium text-foreground">
                {featured.brand} {featured.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {featured.configuration}
              </p>
            </div>
            <div className="relative my-3 h-32">
              <Image
                src={featured.image || '/placeholder.svg'}
                alt={featured.name}
                fill
                sizes="240px"
                className="object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">
                {formatMoney(featured.price)}
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-brand">
                View <ArrowRight className="size-3.5" />
              </span>
            </div>
          </Link>
        )}
      </div>
    </div>
  )
}
