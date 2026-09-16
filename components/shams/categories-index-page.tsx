import Link from 'next/link'
import type { Category, Brand } from '@/lib/commerce/types'
import { ProductImage } from './product-image'

interface CategoryWithMeta extends Category {
  productCount: number
  associatedBrands?: Pick<Brand, 'slug' | 'name'>[]
}

export function CategoriesIndexPage({
  categories,
}: {
  categories: CategoryWithMeta[]
}) {
  return (
    <main className="shams-container max-w-[1400px] py-8 sm:py-12">
      <header className="mb-8 sm:mb-12">
        <p className="text-xs font-semibold uppercase tracking-[.16em] text-brand-ink">
          Shop by category
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          Explore our catalog
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
          Browse cameras, lenses, audio, lighting and creator gear organized by
          category. Each category includes subcategories and the brands we
          trust.
        </p>
      </header>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => {
          const typeColumn = cat.columns.find((col) =>
            ['shop by type', 'microphones', 'lights', 'support', 'stabilization', 'streaming', 'cameras'].includes(col.heading.toLowerCase()),
          )
          const brandColumn = cat.columns.find((col) =>
            col.heading.toLowerCase().includes('brand'),
          )
          const subcategoryLinks = typeColumn?.links ?? cat.columns[0]?.links ?? []
          const brandLinks = brandColumn?.links ?? []

          return (
            <article
              key={cat.slug}
              className="group flex flex-col overflow-hidden rounded-(--radius-card) border border-border bg-card transition-colors duration-fast hover:border-brand/50"
            >
              <Link
                href={`/c/${cat.slug}`}
                className="flex aspect-[16/9] items-center justify-center bg-brand/5 p-6"
              >
                <span className="text-center text-xl font-semibold tracking-tight group-hover:text-brand-ink sm:text-2xl">
                  {cat.name}
                </span>
              </Link>

              <div className="flex flex-1 flex-col p-5">
                <Link href={`/c/${cat.slug}`} className="group/title">
                  <h2 className="text-lg font-semibold group-hover/title:text-brand-ink">
                    {cat.name}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {cat.tagline}
                  </p>
                </Link>

                <p className="mt-2 text-xs text-muted-foreground">
                  {cat.productCount} products
                </p>

                {subcategoryLinks.length > 0 && (
                  <div className="mt-4 border-t border-border/60 pt-3">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {typeColumn?.heading ?? 'Subcategories'}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {subcategoryLinks.slice(0, 6).map((link) => (
                        <Link
                          key={link.href + link.label}
                          href={link.href}
                          className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-brand hover:text-brand-ink"
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {brandLinks.length > 0 && (
                  <div className="mt-3 border-t border-border/60 pt-3">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Top brands
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {brandLinks.slice(0, 5).map((link) => (
                        <Link
                          key={link.href + link.label}
                          href={link.href}
                          className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-brand hover:text-brand-ink"
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                <Link
                  href={`/c/${cat.slug}`}
                  className="mt-auto pt-4 text-sm font-medium text-brand-ink opacity-70 transition-opacity hover:opacity-100"
                >
                  Explore {cat.name} →
                </Link>
              </div>
            </article>
          )
        })}
      </div>
    </main>
  )
}
