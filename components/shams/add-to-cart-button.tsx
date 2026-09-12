'use client'

import { useState } from 'react'
import { Bell, Check, LoaderCircle, ShoppingCart } from 'lucide-react'
import { useInteractions } from './interaction-provider'
import { cn } from '@/lib/utils'
import type { StockStatus } from '@/lib/commerce'

export function AddToCartButton({
  productName,
  stock,
  className,
}: {
  productName: string
  stock: StockStatus
  className?: string
}) {
  const [added, setAdded] = useState(false)
  const [pending, setPending] = useState(false)
  const { addToCart } = useInteractions()
  const outOfStock = stock === 'out_of_stock'
  const preorder = stock === 'preorder'

  const label = outOfStock
    ? 'Notify me'
    : preorder
      ? 'Pre-order'
        : pending
        ? 'Adding…'
        : added
        ? 'Added ✓'
        : 'Add to cart'

  const Icon = pending ? LoaderCircle : outOfStock ? Bell : added ? Check : ShoppingCart

  return (
    <button
      type="button"
      disabled={outOfStock || pending}
      onClick={() => {
        if (outOfStock || pending) return
        setPending(true)
        addToCart(productName)
        setAdded(true)
        window.setTimeout(() => { setPending(false); setAdded(false) }, 1600)
      }}
      aria-label={`${label}: ${productName}`}
      className={cn(
        'inline-flex min-h-11 min-w-0 flex-1 items-center justify-center gap-2 whitespace-nowrap px-3 text-sm font-medium transition-colors',
        outOfStock
          ? 'border border-border bg-background text-foreground hover:border-brand hover:text-brand'
          : 'bg-brand text-brand-foreground hover:bg-brand/90',
        added && 'bg-success text-white hover:bg-success',
        className,
      )}
    >
      <Icon className={cn('size-4', pending && 'animate-spin')} />
      {label}
    </button>
  )
}
