'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Check, Info, X, AlertTriangle } from 'lucide-react'
import type { Product } from '@/lib/commerce'
import { commerce } from '@/lib/commerce'
import { cn } from '@/lib/utils'
import { GlobalSearchOverlay } from './global-search-overlay'
import { MobileBottomNav as GlassMobileBottomNav } from './mobile-navigation'
import { Header } from './header'

type Notice = { id: number; message: string; tone: 'success' | 'error' | 'warning' | 'info' }
export type CartLine = {
  id: string
  productId: string
  productName: string
  productImage?: string
  quantity: number
  price: number
  bundleId?: string
  bundleGroupId?: string
  bundleName?: string
  bundleItemRole?: string
  bundlePricingMetadata?: { regularTotal: number; bundleTotal: number; savingsAmount: number; currency: 'EGP' }
}
type InteractionContextValue = {
  liveMode: boolean
  cartCount: number
  cartLines: CartLine[]
  addBundleToCart: (bundle: { id: string; name: string; bundlePrice: { amount: number }; originalPrice: { amount: number }; items: { productId: string; role: string; required?: boolean }[]; products: { id: string; name: string; image: string; price: { amount: number }; stock: string }[] }) => boolean
  removeCartLine: (id: string) => void
  removeBundleFromCart: (bundleGroupId: string) => void
  wishlistCount: number
  wishlistItems: string[]
  compareItems: string[]
  wishlistOpen: boolean
  cartOpen: boolean
  searchOpen: boolean
  openWishlist: () => void
  closeWishlist: () => void
  openCart: () => void
  closeCart: () => void
  openSearch: () => void
  closeSearch: () => void
  addToCart: (product: Product | string, quantity?: number) => boolean
  toggleWishlist: (name: string) => void
  isWishlisted: (name: string) => boolean
  toggleCompare: (name: string) => void
  notify: (message: string, tone?: Notice['tone']) => void
  stickyPurchaseVisible: boolean
  setStickyPurchaseVisible: (visible: boolean) => void
}

const InteractionContext = createContext<InteractionContextValue | null>(null)

export function useInteractions() {
  const context = useContext(InteractionContext)
  if (!context) throw new Error('useInteractions must be used inside InteractionProvider')
  return context
}

function ToastStack({ notices, dismiss }: { notices: Notice[]; dismiss: (id: number) => void }) {
  const icons = { success: Check, error: X, warning: AlertTriangle, info: Info }
  return <div className="fixed inset-x-4 bottom-[calc(var(--fixed-stack-bottom)+var(--sticky-purchase-offset)+var(--compare-tray-offset)+0.75rem)] z-[110] flex flex-col items-end gap-2 sm:inset-x-auto sm:right-5 sm:w-80" aria-live="polite">
    {notices.map((notice) => { const Icon = icons[notice.tone]; return <div key={notice.id} role="status" className="flex w-full items-center gap-3 rounded-lg border border-border bg-card px-3 py-3 text-sm shadow-md">
      <span className={cn('flex size-7 shrink-0 items-center justify-center rounded-full', notice.tone === 'success' && 'bg-success-muted text-success', notice.tone === 'error' && 'bg-danger-muted text-danger', notice.tone === 'warning' && 'bg-warning-muted text-warning', notice.tone === 'info' && 'bg-brand-muted text-brand')}><Icon className="size-4" /></span>
      <span className="flex-1 text-foreground">{notice.message}</span><button type="button" onClick={() => dismiss(notice.id)} className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted" aria-label="Dismiss notification"><X className="size-4" /></button>
    </div> })}
  </div>
}

export function InteractionProvider({ children, liveMode = false }: { children: React.ReactNode; liveMode?: boolean }) {
  const [cartLines, setCartLines] = useState<CartLine[]>([])
  const cartCount = cartLines.reduce((total, line) => total + line.quantity, 0)
  const [wishlistItems, setWishlistItems] = useState<string[]>([])
  const [compareItems, setCompareItems] = useState<string[]>([])
  const [wishlistOpen, setWishlistOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [notices, setNotices] = useState<Notice[]>([])
  const [stickyPurchaseVisible, setStickyPurchaseVisible] = useState(false)
  const hydrated = useRef(false)
  useEffect(() => {
    try {
      const savedWishlist = window.localStorage.getItem('shams-wishlist-ids')
      const savedCompare = window.localStorage.getItem('shams-compare-ids')
      const savedCart = window.localStorage.getItem(`shams-cart-lines-v2-${liveMode ? 'woo' : 'mock'}`)
      if (savedWishlist) setWishlistItems(JSON.parse(savedWishlist))
      if (savedCompare) setCompareItems(JSON.parse(savedCompare))
      if (savedCart) setCartLines(JSON.parse(savedCart))
    } catch { /* Mock persistence is best-effort. */ } finally { hydrated.current = true }
  }, [])
  useEffect(() => { if (hydrated.current) window.localStorage.setItem('shams-wishlist-ids', JSON.stringify(wishlistItems)) }, [wishlistItems])
  useEffect(() => { if (hydrated.current) window.localStorage.setItem('shams-compare-ids', JSON.stringify(compareItems)) }, [compareItems])
  useEffect(() => { if (hydrated.current) window.localStorage.setItem(`shams-cart-lines-v2-${liveMode ? 'woo' : 'mock'}`, JSON.stringify(cartLines)) }, [cartLines])
  useEffect(() => {
    document.documentElement.style.setProperty('--sticky-purchase-offset', stickyPurchaseVisible ? 'var(--sticky-purchase-height)' : '0px')
    document.documentElement.style.setProperty('--compare-tray-offset', compareItems.length && !wishlistOpen && !cartOpen ? 'var(--compare-tray-height)' : '0px')
    return () => { document.documentElement.style.removeProperty('--sticky-purchase-offset'); document.documentElement.style.removeProperty('--compare-tray-offset') }
  }, [stickyPurchaseVisible, compareItems.length, wishlistOpen, cartOpen])
  useEffect(() => {
    const locked = wishlistOpen || cartOpen || searchOpen
    document.body.style.overflow = locked ? 'hidden' : ''
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') { setWishlistOpen(false); setCartOpen(false); setSearchOpen(false) } }
    if (locked) document.addEventListener('keydown', onKeyDown)
    return () => { document.body.style.overflow = ''; document.removeEventListener('keydown', onKeyDown) }
  }, [wishlistOpen, cartOpen, searchOpen])
  const notify = useCallback((message: string, tone: Notice['tone'] = 'success') => { const id = Date.now(); setNotices((current) => { const existing = current.find((item) => item.message === message && item.tone === tone); if (existing) return current.map((item) => item.id === existing.id ? { ...item, id } : item); return [...current.slice(-1), { id, message, tone }] }); window.setTimeout(() => setNotices((current) => current.filter((item) => item.id !== id)), 3200) }, [])
  const addToCart = useCallback((input: Product | string, quantity = 1) => {
    const product = typeof input === 'string' ? (liveMode ? undefined : commerce.products.list().find((item) => item.id === input || item.name === input)) : input
    if (!product || product.stock === 'out_of_stock' || product.purchasable === false || !Number.isFinite(product.price.amount) || product.price.amount < 0 || !Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
      notify('Open the product page to check availability and options.', 'warning')
      return false
    }
    setCartLines((lines) => {
      const existing = lines.find((line) => !line.bundleGroupId && line.productId === product.id)
      if (existing) return lines.map((line) => line === existing ? { ...line, quantity: Math.min(99, line.quantity + quantity), price: product.price.amount } : line)
      return [...lines, { id: `product-${product.id}`, productId: product.id, productName: product.name, productImage: product.image, quantity, price: product.price.amount }]
    })
    notify(`${product.name} added to cart`)
    return true
  }, [notify, liveMode])
  const addBundleToCart = useCallback((bundle: Parameters<InteractionContextValue['addBundleToCart']>[0]) => {
    const requiredItems = bundle.items.filter((item) => item.required !== false)
    const products = requiredItems.map((item) => bundle.products.find((product) => product.id === item.productId))
    const unavailable = products.some((product) => !product || product.stock === 'out_of_stock')
    if (unavailable) { notify('This setup cannot be added because one required item is unavailable', 'warning'); return false }
    const bundleGroupId = `bundle-${Date.now()}`
    const savingsAmount = bundle.originalPrice.amount - bundle.bundlePrice.amount
    const metadata = { regularTotal: bundle.originalPrice.amount, bundleTotal: bundle.bundlePrice.amount, savingsAmount, currency: 'EGP' as const }
    setCartLines((lines) => [...lines, ...requiredItems.map((item) => { const product = bundle.products.find((candidate) => candidate.id === item.productId)!; return { id: `${bundleGroupId}-${product.id}`, productId: product.id, productName: product.name, productImage: product.image, quantity: 1, price: product.price.amount, bundleId: bundle.id, bundleGroupId, bundleName: bundle.name, bundleItemRole: item.role, bundlePricingMetadata: metadata } })])
    notify(`${bundle.name} added to cart`)
    return true
  }, [notify])
  const removeCartLine = useCallback((id: string) => setCartLines((lines) => lines.filter((line) => line.id !== id || line.bundleGroupId)), [])
  const removeBundleFromCart = useCallback((bundleGroupId: string) => setCartLines((lines) => lines.filter((line) => line.bundleGroupId !== bundleGroupId)), [])
  const toggleWishlist = useCallback((name: string) => { if (liveMode) { notify('Wishlist is not available yet.', 'info'); return } setWishlistItems((items) => { const exists = items.includes(name); notify(exists ? 'Removed from wishlist' : 'Added to wishlist', exists ? 'info' : 'success'); return exists ? items.filter((item) => item !== name) : [...items, name] }) }, [notify, liveMode])
  const isWishlisted = useCallback((name: string) => wishlistItems.includes(name), [wishlistItems])
  const toggleCompare = useCallback((name: string) => { if (liveMode) { notify('Comparison is not available yet.', 'info'); return } setCompareItems((items) => { const exists = items.includes(name); if (exists) { notify('Removed from comparison', 'info'); return items.filter((item) => item !== name) }; if (items.length >= 4) { notify('Compare up to 4 products', 'warning'); return items }; notify('Added to comparison'); return [...items, name] }) }, [notify, liveMode])
  const value = useMemo(() => ({ liveMode, cartCount, cartLines, addBundleToCart, removeCartLine, removeBundleFromCart, wishlistCount: wishlistItems.length, wishlistItems, compareItems, wishlistOpen, cartOpen, searchOpen, stickyPurchaseVisible, setStickyPurchaseVisible, openWishlist: () => setWishlistOpen(true), closeWishlist: () => setWishlistOpen(false), openCart: () => setCartOpen(true), closeCart: () => setCartOpen(false), openSearch: () => { setSearchOpen(true); setWishlistOpen(false); setCartOpen(false) }, closeSearch: () => setSearchOpen(false), addToCart, toggleWishlist, isWishlisted, toggleCompare, notify }), [liveMode, cartLines, addBundleToCart, removeCartLine, removeBundleFromCart, wishlistItems, compareItems, wishlistOpen, cartOpen, searchOpen, stickyPurchaseVisible, addToCart, toggleWishlist, isWishlisted, toggleCompare, notify])
  return <InteractionContext.Provider value={value}>{children}<ToastStack notices={notices} dismiss={(id) => setNotices((current) => current.filter((item) => item.id !== id))} /></InteractionContext.Provider>
}

export function WishlistDrawer() {
  const { wishlistOpen, closeWishlist, notify, addToCart, wishlistItems, toggleWishlist } = useInteractions()
  if (!wishlistOpen) return null
  return <><div className="fixed inset-0 z-[70] bg-foreground/40 backdrop-blur-sm" onClick={closeWishlist} aria-hidden="true" /><aside className="fixed inset-y-0 right-0 z-[71] flex h-dvh w-full max-w-md flex-col overflow-hidden bg-card shadow-2xl" role="dialog" aria-modal="true" aria-label="Wishlist"><header className="flex items-center justify-between border-b border-border px-5 py-4"><div><p className="text-xs font-semibold uppercase tracking-widest text-brand">Saved for later</p><h2 className="mt-1 text-lg font-semibold">Wishlist <span className="text-sm font-normal text-muted-foreground">({wishlistItems.length})</span></h2></div><button type="button" onClick={closeWishlist} className="flex size-11 items-center justify-center rounded-lg border border-border" aria-label="Close wishlist"><X /></button></header><div className="flex-1 overflow-y-auto p-5">{wishlistItems.length ? wishlistItems.map((name) => <div key={name} className="flex gap-3 border-b border-border py-4 first:pt-0"><div className="size-20 shrink-0 rounded-lg bg-surface-subtle" /><div className="min-w-0 flex-1"><p className="text-xs text-brand">Saved product</p><p className="font-medium">{name}</p><p className="mt-1 font-semibold">Price available on product page</p><div className="mt-3 flex gap-2"><button type="button" onClick={() => { addToCart(name) }} className="min-h-10 rounded-md bg-brand px-3 text-sm font-medium text-brand-foreground">Add to cart</button><button type="button" onClick={() => toggleWishlist(name)} className="min-h-10 rounded-md border border-border px-3 text-sm">Remove</button></div></div></div>) : <div className="py-12 text-center"><p className="font-semibold">Your wishlist is empty</p><p className="mt-2 text-sm text-muted-foreground">Save gear you want to revisit later.</p></div>}</div><footer className="border-t border-border p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]"><a href="/wishlist" className="flex min-h-12 items-center justify-center rounded-md border border-border text-sm font-medium">View full wishlist</a></footer></aside></>
}

export function CompareTray() {
  const { compareItems, toggleCompare, stickyPurchaseVisible, cartOpen, wishlistOpen } = useInteractions()
  if (!compareItems.length || cartOpen || wishlistOpen) return null
  return <div className={cn('fixed inset-x-3 z-[70] mx-auto flex max-w-lg items-center gap-3 rounded-lg border border-border bg-background px-3 py-3 shadow-lg transition-[bottom] duration-200 motion-reduce:transition-none', stickyPurchaseVisible ? 'bottom-[calc(var(--fixed-stack-bottom)+var(--sticky-purchase-height))]' : 'bottom-[var(--fixed-stack-bottom)]')}><div className="min-w-0 flex-1"><p className="text-sm font-semibold">{compareItems.length} selected</p><p className="truncate text-xs text-muted-foreground">{compareItems.join(' · ')}</p></div><button type="button" onClick={() => window.location.assign('/compare')} className="min-h-10 shrink-0 rounded-md bg-brand px-3 text-sm font-medium text-brand-foreground">Compare now</button><button type="button" onClick={() => toggleCompare(compareItems[compareItems.length - 1])} className="inline-flex size-10 shrink-0 items-center justify-center rounded-md border border-border" aria-label="Remove last compared product"><X className="size-4" /></button></div>
}

export function RouteProgress() {
  const pathname = usePathname()
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    const onClick = (event: MouseEvent) => { const anchor = (event.target as HTMLElement).closest('a'); if (anchor?.href && anchor.origin === window.location.origin && anchor.pathname !== pathname) setLoading(true) }
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [pathname])
  useEffect(() => { setLoading(false) }, [pathname])
  return loading ? <div className="fixed inset-x-0 top-0 z-[120] h-0.5 overflow-hidden bg-brand-muted" role="progressbar" aria-label="Loading page"><div className="h-full w-1/3 animate-pulse bg-brand" /></div> : null
}

export function InteractionOverlays() { const { cartOpen } = useInteractions(); return <><RouteProgress /><GlobalSearchOverlay /><WishlistDrawer /><CompareTray />{!cartOpen && <GlassMobileBottomNav />}</> }

export function InteractionShell({ children, liveMode = false }: { children: React.ReactNode; liveMode?: boolean }) {
  return <InteractionProvider liveMode={liveMode}>
    <Header />
    <div className="pb-[calc(var(--mobile-bottom-nav-height)+var(--safe-area-bottom))] md:pb-0">{children}</div>
    <InteractionOverlays />
  </InteractionProvider>
}

export function InteractionButton({ label, onClick, className }: { label: string; onClick?: () => void; className?: string }) { const [pending, setPending] = useState(false); return <button type="button" disabled={pending} onClick={() => { setPending(true); onClick?.(); window.setTimeout(() => setPending(false), 600) }} className={cn('transition-[background-color,opacity,transform] active:scale-[0.98] disabled:cursor-wait disabled:opacity-70', className)}>{pending ? 'Loading…' : label}</button> }

