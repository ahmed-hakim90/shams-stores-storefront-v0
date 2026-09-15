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
    <div
      className={`mb-6 grid gap-5 border-b pb-5 ${hub ? '' : 'xl:grid-cols-[1.3fr_1fr]'}`}
    >
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
              <h2 className="mb-3 text-sm font-semibold">{group.title}</h2>
              <div className="flex gap-3 overflow-x-auto overscroll-x-contain pb-2 snap-x snap-proximity">
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
                      className={`group flex shrink-0 snap-start rounded-xl border text-left text-sm transition-colors ${hub && group.kind === 'category' ? 'w-40 flex-col overflow-hidden sm:w-44' : 'min-h-16 w-36 items-center gap-2 px-3 py-2'} ${active ? 'border-brand-ink bg-brand-muted text-brand-ink' : 'bg-card hover:border-brand'}`}
                    >
                      {t.image && (
                        <span
                          className={`relative shrink-0 overflow-hidden bg-white ${hub && group.kind === 'category' ? 'h-24 w-full' : 'size-9 rounded-md'}`}
                        >
                          <ProductImage
                            src={t.image}
                            alt=""
                            fill
                            sizes={
                              hub && group.kind === 'category'
                                ? '176px'
                                : '36px'
                            }
                            className={
                              hub && group.kind === 'category'
                                ? 'object-cover transition-transform motion-safe:[@media(hover:hover)]:group-hover:scale-[1.035]'
                                : 'object-contain'
                            }
                          />
                        </span>
                      )}
                      <span
                        className={`font-medium leading-5 ${hub && group.kind === 'category' ? 'p-3' : ''}`}
                      >
                        {t.name}
                      </span>
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
