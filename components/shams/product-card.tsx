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
        cn('group mobile-product-card border border-border bg-card transition-[border-color,box-shadow,transform] duration-180 hover:border-brand/40 hover:shadow-[0_1px_0_rgba(0,0,0,0.02),0_12px_30px_-18px_rgba(21,63,112,0.35)] sm:min-w-0', view === 'list' ? 'relative flex min-h-[188px] flex-row rounded-none' : 'flex flex-col rounded-xl', view !== 'list' && 'mobile-product-card-grid'),
        className,
      )}
    >
      {/* MEDIA AREA */}
      <div className={cn('relative shrink-0 bg-white overflow-hidden flex items-center justify-center', view === 'list' ? 'flex w-[38%] flex-col p-3 sm:w-[42%] sm:p-5' : view === 'rail' ? 'aspect-[1/1] p-3 sm:p-4' : 'aspect-[4/3] p-3 sm:aspect-[1.15/1] sm:p-5')}>
        {/* BADGES - Top Left */}
        {product.badges.length > 0 && (
          <div className="absolute left-3 top-3 z-10 flex flex-col items-start gap-1">
            {product.badges.map((b) => (
              <ProductBadge key={b} badge={b} />
            ))}
          </div>
        )}

        {/* WISHLIST + COMPARE - Top Right (visible on mobile, hover on desktop for rail/grid) */}
        {view !== 'list' && (
          <div className={cn('absolute right-3 top-3 z-10 flex flex-col gap-1.5', view === 'rail' ? 'opacity-100' : 'opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100 md:focus-within:opacity-100')}>
            <WishlistAction productName={product.name} />
            <CompareAction productName={product.name} />
          </div>
        )}

        {/* PRODUCT IMAGE */}
        <Link href={`/p/${product.slug}`} className="relative block w-full h-full min-h-0 overflow-hidden">
          <Image
            src={product.image || '/placeholder.svg'}
            alt={product.name}
            fill
            sizes={view === 'list' ? '38vw' : view === 'rail' ? '(max-width: 640px) calc(min(78vw, 292px) - 1.5rem), (max-width: 768px) calc(256px - 1.5rem), 240px' : '(max-width: 640px) calc(100vw - 40px), (max-width: 768px) calc(50vw - 60px), (max-width: 1280px) 190px, 220px'}
            className={cn(
              'object-contain transition-transform duration-300 group-hover:scale-[1.04]',
              dimmed && 'opacity-70 grayscale',
            )}
          />
        </Link>

        {/* WISHLIST + COMPARE for List View - Below Image */}
        {view === 'list' && (
          <div className="relative z-20 flex shrink-0 justify-center gap-2 pt-2 sm:pt-3">
            <WishlistAction productName={product.name} className="rounded-none" />
            <CompareAction productName={product.name} className="rounded-none" />
          </div>
        )}
      </div>

      {/* CONTENT AREA */}
      <div className={cn('flex min-w-0 flex-1 flex-col gap-2.5 p-3 sm:p-4', view === 'grid' && 'border-t border-border', view === 'rail' && 'border-t border-border')}>
        {/* BRAND + RATING */}
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

        {/* PRODUCT NAME + CONFIGURATION */}
        <div className="min-h-10">
          <Link
            href={`/p/${product.slug}`}
            className="line-clamp-2 font-medium text-foreground transition-colors hover:text-brand"
          >
            {product.name}
          </Link>
          {product.configuration && (
            <p className="line-clamp-1 text-xs text-muted-foreground">
              {product.configuration}
            </p>
          )}
        </div>

        {/* STOCK STATUS */}
        <StockStatus status={product.stock} />

        {/* PRICE + INSTALLMENT + CTA (STICKY AT BOTTOM) */}
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
