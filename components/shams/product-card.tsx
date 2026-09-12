import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { Product } from '@/lib/commerce'
import { PriceDisplay } from './price-display'
import { ProductBadge } from './product-badge'
import { RatingStars } from './rating-stars'
import { StockStatus } from './stock-status'
import { WishlistAction } from './wishlist-action'
import { CompareAction } from './compare-action'
import { AddToCartButton } from './add-to-cart-button'

export function ProductCard({
  product,
  className,
  view = 'grid',
}: {
  product: Product
  className?: string
  view?: 'list' | 'grid' | 'rail'
}) {
  const dimmed = product.stock === 'out_of_stock'

  return (
    <article
      className={cn(
        cn('group border border-border bg-card transition-[border-color,box-shadow,transform] duration-180 hover:border-brand/40 hover:shadow-[0_1px_0_rgba(0,0,0,0.02),0_12px_30px_-18px_rgba(21,63,112,0.35)] sm:min-w-0', view === 'list' ? 'relative flex min-h-[188px] flex-row rounded-none' : 'flex flex-col rounded-xl'),
        className,
      )}
    >
      <div className={cn('relative shrink-0 bg-white p-3 sm:p-5', view === 'list' ? 'flex w-[38%] flex-col sm:w-[42%]' : view === 'rail' ? 'h-[200px] sm:h-[214px]' : 'aspect-[4/3] sm:aspect-[1.15/1]')}>
        {product.badges.length > 0 && (
          <div className="absolute left-3 top-3 z-10 flex flex-col items-start gap-1">
            {product.badges.map((b) => (
              <ProductBadge key={b} badge={b} />
            ))}
          </div>
        )}
        {view !== 'list' && (
          <div className="absolute right-3 top-3 z-10 flex flex-col gap-1.5 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100 md:focus-within:opacity-100">
            <WishlistAction productName={product.name} />
            <CompareAction productName={product.name} />
          </div>
        )}
        <Link href={`/p/${product.slug}`} className={cn('relative block overflow-hidden', view === 'list' && 'aspect-square shrink-0')}>
          <Image
            src={product.image || '/placeholder.svg'}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 280px"
            className={cn(
              'object-contain p-2 transition-transform duration-300 group-hover:scale-[1.04]',
              dimmed && 'opacity-70 grayscale',
            )}
          />
        </Link>
        {view === 'list' && (
          <div className="relative z-20 flex shrink-0 justify-center gap-2 pt-2 sm:pt-3">
            <WishlistAction productName={product.name} className="rounded-none" />
            <CompareAction productName={product.name} className="rounded-none" />
          </div>
        )}
      </div>

      <div className={cn('flex min-w-0 flex-1 flex-col gap-2.5 p-3 sm:p-4', view === 'grid' && 'border-t border-border')}>
        <div className="flex min-w-0 items-start justify-between gap-2">
          <span className="min-w-0 pt-1 text-xs font-semibold uppercase tracking-wide text-brand">
            {product.brand}
          </span>
          <div className="flex shrink-0 items-center gap-1.5">
            {view !== 'list' && <RatingStars rating={product.rating} reviewCount={product.reviewCount} />}
          </div>
        </div>
        {view === 'list' && (
          <div className="min-w-0">
            <RatingStars rating={product.rating} reviewCount={product.reviewCount} />
          </div>
        )}

        <div className="min-h-10">
          <Link
            href={`/p/${product.slug}`}
            className={cn('line-clamp-2 font-medium text-foreground transition-colors hover:text-brand', view === 'rail' && 'line-clamp-2')}
          >
            {product.name}
          </Link>
          {product.configuration && (
            <p className="line-clamp-1 text-xs text-muted-foreground">
              {product.configuration}
            </p>
          )}
        </div>

        <StockStatus status={product.stock} />

        <div className="mt-auto flex flex-col gap-3 pt-1">
          <PriceDisplay
            price={product.price}
            previousPrice={product.previousPrice}
            installmentFrom={product.installmentFrom}
          />
          <AddToCartButton productName={product.name} stock={product.stock} />
        </div>
      </div>
    </article>
  )
}
