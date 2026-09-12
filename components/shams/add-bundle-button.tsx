'use client'

import { useState } from 'react'
import { Check, ShoppingCart } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Bundle } from '@/lib/commerce'
import { useInteractions } from './interaction-provider'

export function AddBundleButton({
  bundleName,
  bundle,
  className,
}: {
  bundleName: string
  bundle?: Bundle & { products?: { id: string; stock: string }[] }
  className?: string
}) {
  const [added, setAdded] = useState(false)
  const { addToCart, notify } = useInteractions()
  return (
    <button
      type="button"
      onClick={() => {
        const unavailable = bundle?.products?.some((product) => product.stock === 'out_of_stock')
        if (unavailable) { notify('This setup is unavailable because a required item is out of stock', 'warning'); return }
        addToCart(bundleName, bundle?.products?.length ?? 1)
        setAdded(true)
        window.setTimeout(() => setAdded(false), 1600)
      }}
      aria-label={`Add ${bundleName} setup to cart`}
      className={cn(
        'inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold transition-colors',
        added
          ? 'bg-success text-white'
          : 'bg-brand text-brand-foreground hover:bg-brand/90',
        className,
      )}
    >
      {added ? <Check className="size-4" /> : <ShoppingCart className="size-4" />}
      {added ? 'Setup added' : 'Add entire setup'}
    </button>
  )
}
