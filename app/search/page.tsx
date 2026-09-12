import { commerceProvider } from '@/lib/commerce/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { CatalogPage } from '@/components/shams/catalog-page'
import { SearchTrigger } from '@/components/shams/global-search-overlay'
import { commerce } from '@/lib/commerce'

type SearchProps = { searchParams: Promise<{ q?: string }> }

export async function generateMetadata() { return { title: 'Search · Shams Stores', description: 'Search Shams Stores for cameras, lenses and creator gear.' } }

export default async function SearchPage({ searchParams }: SearchProps) {
  const { q = '' } = await searchParams
  const query = q.trim()
  if (commerceProvider() === 'woocommerce') redirect(query ? `/shop?q=${encodeURIComponent(query)}` : '/shop')

  if (!query) {
    return (
      <main className="mx-auto max-w-[1100px] px-4 py-8 sm:px-6 sm:py-12">
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-brand">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">Search</span>
        </nav>
        <section className="rounded-2xl border border-border bg-card p-5 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">Find your next setup</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-5xl">Search Shams Stores</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">Search cameras, lenses, audio, lighting and creator gear by model, brand, category or SKU.</p>
          <div className="mt-6 max-w-2xl"><SearchTrigger placeholder="Search by model, brand, category or SKU…" /></div>
        </section>
        <section className="mt-8 grid gap-6 sm:grid-cols-3">
          <DiscoveryGroup title="Popular searches" items={[['Sony A7 IV', 'Sony A7 IV'], ['Canon RF', 'Canon RF'], ['DJI Mic', 'DJI Mic']]} />
          <DiscoveryGroup title="Popular categories" items={[["Cameras", '/c/cameras'], ["Lenses", '/c/lenses'], ["Audio", '/c/audio']]} />
          <DiscoveryGroup title="Popular brands" items={[["Sonar", '/b/sonar'], ["Canonet", '/b/canonet'], ["DJX", '/b/djx']]} />
        </section>
      </main>
    )
  }

  return <CatalogPage products={commerce.search(query)} title="Search results" query={query} description={`Explore products, brands and categories related to “${query}”.`} />
}

function DiscoveryGroup({ title, items }: { title: string; items: [string, string][] }) {
  return <section><h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{title}</h2><div className="mt-3 flex flex-col gap-2">{items.map(([label, href]) => <Link key={label} href={href.startsWith('/') ? href : `/search?q=${encodeURIComponent(href)}`} className="flex min-h-11 items-center rounded-lg border border-border px-3 text-sm font-medium hover:border-brand hover:text-brand">{label}</Link>)}</div></section>
}
