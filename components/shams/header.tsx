'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'
import {
  Heart,
  MapPin,
  Package,
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
      className="shams-icon-control group relative size-11 shrink-0 text-foreground/80 hover:border-brand/30 hover:text-brand-ink"
    >
      <span className="relative">
        <Icon className="size-5.5" />
        {count !== undefined && count > 0 && (
          <span className="absolute -right-2 -top-2 inline-flex min-w-4.5 items-center justify-center rounded-full bg-brand px-1 text-[0.6rem] font-semibold leading-4.5 text-brand-foreground">
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
        <div className="mx-auto flex h-9 max-w-[1440px] items-center justify-between px-6 text-xs">
          <p className="inline-flex items-center gap-1.5">
            <ShieldCheck className="size-3.5" />
            Photography, cinema & creator gear · Expert advice
          </p>
          <div className="flex items-center gap-5">
            <Link
              href="/orders"
              className="inline-flex items-center gap-1.5 hover:underline"
            >
              <Package className="size-3.5" /> Track order
            </Link>
            <Link
              href="/branches"
              className="inline-flex items-center gap-1.5 hover:underline"
            >
              <MapPin className="size-3.5" /> Branches
            </Link>
            <Link
              href="/support"
              className="inline-flex items-center gap-1.5 hover:underline"
            >
              <Phone className="size-3.5" /> Talk to a specialist
            </Link>
            <span className="text-white/50">|</span>
            <span>EGP · English</span>
          </div>
        </div>
      </div>

      <header
        ref={header}
        className="sticky top-0 z-50 hidden border-b border-border bg-background/95 shadow-[0_10px_30px_-28px_rgb(17_17_17_/_0.6)] backdrop-blur md:block"
      >
        {/* Main row */}
        <div className="border-b border-border">
          <div className="shams-container flex min-w-0 items-center gap-2 py-3 sm:gap-4 lg:gap-5">
            <div className="flex min-w-0 shrink-0 h-11 items-center gap-1">
              <MobileMenu />
              <Link
                href="/"
                aria-label="Shams Stores home"
                className="flex h-11 items-center"
              >
                <ShamsLogo />
              </Link>
            </div>

            <SearchTrigger
              className="hidden min-w-0 flex-1 md:flex lg:max-w-none"
              placeholder="Search by model, brand, category or SKU…"
            />

            <div className="ml-auto flex shrink-0 items-center gap-0.5 sm:gap-1">
              <IconAction href="/account" label="Account" icon={User} />
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
                className="shams-icon-control group relative size-11 shrink-0 text-foreground/80 hover:border-brand/30 hover:text-brand-ink"
              >
                <span className="relative">
                  <Heart className="size-5.5" />
                  <span className="absolute -right-2 -top-2 inline-flex min-w-4.5 items-center justify-center rounded-full bg-brand px-1 text-[0.6rem] font-semibold leading-4.5 text-brand-foreground">
                    {wishlistCount || ''}
                  </span>
                </span>
                <span className="sr-only">Wishlist</span>
              </button>
              <button
                onClick={openCart}
                aria-label="Open cart"
                className="shams-icon-control relative size-11 hover:border-brand/30 hover:text-brand-ink"
              >
                <ShoppingCart className="size-5.5" />
                {cartCount > 0 && (
                  <span className="absolute right-0 top-0 rounded-full bg-brand px-1.5 text-[10px] text-brand-foreground">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Nav row */}
        <div className="hidden border-b border-border lg:block">
          <div className="shams-container flex items-center justify-between">
            <MegaMenu />
            <Link
              href="/branches"
              className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-foreground/80 transition-colors hover:text-brand-ink"
            >
              <MapPin className="size-4 text-brand-ink" />
              Visit Shams
            </Link>
          </div>
        </div>
      </header>
    </>
  )
}
