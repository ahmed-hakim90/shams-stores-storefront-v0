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
    size === 'lg' ? 'text-2xl' : size === 'sm' ? 'text-base' : 'text-lg'

  return (
    <div className={cn('flex flex-col gap-0.5', className)}>
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <span
          className={cn(
            'max-w-full break-words font-semibold tracking-tight text-foreground tabular-nums',
            priceClass,
          )}
        >
          {price.amount > 0 ? formatMoney(price) : 'Contact for price'}
        </span>
        {price.amount > 0 && previousPrice && (
          <span className="text-sm text-muted-foreground line-through">
            {formatMoney(previousPrice)}
          </span>
        )}
        {off && (
          <span className="rounded bg-[color-mix(in_oklab,var(--color-sale)_12%,transparent)] px-1.5 py-0.5 text-xs font-semibold text-sale">
            -{off}%
          </span>
        )}
      </div>
      {installmentFrom && (
        <span className="text-xs text-muted-foreground">
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
