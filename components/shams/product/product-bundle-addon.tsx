import Link from 'next/link'
import { Package, Plus } from 'lucide-react'
import { formatEgp } from '@/lib/commerce'
import type { ProductBundleAddon } from '@/lib/commerce/types'

export function ProductBundleAddonCard({
  bundle,
}: {
  bundle: ProductBundleAddon
}) {
  return (
    <Link
      href={`/bundles/${bundle.slug}`}
      className="group flex items-center gap-4 rounded-(--radius-card) border bg-card p-4 transition-colors hover:border-foreground"
    >
      <div className="flex size-12 shrink-0 items-center justify-center rounded-(--radius-control) bg-brand-muted">
        <Package className="size-5 text-brand-ink" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold truncate">{bundle.name}</p>
          {bundle.badge && (
            <span className="shrink-0 rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-semibold text-success">
              {bundle.badge}
            </span>
          )}
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {bundle.itemCount} items
          {bundle.savings > 0 && (
            <> · Save {formatEgp(bundle.savings)}</>
          )}
        </p>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-sm font-semibold">{formatEgp(bundle.bundlePrice.amount)}</p>
        {bundle.savings > 0 && (
          <p className="text-xs text-muted-foreground line-through">
            {formatEgp(bundle.originalPrice.amount)}
          </p>
        )}
      </div>
      <Plus className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-brand-ink" />
    </Link>
  )
}
