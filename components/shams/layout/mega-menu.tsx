'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowRight, ChevronDown, Tag } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCatalogNavigation } from '@/components/shams/catalog'
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
  const navRef = useRef<HTMLElement>(null)
  const [topOffset, setTopOffset] = useState(0)
  const pathname = usePathname()

  useEffect(() => {
    const el = navRef.current
    if (!el) return
    const update = () => {
      const rect = el.getBoundingClientRect()
      setTopOffset(rect.top)
    }
    const observer = new ResizeObserver(update)
    observer.observe(el)
    update()
    return () => observer.disconnect()
  }, [])

  useEffect(() => () => window.clearTimeout(closeTimer.current), [])
  const open = (slug: string) => {
    window.clearTimeout(closeTimer.current)
    setActive(slug)
  }
  const scheduleClose = () => {
    closeTimer.current = window.setTimeout(() => setActive(null), 150)
  }

  const activeCategory = active
    ? categories.find((c) => c.slug === active)
    : undefined

  return (
    <nav
      ref={navRef}
      aria-label="Primary"
      className="relative hidden lg:block"
      onKeyDown={(e) => {
        if (e.key === 'Escape') setActive(null)
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
              prefetch={false}
              data-prefetch-on-intent
              onFocus={() => open(cat.slug)}
              className={cn(
                'inline-flex h-9 items-center gap-1 px-3 text-xs font-medium text-on-dark-muted transition-colors hover:bg-on-dark-border hover:text-on-dark',
                active === cat.slug && 'bg-on-dark-border text-on-dark',
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
          </li>
        ))}

        <li aria-hidden className="mx-1 h-4 w-px bg-on-dark-border-strong" />

        {extraLinks.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              prefetch={false}
              data-prefetch-on-intent
              aria-current={pathname === link.href ? 'page' : undefined}
              className={cn(
                'inline-flex h-9 items-center gap-1 px-3 text-xs font-medium transition-colors',
                link.accent
                  ? 'text-brand hover:text-brand-hover'
                  : 'text-on-dark-muted hover:bg-on-dark-border hover:text-on-dark',
              )}
            >
              {link.accent && <Tag className="size-3" />}
              {link.label}
            </Link>
          </li>
        ))}
      </ul>

      {activeCategory && (
        <div
          className="fixed left-0 right-0 z-40"
          style={{ top: topOffset }}
          onMouseEnter={() => open(activeCategory.slug)}
          onMouseLeave={scheduleClose}
        >
          <div className="shams-mega-panel-enter backdrop">
            <MegaPanel category={activeCategory} />
          </div>
        </div>
      )}
    </nav>
  )
}

function MegaPanel({ category }: { category: Category }) {
  const featured = category.featuredProductId
    ? commerce.products.byId(category.featuredProductId)
    : undefined

  return (
    <div className="-mt-px max-h-[calc(100dvh-var(--shell-header-height)-32px)] overflow-y-auto overscroll-contain bg-surface-raised shadow-lg">
      <div className="shams-container py-5">
        <div className="grid grid-cols-[1fr_18rem] gap-6">
          <div>
            <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
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
                prefetch={false}
                data-prefetch-on-intent
                className="inline-flex items-center gap-1 text-xs font-medium text-brand-ink hover:underline"
              >
                Shop all {category.itemCount}{' '}
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-6">
              {category.columns.map((col) => (
                <div key={col.heading}>
                  <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {col.heading}
                  </p>
                  <ul className="space-y-0.5">
                    {col.links.map((link) => (
                      <li key={link.label}>
                        <Link
                          href={link.href}
                          prefetch={false}
                          data-prefetch-on-intent
                          className="block py-1 text-sm text-foreground/80 transition-colors hover:text-brand-ink"
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
              prefetch={false}
              data-prefetch-on-intent
              className="group flex flex-col justify-between border border-border bg-surface-tint p-5"
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
              <div className="relative my-3 h-28 bg-surface-raised">
                <Image
                  src={featured.image || '/placeholder.svg'}
                  alt={featured.name}
                  fill
                  sizes="240px"
                  className="object-contain transition-transform duration-standard ease-out-expo group-hover:scale-[1.025]"
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
    </div>
  )
}
