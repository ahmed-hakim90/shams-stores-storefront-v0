'use client'
import Link from 'next/link'
import type { Cart } from '@/lib/commerce/types'
import { formatEgp } from '@/lib/commerce'

export function CheckoutShippingSelect({
  saved,
  cart,
  mutateCart,
  setError,
}: {
  saved: boolean
  cart: Cart | undefined
  mutateCart: (input: Record<string, unknown>) => Promise<unknown>
  setError: (msg: string) => void
}) {
  if (!saved) return null

  if (cart?.rates.length) {
    return (
      <div className="space-y-2">
        <p className="text-xs font-medium">Delivery method</p>
        <div className="grid grid-cols-1 items-start gap-2 lg:grid-cols-2">
          {cart.rates.map((rate) => (
            <label
              key={rate.id}
              className={`flex cursor-pointer items-center gap-2 rounded-(--radius-control) border px-3 py-2 text-xs transition-colors ${
                rate.selected ? 'border-brand bg-brand/5' : 'hover:border-brand'
              }`}
            >
              <input
                type="radio"
                className="size-3.5 accent-brand"
                name={`shipping-${rate.packageId}`}
                checked={rate.selected}
                onChange={() =>
                  void mutateCart({
                    action: 'shipping',
                    rateId: rate.id,
                    packageId: rate.packageId,
                  }).catch((e) => setError(e.message))
                }
              />
              <span>{rate.name}</span>
              <span className="font-semibold">{formatEgp(rate.price)}</span>
            </label>
          ))}
        </div>
      </div>
    )
  }

  if (!cart?.rates.length) {
    return (
      <p className="text-xs text-muted-foreground">
        No delivery methods for this area.{' '}
        <Link href="/support" className="text-brand-ink underline">Contact Shams</Link>
      </p>
    )
  }

  return null
}
