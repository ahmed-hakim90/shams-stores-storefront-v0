'use client'
import Link from 'next/link'
import { useState } from 'react'
import { useInteractions } from './interaction-provider'
import { ProductImage } from './product-image'
import { CartLineOptions } from './cart-line-options'
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
  const total =
    cart?.total ?? cartLines.reduce((sum, l) => sum + l.quantity * l.price, 0)
  return (
    <main className="shams-container max-w-[1200px] py-8 sm:py-12">
      {!checkout && (
        <Link href="/shop" className="text-sm text-brand-ink">
          ← Continue shopping
        </Link>
      )}
      <h1 className="mt-5 text-3xl font-semibold">
        {checkout ? 'Checkout' : 'Your cart'}
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        {checkout
          ? 'Your details. Your delivery. Ready to create.'
          : 'A final look at the gear for your next idea.'}
      </p>
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
        <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div>
            {checkout ? (
              <CheckoutForm />
            ) : (
              <div className="space-y-4">
                {cartLines.map((line) => (
                  <article
                    key={line.id}
                    className="flex gap-3 rounded-(--radius-card) border bg-card p-4 sm:gap-5"
                  >
                    <div className="relative size-20 shrink-0 sm:size-24 bg-white">
                      <ProductImage
                        src={line.productImage || '/placeholder.svg'}
                        alt={line.productName}
                        fill
                        sizes="96px"
                        className="object-contain p-2"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="text-sm font-semibold">
                        {line.productName}
                      </h2>
                      <CartLineOptions options={line.selectedOptions} />
                      <p className="mt-2 font-semibold">
                        {formatEgp(line.total ?? line.quantity * line.price)}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-1">
                          <button
                            disabled={cartPending || line.quantity <= 1}
                            onClick={() => updateCartLineQuantity(line.id, line.quantity - 1)}
                            aria-label="Decrease quantity"
                            className="flex size-9 items-center justify-center rounded-(--radius-control) border text-sm transition-colors hover:border-brand hover:text-brand-ink disabled:opacity-40"
                          >
                            −
                          </button>
                          <span className="w-9 text-center text-sm font-medium tabular-nums">
                            {line.quantity}
                          </span>
                          <button
                            disabled={cartPending || line.quantity >= 99}
                            onClick={() => updateCartLineQuantity(line.id, line.quantity + 1)}
                            aria-label="Increase quantity"
                            className="flex size-9 items-center justify-center rounded-(--radius-control) border text-sm transition-colors hover:border-brand hover:text-brand-ink disabled:opacity-40"
                          >
                            +
                          </button>
                        </div>
                        <button
                          disabled={cartPending}
                          onClick={() => removeCartLine(line.id)}
                          className="min-h-11 text-xs text-muted-foreground underline"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
          <aside className="shams-panel p-5 lg:sticky lg:top-[calc(var(--shell-header-height)+24px)]">
            <h2 className="text-lg font-semibold">Order summary</h2>
            {checkout && (
              <details className="mt-4 border-b pb-3">
                <summary className="min-h-11 cursor-pointer text-sm">
                  Review {cartLines.length} item
                  {cartLines.length === 1 ? '' : 's'}
                </summary>
                <ul className="space-y-3 pb-3">
                  {cartLines.map((line) => (
                    <li key={line.id} className="flex items-center gap-3 text-xs">
                      <div className="relative size-12 shrink-0 rounded-(--radius-control) bg-white">
                        <ProductImage
                          src={line.productImage || '/placeholder.svg'}
                          alt={line.productName}
                          fill
                          sizes="48px"
                          className="object-contain p-1"
                        />
                      </div>
                      <span className="min-w-0 flex-1 truncate">
                        {line.quantity} × {line.productName}
                      </span>
                      <span className="shrink-0 tabular-nums">
                        {formatEgp(line.total ?? line.price * line.quantity)}
                      </span>
                    </li>
                  ))}
                </ul>
              </details>
            )}
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt>Products</dt>
                <dd>{formatEgp(cart?.subtotal ?? total)}</dd>
              </div>
              {!!cart?.discount && (
                <div className="flex justify-between text-green-700">
                  <dt>Discount</dt>
                  <dd>−{formatEgp(cart.discount)}</dd>
                </div>
              )}
              <div className="flex justify-between gap-3">
                <dt>Delivery</dt>
                <dd className="text-right">
                  {cart?.shipping == null ||
                  !cart.rates.some((rate) => rate.selected)
                    ? 'Calculated from your address'
                    : formatEgp(cart.shipping)}
                </dd>
              </div>
              {!!cart?.tax && (
                <div className="flex justify-between">
                  <dt>Tax</dt>
                  <dd>{formatEgp(cart.tax)}</dd>
                </div>
              )}
              <div className="flex flex-wrap justify-between gap-2 border-t pt-4 text-lg font-semibold">
                <dt>Total</dt>
                <dd>{formatEgp(total)}</dd>
              </div>
            </dl>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                void mutateCart({ action: 'coupon', code: coupon })
                  .then(() => setCoupon(''))
                  .catch((e) => notify(e.message, 'error'))
              }}
              className="mt-6 flex gap-2"
            >
              <input
                aria-label="Coupon code"
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
                placeholder="Coupon code"
                className="h-11 min-w-0 flex-1 rounded-(--radius-control) border px-3 text-sm"
              />
              <button
                disabled={cartPending || !coupon}
                className="h-11 rounded-(--radius-control) border px-3 text-sm"
              >
                Apply
              </button>
            </form>
            {cart?.coupons.map((code) => (
              <button
                key={code}
                onClick={() =>
                  void mutateCart({ action: 'remove-coupon', code }).catch(
                    (e) => notify(e.message, 'error'),
                  )
                }
                className="mt-3 text-xs text-brand-ink"
              >
                {code} ×
              </button>
            ))}
            {!checkout && (
              <Link
                href="/checkout"
                className="mt-5 flex min-h-12 items-center justify-center rounded-(--radius-control) bg-brand text-sm font-semibold text-brand-foreground"
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
