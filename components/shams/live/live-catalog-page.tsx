import { primaryCategories } from '@/lib/commerce/navigation'
import Link from 'next/link'
import {
  listProducts,
  facets,
  terms,
  parseQuery,
} from '@/lib/commerce/live/catalog'
import { ShopFeed } from '@/components/shams/catalog'
import { ProductImage } from '@/components/shams/product'
import { catalogParams, type CatalogScope } from '@/lib/commerce/experience'
import type { TaxonomyTerm } from '@/lib/commerce/types'
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
  const [categories, brands] = await Promise.all([
    terms('categories'),
    terms('brands'),
  ])
  const descendants = (id: string): string[] =>
    categories
      .filter((t) => t.parentId === id)
      .flatMap((t) => [t.slug, ...descendants(t.id)])
  const scope: CatalogScope =
    hub?.kind === 'category'
      ? { category: hub.term.slug, categoryOptions: descendants(hub.term.id) }
      : hub?.kind === 'brand'
        ? { brand: hub.term.slug }
        : input.onSale === 'true' && title !== 'Shop all gear'
          ? { onSale: true }
          : {}
  if (typeof input.tag === 'string') scope.tag = input.tag
  if (title === 'Complete setups') scope.category = 'bundles'
  const raw = new URLSearchParams(
    Object.entries(input)
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => [k, String(v)]),
  )
  const initialParams = catalogParams(raw, scope)
  const q = parseQuery(Object.fromEntries(new URLSearchParams(initialParams)))
  const [page, facetData, baseFacets] = await Promise.all([
    listProducts({ ...q, pageSize: 24 }),
    facets(q).catch(() => ({ groups: [] })),
    hub
      ? facets({ category: scope.category, brand: scope.brand }).catch(() => ({
          groups: [],
        }))
      : Promise.resolve({ groups: [] }),
  ])
  let categoryTerms = primaryCategories(categories),
    brandTerms = [...brands].sort((a, b) => b.count - a.count).slice(0, 6)
  if (hub?.kind === 'category') {
    categoryTerms = categories.filter((t) => t.parentId === hub.term.id)
    const counts = new Set(
      baseFacets.groups
        .find((g) => g.key === 'brand')
        ?.options.map((x) => x.id),
    )
    brandTerms = brands.filter((t) => counts.has(t.slug)).slice(0, 6)
  }
  if (hub?.kind === 'brand') {
    const counts = new Set(
      baseFacets.groups
        .find((g) => g.key === 'category')
        ?.options.map((x) => x.id),
    )
    categoryTerms = categories
      .filter((t) => counts.has(t.slug) && !t.parentId)
      .slice(0, 8)
    brandTerms = []
  }
  const categoryGroups = !hub
    ? (
        await Promise.all(
          primaryCategories(categories).map(async (cat) => {
            const p = await listProducts({
              category: cat.slug,
              pageSize: 6,
              sort: 'best-selling',
            }).catch(() => ({ items: [], total: 0, hasNextPage: false }))
            return { category: cat, products: p.items }
          }),
        )
      ).filter((g) => g.products.length > 0)
    : []
  return (
    <main className="shams-container py-3 pb-[calc(2rem+var(--mobile-bottom-nav-height))] sm:py-4 sm:pb-4">
      <nav
        aria-label="Breadcrumb"
        className="mb-2 text-[11px] text-muted-foreground"
      >
        <Link href="/">Home</Link> / <Link href="/shop">Shop</Link>
        {title !== 'Shop all gear' && ` / ${title}`}
      </nav>
      <header
        className={
          hub
            ? 'grid gap-3 border-b border-border bg-surface-subtle p-3 sm:p-4 md:grid-cols-[1fr_180px]'
            : 'border-b pb-3'
        }
      >
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[.16em] text-brand-ink">
            {hub?.kind === 'brand'
              ? 'Inside the brand'
              : hub
                ? 'Find your perspective'
                : 'Shams Stores'}
          </p>
          <h1 className="mt-1 text-lg font-semibold sm:text-xl">
            {q.query ? `Results for "${q.query}"` : title}
          </h1>
          <p className="mt-1.5 max-w-2xl text-xs leading-5 text-muted-foreground">
            {description.slice(0, 200)}
          </p>
          {hub && (
            <a
              href="#catalog-results"
              className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-ink"
            >
              Shop the collection ↓
            </a>
          )}
        </div>
        {hub?.term.image && (
          <div className="relative hidden min-h-28 overflow-hidden bg-surface-raised md:block">
            <ProductImage
              src={hub.term.image}
              alt={hub.term.name}
              fill
              sizes="180px"
              className="object-contain p-2"
            />
          </div>
        )}
      </header>
      {scope.category &&
      (!categories.some((t) => t.slug === scope.category) ||
        (scope.category === 'bundles' &&
          page.total === 0 &&
          Object.keys(input).every((key) =>
            ['category', 'sort'].includes(key),
          ))) ? (
        <section className="mt-4 border bg-card p-4 sm:p-6">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-brand-ink">Create with confidence</p>
          <h2 className="mt-1.5 text-base font-semibold">
            Let’s find the right setup for you.
          </h2>
          <p className="mt-2 max-w-xl text-xs leading-5 text-muted-foreground">
            There are no published kits in this collection right now. Explore
            the catalog or talk to Shams about the equipment you need.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link href="/shop" className="inline-flex h-8 items-center border border-brand bg-brand px-3 text-xs font-medium text-brand-foreground">
              Explore all gear →
            </Link>
            <Link
              href="/support"
              className="inline-flex h-8 items-center border border-border px-3 text-xs font-medium"
            >
              Talk through your setup
            </Link>
          </div>
        </section>
      ) : (
        <ShopFeed
          initialParams={initialParams}
          scope={scope}
          discovery={
            discovery
              ? { categories: categoryTerms, brands: brandTerms, hub: !!hub }
              : undefined
          }
          lockedFilters={[
            ...(scope.category ? ['category'] : []),
            ...(scope.brand ? ['brand'] : []),
            ...(scope.onSale ? ['onSale'] : []),
          ]}
          initialProducts={page.items}
          initialCursor={page.nextCursor}
          initialHasNext={page.hasNextPage}
          total={page.total}
          initialFacets={facetData}
          categoryGroups={categoryGroups}
        />
      )}
    </main>
  )
}
