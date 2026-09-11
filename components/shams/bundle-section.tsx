import { commerce } from '@/lib/commerce'
import { SectionHeading } from './section-heading'
import { BundleBuilderCard } from './bundle-builder-card'

export function BundleSection() {
  const bundles = commerce.bundles.withProducts()

  return (
    <section className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6 sm:py-16">
      <SectionHeading
        eyebrow="Complete your setup"
        title="Bundles that just work together"
        description="Curated kits with real savings — every part is matched by our specialists so nothing is missing on shoot day."
        href="/bundles"
        linkLabel="All bundles"
      />
      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        {bundles.map((bundle, i) => (
          <BundleBuilderCard
            key={bundle.id}
            bundle={bundle}
            className={i === 0 ? 'lg:col-span-2' : ''}
          />
        ))}
      </div>
    </section>
  )
}
