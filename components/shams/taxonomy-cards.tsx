import Link from 'next/link'
import type { TaxonomyTerm } from '@/lib/commerce/types'
import { ProductImage } from './product-image'
export function TaxonomyCards({
  terms,
  kind = 'category',
  compact = false,
}: {
  terms: TaxonomyTerm[]
  kind?: 'category' | 'brand'
  compact?: boolean
}) {
  return (
    <div
      className={
        compact
          ? 'flex gap-1.5 overflow-x-auto py-1'
          : 'grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4'
      }
    >
      {terms.map((t) => (
        <Link
          key={t.id}
          href={`/${kind === 'brand' ? 'b' : 'c'}/${t.slug}`}
          className={`group min-w-0 overflow-hidden border border-border bg-card transition-colors duration-fast hover:border-brand ${compact ? 'flex w-32 shrink-0 items-center gap-2 p-2' : 'p-3'}`}
        >
          {t.image ? (
            <div
              className={`relative shrink-0 bg-white ${compact ? 'size-9' : 'mb-2 aspect-[4/3]'}`}
            >
              <ProductImage
                src={t.image}
                alt={t.name}
                fill
                sizes={compact ? '36px' : '(max-width: 768px) 45vw, 260px'}
                className="object-contain p-1.5"
              />
            </div>
          ) : (
            !compact && (
              <div className="mb-2 flex aspect-[4/3] items-center justify-center bg-surface-subtle px-3 text-center text-sm font-semibold tracking-tight">
                {t.name}
              </div>
            )
          )}
          <div className="min-w-0">
            <h3 className="text-xs font-semibold group-hover:text-brand-ink sm:text-sm">
              {t.name}
            </h3>
            {!compact && (
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {t.count ?? ''} {t.count === 1 ? 'product' : 'products'}
              </p>
            )}
          </div>
        </Link>
      ))}
    </div>
  )
}
