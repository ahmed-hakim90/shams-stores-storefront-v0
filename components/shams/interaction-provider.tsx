'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { commerceFetch } from '@/lib/commerce/browser'
import type { Cart } from '@/lib/commerce/types'
import { usePathname } from 'next/navigation'
import { Check, Info, X, AlertTriangle, ArrowLeft } from 'lucide-react'
import type { Product } from '@/lib/commerce'
import { commerce } from '@/lib/commerce'
import { cn } from '@/lib/utils'
import dynamic from 'next/dynamic'
import { MobileBottomNav as GlassMobileBottomNav } from './mobile-navigation'
import { Header } from './header'
import Link from 'next/link'
import { ShamsLogo } from './logo'
import { CartDrawer } from './cart-drawer'
import {
  ShellPolicyProvider,
  useOverlayPresence,
  useOverlayActive,
} from './shell-policy'
import type { ShellVariant } from '@/lib/commerce/experience'

const GlobalSearchOverlay = dynamic(
  () => import('./global-search-overlay').then((mod) => mod.GlobalSearchOverlay),
  { ssr: false },
)
const WishlistDrawer = dynamic(
  () => import('./wishlist-drawer').then((mod) => mod.WishlistDrawer),
  { ssr: false },
)
const CompareTray = dynamic(
  () => import('./compare-tray').then((mod) => mod.CompareTray),
  { ssr: false },
)

function safePersist(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* Storage can be disabled in private browsing. */
  }
}

type Notice = {
  id: number
  message: string
  tone: 'success' | 'error' | 'warning' | 'info'
}
import type { CartLine } from '@/lib/commerce/types'
export type { CartLine } from '@/lib/commerce/types'
type InteractionContextValue = {
  liveMode: boolean
  cartCount: number
  cartLines: CartLine[]
  addBundleToCart: (bundle: {
    id: string
    name: string
    bundlePrice: { amount: number }
    originalPrice: { amount: number }
    items: { productId: string; role: string; required?: boolean }[]
    products: {
      id: string
      name: string
      image: string
      price: { amount: number }
      stock: string
    }[]
  }) => boolean
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
  addToCart: (product: Product | string, quantity?: number, variant?: { variationId: string; options: { attribute: string; value: string }[] }) => Promise<boolean>
  updateCartLineQuantity: (key: string, quantity: number) => void
  cart: Cart | undefined
  cartLoading: boolean
  cartError: string | undefined
  cartPending: boolean
  mutateCart: (input: Record<string, unknown>) => Promise<Cart>
  refreshCart: () => void
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
  if (!context)
    throw new Error('useInteractions must be used inside InteractionProvider')
  return context
}

function ToastStack({
  notices,
  dismiss,
}: {
  notices: Notice[]
  dismiss: (id: number) => void
}) {
  const icons = { success: Check, error: X, warning: AlertTriangle, info: Info }
  return (
    <div
      className="fixed inset-x-4 bottom-[calc(var(--fixed-stack-bottom)+var(--sticky-purchase-offset)+var(--compare-tray-offset)+0.75rem)] z-[110] flex flex-col items-end gap-2 sm:inset-x-auto sm:right-5 sm:w-80"
      aria-live="polite"
    >
      {notices.map((notice) => {
        const Icon = icons[notice.tone]
        return (
          <div
            key={notice.id}
            role="status"
            className="flex w-full items-center gap-3 rounded-(--radius-control) border border-border bg-card px-3 py-3 text-sm"
          >
            <span
              className={cn(
                'flex size-7 shrink-0 items-center justify-center rounded-full',
                notice.tone === 'success' && 'bg-success-muted text-success',
                notice.tone === 'error' && 'bg-danger-muted text-danger',
                notice.tone === 'warning' && 'bg-warning-muted text-warning',
                notice.tone === 'info' && 'bg-brand-muted text-brand-ink',
              )}
            >
              <Icon className="size-4" />
            </span>
            <span className="flex-1 text-foreground">{notice.message}</span>
            <button
              type="button"
              onClick={() => dismiss(notice.id)}
              className="inline-flex size-8 items-center justify-center rounded-(--radius-control) text-muted-foreground hover:bg-muted"
              aria-label="Dismiss notification"
            >
              <X className="size-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}

export function InteractionProvider({
  children,
  liveMode = false,
}: {
  children: React.ReactNode
  liveMode?: boolean
}) {
  const [localCartLines, setCartLines] = useState<CartLine[]>([])
  const client = useQueryClient()
  const cartQuery = useQuery({
    queryKey: ['cart'],
    queryFn: () => commerceFetch<Cart>('/api/commerce/cart'),
    enabled: liveMode,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
    retry: 1,
  })
  const cartMutation = useMutation({
    mutationFn: (input: Record<string, unknown>) =>
      commerceFetch<Cart>('/api/commerce/cart', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
    onMutate: async (input) => {
      if (!liveMode) return
      await client.cancelQueries({ queryKey: ['cart'] })
      const previous = client.getQueryData(['cart']) as Cart | undefined
      if (!previous) return { previous }

      if (input.action === 'remove' && typeof input.key === 'string') {
        const line = previous.lines.find((l) => l.id === input.key)
        if (line) {
          const lineTotal = line.total ?? line.price * line.quantity
          const newSubtotal = previous.subtotal - lineTotal
          client.setQueryData(['cart'], {
            ...previous,
            lines: previous.lines.filter((l) => l.id !== input.key),
            subtotal: newSubtotal,
            total:
              newSubtotal + previous.tax + (previous.shipping ?? 0) - previous.discount,
          })
        }
      }

      if (input.action === 'add' && typeof input.productId === 'string') {
        const qty = Number(input.quantity) || 1
        const existing = previous.lines.find(
          (l) => l.productId === input.productId && !l.bundleGroupId,
        )
        if (existing) {
          client.setQueryData(['cart'], {
            ...previous,
            lines: previous.lines.map((l) =>
              l === existing ? { ...l, quantity: l.quantity + qty } : l,
            ),
          })
        } else {
          const optimisticLine: CartLine = {
            id: `optimistic-${input.productId}`,
            productId: input.productId,
            productName: (input.productName as string) ?? '',
            productImage: input.productImage as string | undefined,
            quantity: qty,
            price: (input.productPrice as number) ?? 0,
          }
          client.setQueryData(['cart'], {
            ...previous,
            lines: [...previous.lines, optimisticLine],
          })
        }
      }

      if (input.action === 'update' && typeof input.key === 'string') {
        const qty = Number(input.quantity)
        if (Number.isInteger(qty) && qty >= 1 && qty <= 99) {
          const line = previous.lines.find((l) => l.id === input.key)
          if (line && line.quantity !== qty) {
            const linePrice = line.price
            const oldLineTotal = line.total ?? linePrice * line.quantity
            const newLineTotal = linePrice * qty
            const newSubtotal = previous.subtotal - oldLineTotal + newLineTotal
            client.setQueryData(['cart'], {
              ...previous,
              lines: previous.lines.map((l) =>
                l.id === input.key ? { ...l, quantity: qty } : l,
              ),
              subtotal: newSubtotal,
              total:
                newSubtotal + previous.tax + (previous.shipping ?? 0) - previous.discount,
            })
          }
        }
      }

      return { previous }
    },
    onSuccess: (data) => {
      client.setQueryData(['cart'], data)
      if (typeof BroadcastChannel === 'undefined') return
      const channel = new BroadcastChannel('shams-cart')
      channel.postMessage('changed')
      channel.close()
    },
    onError: (_err, _input, context) => {
      if (context?.previous) {
        client.setQueryData(['cart'], context.previous)
      }
      void client.invalidateQueries({ queryKey: ['cart'] })
    },
    scope: { id: 'cart' },
  })
  useEffect(() => {
    if (!liveMode) return
    if (typeof BroadcastChannel === 'undefined') return
    const channel = new BroadcastChannel('shams-cart')
    channel.onmessage = () =>
      void client.invalidateQueries({ queryKey: ['cart'] })
    return () => channel.close()
  }, [liveMode, client])
  const cartLines = liveMode ? (cartQuery.data?.lines ?? []) : localCartLines
  const cartCount = cartLines.reduce((total, line) => total + line.quantity, 0)
  const [wishlistItems, setWishlistItems] = useState<string[]>([])
  const [compareItems, setCompareItems] = useState<string[]>([])
  const [wishlistOpen, setWishlistOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [notices, setNotices] = useState<Notice[]>([])
  const [stickyPurchaseVisible, setStickyPurchaseVisible] = useState(false)
  const [storageReady, setStorageReady] = useState(false)
  useEffect(() => {
    try {
      const savedWishlist = window.localStorage.getItem('shams-wishlist-v3-ids')
      const savedCompare = window.localStorage.getItem('shams-compare-v3-ids')
      const savedCart = window.localStorage.getItem(
        `shams-cart-lines-v2-${liveMode ? 'woo' : 'mock'}`,
      )
      if (savedWishlist) {
        const ids = JSON.parse(savedWishlist)
        if (Array.isArray(ids))
          setWishlistItems(
            ids.filter((x) => typeof x === 'string').slice(0, 100),
          )
      }
      if (savedCompare) {
        const ids = JSON.parse(savedCompare)
        if (Array.isArray(ids))
          setCompareItems(ids.filter((x) => typeof x === 'string').slice(0, 4))
      }
      if (savedCart && !liveMode) setCartLines(JSON.parse(savedCart))
    } catch {
      /* Mock persistence is best-effort. */
    } finally {
      setStorageReady(true)
    }

    fetch('/api/customer/wishlist')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data?.product_ids || !Array.isArray(data.product_ids)) return
        const serverIds = data.product_ids.filter(
          (x: unknown) => typeof x === 'string',
        )
        setWishlistItems((local) => {
          const merged = [...new Set([...local, ...serverIds])].slice(-100)
          return merged.length === local.length ? local : merged
        })
      })
      .catch(() => {})
  }, [])
  useEffect(() => {
    if (storageReady) safePersist('shams-wishlist-v3-ids', wishlistItems)
  }, [wishlistItems, storageReady])
  useEffect(() => {
    if (storageReady) safePersist('shams-compare-v3-ids', compareItems)
  }, [compareItems, storageReady])
  useEffect(() => {
    if (storageReady && !liveMode)
      window.localStorage.setItem(
        `shams-cart-lines-v2-${liveMode ? 'woo' : 'mock'}`,
        JSON.stringify(cartLines),
      )
  }, [cartLines, storageReady, liveMode])
  useEffect(() => {
    document.documentElement.style.setProperty(
      '--sticky-purchase-offset',
      stickyPurchaseVisible ? 'var(--sticky-purchase-height)' : '0px',
    )
    document.documentElement.style.setProperty(
      '--compare-tray-offset',
      compareItems.length &&
        !wishlistOpen &&
        !cartOpen &&
        !stickyPurchaseVisible
        ? 'var(--compare-tray-height)'
        : '0px',
    )
    return () => {
      document.documentElement.style.removeProperty('--sticky-purchase-offset')
      document.documentElement.style.removeProperty('--compare-tray-offset')
    }
  }, [stickyPurchaseVisible, compareItems.length, wishlistOpen, cartOpen])
  const notify = useCallback(
    (message: string, tone: Notice['tone'] = 'success') => {
      const id = Date.now()
      setNotices((current) => {
        const existing = current.find(
          (item) => item.message === message && item.tone === tone,
        )
        if (existing)
          return current.map((item) =>
            item.id === existing.id ? { ...item, id } : item,
          )
        return [...current.slice(-1), { id, message, tone }]
      })
      window.setTimeout(
        () => setNotices((current) => current.filter((item) => item.id !== id)),
        3200,
      )
    },
    [],
  )
  const addToCart = useCallback(
    async (
      input: Product | string,
      quantity = 1,
      variant?: { variationId: string; options: { attribute: string; value: string }[] },
    ) => {
      const product =
        typeof input === 'string'
          ? liveMode
            ? undefined
            : commerce.products
                .list()
                .find((item) => item.id === input || item.name === input)
          : input
      if (
        !product ||
        product.stock === 'out_of_stock' ||
        product.purchasable === false ||
        !Number.isFinite(product.price.amount) ||
        product.price.amount < 0 ||
        !Number.isInteger(quantity) ||
        quantity < 1 ||
        quantity > 99
      ) {
        notify(
          'Open the product page to check availability and options.',
          'warning',
        )
        return false
      }
      if (liveMode) {
        try {
          await cartMutation.mutateAsync({
            action: 'add',
            productId: variant?.variationId ?? product.id,
            variationId: variant?.variationId,
            options: variant?.options,
            quantity,
            productName: product.name,
            productImage: product.image,
            productPrice: product.price.amount,
          })
          notify(`${product.name} added to cart`)
          return true
        } catch (e) {
          notify(
            e instanceof Error ? e.message : 'Unable to add this product.',
            'error',
          )
          return false
        }
      }
      const lineId = variant
        ? `product-${variant.variationId}`
        : `product-${product.id}`
      setCartLines((lines) => {
        const existing = lines.find(
          (line) => !line.bundleGroupId && line.id === lineId,
        )
        if (existing)
          return lines.map((line) =>
            line === existing
              ? {
                  ...line,
                  quantity: Math.min(99, line.quantity + quantity),
                  price: product.price.amount,
                }
              : line,
          )
        return [
          ...lines,
          {
            id: lineId,
            productId: variant?.variationId ?? product.id,
            productName: product.name,
            productImage: product.image,
            quantity,
            price: product.price.amount,
            variationId: variant?.variationId,
            selectedOptions: variant?.options.map(
              (o) => `${o.attribute}: ${o.value}`,
            ),
          },
        ]
      })
      notify(`${product.name} added to cart`)
      return true
    },
    [notify, liveMode, cartMutation.mutateAsync],
  )
  const addBundleToCart = useCallback(
    (bundle: Parameters<InteractionContextValue['addBundleToCart']>[0]) => {
      if (liveMode) {
        notify('This setup is not available for online ordering yet.', 'info')
        return false
      }
      const requiredItems = bundle.items.filter(
        (item) => item.required !== false,
      )
      const products = requiredItems.map((item) =>
        bundle.products.find((product) => product.id === item.productId),
      )
      const unavailable = products.some(
        (product) => !product || product.stock === 'out_of_stock',
      )
      if (unavailable) {
        notify(
          'This setup cannot be added because one required item is unavailable',
          'warning',
        )
        return false
      }
      const bundleGroupId = `bundle-${Date.now()}`
      const savingsAmount =
        bundle.originalPrice.amount - bundle.bundlePrice.amount
      const metadata = {
        regularTotal: bundle.originalPrice.amount,
        bundleTotal: bundle.bundlePrice.amount,
        savingsAmount,
        currency: 'EGP' as const,
      }
      setCartLines((lines) => [
        ...lines,
        ...requiredItems.map((item) => {
          const product = bundle.products.find(
            (candidate) => candidate.id === item.productId,
          )!
          return {
            id: `${bundleGroupId}-${product.id}`,
            productId: product.id,
            productName: product.name,
            productImage: product.image,
            quantity: 1,
            price: product.price.amount,
            bundleId: bundle.id,
            bundleGroupId,
            bundleName: bundle.name,
            bundleItemRole: item.role,
            bundlePricingMetadata: metadata,
          }
        }),
      ])
      notify(`${bundle.name} added to cart`)
      return true
    },
    [notify, liveMode],
  )
  const removeCartLine = useCallback(
    (id: string) => {
      if (liveMode) {
        void cartMutation
          .mutateAsync({ action: 'remove', key: id })
          .catch((e) => notify(e.message, 'error'))
        return
      }
      setCartLines((lines) => lines.filter((line) => line.id !== id))
    },
    [liveMode, cartMutation.mutateAsync, notify],
  )
  const removeBundleFromCart = useCallback(
    (bundleGroupId: string) => {
      if (liveMode) return
      setCartLines((lines) =>
        lines.filter((line) => line.bundleGroupId !== bundleGroupId),
      )
    },
    [liveMode],
  )
  const updateCartLineQuantity = useCallback(
    (key: string, quantity: number) => {
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) return
      if (liveMode) {
        void cartMutation
          .mutateAsync({ action: 'update', key, quantity })
          .catch((e) => notify(e.message, 'error'))
        return
      }
      setCartLines((lines) =>
        lines.map((line) =>
          line.id === key ? { ...line, quantity } : line,
        ),
      )
    },
    [liveMode, cartMutation.mutateAsync, notify],
  )
  const toggleWishlist = useCallback(
    (id: string) =>
      setWishlistItems((items) => {
        const wasIncluded = items.includes(id)
        const next = wasIncluded
          ? items.filter((x) => x !== id)
          : [...items, id].slice(-100)

        fetch(
          wasIncluded
            ? `/api/customer/wishlist/${id}`
            : '/api/customer/wishlist',
          wasIncluded
            ? { method: 'DELETE' }
            : {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ product_id: id }),
              },
        ).catch(() => {})

        return next
      }),
    [],
  )
  const isWishlisted = useCallback(
    (id: string) => wishlistItems.includes(id),
    [wishlistItems],
  )
  const toggleCompare = useCallback(
    (id: string) =>
      setCompareItems((items) =>
        items.includes(id)
          ? items.filter((x) => x !== id)
          : items.length < 4
            ? [...items, id]
            : items,
      ),
    [],
  )
  const value = useMemo(
    () => ({
      liveMode,
      cart: cartQuery.data,
      cartLoading: cartQuery.isLoading,
      cartError: cartQuery.error?.message,
      cartPending: cartMutation.isPending,
      mutateCart: cartMutation.mutateAsync,
      refreshCart: () => {
        void cartQuery.refetch()
      },
      cartCount,
      cartLines,
      addBundleToCart,
      removeCartLine,
      removeBundleFromCart,
      wishlistCount: wishlistItems.length,
      wishlistItems,
      compareItems,
      wishlistOpen,
      cartOpen,
      searchOpen,
      stickyPurchaseVisible,
      setStickyPurchaseVisible,
      openWishlist: () => setWishlistOpen(true),
      closeWishlist: () => setWishlistOpen(false),
      openCart: () => setCartOpen(true),
      closeCart: () => setCartOpen(false),
      openSearch: () => {
        setSearchOpen(true)
        setWishlistOpen(false)
        setCartOpen(false)
      },
      closeSearch: () => setSearchOpen(false),
      addToCart,
      updateCartLineQuantity,
      toggleWishlist,
      isWishlisted,
      toggleCompare,
      notify,
    }),
    [
      liveMode,
      cartQuery.data,
      cartQuery.isLoading,
      cartQuery.error,
      cartMutation.isPending,
      cartMutation.mutateAsync,
      cartLines,
      addBundleToCart,
      removeCartLine,
      removeBundleFromCart,
      wishlistItems,
      compareItems,
      wishlistOpen,
      cartOpen,
      searchOpen,
      stickyPurchaseVisible,
      addToCart,
      updateCartLineQuantity,
      toggleWishlist,
      isWishlisted,
      toggleCompare,
      notify,
    ],
  )
  return (
    <InteractionContext.Provider value={value}>
      {children}
      <ToastStack
        notices={notices}
        dismiss={(id) =>
          setNotices((current) => current.filter((item) => item.id !== id))
        }
      />
    </InteractionContext.Provider>
  )
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
      <CartDrawer showTrigger={false} />
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
