import { notFound } from 'next/navigation'
import { ProductCard } from '@/components/shams/product-card'
import { commerce } from '@/lib/commerce'

export const dynamicParams = true

type PageProps = { params: Promise<{ slug: string[] }> }

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const title = slug.join(' / ').replaceAll('-', ' ')
  return {
    title: `${title.replace(/\b\w/g, (letter) => letter.toUpperCase())} · Shams Stores`,
    description: 'Shop photography, cinema and creator gear from Shams Stores.',
  }
}

export default async function StorefrontRoute({ params }: PageProps) {
  const { slug } = await params
  const [section, value] = slug

  if (!section) notFound()

  const products =
    section === 'search'
      ? commerce.search(value ?? '')
      : section === 'deals'
        ? commerce.products.deals()
        : section === 'new'
          ? commerce.products.featured()
          : section === 'w'
            ? commerce.products.byUseCase((value ?? 'vlogging') as never)
            : section === 'c'
              ? commerce.products.byCategory(value ?? '')
              : section === 'brands'
                ? commerce.brands.bySlug(value ?? '')
                  ? commerce.products.list().filter((product) => product.brand.toLowerCase() === commerce.brands.bySlug(value ?? '')?.name.toLowerCase())
                  : []
                : section === 'p'
                  ? []
                  : section === 'bundles'
                    ? commerce.products.trending()
                    : []

  if (section === 'p') {
    const product = commerce.products.bySlug(value ?? '')
    if (!product) notFound()
    return (
      <main className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand">{product.brand}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-5xl">{product.name}</h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">{product.description}</p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-6"><img src={product.image} alt={product.name} className="mx-auto aspect-square max-h-[420px] w-full object-contain" /></div>
          <div className="rounded-2xl border border-border bg-card p-6"><p className="text-2xl font-semibold">EGP {product.price.amount.toLocaleString('en-EG')}</p><p className="mt-3 text-sm text-muted-foreground">{product.stock === 'out_of_stock' ? 'Currently unavailable' : 'In stock · ships today'}</p></div>
        </div>
      </main>
    )
  }

  const heading = section === 'search' ? `Search results for “${value ?? ''}”` : section === 'deals' ? 'Deals worth catching' : section === 'new' ? 'New arrivals' : section === 'w' ? 'Build your setup' : section === 'c' ? `${value ?? 'Shop'} gear` : section === 'brands' ? `${value ?? 'Brand'} collection` : 'Featured gear'
  return (
    <main className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand">Shams Stores</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-5xl">{heading}</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">Expertly selected photography, cinema and creator gear, ready to ship across Egypt.</p>
      {products.length ? <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <div className="mt-10 rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">No products found yet. Try another category or search.</div>}
    </main>
  )
}

export function generateStaticParams() { return [] }

export const revalidate = 3600
