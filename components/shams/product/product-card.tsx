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
import { discountPercent } from '@/lib/commerce'

export function ProductCard({
  product,
  className,
  view = 'grid',
  purchaseDisabled = false,
  hideActions = false,
}: {
  product: ProductSummary
  className?: string
  view?: 'list' | 'grid' | 'rail' | 'compact-related'
  purchaseDisabled?: boolean
  hideActions?: boolean
}) {
  const horizontal = view === 'list' || view === 'compact-related'
  const productHref = `/p/${product.slug}`
  const canAddDirectly =
    product.purchasable !== false &&
    product.price.amount > 0 &&
    product.stock !== 'out_of_stock' &&
    !product.hasOptions
  const discount = discountPercent(product.price, product.previousPrice)

  return (
    <article
      className={cn(
        'group shams-panel shams-product-card min-w-0 overflow-hidden transition-[border-color,box-shadow] duration-standard ease-out-expo hover:border-foreground',
        horizontal
          ? 'relative grid min-h-[180px] grid-cols-[minmax(96px,34%)_minmax(0,1fr)] sm:min-h-[180px] sm:grid-cols-[180px_minmax(0,1fr)]'
          : 'flex flex-col',
        view === 'compact-related' &&
          'grid-cols-[140px_minmax(0,1fr)] sm:grid-cols-[140px_minmax(0,1fr)]',
        className,
      )}
    >
      <div
        className={cn(
          'relative min-w-0 shrink-0 overflow-hidden bg-surface-raised',
          horizontal
            ? 'flex h-full flex-col border-r border-border p-2.5 sm:p-4'
            : view === 'rail'
              ? 'flex aspect-square flex-col p-1.5 sm:p-2'
              : 'flex aspect-square flex-col px-1.5 pt-1.5 pb-1 sm:px-2 sm:pt-2 sm:pb-1 sm:aspect-[1.15/1]',
        )}
      >
        {!horizontal && product.badges.length > 0 && (
          <div className="absolute left-0 top-0 z-20 flex flex-col items-start">
            {product.badges.map((badge) => (
              <ProductBadge key={badge} badge={badge} discount={discount ?? undefined} />
            ))}
          </div>
        )}
        {!horizontal && !hideActions && (
          <div className="shams-card-actions relative z-10 flex h-7 min-h-[28px] items-center justify-end">
            <div className="flex items-center gap-1">
              <WishlistAction
                productName={product.name}
                productId={product.id}
                className="size-7 [&_svg]:size-4"
              />
              <CompareAction
                productName={product.name}
                productId={product.id}
                className="size-7 [&_svg]:size-4"
              />
            </div>
          </div>
        )}
        {horizontal && product.badges.length > 0 && (
          <div className="absolute left-0 top-0 z-10 flex flex-col items-start gap-0.5">
            {product.badges.map((badge) => (
              <ProductBadge key={badge} badge={badge} discount={discount ?? undefined} />
            ))}
          </div>
        )}
        <Link
          href={productHref}
          prefetch={false}
          data-prefetch-on-intent
          className={cn(
            'relative block w-full overflow-hidden',
            !horizontal ? 'min-h-0 flex-1' : 'min-h-[120px] flex-1',
          )}
        >
          <Image
            src={product.image || '/placeholder.svg'}
            alt={product.name}
            fill
            sizes={
              horizontal
                ? '(max-width: 639px) 38vw, 240px'
                : view === 'rail'
                  ? '(max-width: 640px) calc(min(78vw, 292px) - 1.5rem), (max-width: 768px) calc(256px - 1.5rem), 220px'
                  : '(max-width: 640px) calc(100vw - 40px), (max-width: 768px) calc(50vw - 60px), (max-width: 1280px) 180px, 200px'
            }
            className={cn(
              'object-contain transition-[transform,opacity] duration-standard ease-out-expo motion-safe:[@media(hover:hover)]:group-hover:scale-[1.025]',
              product.secondaryImage &&
                '[@media(hover:hover)]:group-hover:opacity-0',
            )}
          />
          {product.secondaryImage && (
            <Image
              src={product.secondaryImage}
              alt=""
              fill
              sizes={horizontal ? '(max-width: 639px) 38vw, 200px' : '240px'}
              className="pointer-events-none hidden object-contain opacity-0 transition-opacity duration-standard motion-reduce:transition-none [@media(hover:hover)]:block [@media(hover:hover)]:group-hover:opacity-100"
            />
          )}
        </Link>
      </div>

      <div
        className={cn(
          'flex min-w-0 flex-1 flex-col gap-1 p-2 sm:gap-2 sm:p-4',
          view === 'grid' && 'border-t border-border',
          view === 'rail' && 'border-t border-border',
        )}
      >
        <div className="flex min-w-0 flex-wrap items-center justify-between gap-x-2 gap-y-0.5">
          <span className="min-w-0 truncate text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
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
            prefetch={false}
            data-prefetch-on-intent
            className={cn(
              'line-clamp-2 break-words text-sm font-medium leading-[1.35] text-foreground transition-colors duration-fast hover:text-brand-ink',
              view === 'rail' ? 'sm:text-sm' : 'sm:text-base',
            )}
          >
            {product.name}
          </Link>
          {product.configuration && (
            <p className="line-clamp-1 text-[11px] text-muted-foreground">
              {product.configuration}
            </p>
          )}
        </div>
        {product.highlights?.length ? (
          <p className="line-clamp-1 text-xs leading-4 text-muted-foreground">
            {product.highlights.slice(0, 2).map((highlight) => highlight.value).join(' · ')}
          </p>
        ) : null}
        <StockStatus status={product.stock} compact />
        {product.stock === 'low_stock' && (
          <p className="text-[11px] font-medium text-warning">
            Low stock
          </p>
        )}

        <div className="mt-auto min-w-0 pt-1">
          <PriceDisplay
            price={product.price}
            previousPrice={product.previousPrice}
            installmentFrom={product.installmentFrom}
            size="sm"
          />
          <div className="mt-2 flex min-w-0 flex-wrap items-center gap-1.5">
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
                  'rounded-(--radius-control)',
                  horizontal ? 'basis-full sm:basis-auto sm:flex-1' : 'w-full',
                )}
              />
            ) : (
              <Link
                href={productHref}
                prefetch={false}
                data-prefetch-on-intent
                className={cn(
                  'inline-flex h-9 items-center justify-center rounded-(--radius-control) border border-brand/30 px-3 text-xs font-medium text-brand-ink transition-colors duration-fast hover:bg-brand-muted',
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
