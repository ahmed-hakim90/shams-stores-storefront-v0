'use client'

import { Scale } from 'lucide-react'
import { useInteractions } from '@/components/shams/providers'
import { cn } from '@/lib/utils'

export function CompareAction({
  productName,
  productId,
  className,
}: {
  productName: string
  productId?: string
  className?: string
}) {
  const { compareItems, toggleCompare } = useInteractions()
  const active = compareItems.includes(productId ?? productName)
  return (
    <button
      type="button"
      onClick={() => toggleCompare(productId ?? productName)}
      aria-pressed={active}
      aria-label={
        active
          ? `Remove ${productName} from compare`
          : `Add ${productName} to compare`
      }
      className={cn(
        'inline-flex size-11 items-center justify-center rounded-full border border-border bg-background/95 transition-colors hover:border-foreground hover:text-foreground shrink-0',
        active && 'border-brand bg-brand text-brand-foreground',
        className,
      )}
    >
      <Scale className="size-4" />
    </button>
  )
}
