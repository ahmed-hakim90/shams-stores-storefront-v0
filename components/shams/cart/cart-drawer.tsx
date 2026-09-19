'use client'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { Dialog } from '@base-ui/react/dialog'
import { ShoppingCart, X, Lock, CheckCircle } from 'lucide-react'
import { useInteractions } from '@/components/shams/providers'
import { ProductImage } from '@/components/shams/product'
import { useCountPulse } from '@/components/shams/shared'
import { CartLineOptions } from './cart-line-options'
import { formatEgp } from '@/lib/commerce'
import { theme } from '@/lib/theme'

type CartLineData = ReturnType<typeof useInteractions>['cartLines'][number]

function CartLine({
  l,
  cartPending,
  removeCartLine,
  updateCartLineQuantity,
}: {
  l: CartLineData
  cartPending: boolean
  removeCartLine: (id: string) => void
  updateCartLineQuantity: (id: string, quantity: number) => void
}) {
  const [leaving, setLeaving] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>(null)
  useEffect(() => () => clearTimeout(timer.current ?? undefined), [])
  const remove = () => {
    if (
      leaving ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      removeCartLine(l.id)
      return
    }
    setLeaving(true)
    timer.current = setTimeout(() => removeCartLine(l.id), 220)
  }
  return (
    <div className="cart-line-wrap" data-leaving={leaving || undefined}>
      <article className="flex gap-3 border-b py-4">
        <div className="relative size-20 shrink-0 bg-surface-raised">
          <ProductImage
            src={l.productImage || '/placeholder.svg'}
            alt={l.productName}
            fill
            sizes="80px"
            className="object-contain p-2"
          />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-medium">{l.productName}</h3>
          <CartLineOptions options={l.selectedOptions} />
          <p className="mt-2 text-sm font-semibold">
            {formatEgp(l.total ?? l.price * l.quantity)}
          </p>
          <div className="mt-1 flex items-center gap-1">
            <button
              disabled={cartPending || l.quantity <= 1}
              onClick={() => updateCartLineQuantity(l.id, l.quantity - 1)}
              aria-label="Decrease quantity"
              className="flex size-7 items-center justify-center rounded-(--radius-control) border text-sm transition-colors hover:border-foreground hover:text-foreground disabled:opacity-40"
            >
              −
            </button>
            <span className="w-7 text-center text-xs font-medium tabular-nums">
              {l.quantity}
            </span>
            <button
              disabled={cartPending || l.quantity >= 99}
              onClick={() => updateCartLineQuantity(l.id, l.quantity + 1)}
              aria-label="Increase quantity"
              className="flex size-7 items-center justify-center rounded-(--radius-control) border text-sm transition-colors hover:border-foreground hover:text-foreground disabled:opacity-40"
            >
              +
            </button>
          </div>
          <button
            disabled={cartPending || leaving}
            onClick={remove}
            className="min-h-11 text-xs text-muted-foreground underline"
          >
            Remove
          </button>
        </div>
      </article>
    </div>
  )
}

export function CartDrawer({ showTrigger = true }: { showTrigger?: boolean }) {
  const {
    cartOpen,
    openCart,
    closeCart,
    cartCount,
    cartLines,
    cart,
    cartLoading,
    cartError,
    refreshCart,
    removeCartLine,
    updateCartLineQuantity,
    cartPending,
  } = useInteractions()
  const badgePulse = useCountPulse(cartCount)
  return (
    <Dialog.Root
      open={cartOpen}
      onOpenChange={(v) => (v ? openCart() : closeCart())}
    >
      {showTrigger && (
        <Dialog.Trigger
          aria-label="Open cart"
          className="relative flex size-11 items-center justify-center rounded-(--radius-control)"
        >
          <ShoppingCart className="size-5" />
          {cartCount > 0 && (
            <span
              key={badgePulse}
              className={`absolute right-0 top-0 rounded-full bg-brand px-1.5 text-[10px] text-brand-foreground${badgePulse > 0 ? ' badge-pop' : ''}`}
            >
              {cartCount}
            </span>
          )}
        </Dialog.Trigger>
      )}
      <Dialog.Portal>
        <Dialog.Backdrop data-overlay-backdrop className="fixed inset-0 z-[120] bg-black/40" />
        <Dialog.Popup data-overlay="cart" className="fixed inset-y-0 right-0 z-[121] flex h-dvh w-full max-w-md flex-col bg-background outline-none">
          <header className="flex items-center justify-between border-b p-5">
            <Dialog.Title className="text-xl font-semibold">
              Your cart{' '}
              <span className="text-sm text-muted-foreground">
                ({cartCount})
              </span>
            </Dialog.Title>
            <Dialog.Close
              aria-label="Close cart"
              className="size-11 rounded-full border"
            >
              <X className="mx-auto size-5" />
            </Dialog.Close>
          </header>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5">
            {cartLoading ? (
              <div className="space-y-4">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="flex gap-3 animate-pulse">
                    <div className="size-20 shrink-0 rounded-(--radius-control) bg-muted" />
                    <div className="flex-1 space-y-2 py-1">
                      <div className="h-4 w-3/4 rounded bg-muted" />
                      <div className="h-3 w-1/2 rounded bg-muted" />
                      <div className="h-4 w-1/3 rounded bg-muted" />
                    </div>
                  </div>
                ))}
              </div>
            ) : cartError ? (
              <div>
                <p className="text-sm">{cartError}</p>
                <button onClick={refreshCart} className="min-h-11 text-brand-ink">
                  Retry
                </button>
              </div>
            ) : cartLines.length ? (
              cartLines.map((l) => (
                <CartLine
                  key={l.id}
                  l={l}
                  cartPending={cartPending}
                  removeCartLine={removeCartLine}
                  updateCartLineQuantity={updateCartLineQuantity}
                />
              ))
            ) : (
              <div className="py-12 text-center">
                <p className="font-semibold">Your cart is empty</p>
                <Link
                  href="/shop"
                  onClick={closeCart}
                  className="mt-4 inline-flex min-h-11 items-center text-sm text-brand-ink"
                >
                  Find your next piece of gear →
                </Link>
              </div>
            )}
          </div>
          {cartLines.length > 0 && (
            <footer className="border-t p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
              {(() => {
                const subtotal = cart?.subtotal ?? cartLines.reduce((s, l) => s + l.price * l.quantity, 0)
                const threshold: number = theme.cart.freeShippingThreshold
                if (threshold <= 0) return null
                const remaining = threshold - subtotal
                const progress = Math.min(subtotal / threshold, 1)
                return remaining > 0 ? (
                  <div className="mb-3">
                    <p className="mb-1.5 text-xs text-muted-foreground">
                      Add <span className="font-semibold text-foreground">{formatEgp(remaining)}</span> more for free shipping!
                    </p>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-brand transition-all duration-300" style={{ width: `${progress * 100}%` }} />
                    </div>
                  </div>
                ) : (
                  <div className="mb-3 flex items-center gap-1.5 text-xs font-medium text-success">
                    <CheckCircle className="size-3.5" />
                    You&apos;ve earned free shipping!
                  </div>
                )
              })()}
              <div className="flex justify-between font-semibold">
                <span>Subtotal</span>
                <span>
                  {formatEgp(
                    cart?.subtotal ??
                      cartLines.reduce((s, l) => s + l.price * l.quantity, 0),
                  )}
                </span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Shipping and discounts are calculated at checkout.
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <Link
                  href="/cart"
                  onClick={closeCart}
                  className="flex min-h-12 items-center justify-center rounded-(--radius-control) border text-sm"
                >
                  View cart
                </Link>
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="flex min-h-12 items-center justify-center rounded-(--radius-control) bg-brand text-sm font-semibold text-brand-foreground shadow-sm transition-shadow hover:shadow-md"
                >
                  Checkout
                </Link>
              </div>
              <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
                <Lock className="size-3" />
                {theme.cart.trustCopy}
              </p>
            </footer>
          )}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
