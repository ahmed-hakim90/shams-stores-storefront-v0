import { cn } from '@/lib/utils'
import { discountPercent, formatEgp, formatMoney } from '@/lib/commerce'
import type { Money } from '@/lib/commerce'

export function PriceDisplay({
  price,
  previousPrice,
  installmentFrom,
  size = 'md',
  className,
}: {
  price: Money
  previousPrice?: Money
  installmentFrom?: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  const off =
    price.amount > 0 ? discountPercent(price, previousPrice) : undefined
  const priceClass =
    size === 'lg' ? 'text-2xl' : size === 'sm' ? 'text-sm' : 'text-base'
  const subClass = size === 'sm' ? 'text-xs' : 'text-sm'

  return (
    <div className={cn('flex flex-col gap-0.5', className)}>
      <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
        <span
          className={cn(
            'max-w-full break-words font-semibold tracking-tight text-foreground tabular-nums',
            priceClass,
          )}
        >
          {price.amount > 0 ? formatMoney(price) : 'Contact for price'}
        </span>
        {price.amount > 0 && previousPrice && (
          <span className={cn('text-muted-foreground line-through', subClass)}>
            {formatMoney(previousPrice)}
          </span>
        )}
        {off && (
          <span className={cn(
            'rounded bg-[color-mix(in_oklab,var(--color-sale)_12%,transparent)] font-semibold text-sale',
            size === 'sm' ? 'px-1 py-px text-[10px]' : 'px-1.5 py-0.5 text-xs',
          )}>
            -{off}%
          </span>
        )}
      </div>
      {installmentFrom && (
        <span className={cn('text-muted-foreground', size === 'sm' ? 'text-[10px]' : 'text-xs')}>
          or{' '}
          <span className="font-medium text-foreground">
            {formatEgp(installmentFrom)}
          </span>
          /mo · 24 months
        </span>
      )}
    </div>
  )
}
