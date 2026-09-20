'use client'

import {
  useEffect,
  useMemo,
  useState,
} from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import dynamic from 'next/dynamic'
import { MobileBottomNav as GlassMobileBottomNav } from '../layout/mobile-navigation'
import { Header } from '../layout/header'
import Link from 'next/link'
import { ShamsLogo } from '../shared/logo'
import {
  ShellPolicyProvider,
  useOverlayPresence,
  useOverlayActive,
} from '../shared/shell-policy'
import type { ShellVariant } from '@/lib/commerce/experience'
import { NoticeProvider, useNotices } from './notice-provider'
import { CompareProvider, useCompare } from './compare-provider'
import { WishlistProvider, useWishlist } from './wishlist-provider'
import { OverlayProvider, useOverlays } from './overlay-provider'
import { CartProvider, useCart } from './cart-provider'
import type { CartLine } from '@/lib/commerce/types'
export type { CartLine } from '@/lib/commerce/types'

const GlobalSearchOverlay = dynamic(
  () => import('../overlays/global-search-overlay').then((mod) => mod.GlobalSearchOverlay),
  { ssr: false },
)
const WishlistDrawer = dynamic(
  () => import('../overlays/wishlist-drawer').then((mod) => mod.WishlistDrawer),
  { ssr: false },
)
const CompareTray = dynamic(
  () => import('../overlays/compare-tray').then((mod) => mod.CompareTray),
  { ssr: false },
)
const loadCartDrawer = () =>
  import('../cart/cart-drawer').then((mod) => mod.CartDrawer)
const CartDrawer = dynamic(loadCartDrawer, { ssr: false })

function allowsIntentPrefetch() {
  const connection = (
    navigator as Navigator & {
      connection?: { effectiveType?: string; saveData?: boolean }
    }
  ).connection
  return !(
    connection?.saveData ||
    connection?.effectiveType === 'slow-2g' ||
    connection?.effectiveType === '2g'
  )
}

export function preloadCartDrawer() {
  if (allowsIntentPrefetch()) void loadCartDrawer()
}

export function useInteractions() {
  const notices = useNotices()
  const compare = useCompare()
  const wishlist = useWishlist()
  const overlays = useOverlays()
  const cart = useCart()

  return useMemo(
    () => ({
      ...cart,
      ...wishlist,
      ...compare,
      ...overlays,
      ...notices,
    }),
    [cart, wishlist, compare, overlays, notices],
  )
}

export function InteractionProvider({
  children,
  liveMode = false,
}: {
  children: React.ReactNode
  liveMode?: boolean
}) {
  return (
    <NoticeProvider>
      <CompareProvider>
        <WishlistProvider>
          <OverlayProvider>
            <CartProvider liveMode={liveMode}>{children}</CartProvider>
          </OverlayProvider>
        </WishlistProvider>
      </CompareProvider>
    </NoticeProvider>
  )
}

function useIntentPrefetch() {
  const router = useRouter()
  useEffect(() => {
    if (!allowsIntentPrefetch()) return
    const timers = new Map<HTMLAnchorElement, number>()
    const prefetched = new Set<string>()
    const anchorFor = (target: EventTarget | null) =>
      target instanceof Element
        ? target.closest<HTMLAnchorElement>('a[data-prefetch-on-intent]')
        : null
    const cancel = (anchor: HTMLAnchorElement | null) => {
      if (!anchor) return
      const timer = timers.get(anchor)
      if (timer === undefined) return
      window.clearTimeout(timer)
      timers.delete(anchor)
    }
    const schedule = (anchor: HTMLAnchorElement | null) => {
      if (!anchor || timers.has(anchor)) return
      const href = anchor.getAttribute('href')
      if (!href || !href.startsWith('/') || href.startsWith('//') || prefetched.has(href))
        return
      timers.set(
        anchor,
        window.setTimeout(() => {
          timers.delete(anchor)
          prefetched.add(href)
          router.prefetch(href)
        }, 120),
      )
    }
    const pointerEnter = (event: PointerEvent) => {
      const anchor = anchorFor(event.target)
      if (anchor && event.relatedTarget instanceof Node && anchor.contains(event.relatedTarget))
        return
      schedule(anchor)
    }
    const pointerLeave = (event: PointerEvent) => {
      const anchor = anchorFor(event.target)
      if (anchor && event.relatedTarget instanceof Node && anchor.contains(event.relatedTarget))
        return
      cancel(anchor)
    }
    const focusEnter = (event: FocusEvent) => schedule(anchorFor(event.target))
    const focusLeave = (event: FocusEvent) => cancel(anchorFor(event.target))
    document.addEventListener('pointerover', pointerEnter)
    document.addEventListener('pointerout', pointerLeave)
    document.addEventListener('focusin', focusEnter)
    document.addEventListener('focusout', focusLeave)
    return () => {
      document.removeEventListener('pointerover', pointerEnter)
      document.removeEventListener('pointerout', pointerLeave)
      document.removeEventListener('focusin', focusEnter)
      document.removeEventListener('focusout', focusLeave)
      timers.forEach((timer) => window.clearTimeout(timer))
    }
  }, [router])
}

export function RouteProgress() {
  const pathname = usePathname()
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const anchor = (event.target as HTMLElement).closest('a')
      if (
        anchor?.href &&
        anchor.origin === window.location.origin &&
        anchor.pathname !== pathname
      )
        setLoading(true)
    }
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [pathname])
  useEffect(() => {
    setLoading(false)
  }, [pathname])
  return loading ? (
    <div
      className="fixed inset-x-0 top-0 z-[120] h-0.5 overflow-hidden bg-brand-muted"
      role="progressbar"
      aria-label="Loading page"
    >
      <div className="h-full w-1/3 animate-pulse bg-brand" />
    </div>
  ) : null
}

function ShellFrame({
  children,
  footer,
}: {
  children: React.ReactNode
  footer?: React.ReactNode
}) {
  const pathname = usePathname()
  useIntentPrefetch()
  const variant: ShellVariant =
    pathname === '/checkout' || pathname === '/order/success'
      ? 'checkout'
      : 'store'
  const { cartOpen, wishlistOpen, searchOpen } = useInteractions()
  useOverlayPresence(cartOpen || wishlistOpen || searchOpen)
  const overlayActive = useOverlayActive()
  return (
    <div data-shell={variant} data-overlay-active={overlayActive}>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-(--radius-control) focus:bg-card focus:p-4"
      >
        Skip to content
      </a>
      {variant === 'checkout' ? (
        <header className="border-b border-border bg-card">
          <div className="shams-container flex min-h-20 flex-wrap items-center justify-between gap-3 py-3">
            <Link href="/" aria-label="Shams Stores home">
              <ShamsLogo />
            </Link>
            <Link
              href="/cart"
              className="flex min-h-11 items-center gap-2 text-sm"
            >
              <ArrowLeft className="size-4" />
              Back to cart
            </Link>
            <Link
              href="/support"
              className="flex min-h-11 items-center text-sm text-brand-ink"
            >
              Need a specialist?
            </Link>
          </div>
        </header>
      ) : (
        <Header />
      )}
      <div
        id="main-content"
        tabIndex={-1}
        className={variant === 'store' ? 'shams-shell-content' : 'pb-8'}
      >
        {children}
      </div>
      {variant === 'store' && footer}
      <RouteProgress />
      {cartOpen && <CartDrawer showTrigger={false} />}
      {variant === 'store' && (
        <>
          <GlobalSearchOverlay />
          <WishlistDrawer />
          <CompareTray />
          <GlassMobileBottomNav />
        </>
      )}
    </div>
  )
}
export function InteractionShell({
  children,
  footer,
  liveMode = false,
}: {
  children: React.ReactNode
  footer?: React.ReactNode
  liveMode?: boolean
}) {
  return (
    <InteractionProvider liveMode={liveMode}>
      <ShellPolicyProvider>
        <ShellFrame footer={footer}>{children}</ShellFrame>
      </ShellPolicyProvider>
    </InteractionProvider>
  )
}

export function InteractionButton({
  label,
  onClick,
  className,
}: {
  label: string
  onClick?: () => void
  className?: string
}) {
  const [pending, setPending] = useState(false)
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        setPending(true)
        onClick?.()
        window.setTimeout(() => setPending(false), 600)
      }}
      className={cn(
        'transition-[background-color,opacity,transform] active:scale-[0.98] disabled:cursor-wait disabled:opacity-70',
        className,
      )}
    >
      {pending ? 'Loading…' : label}
    </button>
  )
}
