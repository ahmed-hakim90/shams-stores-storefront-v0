'use client'

import { useState } from 'react'
import { Heart } from 'lucide-react'
import { cn } from '@/lib/utils'

export function WishlistAction({
  productName,
  className,
}: {
  productName: string
  className?: string
}) {
  const [saved, setSaved] = useState(false)
  return (
    <button
      type="button"
      onClick={() => setSaved((s) => !s)}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${productName} from wishlist` : `Save ${productName} to wishlist`}
      className={cn(
        'inline-flex size-8 items-center justify-center rounded-full border border-border bg-background/90 backdrop-blur transition-colors hover:border-brand hover:text-brand',
        saved && 'border-brand text-brand',
        className,
      )}
    >
      <Heart className={cn('size-4', saved && 'fill-brand')} />
    </button>
  )
}
