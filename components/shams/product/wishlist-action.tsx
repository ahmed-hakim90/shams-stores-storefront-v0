'use client'

import { Heart } from 'lucide-react'
import { useInteractions } from '@/components/shams/providers'
import { cn } from '@/lib/utils'

export function WishlistAction({
  productName,
  productId,
  className,
}: {
  productName: string
  productId?: string
  className?: string
}) {
  const { isWishlisted, toggleWishlist } = useInteractions()
  const saved = isWishlisted(productId ?? productName)
  return (
    <button
      type="button"
      onClick={() => toggleWishlist(productId ?? productName)}
      aria-pressed={saved}
      aria-label={
        saved
          ? `Remove ${productName} from wishlist`
          : `Save ${productName} to wishlist`
      }
      className={cn(
        'inline-flex size-11 items-center justify-center rounded-full border border-border bg-background/95 transition-colors hover:border-foreground hover:text-foreground shrink-0',
        saved && 'border-brand text-brand-ink',
        className,
      )}
    >
      <Heart className={cn('size-4', saved && 'fill-brand')} />
    </button>
  )
}
