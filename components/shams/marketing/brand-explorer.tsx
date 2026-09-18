import Link from 'next/link'
import Image from 'next/image'
import { commerce } from '@/lib/commerce'
import { SectionHeading } from '@/components/shams/shared'

export function BrandExplorer() {
  const brands = commerce.brands.list()

  return (
    <section className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 sm:py-16">
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
            className="group flex flex-col items-center justify-center gap-1.5 rounded-(--radius-card) border border-border bg-card px-4 py-7 text-center transition-colors hover:border-foreground hover:bg-surface-raised"
          >
            <div className="relative mb-2 aspect-[1.8/1] w-full overflow-hidden rounded-(--radius-control) bg-surface-subtle">{brand.image ? <Image src={brand.image} alt="" fill sizes="180px" className="object-contain p-4 transition-transform duration-standard motion-safe:[@media(hover:hover)]:group-hover:scale-[1.02]" /> : <span className="flex h-full items-center justify-center text-lg font-semibold uppercase tracking-tight text-muted-foreground">{brand.name}</span>}</div><span className="text-lg font-semibold uppercase tracking-tight text-muted-foreground transition-colors duration-fast motion-safe:[@media(hover:hover)]:group-hover:text-foreground">{brand.name}</span>
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
