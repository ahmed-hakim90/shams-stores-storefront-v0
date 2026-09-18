import { cn } from '@/lib/utils'
import type { ProductBadge as ProductBadgeType } from '@/lib/commerce'

const badgeMeta: Record<
  ProductBadgeType,
  { label: string; className: string }
> = {
  new: { label: 'New', className: 'bg-brand text-brand-foreground shadow-sm' },
  best_seller: {
    label: 'Best seller',
    className: 'bg-foreground text-background shadow-sm',
  },
  sale: {
    label: 'Sale',
    className: 'ribbon-sale',
  },
  exclusive: {
    label: 'Shams exclusive',
    className: 'bg-brand-muted text-brand ring-1 ring-inset ring-brand/20 shadow-sm',
  },
}

export function ProductBadge({
  badge,
  discount,
  className,
}: {
  badge: ProductBadgeType
  discount?: number
  className?: string
}) {
  const meta = badgeMeta[badge]
  const isSale = badge === 'sale' && discount && discount > 0
  const label = isSale ? `${discount}%` : meta.label
  const sublabel = isSale ? 'OFF' : undefined

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-sm px-2.5 py-1 text-xs font-bold uppercase tracking-wide shadow-sm',
        isSale ? 'ribbon-sale' : meta.className,
        className,
      )}
    >
      {isSale ? (
        <span className="flex flex-col leading-none">
          <span>{label}</span>
          {sublabel && <span className="text-[9px] font-semibold">{sublabel}</span>}
        </span>
      ) : (
        meta.label
      )}
    </span>
  )
}
