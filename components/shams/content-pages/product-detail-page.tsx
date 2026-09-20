import { getProduct } from '@/lib/commerce/live/catalog'
import { LiveProductDetail } from '@/components/shams/live'
import { notFound } from 'next/navigation'
import { productJsonLd, productBreadcrumbJsonLd, serializeJsonLd } from '@/lib/seo/json-ld'

export async function ProductDetailPage({ slug }: { slug: string }) {
  const product = await getProduct(slug)
  if (!product) notFound()
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(
            productJsonLd(product),
            productBreadcrumbJsonLd(product),
          ),
        }}
      />
      <LiveProductDetail product={product} />
    </>
  )
}
