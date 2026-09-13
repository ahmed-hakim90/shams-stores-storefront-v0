import { cn } from '@/lib/utils'
import { stockMeta } from '@/lib/commerce'
import type { StockStatus as StockStatusType } from '@/lib/commerce'

const toneClass: Record<string, string> = {
  success: 'text-success',
  warning: 'text-warning',
  brand: 'text-brand-ink',
  muted: 'text-muted-foreground',
}

const dotClass: Record<string, string> = {
  success: 'bg-success',
  warning: 'bg-warning',
  brand: 'bg-brand',
  muted: 'bg-muted-foreground/50',
}

export function StockStatus({
  status,
  className,
}: {
  status: StockStatusType
  className?: string
}) {
  const meta = stockMeta[status]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-sm font-medium',
        toneClass[meta.tone],
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          'size-1.5 rounded-full',
          dotClass[meta.tone],
          status === 'low_stock' && 'animate-pulse',
        )}
      />
      {meta.label}
    </span>
  )
}
