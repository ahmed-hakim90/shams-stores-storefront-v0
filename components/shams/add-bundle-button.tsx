'use client'

import { useState } from 'react'
import { Check, ShoppingCart } from 'lucide-react'
import { cn } from '@/lib/utils'

export function AddBundleButton({
  bundleName,
  className,
}: {
  bundleName: string
  className?: string
}) {
  const [added, setAdded] = useState(false)
  return (
    <button
      type="button"
      onClick={() => {
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
