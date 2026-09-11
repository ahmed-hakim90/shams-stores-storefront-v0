'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { Check, Info, X, AlertTriangle, Home, Grid2X2, Search, Heart, User, ShoppingBag } from 'lucide-react'
import { cn } from '@/lib/utils'

type Notice = { id: number; message: string; tone: 'success' | 'error' | 'warning' | 'info' }
type InteractionContextValue = {
  cartCount: number
  wishlistCount: number
  wishlistItems: string[]
  compareItems: string[]
  wishlistOpen: boolean
  cartOpen: boolean
  openWishlist: () => void
  closeWishlist: () => void
  openCart: () => void
  closeCart: () => void
  addToCart: (name?: string) => void
  toggleWishlist: (name: string) => void
  isWishlisted: (name: string) => boolean
  toggleCompare: (name: string) => void
  notify: (message: string, tone?: Notice['tone']) => void
}

const InteractionContext = createContext<InteractionContextValue | null>(null)

export function useInteractions() {
  const context = useContext(InteractionContext)
  if (!context) throw new Error('useInteractions must be used inside InteractionProvider')
  return context
}

function ToastStack({ notices, dismiss }: { notices: Notice[]; dismiss: (id: number) => void }) {
  const icons = { success: Check, error: X, warning: AlertTriangle, info: Info }
  return <div className="fixed inset-x-4 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-[90] flex flex-col items-end gap-2 sm:inset-x-auto sm:right-5 sm:w-80" aria-live="polite">
    {notices.map((notice) => { const Icon = icons[notice.tone]; return <div key={notice.id} role="status" className="flex w-full items-center gap-3 rounded-lg border border-border bg-surface px-3 py-3 text-sm shadow-lg">
      <span className={cn('flex size-7 shrink-0 items-center justify-center rounded-full', notice.tone === 'success' && 'bg-success-muted text-success', notice.tone === 'error' && 'bg-danger-muted text-danger', notice.tone === 'warning' && 'bg-warning-muted text-warning', notice.tone === 'info' && 'bg-brand-muted text-brand')}><Icon className="size-4" /></span>
      <span className="flex-1 text-foreground">{notice.message}</span><button type="button" onClick={() => dismiss(notice.id)} className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted" aria-label="Dismiss notification"><X className="size-4" /></button>
    </div> })}
  </div>
}

export function InteractionProvider({ children }: { children: React.ReactNode }) {
  const [cartCount, setCartCount] = useState(0)
  const [wishlistItems, setWishlistItems] = useState<string[]>([])
  const [compareItems, setCompareItems] = useState<string[]>([])
  const [wishlistOpen, setWishlistOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [notices, setNotices] = useState<Notice[]>([])
  useEffect(() => {
    const locked = wishlistOpen || cartOpen
    document.body.style.overflow = locked ? 'hidden' : ''
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') { setWishlistOpen(false); setCartOpen(false) } }
    if (locked) document.addEventListener('keydown', onKeyDown)
    return () => { document.body.style.overflow = ''; document.removeEventListener('keydown', onKeyDown) }
  }, [wishlistOpen, cartOpen])
  const notify = useCallback((message: string, tone: Notice['tone'] = 'success') => { const id = Date.now(); setNotices((current) => [...current.slice(-2), { id, message, tone }]); window.setTimeout(() => setNotices((current) => current.filter((item) => item.id !== id)), 3200) }, [])
  const addToCart = useCallback((name = 'Product') => { setCartCount((count) => count + 1); notify(`${name} added to cart`) }, [notify])
  const toggleWishlist = useCallback((name: string) => { setWishlistItems((items) => { const exists = items.includes(name); notify(exists ? 'Removed from wishlist' : 'Added to wishlist', exists ? 'info' : 'success'); return exists ? items.filter((item) => item !== name) : [...items, name] }) }, [notify])
  const isWishlisted = useCallback((name: string) => wishlistItems.includes(name), [wishlistItems])
  const toggleCompare = useCallback((name: string) => { setCompareItems((items) => { const exists = items.includes(name); if (exists) { notify('Removed from comparison', 'info'); return items.filter((item) => item !== name) }; if (items.length >= 4) { notify('Compare up to 4 products', 'warning'); return items }; notify('Added to comparison'); return [...items, name] }) }, [notify])
  const value = useMemo(() => ({ cartCount, wishlistCount: wishlistItems.length, wishlistItems, compareItems, wishlistOpen, cartOpen, openWishlist: () => setWishlistOpen(true), closeWishlist: () => setWishlistOpen(false), openCart: () => setCartOpen(true), closeCart: () => setCartOpen(false), addToCart, toggleWishlist, isWishlisted, toggleCompare, notify }), [cartCount, wishlistItems, compareItems, wishlistOpen, cartOpen, addToCart, toggleWishlist, isWishlisted, toggleCompare, notify])
  return <InteractionContext.Provider value={value}>{children}<ToastStack notices={notices} dismiss={(id) => setNotices((current) => current.filter((item) => item.id !== id))} /></InteractionContext.Provider>
}

export function MobileBottomNav() {
  const { openWishlist, openCart, cartCount, wishlistCount } = useInteractions()
  const itemClass = 'relative flex min-h-11 flex-col items-center justify-center gap-0.5 text-[0.65rem] text-muted-foreground transition-colors hover:text-brand active:bg-muted'
  return <nav className="fixed inset-x-0 bottom-0 z-[55] border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden" aria-label="Mobile shopping navigation"><div className="grid h-16 grid-cols-5"><a href="/" className={itemClass}><Home className="size-4" />Home</a><a href="/c/cameras" className={itemClass}><Grid2X2 className="size-4" />Categories</a><a href="/search" className={itemClass}><Search className="size-4" />Search</a><button type="button" onClick={openWishlist} className={itemClass}><Heart className="size-4" />Wishlist{wishlistCount > 0 && <span className="absolute right-5 top-2 min-w-4 rounded-full bg-brand px-1 text-center text-[0.6rem] text-brand-foreground">{wishlistCount}</span>}</button><button type="button" onClick={openCart} className={itemClass}><ShoppingBag className="size-4" />Cart{cartCount > 0 && <span className="absolute right-5 top-2 min-w-4 rounded-full bg-brand px-1 text-center text-[0.6rem] text-brand-foreground">{cartCount}</span>}</button></div></nav>
}

export function WishlistDrawer() {
  const { wishlistOpen, closeWishlist, notify, addToCart, wishlistItems, toggleWishlist } = useInteractions()
  if (!wishlistOpen) return null
  return <><div className="fixed inset-0 z-[70] bg-foreground/40" onClick={closeWishlist} aria-hidden="true" /><aside className="fixed inset-y-0 right-0 z-[71] flex w-full max-w-md flex-col bg-background shadow-xl" role="dialog" aria-modal="true" aria-label="Wishlist"><header className="flex items-center justify-between border-b border-border px-5 py-4"><div><p className="text-xs font-semibold uppercase tracking-widest text-brand">Saved for later</p><h2 className="mt-1 text-lg font-semibold">Wishlist <span className="text-sm font-normal text-muted-foreground">({wishlistItems.length})</span></h2></div><button type="button" onClick={closeWishlist} className="flex size-11 items-center justify-center rounded-lg border border-border" aria-label="Close wishlist"><X /></button></header><div className="flex-1 overflow-y-auto p-5">{wishlistItems.length ? wishlistItems.map((name) => <div key={name} className="flex gap-3 border-b border-border py-4 first:pt-0"><div className="size-20 shrink-0 rounded-lg bg-surface-subtle" /><div className="min-w-0 flex-1"><p className="text-xs text-brand">Saved product</p><p className="font-medium">{name}</p><p className="mt-1 font-semibold">Price available on product page</p><div className="mt-3 flex gap-2"><button type="button" onClick={() => { addToCart(name); notify('Added to cart') }} className="min-h-10 rounded-md bg-brand px-3 text-sm font-medium text-brand-foreground">Add to cart</button><button type="button" onClick={() => toggleWishlist(name)} className="min-h-10 rounded-md border border-border px-3 text-sm">Remove</button></div></div></div>) : <div className="py-12 text-center"><p className="font-semibold">Your wishlist is empty</p><p className="mt-2 text-sm text-muted-foreground">Save gear you want to revisit later.</p></div>}</div><footer className="border-t border-border p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]"><a href="/wishlist" className="flex min-h-12 items-center justify-center rounded-md border border-border text-sm font-medium">View full wishlist</a></footer></aside></>
}

export function CompareTray() {
  const { compareItems, toggleCompare } = useInteractions()
  if (!compareItems.length) return null
  return <div className="fixed inset-x-3 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-[60] mx-auto flex max-w-lg items-center gap-3 rounded-lg border border-border bg-background px-3 py-3 shadow-lg"><div className="min-w-0 flex-1"><p className="text-sm font-semibold">{compareItems.length} selected</p><p className="truncate text-xs text-muted-foreground">{compareItems.join(' · ')}</p></div><button type="button" onClick={() => window.location.assign('/compare')} className="min-h-10 shrink-0 rounded-md bg-brand px-3 text-sm font-medium text-brand-foreground">Compare now</button><button type="button" onClick={() => toggleCompare(compareItems[compareItems.length - 1])} className="inline-flex size-10 shrink-0 items-center justify-center rounded-md border border-border" aria-label="Remove last compared product"><X className="size-4" /></button></div>
}

export function InteractionOverlays() { return <><WishlistDrawer /><CompareTray /><MobileBottomNav /></> }

export function InteractionShell({ children }: { children: React.ReactNode }) { return <InteractionProvider><div className="pb-20 md:pb-0">{children}</div><InteractionOverlays /></InteractionProvider> }

export function InteractionButton({ label, onClick, className }: { label: string; onClick?: () => void; className?: string }) { const [pending, setPending] = useState(false); return <button type="button" disabled={pending} onClick={() => { setPending(true); onClick?.(); window.setTimeout(() => setPending(false), 600) }} className={cn('transition-[background-color,opacity,transform] active:scale-[0.98] disabled:cursor-wait disabled:opacity-70', className)}>{pending ? 'Loading…' : label}</button> }


