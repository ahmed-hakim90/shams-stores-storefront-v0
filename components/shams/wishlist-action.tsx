'use client'

import { Heart } from 'lucide-react'
import { useInteractions } from './interaction-provider'
import { cn } from '@/lib/utils'

export function WishlistAction({
  productName,
  className,
}: {
  productName: string
  className?: string
}) {
  const { isWishlisted, toggleWishlist } = useInteractions()
  const saved = isWishlisted(productName)
  return (
    <button
      type="button"
      onClick={() => toggleWishlist(productName)}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${productName} from wishlist` : `Save ${productName} to wishlist`}
      className={cn(
        'inline-flex size-11 items-center justify-center rounded-full border border-border bg-background/95 transition-colors hover:border-brand hover:text-brand sm:size-8',
        saved && 'border-brand text-brand',
        className,
      )}
    >
      <Heart className={cn('size-4', saved && 'fill-brand')} />
    </button>
  )
}
