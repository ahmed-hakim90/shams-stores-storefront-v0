'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import {
  Heart,
  LogOut,
  MapPin,
  Package,
  Pencil,
  Phone,
  Scale,
  ShieldCheck,
  ShoppingCart,
  User,
} from 'lucide-react'
import { ShamsLogo } from './logo'
import { SearchTrigger } from './global-search-overlay'
import { MegaMenu } from './mega-menu'
import { MobileMenu } from './mobile-menu'
import { useInteractions } from './interaction-provider'
import { useAuth } from './auth-provider'
import { MobileHeader } from './mobile-navigation'

function IconAction({
  href,
  label,
  icon: Icon,
  count,
}: {
  href: string
  label: string
  icon: typeof Heart
  count?: number
}) {
  return (
    <Link
      href={href}
      className="shams-icon-control group relative size-10 shrink-0 text-foreground/80 hover:border-brand/30 hover:text-brand-ink"
    >
      <span className="relative">
        <Icon className="size-5" />
        {count !== undefined && count > 0 && (
          <span className="absolute -right-2 -top-2 inline-flex min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[0.55rem] font-semibold leading-4 text-brand-foreground">
            {count}
          </span>
        )}
      </span>
      <span className="sr-only">{label}</span>
    </Link>
  )
}

export function Header() {
  const { openWishlist, openCart, cartCount, wishlistCount, compareItems } =
    useInteractions()
  const { user, logout } = useAuth()
  const [accountOpen, setAccountOpen] = useState(false)
  const accountRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!accountOpen) return
    const onDown = (e: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) setAccountOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [accountOpen])
  const header = useRef<HTMLElement>(null)
  useEffect(() => {
    const el = header.current
    if (!el) return
    const update = () => {
      if (el.offsetHeight)
        document.documentElement.style.setProperty(
          '--shell-header-height',
          `${el.offsetHeight}px`,
        )
    }
    const observer = new ResizeObserver(update)
    observer.observe(el)
    update()
    return () => observer.disconnect()
  }, [])
  return (
    <>
      <MobileHeader />

      {/* Utility bar */}
      <div className="hidden border-b border-border bg-foreground text-white lg:block">
        <div className="mx-auto flex h-8 max-w-[1440px] items-center justify-between px-4 text-[11px]">
          <p className="inline-flex items-center gap-1.5">
            <ShieldCheck className="size-3" />
            Photography, cinema & creator gear · Expert advice
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="/orders"
              className="inline-flex items-center gap-1 hover:underline"
            >
              <Package className="size-3" /> Track order
            </Link>
            <Link
              href="/branches"
              className="inline-flex items-center gap-1 hover:underline"
            >
              <MapPin className="size-3" /> Branches
            </Link>
            <Link
              href="/support"
              className="inline-flex items-center gap-1 font-medium hover:underline"
            >
              <Phone className="size-3" /> 212-444-6615
            </Link>
            <span className="text-white/40">|</span>
            <span>EGP · English</span>
          </div>
        </div>
      </div>

      <header
        ref={header}
        className="sticky top-0 z-50 hidden border-b border-border bg-background/95 backdrop-blur md:block"
      >
        {/* Main row */}
        <div className="border-b border-border">
          <div className="shams-container flex min-w-0 items-center gap-2 py-2 sm:gap-3 lg:gap-4">
            <div className="flex min-w-0 shrink-0 h-10 items-center gap-1">
              <MobileMenu />
              <Link
                href="/"
                aria-label="Shams Stores home"
                className="flex h-10 items-center"
              >
                <ShamsLogo />
              </Link>
            </div>

            <SearchTrigger
              className="hidden min-w-0 flex-1 md:flex lg:max-w-none"
              placeholder="Search by model, brand, category or SKU…"
            />

            <div className="ml-auto flex shrink-0 items-center gap-0.5 sm:gap-0.5">
              <div ref={accountRef} className="relative">
                {user ? (
                  <button
                    type="button"
                    onClick={() => setAccountOpen((v) => !v)}
                    aria-expanded={accountOpen}
                    aria-label={`Account: ${user.name}`}
                    className="shams-icon-control group relative size-10 shrink-0 text-foreground/80 hover:border-brand/30 hover:text-brand-ink"
                  >
                    <span className="flex size-5 items-center justify-center rounded-full bg-brand text-[0.6rem] font-bold text-brand-foreground">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </button>
                ) : (
                  <Link
                    href="/account/login"
                    aria-label="Sign in"
                    className="shams-icon-control group relative size-10 shrink-0 text-foreground/80 hover:border-brand/30 hover:text-brand-ink"
                  >
                    <User className="size-5" />
                    <span className="sr-only">Sign in</span>
                  </Link>
                )}
                {accountOpen && user && (
                  <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-(--radius-card) border bg-background p-2 shadow-lg">
                    <div className="border-b px-3 py-2">
                      <p className="truncate text-sm font-semibold">{user.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <Link href="/account/orders" onClick={() => setAccountOpen(false)} className="flex items-center gap-2.5 rounded-(--radius-control) px-3 py-2 text-sm hover:bg-muted">
                      <Package className="size-4 text-muted-foreground" /> My orders
                    </Link>
                    <Link href="/account/addresses" onClick={() => setAccountOpen(false)} className="flex items-center gap-2.5 rounded-(--radius-control) px-3 py-2 text-sm hover:bg-muted">
                      <MapPin className="size-4 text-muted-foreground" /> Addresses
                    </Link>
                    <Link href="/account/profile" onClick={() => setAccountOpen(false)} className="flex items-center gap-2.5 rounded-(--radius-control) px-3 py-2 text-sm hover:bg-muted">
                      <Pencil className="size-4 text-muted-foreground" /> Personal info
                    </Link>
                    <div className="my-1 h-px bg-border" />
                    <button type="button" onClick={() => { setAccountOpen(false); logout() }} className="flex w-full items-center gap-2.5 rounded-(--radius-control) px-3 py-2 text-sm text-red-600 hover:bg-muted">
                      <LogOut className="size-4" /> Sign out
                    </button>
                  </div>
                )}
              </div>
              <IconAction
                href="/compare"
                label="Compare"
                icon={Scale}
                count={compareItems.length}
              />
              <button
                type="button"
                onClick={openWishlist}
                aria-label="Open wishlist"
                className="shams-icon-control group relative size-10 shrink-0 text-foreground/80 hover:border-brand/30 hover:text-brand-ink"
              >
                <span className="relative">
                  <Heart className="size-5" />
                  <span className="absolute -right-2 -top-2 inline-flex min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[0.55rem] font-semibold leading-4 text-brand-foreground">
                    {wishlistCount || ''}
                  </span>
                </span>
                <span className="sr-only">Wishlist</span>
              </button>
              <button
                onClick={openCart}
                aria-label="Open cart"
                className="shams-icon-control relative size-10 hover:border-brand/30 hover:text-brand-ink"
              >
                <ShoppingCart className="size-5" />
                {cartCount > 0 && (
                  <span aria-live="polite" aria-atomic="true" className="absolute right-0 top-0 rounded-full bg-brand px-1.5 text-[9px] text-brand-foreground">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Nav row - brand colored like B&H */}
        <div className="hidden bg-brand lg:block">
          <div className="shams-container flex items-center justify-between">
            <MegaMenu />
            <Link
              href="/branches"
              className="inline-flex h-9 items-center gap-1.5 text-xs font-medium text-white/90 transition-colors hover:text-white"
            >
              <MapPin className="size-3.5" />
              Visit Shams
            </Link>
          </div>
        </div>
      </header>
    </>
  )
}
