'use client'
import { useOverlayPresence } from './shell-policy'

import { useState, type ComponentProps } from 'react'
import Link from 'next/link'
import {
  ChevronDown,
  ChevronRight,
  Heart,
  Info,
  Layers,
  MapPin,
  Menu,
  MessageCircle,
  Package,
  Scale,
  ShieldCheck,
  Sparkles,
  Tag,
  Truck,
  User,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCatalogNavigation } from '@/components/shams/catalog'
import { useAuth } from '@/components/shams/providers'
import { commerce } from '@/lib/commerce'
import { ShamsLogo } from './logo'
import { Dialog } from '@base-ui/react/dialog'

const useCases = commerce.useCases.list()
const allBrands = commerce.brands.list()

const discoverLinks = [
  { label: 'Deals & offers', href: '/deals', icon: Tag },
  { label: 'New arrivals', href: '/new', icon: Sparkles },
  { label: 'Best sellers', href: '/best-sellers', icon: Sparkles },
  { label: 'Bundles', href: '/bundles', icon: Layers },
]

const accountLinks = [
  { label: 'Track order', href: '/orders', icon: Package },
  { label: 'Your account', href: '/account', icon: User },
  { label: 'Wishlist', href: '/wishlist', icon: Heart },
  { label: 'Compare gear', href: '/compare', icon: Scale },
]

const helpLinks = [
  { label: 'Visit our branches', href: '/branches', icon: MapPin, desc: 'Downtown & Heliopolis' },
  { label: 'Talk to Shams', href: '/support', icon: MessageCircle, desc: 'Advice & order support' },
  { label: 'Contact us', href: '/contact', icon: MessageCircle, desc: 'Call, WhatsApp or email' },
  { label: 'About Shams', href: '/about', icon: Info, desc: 'Our story & values' },
  { label: 'Terms & conditions', href: '/terms', icon: Package, desc: 'Purchase terms' },
  { label: 'Privacy policy', href: '/privacy', icon: ShieldCheck, desc: 'Your data & rights' },
  { label: 'Cookie policy', href: '/cookies', icon: Info, desc: 'How we use cookies' },
]

function MenuLink(props: ComponentProps<typeof Link>) {
  return <Link {...props} prefetch={false} data-prefetch-on-intent />
}

export function MobileMenu() {
  const { categories, liveMode } = useCatalogNavigation()
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [showBrands, setShowBrands] = useState(false)

  useOverlayPresence(open)
  return (
    <Dialog.Root open={open} onOpenChange={(v) => { setOpen(v); if (!v) setShowBrands(false) }}>
      <Dialog.Trigger
        aria-label="Open menu"
        className="shams-icon-control relative size-11 text-foreground/80 hover:border-brand/30 hover:text-brand-ink lg:hidden"
      >
        <Menu className="size-5" />
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Backdrop data-overlay-backdrop className="fixed inset-0 z-[140] bg-foreground/40 backdrop-blur-sm" />
        <Dialog.Popup data-overlay="menu" className="fixed inset-y-0 left-0 z-[141] flex h-dvh w-[88%] max-w-sm flex-col rounded-r-[var(--radius-editorial)] bg-background">
          <Dialog.Title className="sr-only">Mobile navigation</Dialog.Title>

          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <ShamsLogo />
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="shams-icon-control size-11 hover:border-brand/30 hover:text-brand-ink"
            >
              <X className="size-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto overscroll-contain">
            {/* Shop by Category */}
            <nav aria-label="Categories" className="p-2">
              <MenuLink
                href="/categories"
                onClick={() => setOpen(false)}
                className="flex items-center justify-between px-3 pb-1 pt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-brand-ink"
              >
                Shop by category
                <ChevronRight className="size-3.5" />
              </MenuLink>
              <ul>
                {categories.map((cat) => {
                  const isOpen = expanded === cat.slug
                  return (
                    <li key={cat.slug} className="border-b border-border/60">
                      <div className="flex items-center">
                        <MenuLink
                          href={`/c/${cat.slug}`}
                          onClick={() => setOpen(false)}
                          className="flex-1 py-3 pl-3 text-sm font-medium text-foreground"
                        >
                          {cat.name}
                        </MenuLink>
                        <button
                          type="button"
                          aria-label={`Expand ${cat.name}`}
                          aria-expanded={isOpen}
                          onClick={() => setExpanded(isOpen ? null : cat.slug)}
                          className="inline-flex size-11 items-center justify-center text-muted-foreground"
                        >
                          <ChevronDown
                            className={cn(
                              'size-4 transition-transform duration-fast',
                              isOpen && 'rotate-180',
                            )}
                          />
                        </button>
                      </div>
                      {isOpen && (
                        <div className="grid grid-cols-2 gap-x-3 gap-y-1 pb-3 pl-3 pr-2">
                          {cat.columns
                            .flatMap((col) => col.links)
                            .map((link) => (
                              <MenuLink
                                key={link.label + link.href}
                                href={link.href}
                                onClick={() => setOpen(false)}
                                className="truncate py-1.5 text-sm text-muted-foreground hover:text-brand-ink"
                              >
                                {link.label}
                              </MenuLink>
                            ))}
                        </div>
                      )}
                    </li>
                  )
                })}
              </ul>
            </nav>

            {/* Shop by Brand */}
            <div className="p-2">
              <MenuLink
                href="/brands"
                onClick={() => setOpen(false)}
                className="flex items-center justify-between px-3 pb-1 pt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-brand-ink"
              >
                Shop by brand
                <ChevronRight className="size-3.5" />
              </MenuLink>
              <button
                type="button"
                onClick={() => setShowBrands((v) => !v)}
                className="w-full px-3 py-1 text-xs text-muted-foreground hover:text-brand-ink"
              >
                {showBrands ? 'Hide brands' : 'Show all brands'}
              </button>
              {showBrands && (
                <div className="px-3 pb-2">
                  <MenuLink
                    href="/brands"
                    onClick={() => setOpen(false)}
                    className="mb-2 block rounded-(--radius-control) bg-brand-muted px-3 py-2 text-sm font-semibold text-brand-ink"
                  >
                    View all brands
                  </MenuLink>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
                    {allBrands.map((brand) => (
                      <MenuLink
                        key={brand.slug}
                        href={`/b/${brand.slug}`}
                        onClick={() => setOpen(false)}
                        className="flex items-center justify-between py-2 text-sm text-foreground/80 hover:text-brand-ink"
                      >
                        <span className="truncate">{brand.name}</span>
                        <span className="ml-2 text-xs text-muted-foreground">{brand.productCount}</span>
                      </MenuLink>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Workflows */}
            {!liveMode && (
              <div className="p-2">
                <p className="px-3 pb-1 pt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Shop by workflow
                </p>
                <div className="flex flex-wrap gap-2 px-3 pb-2">
                  {useCases.map((u) => (
                    <MenuLink
                      key={u.slug}
                      href={`/w/${u.slug}`}
                      onClick={() => setOpen(false)}
                      className="rounded-full border border-border px-3 py-1.5 text-sm text-foreground hover:border-brand hover:text-brand-ink"
                    >
                      {u.name}
                    </MenuLink>
                  ))}
                </div>
              </div>
            )}

            {/* Divider */}
            <div className="mx-4 my-1 h-px bg-border" />

            {/* Discover */}
            <div className="p-2">
              <p className="px-3 pb-1 pt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Discover
              </p>
              <ul>
                {discoverLinks
                  .map((item) => (
                    <li key={item.href}>
                      <MenuLink
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 rounded-(--radius-control) px-4 py-2.5 text-sm text-foreground hover:bg-muted"
                      >
                        <item.icon className="size-4 text-muted-foreground" />
                        {item.label}
                      </MenuLink>
                    </li>
                  ))}
              </ul>
            </div>

            {/* Divider */}
            <div className="mx-4 my-1 h-px bg-border" />

            {/* Your account */}
            <div className="p-2">
              {user ? (
                <>
                  <div className="flex items-center gap-3 px-3 pb-1 pt-3">
                    <span className="flex size-9 items-center justify-center rounded-full bg-brand text-sm font-bold text-brand-foreground">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{user.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <ul>
                    {accountLinks.map((item) => (
                      <li key={item.href}>
                        <MenuLink
                          href={item.href}
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-3 rounded-(--radius-control) px-4 py-2.5 text-sm text-foreground hover:bg-muted"
                        >
                          <item.icon className="size-4 text-muted-foreground" />
                          {item.label}
                        </MenuLink>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <>
                  <p className="px-3 pb-1 pt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Your account
                  </p>
                  <ul>
                    <li>
                      <MenuLink
                        href="/account/login"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 rounded-(--radius-control) bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground"
                      >
                        <User className="size-4" />
                        Sign in
                      </MenuLink>
                    </li>
                    <li>
                      <MenuLink
                        href="/account/register"
                        onClick={() => setOpen(false)}
                        className="mt-1 flex items-center gap-3 rounded-(--radius-control) border border-brand px-4 py-2.5 text-sm font-semibold text-brand-ink"
                      >
                        Create account
                      </MenuLink>
                    </li>
                    {accountLinks.map((item, i) => (
                      <li key={item.href} className={i === 0 ? 'mt-2' : undefined}>
                        <MenuLink
                          href={item.href}
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-3 rounded-(--radius-control) px-4 py-2.5 text-sm text-foreground hover:bg-muted"
                        >
                          <item.icon className="size-4 text-muted-foreground" />
                          {item.label}
                        </MenuLink>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>

            {/* Divider */}
            <div className="mx-4 my-1 h-px bg-border" />

            {/* Help & Info */}
            <div className="p-2 pb-4">
              <p className="px-3 pb-1 pt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Help & info
              </p>
              <ul>
                {helpLinks.map((item) => (
                  <li key={item.href}>
                    <MenuLink
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="flex items-start gap-3 rounded-(--radius-control) px-4 py-2.5 text-sm hover:bg-muted"
                    >
                      <item.icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                      <span className="flex flex-col">
                        <span className="text-foreground">{item.label}</span>
                        {item.desc && (
                          <span className="text-xs text-muted-foreground">{item.desc}</span>
                        )}
                      </span>
                    </MenuLink>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-border px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] text-xs text-muted-foreground">
            <span>Egypt · EGP · English</span>
            <span className="inline-flex items-center gap-1">
              <Truck className="size-3.5" /> Free delivery over 5,000 EGP
            </span>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
