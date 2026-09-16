'use client'

import { useState } from 'react'
import { Bell, Check, LoaderCircle, ShoppingCart } from 'lucide-react'
import { useInteractions } from './interaction-provider'
import { cn } from '@/lib/utils'
import type { Product } from '@/lib/commerce'
import type { SelectedVariant } from './variant-selector'

export function AddToCartButton({
  product,
  quantity = 1,
  className,
  disabled = false,
  variant,
}: {
  product: Product
  quantity?: number
  className?: string
  disabled?: boolean
  variant?: SelectedVariant | null
}) {
  const { name: productName, stock } = product
  const [added, setAdded] = useState(false)
  const [pending, setPending] = useState(false)
  const { addToCart } = useInteractions()
  const outOfStock = stock === 'out_of_stock'
  const preorder = stock === 'preorder'
  const needsOptions = product.hasOptions && !variant

  const label =
    product.price.amount === 0
      ? 'Contact for price'
      : needsOptions
        ? 'Choose options'
        : product.purchasable === false && stock !== 'out_of_stock'
          ? 'Unavailable online'
          : outOfStock
            ? 'Out of stock'
            : preorder
              ? 'Pre-order'
              : pending
                ? 'Adding…'
                : added
                  ? 'Added ✓'
                  : 'Add to cart'

  const Icon = pending
    ? LoaderCircle
    : outOfStock
      ? Bell
      : added
        ? Check
        : ShoppingCart

  return (
    <button
      type="button"
      data-purchase
      aria-busy={pending}
      disabled={disabled || outOfStock || pending || product.purchasable === false || product.price.amount <= 0 || needsOptions}
      onClick={async () => {
        if (disabled || outOfStock || pending || needsOptions) return
        setPending(true)
        const variantPayload = variant
          ? { variationId: variant.variantId, options: variant.options }
          : undefined
        if (!(await addToCart(product, quantity, variantPayload))) {
          setPending(false)
          return
        }
        setAdded(true)
        window.setTimeout(() => {
          setPending(false)
          setAdded(false)
        }, 1600)
      }}
      aria-label={`${label}: ${productName}`}
      className={cn(
        'inline-flex min-h-9 min-w-0 flex-1 items-center justify-center gap-1.5 text-center px-2.5 text-xs font-medium transition-colors',
        outOfStock
          ? 'border border-border bg-background text-foreground hover:border-brand hover:text-brand-ink'
          : 'bg-brand text-brand-foreground hover:bg-brand/90',
        added && 'bg-success text-white hover:bg-success',
        className,
      )}
    >
      <Icon className={cn('size-3.5', pending && 'animate-spin')} />
      <span>{label}</span>
    </button>
  )
}
