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
          ? 'flex gap-3 overflow-x-auto py-2'
          : 'grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4'
      }
    >
      {terms.map((t) => (
        <Link
          key={t.id}
          href={`/${kind === 'brand' ? 'b' : 'c'}/${t.slug}`}
          className={`group min-w-0 overflow-hidden rounded-[var(--radius-card)] border border-border bg-card transition-colors hover:border-brand ${compact ? 'flex w-40 shrink-0 items-center gap-3 p-3' : 'p-4'}`}
        >
          {t.image ? (
            <div
              className={`relative shrink-0 bg-white ${compact ? 'size-12' : 'mb-4 aspect-[4/3]'}`}
            >
              <ProductImage
                src={t.image}
                alt={t.name}
                fill
                sizes={compact ? '48px' : '(max-width: 768px) 45vw, 260px'}
                className="object-contain p-2"
              />
            </div>
          ) : (
            !compact && (
              <div className="mb-4 flex aspect-[4/3] items-center justify-center rounded-lg bg-brand/5 px-4 text-center text-lg font-semibold tracking-tight sm:text-2xl">
                {t.name}
              </div>
            )
          )}
          <div className="min-w-0">
            <h3 className="text-base font-semibold group-hover:text-brand-ink">
              {t.name}
            </h3>
            {!compact && (
              <p className="mt-2 text-sm text-muted-foreground">
                Explore {t.name} →
              </p>
            )}
          </div>
        </Link>
      ))}
    </div>
  )
}
