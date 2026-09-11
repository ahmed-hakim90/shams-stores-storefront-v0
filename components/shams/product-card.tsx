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
}: {
  product: Product
  className?: string
}) {
  const dimmed = product.stock === 'out_of_stock'

  return (
    <article
      className={cn(
        'group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-brand/40 hover:shadow-[0_1px_0_rgba(0,0,0,0.02),0_12px_30px_-18px_rgba(21,63,112,0.35)]',
        className,
      )}
    >
      <div className="relative aspect-square bg-white p-5">
        {product.badges.length > 0 && (
          <div className="absolute left-3 top-3 z-10 flex flex-col items-start gap-1">
            {product.badges.map((b) => (
              <ProductBadge key={b} badge={b} />
            ))}
          </div>
        )}
        <div className="absolute right-3 top-3 z-10 flex flex-col gap-1.5 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100 md:focus-within:opacity-100">
          <WishlistAction productName={product.name} />
          <CompareAction productName={product.name} />
        </div>
        <Link href={`/p/${product.slug}`} className="block h-full">
          <Image
            src={product.image || '/placeholder.svg'}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 280px"
            className={cn(
              'object-contain p-2 transition-transform duration-300 group-hover:scale-[1.04]',
              dimmed && 'opacity-70 grayscale',
            )}
          />
        </Link>
      </div>

      <div className="flex flex-1 flex-col gap-2.5 border-t border-border p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-brand">
            {product.brand}
          </span>
          <RatingStars rating={product.rating} reviewCount={product.reviewCount} />
        </div>

        <div className="min-h-10">
          <Link
            href={`/p/${product.slug}`}
            className="line-clamp-1 font-medium text-foreground transition-colors hover:text-brand"
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
