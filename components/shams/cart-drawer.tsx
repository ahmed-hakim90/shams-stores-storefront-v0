'use client'
import Link from 'next/link'
import { Dialog } from '@base-ui/react/dialog'
import { ShoppingCart, X } from 'lucide-react'
import { useInteractions } from './interaction-provider'
import { ProductImage } from './product-image'
import { formatEgp } from '@/lib/commerce'
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
    cartPending,
  } = useInteractions()
  return (
    <Dialog.Root
      open={cartOpen}
      onOpenChange={(v) => (v ? openCart() : closeCart())}
    >
      {showTrigger && (
        <Dialog.Trigger
          aria-label="Open cart"
          className="relative flex size-11 items-center justify-center rounded-lg"
        >
          <ShoppingCart className="size-5" />
          {cartCount > 0 && (
            <span className="absolute right-0 top-0 rounded-full bg-brand px-1.5 text-[10px] text-brand-foreground">
              {cartCount}
            </span>
          )}
        </Dialog.Trigger>
      )}
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-[120] bg-black/40" />
        <Dialog.Popup className="shams-overlay fixed inset-y-0 right-0 z-[121] flex h-dvh w-full max-w-md flex-col bg-background shadow-xl outline-none">
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
              <p>Loading cart…</p>
            ) : cartError ? (
              <div>
                <p className="text-sm">{cartError}</p>
                <button onClick={refreshCart} className="min-h-11 text-brand-ink">
                  Retry
                </button>
              </div>
            ) : cartLines.length ? (
              cartLines.map((l) => (
                <article key={l.id} className="flex gap-3 border-b py-4">
                  <div className="relative size-20 shrink-0 bg-white">
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
                    <p className="mt-2 text-sm font-semibold">
                      {formatEgp(l.total ?? l.price * l.quantity)}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Qty {l.quantity}
                    </p>
                    <button
                      disabled={cartPending}
                      onClick={() => removeCartLine(l.id)}
                      className="min-h-11 text-xs text-muted-foreground underline"
                    >
                      Remove
                    </button>
                  </div>
                </article>
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
                  className="flex min-h-12 items-center justify-center rounded-lg border text-sm"
                >
                  View cart
                </Link>
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="flex min-h-12 items-center justify-center rounded-lg bg-brand text-sm font-semibold text-brand-foreground"
                >
                  Checkout
                </Link>
              </div>
            </footer>
          )}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
