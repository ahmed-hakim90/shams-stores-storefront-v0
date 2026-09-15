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
  purchaseDisabled = false,
}: {
  product: ProductSummary
  className?: string
  view?: 'list' | 'grid' | 'rail' | 'compact-related'
  purchaseDisabled?: boolean
}) {
  const horizontal = view === 'list' || view === 'compact-related'
  const productHref = `/p/${product.slug}`
  const canAddDirectly =
    product.purchasable !== false &&
    product.price.amount > 0 &&
    product.stock !== 'out_of_stock' &&
    !product.hasOptions

  return (
    <article
      className={cn(
        'group shams-product-card min-w-0 border border-border bg-card transition-[border-color,box-shadow,transform] duration-180 hover:border-brand/40 hover:shadow-[0_1px_0_rgba(0,0,0,0.02),0_12px_30px_-18px_rgba(21,63,112,0.35)]',
        horizontal
          ? 'relative grid min-h-[210px] grid-cols-[minmax(96px,34%)_minmax(0,1fr)] overflow-hidden rounded-xl sm:min-h-[210px] sm:grid-cols-[200px_minmax(0,1fr)]'
          : 'flex flex-col rounded-xl',
        !horizontal && 'mobile-product-card-grid',
        view === 'compact-related' &&
          'grid-cols-[160px_minmax(0,1fr)] sm:grid-cols-[160px_minmax(0,1fr)]',
        className,
      )}
    >
      <div
        className={cn(
          'relative min-w-0 shrink-0 overflow-hidden bg-white',
          horizontal
            ? 'flex h-full flex-col border-r border-border p-3 sm:p-5'
            : view === 'rail'
              ? 'aspect-[1/1] p-3 sm:p-4'
              : 'aspect-[4/3] p-3 sm:aspect-[1.15/1] sm:p-5',
        )}
      >
        {product.badges.length > 0 && (
          <div className="absolute left-3 top-3 z-10 flex flex-col items-start gap-1">
            {product.badges.map((badge) => (
              <ProductBadge key={badge} badge={badge} />
            ))}
          </div>
        )}
        {!horizontal && (
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
        <Link
          href={productHref}
          className="relative block min-h-[132px] w-full flex-1 overflow-hidden"
        >
          <Image
            src={product.image || '/placeholder.svg'}
            alt={product.name}
            fill
            sizes={
              horizontal
                ? '(max-width: 639px) 38vw, 260px'
                : view === 'rail'
                  ? '(max-width: 640px) calc(min(78vw, 292px) - 1.5rem), (max-width: 768px) calc(256px - 1.5rem), 240px'
                  : '(max-width: 640px) calc(100vw - 40px), (max-width: 768px) calc(50vw - 60px), (max-width: 1280px) 190px, 220px'
            }
            className={cn(
              'object-contain transition-[transform,opacity] duration-300 motion-safe:[@media(hover:hover)]:group-hover:scale-[1.04]',
              product.secondaryImage &&
                '[@media(hover:hover)]:group-hover:opacity-0',
            )}
          />
          {product.secondaryImage && (
            <Image
              src={product.secondaryImage}
              alt=""
              fill
              sizes={horizontal ? '(max-width: 639px) 38vw, 220px' : '260px'}
              className="pointer-events-none hidden object-contain opacity-0 transition-opacity duration-200 motion-reduce:transition-none [@media(hover:hover)]:block [@media(hover:hover)]:group-hover:opacity-100"
            />
          )}
        </Link>
      </div>

      <div
        className={cn(
          'flex min-w-0 flex-1 flex-col gap-2 p-3 sm:gap-3 sm:p-5',
          view === 'grid' && 'border-t border-border',
          view === 'rail' && 'border-t border-border',
        )}
      >
        <div className="flex min-w-0 flex-wrap items-center justify-between gap-x-3 gap-y-1">
          <span className="min-w-0 truncate text-xs font-semibold uppercase tracking-wide text-brand-ink">
            {product.brand}
          </span>
          {!horizontal && product.reviewCount > 0 && (
            <RatingStars rating={product.rating} reviewCount={product.reviewCount} />
          )}
        </div>
        {horizontal && product.reviewCount > 0 && (
          <RatingStars
            rating={product.rating}
            reviewCount={product.reviewCount}
            className="shrink-0"
          />
        )}

        <div className="min-h-0">
          <Link
            href={productHref}
            className="line-clamp-3 break-words text-base font-semibold leading-[1.4] text-foreground transition-colors hover:text-brand-ink sm:text-lg"
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
          <p className="line-clamp-2 text-sm leading-5 text-muted-foreground">
            {product.highlights.slice(0, 3).map((highlight) => highlight.value).join(' · ')}
          </p>
        ) : null}
        <StockStatus status={product.stock} />

        <div className="mt-auto min-w-0 pt-1">
          <PriceDisplay
            price={product.price}
            previousPrice={product.previousPrice}
            installmentFrom={product.installmentFrom}
          />
          <div className="mt-3 flex min-w-0 flex-wrap items-center gap-2">
            {horizontal && (
              <>
                <WishlistAction
                  productName={product.name}
                  productId={product.id}
                />
                <CompareAction productName={product.name} productId={product.id} />
              </>
            )}
            {canAddDirectly ? (
              <AddToCartButton
                product={product}
                disabled={purchaseDisabled}
                className={cn(
                  'rounded-lg',
                  horizontal ? 'basis-full sm:basis-auto sm:flex-1' : 'w-full',
                )}
              />
            ) : (
              <Link
                href={productHref}
                className={cn(
                  'inline-flex min-h-11 items-center justify-center rounded-lg border border-brand/30 px-4 text-sm font-medium text-brand-ink transition-colors hover:bg-brand-muted',
                  horizontal ? 'basis-full sm:basis-auto sm:flex-1' : 'w-full',
                )}
              >
                View details
              </Link>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}
