'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowRight, ChevronDown, Tag } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCatalogNavigation } from './catalog-navigation'
import { commerce, formatMoney } from '@/lib/commerce'
import type { Category } from '@/lib/commerce'

const extraLinks = [
  { label: 'Deals', href: '/deals', accent: true },
  { label: 'Bundles', href: '/bundles' },
  { label: 'Brands', href: '/brands' },
]

export function MegaMenu() {
  const { categories, liveMode } = useCatalogNavigation()
  const [active, setActive] = useState<string | null>(null)
  const closeTimer = useRef<number | undefined>(undefined)
  const pathname = usePathname()

  useEffect(() => () => window.clearTimeout(closeTimer.current), [])
  const open = (slug: string) => {
    window.clearTimeout(closeTimer.current)
    setActive(slug)
  }
  const scheduleClose = () => {
    closeTimer.current = window.setTimeout(() => setActive(null), 120)
  }

  return (
    <nav
      aria-label="Primary"
      className="relative hidden lg:block"
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          setActive(null)
        }
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setActive(null)
      }}
      onClickCapture={(e) => {
        if ((e.target as HTMLElement).closest('a')) setActive(null)
      }}
    >
      <ul className="flex items-center gap-0.5">
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
                'inline-flex h-9 items-center gap-1 px-3 text-xs font-medium text-white/85 transition-colors hover:bg-white/15 hover:text-white',
                active === cat.slug && 'bg-white/15 text-white',
              )}
              aria-expanded={active === cat.slug}
            >
              {cat.name}
              <ChevronDown
                className={cn(
                  'size-3 transition-transform',
                  active === cat.slug && 'rotate-180',
                )}
              />
            </Link>

            {active === cat.slug && (
              <div
                onMouseEnter={() => open(cat.slug)}
                onMouseLeave={scheduleClose}
                className="absolute left-0 right-0 top-full z-50"
              >
                <MegaPanel category={cat} />
              </div>
            )}
          </li>
        ))}

        <li aria-hidden className="mx-1 h-4 w-px bg-white/30" />

        {extraLinks
          .map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={pathname === link.href ? 'page' : undefined}
                className={cn(
                  'inline-flex h-9 items-center gap-1 px-3 text-xs font-medium transition-colors',
                  link.accent
                    ? 'text-yellow-200 hover:text-yellow-100'
                    : 'text-white/85 hover:bg-white/15 hover:text-white',
                )}
              >
                {link.accent && <Tag className="size-3" />}
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
    <div className="shams-panel max-h-[calc(100dvh-var(--shell-header-height)-32px)] overflow-y-auto overscroll-contain rounded-[var(--radius-editorial)] bg-popover">
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
              className="inline-flex items-center gap-1 min-h-11 text-xs font-medium text-brand-ink hover:underline"
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
                        className="block rounded-(--radius-control) py-1 text-sm text-foreground/80 transition-colors hover:text-brand-ink"
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
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-ink">
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
                className="object-contain transition-transform duration-standard ease-out-expo group-hover:scale-[1.04]"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">
                {formatMoney(featured.price)}
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-brand-ink">
                View <ArrowRight className="size-3.5" />
              </span>
            </div>
          </Link>
        )}
      </div>
    </div>
  )
}
