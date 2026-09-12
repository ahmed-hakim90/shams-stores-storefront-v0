import { ProductImage as Image } from './product-image'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { ProductSummary } from '@/lib/commerce'
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
  product: ProductSummary
  className?: string
  view?: 'list' | 'grid' | 'rail' | 'compact-related'
}) {
  return (
    <article
      className={cn(
        cn(
          'group mobile-product-card min-w-0 border border-border bg-card transition-[border-color,box-shadow,transform] duration-180 hover:border-brand/40 hover:shadow-[0_1px_0_rgba(0,0,0,0.02),0_12px_30px_-18px_rgba(21,63,112,0.35)]',
          view === 'list'
            ? 'relative grid min-h-[210px] grid-cols-[minmax(120px,38%)_minmax(0,1fr)] overflow-hidden rounded-xl sm:min-h-[210px] sm:grid-cols-[220px_minmax(0,1fr)]'
            : 'flex flex-col rounded-xl',
          view !== 'list' && 'mobile-product-card-grid',
        ),
        className,
      )}
    >
      {/* MEDIA AREA */}
      <div
        className={cn(
          'relative min-w-0 shrink-0 overflow-hidden bg-white',
          view === 'list'
            ? 'flex h-full flex-col border-r border-border p-3 sm:p-5'
            : view === 'rail'
              ? 'aspect-[1/1] p-3 sm:p-4'
              : 'aspect-[4/3] p-3 sm:aspect-[1.15/1] sm:p-5',
        )}
      >
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
          <div
            className={cn(
              'absolute right-3 top-3 z-10 flex flex-col gap-1.5',
              view === 'rail'
                ? 'opacity-100'
                : 'opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100 md:focus-within:opacity-100',
            )}
          >
            <WishlistAction productName={product.name} productId={product.id} />
            <CompareAction productName={product.name} productId={product.id} />
          </div>
        )}

        {/* PRODUCT IMAGE */}
        <Link
          href={`/p/${product.slug}`}
          className="relative block min-h-0 w-full flex-1 overflow-hidden"
        >
          <Image
            src={product.image || '/placeholder.svg'}
            alt={product.name}
            fill
            sizes={
              view === 'list'
                ? '(max-width: 639px) 38vw, 260px'
                : view === 'rail'
                  ? '(max-width: 640px) calc(min(78vw, 292px) - 1.5rem), (max-width: 768px) calc(256px - 1.5rem), 240px'
                  : '(max-width: 640px) calc(100vw - 40px), (max-width: 768px) calc(50vw - 60px), (max-width: 1280px) 190px, 220px'
            }
            className={cn(
              'object-contain transition-transform duration-300 motion-safe:group-hover:scale-[1.04]',
              product.secondaryImage &&
                '[@media(hover:hover)]:group-hover:opacity-0',
            )}
          />
          {product.secondaryImage && (
            <Image
              src={product.secondaryImage}
              alt=""
              fill
              sizes={
                view === 'list' ? '(max-width: 639px) 38vw, 220px' : '260px'
              }
              className="pointer-events-none hidden object-contain opacity-0 transition-opacity duration-200 motion-reduce:transition-none [@media(hover:hover)]:block [@media(hover:hover)]:group-hover:opacity-100"
            />
          )}
        </Link>

        {/* WISHLIST + COMPARE for List View - Below Image */}
        {view === 'list' && (
          <div className="relative z-20 flex shrink-0 justify-center gap-2 pt-2 sm:pt-3">
            <WishlistAction productName={product.name} productId={product.id} />
            <CompareAction productName={product.name} productId={product.id} />
          </div>
        )}
      </div>

      {/* CONTENT AREA */}
      <div
        className={cn(
          'flex min-w-0 flex-1 flex-col gap-2 p-3 sm:gap-3 sm:p-5',
          view === 'grid' && 'border-t border-border',
          view === 'rail' && 'border-t border-border',
        )}
      >
        {/* BRAND + RATING */}
        <div className="flex min-w-0 flex-wrap items-center justify-between gap-x-3 gap-y-1">
          <span className="min-w-0 truncate text-xs font-semibold uppercase tracking-wide text-brand">
            {product.brand}
          </span>
          <div className="flex shrink-0 items-center gap-1.5">
            {view !== 'list' && product.reviewCount > 0 && (
              <RatingStars
                rating={product.rating}
                reviewCount={product.reviewCount}
              />
            )}
          </div>
        </div>
        {view === 'list' && product.reviewCount > 0 && (
          <RatingStars
            rating={product.rating}
            reviewCount={product.reviewCount}
            className="shrink-0"
          />
        )}

        {/* PRODUCT NAME + CONFIGURATION */}
        <div className="min-h-0">
          <Link
            href={`/p/${product.slug}`}
            className="line-clamp-2 text-sm font-semibold leading-5 text-foreground transition-colors hover:text-brand sm:text-lg sm:leading-6"
          >
            {product.name}
          </Link>
          {product.configuration && (
            <p className="line-clamp-1 text-xs text-muted-foreground">
              {product.configuration}
            </p>
          )}
        </div>

        {product.highlights?.length ? (
          <p className="line-clamp-2 text-xs leading-5 text-muted-foreground">
            {product.highlights.map((h) => h.value).join(' · ')}
          </p>
        ) : null}
        {/* STOCK STATUS */}
        <StockStatus status={product.stock} />

        {/* PRICE + INSTALLMENT + CTA (STICKY AT BOTTOM) */}
        <div className="mt-auto flex min-w-0 flex-col gap-3 pt-1 sm:flex-row sm:items-end sm:justify-between">
          <PriceDisplay
            price={product.price}
            previousPrice={product.previousPrice}
            installmentFrom={product.installmentFrom}
          />
          <AddToCartButton
            product={product}
            className="w-full flex-none rounded-lg sm:w-auto sm:min-w-44"
          />
        </div>
      </div>
    </article>
  )
}
