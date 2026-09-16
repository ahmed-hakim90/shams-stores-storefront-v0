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
import { SearchTrigger } from '../overlays/global-search-overlay'

import { MobileMenu } from '../shared/mobile-menu'
import { ShamsLogo } from '../shared/logo'
import { useInteractions } from '../providers/interaction-provider'
import { useAuth } from '../providers/auth-provider'

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
      className="sticky top-0 z-50 border-b border-border bg-background px-3 pt-[max(0px,env(safe-area-inset-top))] md:hidden"
    >
      <div className="relative flex h-11 items-center justify-between">
        <MobileMenu />
        <Link
          href="/"
          aria-label="Shams Stores home"
          className="absolute left-1/2 flex -translate-x-1/2 items-center justify-center"
        >
          <ShamsLogo className="w-[min(130px,calc(100vw-200px))]" />
        </Link>
        <div className="ml-auto flex items-center gap-0.5">
          <button
            type="button"
            onClick={openWishlist}
            aria-label="Open wishlist"
            className="relative flex size-9 items-center justify-center border border-border text-foreground/80 hover:border-brand/30 hover:text-brand-ink"
          >
            <Heart className="size-4" />
            <CountBadge count={wishlistCount} />
          </button>
          <button
            type="button"
            onClick={openCart}
            aria-label="Open cart"
            className="relative flex size-9 items-center justify-center border border-border text-foreground/80 hover:border-brand/30 hover:text-brand-ink"
          >
            <ShoppingBag className="size-4" />
            <CountBadge count={cartCount} />
          </button>
        </div>
      </div>
      <div className="pb-1.5">
        <SearchTrigger placeholder="Search gear…" />
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
      className="fixed inset-x-0 bottom-0 z-[55] border-t border-border bg-background pb-[max(0px,env(safe-area-inset-bottom))] md:hidden"
      data-fixed-bar
      aria-label="Mobile shopping navigation"
    >
      <div className="mx-auto grid h-14 max-w-lg grid-cols-5">
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
          const iconElement = isAccount && user ? (
            <span className="flex size-5 items-center justify-center rounded-full bg-brand text-[0.6rem] font-bold text-brand-foreground">
              {user.name.charAt(0).toUpperCase()}
            </span>
          ) : (
            <Icon className="size-[18px]" />
          )
          const baseClass =
            'relative flex flex-col items-center justify-center gap-0.5 text-muted-foreground'
          const activeClass = active ? 'text-foreground after:absolute after:bottom-0 after:left-1/2 after:h-0.5 after:w-6 after:-translate-x-1/2 after:bg-brand' : ''
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
