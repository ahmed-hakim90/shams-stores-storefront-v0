'use client'

import { Scale } from 'lucide-react'
import { useInteractions } from './interaction-provider'
import { cn } from '@/lib/utils'

export function CompareAction({
  productName,
  className,
}: {
  productName: string
  className?: string
}) {
  const { compareItems, toggleCompare } = useInteractions()
  const active = compareItems.includes(productName)
  return (
    <button
      type="button"
      onClick={() => toggleCompare(productName)}
      aria-pressed={active}
      aria-label={active ? `Remove ${productName} from compare` : `Add ${productName} to compare`}
      className={cn(
        'inline-flex size-11 items-center justify-center rounded-full border border-border bg-background/95 transition-colors hover:border-brand hover:text-brand sm:size-8',
        active && 'border-brand bg-brand text-brand-foreground',
        className,
      )}
    >
      <Scale className="size-4" />
    </button>
  )
}
