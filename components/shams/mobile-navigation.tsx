'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
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
import { useAuth } from './auth-provider'

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
      className="sticky top-0 z-50 border-b border-border bg-background/95 px-3 pt-[max(0.25rem,env(safe-area-inset-top))] backdrop-blur md:hidden"
    >
      <div className="relative flex h-12 items-center justify-between px-0">
        <MobileMenu />
        <Link
          href="/"
          aria-label="Shams Stores home"
          className="absolute left-1/2 flex min-h-10 -translate-x-1/2 items-center justify-center"
        >
          <ShamsLogo className="w-[min(140px,calc(100vw-220px))]" />
        </Link>
        <div className="ml-auto flex items-center gap-0.5">
          <button
            type="button"
            onClick={openWishlist}
            aria-label="Open wishlist"
            className="shams-icon-control relative size-10 text-foreground/80 hover:border-brand/30 hover:text-brand-ink"
          >
            <Heart className="size-4.5" />
            <CountBadge count={wishlistCount} />
          </button>
          <button
            type="button"
            onClick={openCart}
            aria-label="Open cart"
            className="shams-icon-control relative size-10 text-foreground/80 hover:border-brand/30 hover:text-brand-ink"
          >
            <ShoppingBag className="size-4.5" />
            <CountBadge count={cartCount} />
          </button>
        </div>
      </div>
      <div className="pb-2">
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
  const { user } = useAuth()
  const nav = useRef<HTMLElement>(null)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 80)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      ref={nav}
      className={cn(
        'fixed inset-x-0 bottom-0 z-[55] px-4 pb-[max(0.375rem,env(safe-area-inset-bottom))] transition-all duration-300 ease-out md:hidden',
        scrolled ? 'px-8 pb-1' : 'px-5 pb-[max(0.2rem,env(safe-area-inset-bottom))]',
      )}
      data-fixed-bar
      aria-label="Mobile shopping navigation"
    >
      <GlassSurface
        className={cn(
          'mx-auto grid max-w-lg rounded-full bg-background/70 backdrop-blur-xl transition-all duration-300 ease-out',
          scrolled
            ? 'h-[2.7rem] gap-2 p-1'
            : 'h-[4.5rem] gap-4 p-1.5',
        )}
        style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}
      >
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
          const isAccount = label === 'Account'
          const iconSize = cn('transition-all duration-300', scrolled ? 'size-4' : 'size-5')
          const iconElement = isAccount && user ? (
            <span className={cn(
              'flex items-center justify-center rounded-full bg-brand-foreground font-bold text-brand transition-all duration-300',
              scrolled ? 'size-4 text-[0.5rem]' : 'size-5 text-[0.6rem]',
            )}>
              {user.name.charAt(0).toUpperCase()}
            </span>
          ) : (
            <Icon className={iconSize} />
          )
          return label === 'Search' ? (
            <button
              key={label}
              type="button"
              onClick={openSearch}
              aria-label={label}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'relative flex flex-col items-center justify-center gap-0.5 rounded-full font-medium transition-all duration-300',
                active
                  ? 'bg-brand text-brand-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
                scrolled ? 'min-h-0 py-1' : 'min-h-11 px-1',
              )}
            >
              {iconElement}
              <span className={cn(
                'transition-all duration-300',
                scrolled ? 'text-[0.6rem] leading-none' : 'text-[0.7rem] font-medium leading-none',
              )}>
                {label}
              </span>
            </button>
          ) : (
            <Link
              key={label}
              href={href}
              aria-current={active ? 'page' : undefined}
              aria-label={isAccount && user ? `Account: ${user.name}` : label}
              className={cn(
                'relative flex flex-col items-center justify-center gap-0.5 rounded-full font-medium transition-all duration-300',
                active
                  ? 'bg-brand text-brand-foreground shadow-sm'
                  : isAccount && user
                    ? 'text-foreground hover:text-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                scrolled ? 'min-h-0 py-1' : 'min-h-11 px-1',
              )}
            >
              {iconElement}
              <span className={cn(
                'transition-all duration-300',
                scrolled ? 'text-[0.6rem] leading-none' : 'text-[0.7rem] font-medium leading-none',
              )}>
                {label}
              </span>
            </Link>
          )
        })}
      </GlassSurface>
    </nav>
  )
}
