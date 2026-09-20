'use client'
import Link from 'next/link'
import { useState } from 'react'
import { useInteractions } from '@/components/shams/providers'
import { ProductImage } from '@/components/shams/product'
import { CartLineItem } from './cart-line-item'
import { formatEgp } from '@/lib/commerce'
import { CheckoutForm } from './checkout-form'
export function CartPageContent({ checkout = false }: { checkout?: boolean }) {
  const {
      cartLines,
      cart,
      cartLoading,
      cartError,
      cartPending,
      mutateCart,
      refreshCart,
      removeCartLine,
      updateCartLineQuantity,
      notify,
    } = useInteractions(),
    [coupon, setCoupon] = useState('')
  const coupons = cart?.coupons ?? []
  const total =
    cart?.total ?? cartLines.reduce((sum, l) => sum + l.quantity * l.price, 0)
  return (
    <main className="shams-container max-w-[1200px] py-8 pb-[calc(2rem+var(--mobile-bottom-nav-height))] sm:py-12 sm:pb-12">
      {!checkout && (
        <Link href="/shop" className="text-sm text-brand-ink">
          ← Continue shopping
        </Link>
      )}
      <h1 className="mt-3 text-xl font-semibold sm:mt-4 sm:text-2xl">
        {checkout ? 'Checkout' : 'Your cart'}
      </h1>
      {!checkout && (
        <p className="mt-2 text-sm text-muted-foreground">
          A final look at the gear for your next idea.
        </p>
      )}
      {cartLoading ? (
        <div className="mt-8 h-56 animate-pulse rounded-(--radius-card) bg-muted" />
      ) : cartError ? (
        <div role="alert" className="mt-8 rounded-(--radius-card) border p-6">
          <p>{cartError}</p>
          <button
            onClick={refreshCart}
            className="mt-3 min-h-11 rounded-(--radius-control) border px-4"
          >
            Retry cart
          </button>
        </div>
      ) : !cartLines.length ? (
        <div className="mt-8 rounded-(--radius-card) border border-dashed p-10 text-center">
          <h2 className="font-semibold">Your cart is empty</h2>
          <Link
            href="/shop"
            className="mt-5 inline-flex min-h-11 items-center rounded-(--radius-control) bg-brand px-6 text-brand-foreground"
          >
            Explore gear
          </Link>
        </div>
      ) : (
        <div className="mt-5 grid items-start gap-5 sm:mt-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div>
            {checkout ? (
              <CheckoutForm />
            ) : (
              <div className="space-y-4">
                {cartLines.map((line) => (
                  <CartLineItem
                    key={line.id}
                    line={line}
                    pending={cartPending}
                    onRemove={removeCartLine}
                    onUpdateQuantity={updateCartLineQuantity}
                  />
                ))}
              </div>
            )}
          </div>
          <aside className="shams-panel p-5 lg:sticky lg:top-[calc(var(--shell-header-height)+24px)]">
            <h2 className="text-base font-semibold">Order summary</h2>
            {checkout && (
              <details className="mt-4 rounded-(--radius-control) border bg-muted/30">
                <summary className="cursor-pointer px-4 py-3 text-sm font-medium hover:bg-muted/50 transition-colors">
                  Review {cartLines.length} item{cartLines.length === 1 ? '' : 's'}
                </summary>
                <ul className="space-y-3 border-t px-4 py-3">
                  {cartLines.map((line) => (
                    <li key={line.id} className="flex items-center gap-3">
                      <div className="relative size-14 shrink-0 overflow-hidden rounded-(--radius-control) bg-surface-raised ring-1 ring-border">
                        <ProductImage
                          src={line.productImage || '/placeholder.svg'}
                          alt={line.productName}
                          fill
                          sizes="56px"
                          className="object-contain p-1.5"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{line.productName}</p>
                        <p className="text-xs text-muted-foreground">Qty {line.quantity}</p>
                      </div>
                      <span className="shrink-0 text-sm font-semibold tabular-nums">
                        {formatEgp(line.total ?? line.price * line.quantity)}
                      </span>
                    </li>
                  ))}
                </ul>
              </details>
            )}
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd className="font-medium tabular-nums">{formatEgp(cart?.subtotal ?? total)}</dd>
              </div>
              {!!cart?.discount && (
                <div className="flex justify-between text-success">
                  <dt>Discount</dt>
                  <dd className="font-medium tabular-nums">−{formatEgp(cart.discount)}</dd>
                </div>
              )}
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Shipping</dt>
                <dd className="text-right font-medium tabular-nums">
                  {cart?.shipping == null ||
                  !cart.rates.some((rate) => rate.selected)
                    ? <span className="text-xs text-muted-foreground">Calculated at checkout</span>
                    : formatEgp(cart.shipping)}
                </dd>
              </div>
              {!!cart?.tax && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Tax</dt>
                  <dd className="font-medium tabular-nums">{formatEgp(cart.tax)}</dd>
                </div>
              )}
              <div className="flex justify-between gap-3 border-t pt-4 mt-4">
                <dt className="text-base font-semibold">Total</dt>
                <dd className="text-base font-bold tabular-nums">{formatEgp(total)}</dd>
              </div>
            </dl>
            <div className="mt-5 rounded-(--radius-control) border bg-muted/20 p-3">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  void mutateCart({ action: 'coupon', code: coupon })
                    .then(() => setCoupon(''))
                    .catch((e) => notify(e.message, 'error'))
                }}
                className="flex gap-2"
              >
                <input
                  aria-label="Coupon code"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  placeholder="Enter coupon code"
                  className="h-10 min-w-0 flex-1 rounded-(--radius-control) border bg-background px-3 text-sm"
                />
                <button
                  disabled={cartPending || !coupon.trim()}
                  className="h-10 rounded-(--radius-control) bg-brand px-4 text-sm font-medium text-brand-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-opacity hover:opacity-90"
                >
                  Apply
                </button>
              </form>
              {coupons.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {coupons.map((code) => (
                    <button
                      key={code}
                      onClick={() =>
                        void mutateCart({ action: 'remove-coupon', code }).catch(
                          (e) => notify(e.message, 'error'),
                        )
                      }
                      className="inline-flex items-center gap-1.5 rounded-full bg-success-muted px-3 py-1 text-xs font-medium text-success hover:bg-success-muted/80 transition-colors"
                    >
                      <span>{code}</span>
                      <span className="text-success">×</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {!checkout && (
              <Link
                href="/checkout"
                className="mt-5 flex min-h-12 items-center justify-center rounded-(--radius-control) bg-brand text-sm font-semibold text-brand-foreground transition-opacity hover:opacity-90"
              >
                Continue to checkout
              </Link>
            )}
          </aside>
        </div>
      )}
    </main>
  )
}
