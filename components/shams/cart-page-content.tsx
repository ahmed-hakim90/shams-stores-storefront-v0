'use client'
import Link from 'next/link'
import { useState } from 'react'
import { useInteractions } from './interaction-provider'
import { ProductImage } from './product-image'
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
      notify,
    } = useInteractions(),
    [coupon, setCoupon] = useState('')
  const total =
    cart?.total ?? cartLines.reduce((sum, l) => sum + l.quantity * l.price, 0)
  return (
    <main className="mobile-storefront-page mx-auto max-w-[1200px] px-4 py-8 sm:px-6 sm:py-12">
      <Link href="/shop" className="text-sm text-brand">
        ← Continue shopping
      </Link>
      <h1 className="mt-5 text-3xl font-semibold">
        {checkout ? 'Checkout' : 'Your cart'}
      </h1>
      {cartLoading ? (
        <div className="mt-8 h-56 animate-pulse rounded-xl bg-muted" />
      ) : cartError ? (
        <div role="alert" className="mt-8 rounded-xl border p-6">
          <p>{cartError}</p>
          <button
            onClick={refreshCart}
            className="mt-3 min-h-11 rounded-lg border px-4"
          >
            Retry cart
          </button>
        </div>
      ) : !cartLines.length ? (
        <div className="mt-8 rounded-xl border border-dashed p-10 text-center">
          <h2 className="font-semibold">Your cart is empty</h2>
          <Link
            href="/shop"
            className="mt-5 inline-flex min-h-11 items-center rounded-lg bg-brand px-6 text-white"
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
                    className="flex gap-4 rounded-xl border p-4"
                  >
                    <div className="relative size-24 shrink-0 bg-white">
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
                      <p className="mt-2 font-semibold">
                        {formatEgp(line.total ?? line.quantity * line.price)}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        <label className="text-xs text-muted-foreground">
                          Qty{' '}
                          <select
                            aria-label={`Quantity for ${line.productName}`}
                            value={line.quantity}
                            disabled={cartPending}
                            onChange={(e) =>
                              void mutateCart({
                                action: 'update',
                                key: line.id,
                                quantity: Number(e.target.value),
                              }).catch((e) => notify(e.message, 'error'))
                            }
                            className="ml-1 h-11 rounded-lg border px-3 text-base text-foreground"
                          >
                            {Array.from(
                              {
                                length: Math.min(
                                  99,
                                  Math.max(
                                    line.quantity,
                                    line.maxQuantity ?? 10,
                                  ),
                                ),
                              },
                              (_, i) => (
                                <option key={i} value={i + 1}>
                                  {i + 1}
                                </option>
                              ),
                            )}
                          </select>
                        </label>
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
          <aside className="rounded-xl border p-5 lg:sticky lg:top-44">
            <h2 className="text-lg font-semibold">Order summary</h2>
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
                  {cart?.shipping == null
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
              <div className="flex justify-between border-t pt-4 text-lg font-semibold">
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
                className="h-11 min-w-0 flex-1 rounded-lg border px-3 text-sm"
              />
              <button
                disabled={cartPending || !coupon}
                className="h-11 rounded-lg border px-3 text-sm"
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
                className="mt-3 text-xs text-brand"
              >
                {code} ×
              </button>
            ))}
            {!checkout && (
              <Link
                href="/checkout"
                className="mt-5 flex min-h-12 items-center justify-center rounded-lg bg-brand text-sm font-semibold text-white"
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
