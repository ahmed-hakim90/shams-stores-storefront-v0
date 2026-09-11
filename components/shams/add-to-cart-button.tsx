'use client'

import { useState } from 'react'
import { Bell, Check, ShoppingCart } from 'lucide-react'
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
  const outOfStock = stock === 'out_of_stock'
  const preorder = stock === 'preorder'

  const label = outOfStock
    ? 'Notify me'
    : preorder
      ? 'Pre-order'
      : added
        ? 'Added'
        : 'Add to cart'

  const Icon = outOfStock ? Bell : added ? Check : ShoppingCart

  return (
    <button
      type="button"
      onClick={() => {
        if (outOfStock) return
        setAdded(true)
        window.setTimeout(() => setAdded(false), 1600)
      }}
      aria-label={`${label}: ${productName}`}
      className={cn(
        'inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg text-sm font-medium transition-colors',
        outOfStock
          ? 'border border-border bg-background text-foreground hover:border-brand hover:text-brand'
          : 'bg-brand text-brand-foreground hover:bg-brand/90',
        added && 'bg-success text-white hover:bg-success',
        className,
      )}
    >
      <Icon className="size-4" />
      {label}
    </button>
  )
}
