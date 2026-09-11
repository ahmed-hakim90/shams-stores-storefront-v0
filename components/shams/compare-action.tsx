'use client'

import { useState } from 'react'
import { Scale } from 'lucide-react'
import { cn } from '@/lib/utils'

export function CompareAction({
  productName,
  className,
}: {
  productName: string
  className?: string
}) {
  const [active, setActive] = useState(false)
  return (
    <button
      type="button"
      onClick={() => setActive((s) => !s)}
      aria-pressed={active}
      aria-label={active ? `Remove ${productName} from compare` : `Add ${productName} to compare`}
      className={cn(
        'inline-flex size-8 items-center justify-center rounded-full border border-border bg-background/90 backdrop-blur transition-colors hover:border-brand hover:text-brand',
        active && 'border-brand bg-brand text-brand-foreground',
        className,
      )}
    >
      <Scale className="size-4" />
    </button>
  )
}
