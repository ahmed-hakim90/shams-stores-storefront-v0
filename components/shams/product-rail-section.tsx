import type { Product } from '@/lib/commerce'
import { SectionHeading } from './section-heading'
import { ProductRail } from './product-rail'

export function ProductRailSection({
  eyebrow,
  title,
  description,
  href,
  products,
}: {
  eyebrow?: string
  title: string
  description?: string
  href?: string
  products: Product[]
}) {
  return (
    <section className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6 sm:py-14">
      <SectionHeading
        eyebrow={eyebrow}
        title={title}
        description={description}
        href={href}
      />
      <div className="mt-8">
        <ProductRail products={products} />
      </div>
    </section>
  )
}
