import Image from 'next/image'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { commerce, formatMoney, formatEgp } from '@/lib/commerce'
import type { Bundle, Product } from '@/lib/commerce'
import { AddBundleButton } from './add-bundle-button'

export function BundleBuilderCard({
  bundle,
  className,
}: {
  bundle: Bundle & { products: Product[] }
  className?: string
}) {
  const savings = bundle.originalPrice.amount - bundle.bundlePrice.amount
  const roles = bundle.items.map((i) => i.role)

  return (
    <article
      className={cn(
        'flex flex-col overflow-hidden rounded-2xl border border-border bg-card',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2 border-b border-border px-5 py-3">
        <div>
          <Link href={`/bundles/${bundle.slug}`} className="font-semibold tracking-tight text-foreground hover:text-brand-ink">{bundle.name}</Link>
          <p className="text-xs text-muted-foreground">
            {commerce.useCases.bySlug(bundle.useCase)?.name} setup ·{' '}
            {bundle.products.length} items
          </p>
        </div>
        {bundle.badge && (
          <span className="shrink-0 rounded-full bg-[color-mix(in_oklab,var(--color-sale)_12%,transparent)] px-2.5 py-1 text-xs font-semibold text-sale">
            {bundle.badge}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between gap-1 bg-white px-4 py-6">
        {bundle.products.map((p, i) => (
          <div key={p.id} className="flex flex-1 items-center">
            <div className="flex min-w-0 flex-1 flex-col items-center gap-1.5 text-center">
              <div className="relative size-20 sm:size-24">
                <Image
                  src={p.image || '/placeholder.svg'}
                  alt={p.name}
                  fill
                  sizes="96px"
                  className="object-contain"
                />
              </div>
              <span className="text-[0.7rem] font-medium uppercase tracking-wide text-brand-ink">
                {roles[i]}
              </span>
              <span className="line-clamp-1 max-w-full text-xs text-muted-foreground">
                {p.name}
              </span>
            </div>
            {i < bundle.products.length - 1 && (
              <Plus className="mx-0.5 size-4 shrink-0 text-muted-foreground" />
            )}
          </div>
        ))}
      </div>

      <div className="mt-auto flex flex-col gap-4 border-t border-border p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            <span className="line-through">{formatMoney(bundle.originalPrice)}</span>{' '}
            <span className="font-medium text-success">
              save {formatEgp(savings)}
            </span>
          </p>
          <p className="text-2xl font-semibold tracking-tight text-foreground">
            {formatMoney(bundle.bundlePrice)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2"><Link href={`/bundles/${bundle.slug}`} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-border px-4 text-sm font-semibold hover:border-brand hover:text-brand-ink">View bundle</Link><AddBundleButton bundleName={bundle.name} bundle={bundle} /></div>
      </div>
    </article>
  )
}
