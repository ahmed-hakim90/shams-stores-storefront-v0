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
    <section className="shams-container shams-section">
      <SectionHeading
        eyebrow={eyebrow}
        title={title}
        description={description}
        href={href}
      />
      <div className="mt-4">
        <ProductRail products={products} />
      </div>
    </section>
  )
}
