import { commerceProvider } from '@/lib/commerce/server'
import { getProduct } from '@/lib/commerce/live/catalog'
import { LiveProductDetail } from '@/components/shams/live-product-detail'
import { notFound } from 'next/navigation'
import { BundleDetailPage } from '@/components/shams/bundle-detail-page'
import { commerce } from '@/lib/commerce'

export default async function BundleRoute({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  if (commerceProvider() === 'woocommerce') {
    const product = await getProduct(slug)
    if (!product) notFound()
    return <LiveProductDetail product={product} />
  }
  const bundle = commerce.bundles.getBySlug(slug)
  if (!bundle) notFound()
  return <BundleDetailPage bundle={bundle} />
}

export function generateStaticParams() {
  if (commerceProvider() === 'woocommerce') return []
  return commerce.bundles.list().map((bundle) => ({ slug: bundle.slug }))
}
