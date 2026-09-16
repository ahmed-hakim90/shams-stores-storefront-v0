'use client'

import { useState } from 'react'
import { Check, ShoppingCart } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Bundle, Product } from '@/lib/commerce'
import { useInteractions } from '@/components/shams/providers'

export function AddBundleButton({
  bundleName,
  bundle,
  className,
}: {
  bundleName: string
  bundle?: Bundle & { products?: Product[] }
  className?: string
}) {
  const [added, setAdded] = useState(false)
  const { addBundleToCart, notify } = useInteractions()
  return (
    <button
      type="button"
      onClick={() => {
        if (!bundle?.products) { notify('This setup is still loading', 'info'); return }
        const addedToCart = addBundleToCart({ ...bundle, products: bundle.products })
        if (!addedToCart) return
        setAdded(true)
        window.setTimeout(() => setAdded(false), 1600)
      }}
      aria-label={`Add ${bundleName} setup to cart`}
      className={cn(
        'inline-flex h-11 items-center justify-center gap-2 rounded-(--radius-control) px-5 text-sm font-semibold transition-colors duration-fast',
        added
          ? 'bg-success text-on-dark'
          : 'bg-brand text-brand-foreground hover:bg-brand/90',
        className,
      )}
    >
      {added ? <Check className="size-4" /> : <ShoppingCart className="size-4" />}
      {added ? 'Setup added' : 'Add entire setup'}
    </button>
  )
}
