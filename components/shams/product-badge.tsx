import { cn } from '@/lib/utils'
import type { ProductBadge as ProductBadgeType } from '@/lib/commerce'

const badgeMeta: Record<
  ProductBadgeType,
  { label: string; className: string }
> = {
  new: { label: 'New', className: 'bg-brand text-brand-foreground' },
  best_seller: {
    label: 'Best seller',
    className: 'bg-foreground text-background',
  },
  sale: {
    label: 'Sale',
    className: 'bg-[color-mix(in_oklab,var(--color-sale)_14%,white)] text-sale',
  },
  exclusive: {
    label: 'Shams exclusive',
    className: 'bg-brand-muted text-brand ring-1 ring-inset ring-brand/20',
  },
}

export function ProductBadge({
  badge,
  className,
}: {
  badge: ProductBadgeType
  className?: string
}) {
  const meta = badgeMeta[badge]
  return (
    <span
      className={cn(
        'inline-flex items-center rounded px-1.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide',
        meta.className,
        className,
      )}
    >
      {meta.label}
    </span>
  )
}
