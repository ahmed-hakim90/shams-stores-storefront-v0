'use client'

import Link from 'next/link'
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
import { CartDrawer } from './cart-drawer'
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
      className="group relative flex size-11 shrink-0 items-center justify-center rounded-lg text-foreground/80 transition-colors hover:text-brand"
    >
      <span className="relative">
        <Icon className="size-5.5" />
        {count !== undefined && (
          <span className="absolute -right-2 -top-2 inline-flex min-w-4.5 items-center justify-center rounded-full bg-brand px-1 text-[0.6rem] font-semibold leading-4.5 text-brand-foreground">
            {count}
          </span>
        )}
      </span>
      <span className="hidden text-[0.65rem] font-medium xl:block">{label}</span>
    </Link>
  )
}

export function Header() {
  const { openWishlist } = useInteractions()
  return (
    <>
      <MobileHeader />
    <header className="sticky top-0 z-50 hidden bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:block">
      {/* Utility bar */}
      <div className="hidden border-b border-border bg-brand text-brand-foreground lg:block">
        <div className="mx-auto flex h-9 max-w-[1400px] items-center justify-between px-6 text-xs">
          <p className="inline-flex items-center gap-1.5">
            <ShieldCheck className="size-3.5" />
            Official & authorized products · Warranty on every order
          </p>
          <div className="flex items-center gap-5">
            <Link href="/orders" className="inline-flex items-center gap-1.5 hover:underline">
              <Package className="size-3.5" /> Track order
            </Link>
            <Link href="/branches" className="inline-flex items-center gap-1.5 hover:underline">
              <MapPin className="size-3.5" /> Branches
            </Link>
            <Link href="/support" className="inline-flex items-center gap-1.5 hover:underline">
              <Phone className="size-3.5" /> Talk to a specialist
            </Link>
            <span className="text-brand-foreground/70">|</span>
            <button type="button" className="hover:underline">
              EGP · English
            </button>
          </div>
        </div>
      </div>

      {/* Main row */}
      <div className="border-b border-border">
        <div className="mx-auto flex max-w-[1400px] items-center gap-3 px-4 py-3 sm:gap-5 sm:px-6">
          <div className="flex h-11 items-center gap-1">
            <MobileMenu />
            <Link href="/" aria-label="Shams Stores home" className="flex h-11 items-center">
              <ShamsLogo />
            </Link>
          </div>

          <SearchTrigger className="hidden flex-1 md:flex" placeholder="Search by model, brand, category or SKU…" />

          <div className="ml-auto flex items-center gap-0.5 sm:gap-1">
            <IconAction href="/account" label="Account" icon={User} />
            <IconAction href="/compare" label="Compare" icon={Scale} count={2} />
            <button type="button" onClick={openWishlist} aria-label="Open wishlist" className="group relative flex size-11 shrink-0 items-center justify-center rounded-lg text-foreground/80 transition-colors hover:text-brand"><span className="relative"><Heart className="size-5.5" /><span className="absolute -right-2 -top-2 inline-flex min-w-4.5 items-center justify-center rounded-full bg-brand px-1 text-[0.6rem] font-semibold leading-4.5 text-brand-foreground">5</span></span><span className="hidden text-[0.65rem] font-medium xl:block">Wishlist</span></button>
            <CartDrawer />
          </div>
        </div>

        {/* Mobile search */}
        <div className="px-4 pb-3 md:hidden">
          <SearchTrigger placeholder="Search cameras, lenses, audio and creator gear…" />
        </div>
      </div>

      {/* Nav row */}
      <div className="hidden border-b border-border lg:block">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6">
          <MegaMenu />
          <Link
            href="/branches"
            className="inline-flex items-center gap-1.5 py-2 text-sm font-medium text-foreground/80 transition-colors hover:text-brand"
          >
            <MapPin className="size-4 text-brand" />
            Downtown · Heliopolis
          </Link>
        </div>
      </div>
    </header>
    </>
  )
}
