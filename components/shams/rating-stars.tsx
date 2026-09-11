import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

export function RatingStars({
  rating,
  reviewCount,
  className,
}: {
  rating: number
  reviewCount?: number
  className?: string
}) {
  return (
    <span className={cn('inline-flex items-center gap-1', className)}>
      <Star className="size-3.5 fill-amber-400 text-amber-400" aria-hidden />
      <span className="text-xs font-medium text-foreground">
        {rating.toFixed(1)}
      </span>
      {reviewCount !== undefined && (
        <span className="text-xs text-muted-foreground">({reviewCount})</span>
      )}
    </span>
  )
}
