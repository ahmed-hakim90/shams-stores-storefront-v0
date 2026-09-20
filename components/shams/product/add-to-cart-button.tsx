'use client'

import { useState } from 'react'
import { useSiteContent } from '../providers/site-content-provider'
import { Bell, Check, LoaderCircle, ShoppingCart } from 'lucide-react'
import { useInteractions } from '@/components/shams/providers'
import { cn } from '@/lib/utils'
import type { Product } from '@/lib/commerce'
import type { SelectedVariant } from './variant-selector'
import { measureOaiq, trackAddToCart } from '@/lib/tracking'

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
  const labels = useSiteContent().labels
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
                  : labels.add || 'Add to cart'

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
        measureOaiq('add_to_cart', {
          content_ids: [product.id],
          content_name: product.name,
          content_type: 'product',
          value: product.price.amount * quantity,
          currency: 'EGP',
        })
        trackAddToCart({ id: product.id, name: product.name, price: product.price.amount }, quantity)
        setAdded(true)
        window.setTimeout(() => {
          setPending(false)
          setAdded(false)
        }, 1600)
      }}
      aria-label={`${label}: ${productName}`}
      className={cn(
        'inline-flex min-h-9 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-(--radius-control) text-center px-2.5 text-xs font-medium transition-[background-color,box-shadow,transform] duration-fast ease-out-expo',
        outOfStock
          ? 'border border-border bg-background text-foreground hover:border-brand hover:text-brand-ink'
          : 'bg-brand text-brand-foreground hover:bg-brand-hover hover:shadow-[0_2px_6px_rgba(244,122,32,0.15)] active:bg-brand-active active:translate-y-px',
        added && 'bg-success text-on-dark hover:bg-success',
        className,
      )}
    >
      <Icon className={cn('size-3.5', pending && 'animate-spin')} />
      <span>{label}</span>
    </button>
  )
}
