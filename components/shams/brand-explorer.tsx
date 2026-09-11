import Link from 'next/link'
import { commerce } from '@/lib/commerce'
import { SectionHeading } from './section-heading'

export function BrandExplorer() {
  const brands = commerce.brands.list()

  return (
    <section className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6 sm:py-16">
      <SectionHeading
        eyebrow="Shop by brand"
        title="The names professionals trust"
        description="Authorized partner for the brands that build serious kit — with local warranty on every purchase."
        href="/brands"
        linkLabel="All brands"
      />
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {brands.map((brand) => (
          <Link
            key={brand.slug}
            href={`/b/${brand.slug}`}
            className="group flex flex-col items-center justify-center gap-1.5 rounded-2xl border border-border bg-card px-4 py-7 text-center transition-all hover:border-brand/40 hover:shadow-[0_12px_30px_-20px_rgba(21,63,112,0.4)]"
          >
            <span className="text-lg font-semibold uppercase tracking-tight text-muted-foreground transition-colors group-hover:text-brand">
              {brand.name}
            </span>
            <span className="text-xs text-muted-foreground/80">{brand.tagline}</span>
            <span className="mt-1 text-[0.7rem] font-medium text-brand/80">
              {brand.productCount} products
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
