import { ManagedCampaigns } from '@/components/shams/marketing/managed-campaigns'
import { siteContent } from '@/lib/commerce/live/shams-content'
import { array, record, text } from '@/lib/commerce/live/normalize'
import { publicImage, storefrontLink } from '@/lib/commerce/live/shams-contract'
import { byIds } from '@/lib/commerce/live/catalog'
import { ProductCard } from '@/components/shams/product/product-card'

export async function ManagedHero() {
  const data = await siteContent()
  const slides = array(record(data?.hero_carousel).slides).flatMap((raw) => {
    const s = record(raw),
      desktop = publicImage(s.desktop_url),
      mobile = publicImage(s.mobile_url)
    return desktop && mobile
      ? [
          {
            id: text(s.id),
            desktop,
            mobile,
            heading: text(s.heading),
            body: text(s.body),
            eyebrow: text(s.eyebrow),
            alt: text(s.alt),
            href: storefrontLink(s.cta_url),
            label: text(s.cta_label),
          },
        ]
      : []
  })
  if (slides.length) return <ManagedCampaigns slides={slides} />
  const hero = record(data?.shoppable_hero),
    background = publicImage(hero.background_url)
  const ids = array(hero.hotspots).map((spot) =>
    String(record(record(spot).product).id),
  )
  if (!background || !ids.length) return null
  const products = await byIds(ids).catch(() => [])
  if (!products.length) return null
  return (
    <section className="shams-container py-6">
      <h2 dir="auto" className="mb-2 text-3xl font-semibold">
        {text(hero.heading)}
      </h2>
      <p dir="auto" className="mb-4 text-muted-foreground">
        {text(hero.subheading)}
      </p>
      <img
        src={background}
        alt={text(hero.heading)}
        className="aspect-[2/1] w-full rounded-(--radius-editorial) object-cover"
      />
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  )
}
