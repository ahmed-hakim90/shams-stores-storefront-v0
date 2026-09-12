import { primaryCategories } from '@/lib/commerce/navigation'
import Link from 'next/link'
import {
  listProducts,
  facets,
  terms,
  parseQuery,
} from '@/lib/commerce/live/catalog'
import { ShopFeed } from './shop-feed'
import { TaxonomyCards } from './taxonomy-cards'
import type { CatalogQuery, TaxonomyTerm } from '@/lib/commerce/types'
export async function LiveCatalogPage({
  query: input = {},
  title = 'Shop all gear',
  description = 'Cameras, lenses, audio and the essentials for your next production.',
  discovery = true,
  hub,
}: {
  query?: Record<string, unknown>
  title?: string
  description?: string
  discovery?: boolean
  hub?: { kind: 'category' | 'brand'; term: TaxonomyTerm }
}) {
  const q = parseQuery({ ...input, pageSize: 24 })
  const [page, facetData, categories, brands] = await Promise.all([
    listProducts(q),
    facets(q).catch(() => ({ groups: [] })),
    terms('categories'),
    terms('brands'),
  ])
  let categoryTerms = primaryCategories(categories),
    brandTerms = [...brands].sort((a, b) => b.count - a.count).slice(0, 6)
  if (hub?.kind === 'category') {
    categoryTerms = categories.filter((t) => t.parentId === hub.term.id)
    const counts = new Set(
      facetData.groups.find((g) => g.key === 'brand')?.options.map((x) => x.id),
    )
    brandTerms = brands.filter((t) => counts.has(t.slug)).slice(0, 6)
  }
  if (hub?.kind === 'brand') {
    const counts = new Set(
      facetData.groups
        .find((g) => g.key === 'category')
        ?.options.map((x) => x.id),
    )
    categoryTerms = categories
      .filter((t) => counts.has(t.slug) && !t.parentId)
      .slice(0, 8)
    brandTerms = []
  }
  return (
    <main className="mobile-storefront-page mx-auto max-w-[1400px] px-4 py-6 sm:px-6 sm:py-10">
      <nav
        aria-label="Breadcrumb"
        className="mb-4 text-xs text-muted-foreground"
      >
        <Link href="/">Home</Link> / <Link href="/shop">Shop</Link>
        {title !== 'Shop all gear' && ` / ${title}`}
      </nav>
      <header className="border-b pb-5">
        <p className="text-xs font-semibold uppercase tracking-[.16em] text-brand">
          Shams Stores
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-4xl">
          {q.query ? `Results for “${q.query}”` : title}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
          {description.slice(0, 280)}
        </p>
      </header>
      {discovery && (
        <div className="mt-5 space-y-4">
          {categoryTerms.length > 0 && (
            <section>
              <h2 className="mb-2 text-sm font-semibold">
                {hub ? 'Explore the range' : 'Shop by category'}
              </h2>
              <TaxonomyCards terms={categoryTerms} compact />
            </section>
          )}
          {brandTerms.length > 0 && (
            <section>
              <h2 className="mb-2 text-sm font-semibold">Shop by brand</h2>
              <TaxonomyCards terms={brandTerms} kind="brand" compact />
            </section>
          )}
        </div>
      )}
      <ShopFeed
        key={JSON.stringify(q)}
        lockedFilters={hub ? [hub.kind] : []}
        initialProducts={page.items}
        initialCursor={page.nextCursor}
        initialHasNext={page.hasNextPage}
        total={page.total}
        initialFacets={facetData}
        category={q.category}
        brand={q.brand}
        query={q.query}
        sort={q.sort}
      />
    </main>
  )
}
