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
      className={`mb-3 grid gap-3 border-b border-border pb-3 ${hub ? '' : 'xl:grid-cols-[1.3fr_1fr]'}`}
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
              <h2 className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide">{group.title}</h2>
              <div className="flex gap-1.5 overflow-x-auto overscroll-x-contain pb-1 snap-x snap-proximity">
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
                      className={`group flex shrink-0 snap-start border text-left text-xs transition-colors duration-fast ${hub && group.kind === 'category' ? 'w-32 flex-col overflow-hidden' : 'h-12 w-28 items-center gap-1.5 px-2'} ${active ? 'border-brand-ink bg-brand-muted text-brand-ink' : 'border-border bg-card hover:border-brand'}`}
                    >
                      {t.image && (
                        <span
                          className={`relative shrink-0 overflow-hidden bg-white ${hub && group.kind === 'category' ? 'h-16 w-full' : 'size-7'}`}
                        >
                          <ProductImage
                            src={t.image}
                            alt=""
                            fill
                            sizes={
                              hub && group.kind === 'category'
                                ? '128px'
                                : '28px'
                            }
                            className={
                              hub && group.kind === 'category'
                                ? 'object-cover transition-transform duration-standard motion-safe:[@media(hover:hover)]:group-hover:scale-[1.04]'
                                : 'object-contain'
                            }
                          />
                        </span>
                      )}
                      <span
                        className={`font-medium leading-tight ${hub && group.kind === 'category' ? 'p-1.5 text-[11px]' : ''}`}
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
