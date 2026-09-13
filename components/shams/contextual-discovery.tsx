'use client'
import type { TaxonomyTerm } from '@/lib/commerce/types'
import type { CatalogScope } from '@/lib/commerce/experience'
import { ProductImage } from './product-image'
export function CatalogDiscovery({
  categories,
  brands,
  hub,
  scope,
  params,
  change,
}: {
  categories: TaxonomyTerm[]
  brands: TaxonomyTerm[]
  hub: boolean
  scope: CatalogScope
  params: string
  change: (key: string, value: string) => void
}) {
  const selected = new URLSearchParams(params)
  return (
    <div className="mb-6 grid gap-4 border-b pb-5 xl:grid-cols-[1.3fr_1fr]">
      {(
        [
          {
            kind: 'category',
            title: hub ? 'Explore the range' : 'Shop by category',
            terms: categories,
          },
          { kind: 'brand', title: 'Shop by brand', terms: brands },
        ] as const
      ).map(
        (group) =>
          group.terms.length > 0 && (
            <section key={group.kind} className="min-w-0">
              <h2 className="mb-2 text-sm font-semibold">{group.title}</h2>
              <div className="flex gap-2 overflow-x-auto overscroll-x-contain pb-2">
                {group.terms.map((t) => {
                  const active = selected.get(group.kind) === t.slug
                  return (
                    <button
                      type="button"
                      key={t.id}
                      aria-pressed={active}
                      onClick={() =>
                        change(
                          group.kind,
                          active ? (scope[group.kind] ?? '') : t.slug,
                        )
                      }
                      className={`flex min-h-16 w-36 shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-left text-sm transition-colors ${active ? 'border-brand-ink bg-brand-muted text-brand-ink' : 'bg-card hover:border-brand'}`}
                    >
                      {t.image && (
                        <span className="relative size-9 shrink-0 overflow-hidden rounded-md bg-white">
                          <ProductImage
                            src={t.image}
                            alt=""
                            fill
                            sizes="36px"
                            className="object-contain"
                          />
                        </span>
                      )}
                      <span className="font-medium leading-5">{t.name}</span>
                    </button>
                  )
                })}
              </div>
            </section>
          ),
      )}
    </div>
  )
}
