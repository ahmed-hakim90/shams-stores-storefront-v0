import Image from 'next/image'
import Link from 'next/link'
import { commerce } from '@/lib/commerce'
import { SectionHeading } from './section-heading'

export function CatalogDiscovery({ compact = false }: { compact?: boolean }) {
  const categories = commerce.categories.list().slice(0, compact ? 6 : 8)
  const brands = commerce.brands.list().filter((brand) => brand.featured).slice(0, compact ? 6 : 8)
  const products = commerce.products.list()
  return (
    <section className={compact ? 'mb-8' : 'mx-auto max-w-[1440px] px-4 py-12 sm:px-6 sm:py-16'}>
      <SectionHeading eyebrow="Explore the catalog" title="Shop by category and brand" description="Start with the system you shoot, the brand you trust, or the gear that fits your workflow." />
      <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {categories.map((category) => {
          const image = products.find((product) => product.category === category.slug)?.image
          return <Link key={category.slug} href={`/c/${category.slug}`} className="group relative min-h-36 overflow-hidden rounded-xl border border-border bg-card p-4 transition-colors hover:border-brand/50">
            {image && <Image src={image} alt="" fill sizes="(max-width: 640px) 50vw, 25vw" className="object-cover opacity-25 transition-transform duration-200 group-hover:scale-105" />}
            <div className="relative flex h-full min-h-28 flex-col justify-end"><p className="text-xs font-semibold uppercase tracking-widest text-brand-ink">{category.itemCount} products</p><h3 className="mt-1 text-lg font-semibold">{category.name}</h3><p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{category.tagline}</p><span className="mt-3 text-sm font-medium text-brand-ink">Explore →</span></div>
          </Link>
        })}
      </div>
      {brands.length > 0 && <div className="mt-10"><div className="mb-4 flex items-end justify-between"><div><p className="text-xs font-semibold uppercase tracking-widest text-brand-ink">Trusted systems</p><h3 className="mt-1 text-xl font-semibold">Shop by brand</h3></div><Link href="/brands" className="text-sm font-medium text-brand-ink">All brands</Link></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">{brands.map((brand) => <Link key={brand.slug} href={`/b/${brand.slug}`} className="flex min-h-24 flex-col justify-between rounded-xl border border-border bg-card p-4 transition-colors hover:border-brand/50"><span className="text-base font-semibold">{brand.name}</span><span className="text-xs text-muted-foreground">{brand.productCount} products</span></Link>)}</div></div>}
    </section>
  )
}

export function RelationalDiscovery({ productId }: { productId: string }) {
  const relationships = commerce.relationships.getForProduct(productId)
  if (!relationships.length) return null
  const groups = new Map<string, ReturnType<typeof commerce.products.byIds>>()
  for (const relationship of relationships) groups.set(relationship.type, [...(groups.get(relationship.type) ?? []), ...commerce.products.byIds([relationship.targetProductId])])
  return <section className="mt-12 border-t border-border pt-8"><p className="text-xs font-semibold uppercase tracking-widest text-brand-ink">Built around your gear</p><h2 className="mt-2 text-2xl font-semibold tracking-tight">Compatible and recommended</h2><div className="mt-6 grid gap-4 sm:grid-cols-2">{Array.from(groups.entries()).map(([type, items]) => <div key={type} className="rounded-xl border border-border bg-card p-4"><h3 className="font-semibold">{type.replaceAll('_', ' ')}</h3><div className="mt-3 space-y-2">{items.slice(0, 4).map((item) => <Link key={item.id} href={`/p/${item.slug}`} className="flex items-center justify-between gap-3 rounded-lg p-2 text-sm transition-colors hover:bg-brand-muted"><span className="truncate">{item.name}</span><span className="shrink-0 text-xs font-medium text-brand-ink">View</span></Link>)}</div></div>)}</div></section>
}

export function CategoryDiscovery({ slug }: { slug: string }) {
  const category = commerce.categories.bySlug(slug)
  if (!category) return null
  const brands = commerce.categories.getBrands(category.id ?? category.slug)
  const systems = commerce.systems.list({ categoryId: category.id ?? category.slug })
  const groups = commerce.categories.getAccessoryGroups(category.id ?? category.slug)
  return <section className="mt-8 grid gap-4 lg:grid-cols-3"><div className="rounded-xl border border-border bg-card p-5"><p className="text-xs font-semibold uppercase tracking-widest text-brand-ink">Relevant brands</p><div className="mt-4 flex flex-wrap gap-2">{(brands.length ? brands : commerce.brands.list().slice(0, 5)).map((brand) => <Link key={brand.slug} href={`/b/${brand.slug}`} className="rounded-full border border-border px-3 py-2 text-sm hover:border-brand">{brand.name}</Link>)}</div></div><div className="rounded-xl border border-border bg-card p-5"><p className="text-xs font-semibold uppercase tracking-widest text-brand-ink">Systems and mounts</p><div className="mt-4 flex flex-wrap gap-2">{systems.map((system) => <Link key={system.id} href={`/shop?system=${system.slug}`} className="rounded-full border border-border px-3 py-2 text-sm hover:border-brand">{system.name}</Link>)}</div></div><div className="rounded-xl border border-border bg-card p-5"><p className="text-xs font-semibold uppercase tracking-widest text-brand-ink">Accessories</p><div className="mt-4 flex flex-wrap gap-2">{groups.map((group) => <Link key={group.id} href={`/shop?accessory=${group.slug}`} className="rounded-full border border-border px-3 py-2 text-sm hover:border-brand">{group.name}</Link>)}</div></div></section>
}

export function BrandDiscovery({ slug }: { slug: string }) {
  const brand = commerce.brands.bySlug(slug)
  if (!brand) return null
  const categories = commerce.brands.getCategories(brand.id ?? brand.slug)
  return <section className="mt-8 rounded-xl border border-border bg-card p-5"><p className="text-xs font-semibold uppercase tracking-widest text-brand-ink">Shop this brand by category</p><div className="mt-4 flex flex-wrap gap-2">{categories.map((category) => <Link key={category.slug} href={`/shop?brand=${brand.name}&category=${category.slug}`} className="rounded-full border border-border px-3 py-2 text-sm hover:border-brand">{category.name}</Link>)}</div></section>
}
