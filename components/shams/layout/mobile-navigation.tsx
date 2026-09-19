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
import { SearchTrigger } from '@/components/shams/overlays'

import { MobileMenu, ShamsLogo, useCountPulse } from '@/components/shams/shared'
import {
  preloadCartDrawer,
  useInteractions,
  useAuth,
} from '@/components/shams/providers'

function CountBadge({ count }: { count: number }) {
  const pulse = useCountPulse(count)
  if (!count) return null
  return (
    <span
      key={pulse}
      className={`absolute -right-1.5 -top-1.5 min-w-4 rounded-full bg-brand px-1 text-center text-[0.6rem] font-semibold leading-4 text-brand-foreground${pulse > 0 ? ' badge-pop' : ''}`}
    >
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
      className="border-b border-border bg-background/85 backdrop-blur-xl backdrop-saturate-150 shadow-[0_1px_8px_rgba(0,0,0,0.04)] px-3 pt-[max(0px,env(safe-area-inset-top))] md:hidden"
    >
      <div className="relative flex h-12 items-center justify-between">
        <MobileMenu />
        <Link
          href="/"
          aria-label="Shams Stores home"
          className="absolute left-1/2 flex -translate-x-1/2 items-center justify-center"
        >
          <ShamsLogo className="w-[min(130px,calc(100vw-200px))]" />
        </Link>
        <div className="ml-auto flex items-center gap-1.5">
          <button
            type="button"
            onClick={openWishlist}
            aria-label="Open wishlist"
            className="flex size-11 items-center justify-center text-foreground/80 transition-[color,scale] duration-fast hover:text-foreground active:scale-90"
          >
            <span className="relative inline-flex">
              <Heart className="size-[22px]" />
              <CountBadge count={wishlistCount} />
            </span>
          </button>
          <button
            type="button"
            onClick={openCart}
            onPointerEnter={preloadCartDrawer}
            onFocus={preloadCartDrawer}
            aria-label="Open cart"
            className="flex size-11 items-center justify-center text-foreground/80 transition-[color,scale] duration-fast hover:text-foreground active:scale-90"
          >
            <span className="relative inline-flex">
              <ShoppingBag className="size-[22px]" />
              <CountBadge count={cartCount} />
            </span>
          </button>
        </div>
      </div>
      <div className="pb-2">
        <SearchTrigger placeholder="Search gear…" />
      </div>
    </header>
  )
}

const items = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Shop', href: '/shop', icon: Grid2X2 },
  { label: 'Search', href: '/search', icon: Search },
  { label: 'Offers', href: '/deals', icon: Tag },
  { label: 'Account', href: '/account', icon: User },
]

export function MobileBottomNav() {
  const pathname = usePathname()
  const { openSearch } = useInteractions()
  const { user } = useAuth()
  const nav = useRef<HTMLElement>(null)
  const [intent, setIntent] = useState<string | null>(null)

  useEffect(() => {
    setIntent(null)
  }, [pathname])

  useEffect(() => {
    const el = nav.current
    if (!el) return
    const update = () => {
      if (el.offsetHeight)
        document.documentElement.style.setProperty(
          '--mobile-bottom-nav-height',
          `${el.offsetHeight}px`,
        )
    }
    const observer = new ResizeObserver(update)
    observer.observe(el)
    update()
    return () => {
      observer.disconnect()
      document.documentElement.style.removeProperty('--mobile-bottom-nav-height')
    }
  }, [])

  return (
    <nav
      ref={nav}
      className="fixed inset-x-0 bottom-0 z-[55] border-t border-border bg-background/85 backdrop-blur-xl backdrop-saturate-150 pb-[max(0px,env(safe-area-inset-bottom))] md:hidden"
      data-fixed-bar
      aria-label="Mobile shopping navigation"
    >
      <div className="mx-auto grid h-16 max-w-lg grid-cols-5 gap-1">
        <span className="sr-only">Store navigation</span>
        {items.map(({ label, href, icon: Icon }) => {
          const routeActive =
            label === 'Search'
              ? pathname.startsWith('/search')
              : label === 'Home'
                ? pathname === '/'
                : label === 'Shop'
                  ? pathname.startsWith('/shop') ||
                    pathname.startsWith('/c/') ||
                    pathname === '/categories'
                  : label === 'Offers'
                    ? pathname.startsWith('/deals')
                    : pathname.startsWith('/account')
          const active = intent ? intent === label : routeActive
          const isAccount = label === 'Account'
          const iconElement = isAccount && user ? (
            <span className="flex size-5 items-center justify-center rounded-full bg-brand text-[0.6rem] font-bold text-brand-foreground">
              {user.name.charAt(0).toUpperCase()}
            </span>
          ) : (
            <Icon className="size-[18px]" />
          )
          const baseClass =
            'relative flex flex-col items-center justify-center gap-1 text-muted-foreground transition-[color,scale] duration-instant motion-reduce:transition-none active:scale-[0.94]'
          const activeClass = active
            ? 'text-brand-ink bg-brand-muted'
            : ''
          return label === 'Search' ? (
            <button
              key={label}
              type="button"
              onClick={openSearch}
              aria-label={label}
              aria-current={active ? 'page' : undefined}
              className={`${baseClass} ${activeClass}`}
            >
              {iconElement}
              <span className="text-[10px] leading-none">{label}</span>
            </button>
          ) : (
            <Link
              key={label}
              href={href}
              onClick={() => setIntent(label)}
              aria-current={active ? 'page' : undefined}
              aria-label={isAccount && user ? `Account: ${user.name}` : label}
              className={`${baseClass} ${activeClass} ${isAccount && user ? 'text-foreground' : ''}`}
            >
              {iconElement}
              <span className="text-[10px] leading-none">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
