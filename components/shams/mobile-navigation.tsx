'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'
import {
  Grid2X2,
  Heart,
  Home,
  Menu,
  Search,
  ShoppingBag,
  Tag,
  User,
} from 'lucide-react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { GlassSurface } from './glass-surface'
import { SearchTrigger } from './global-search-overlay'

import { MobileMenu } from './mobile-menu'
import { ShamsLogo } from './logo'
import { useInteractions } from './interaction-provider'

function CountBadge({ count }: { count: number }) {
  if (!count) return null
  return (
    <span className="absolute -right-2 -top-2 min-w-4 rounded-full bg-brand px-1 text-center text-[0.6rem] font-semibold leading-4 text-brand-foreground">
      {count}
    </span>
  )
}

export function MobileHeader() {
  const { openWishlist, openCart, wishlistCount, cartCount } = useInteractions()
  const header = useRef<HTMLElement>(null)
  useEffect(() => {
    const el = header.current
    if (!el) return
    const observer = new ResizeObserver(() => {
      if (el.offsetHeight)
        document.documentElement.style.setProperty(
          '--shell-header-height',
          `${el.offsetHeight}px`,
        )
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  return (
    <header
      ref={header}
      className="sticky top-0 z-50 border-b border-border bg-background/95 px-3 pt-[max(0.375rem,env(safe-area-inset-top))] shadow-[0_10px_30px_-28px_rgb(17_17_17_/_0.6)] backdrop-blur md:hidden"
    >
      <div className="relative flex h-14 items-center justify-between px-0">
        <MobileMenu />
        <Link
          href="/"
          aria-label="Shams Stores home"
          className="absolute left-1/2 flex min-h-11 -translate-x-1/2 items-center justify-center"
        >
          <ShamsLogo className="w-[min(152px,calc(100vw-240px))]" />
        </Link>
        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={openWishlist}
            aria-label="Open wishlist"
            className="shams-icon-control relative size-11 text-foreground/80 hover:border-brand/30 hover:text-brand-ink"
          >
            <Heart className="size-5" />
            <CountBadge count={wishlistCount} />
          </button>
          <button
            type="button"
            onClick={openCart}
            aria-label="Open cart"
            className="shams-icon-control relative size-11 text-foreground/80 hover:border-brand/30 hover:text-brand-ink"
          >
            <ShoppingBag className="size-5" />
            <CountBadge count={cartCount} />
          </button>
        </div>
      </div>
      <div className="pb-3">
        <SearchTrigger placeholder="Search cameras, lenses, audio and creator gear…" />
      </div>
    </header>
  )
}

const items = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Shop', href: '/categories', icon: Grid2X2 },
  { label: 'Search', href: '/search', icon: Search },
  { label: 'Offers', href: '/deals', icon: Tag },
  { label: 'Account', href: '/account', icon: User },
]

export function MobileBottomNav() {
  const pathname = usePathname()
  const { openSearch } = useInteractions()
  return (
    <nav
      className="fixed  inset-x-0 bottom-0 z-[55] px-5 pb-[max(0.2rem,env(safe-area-inset-bottom))] md:hidden"
      data-fixed-bar
      aria-label="Mobile shopping navigation"
    >
      <GlassSurface className="mx-auto grid h-[4.5rem] max-w-lg grid-cols-5 gap-6 rounded-full bg-background/55 backdrop-blur p-1.2 shadow-lg">
        <span className="sr-only">Store navigation</span>
        {items.map(({ label, href, icon: Icon }) => {
          const active =
            label === 'Search'
              ? pathname.startsWith('/search')
              : label === 'Home'
                ? pathname === '/'
                : label === 'Shop'
                  ? pathname.startsWith('/c/') || pathname === '/categories'
                  : label === 'Offers'
                    ? pathname.startsWith('/deals')
                    : pathname.startsWith('/account')
          const content = (
            <>
              <Icon className="size-5" />
              <span className="text-[0.75rem] font-medium">{label}</span>
            </>
          )
          return label === 'Search' ? (
            <button
              key={label}
              type="button"
              onClick={openSearch}
              aria-label={label}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'relative flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-full px-1 font-medium transition-colors',
                active
                  ? 'bg-brand text-brand-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {content}
            </button>
          ) : (
            <Link
              key={label}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'relative flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-full  font-medium transition-colors',
                active
                  ? 'bg-brand text-brand-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {content}
            </Link>
          )
        })}
      </GlassSurface>
    </nav>
  )
}
