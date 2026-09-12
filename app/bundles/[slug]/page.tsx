import { notFound } from 'next/navigation'
import { BundleDetailPage } from '@/components/shams/bundle-detail-page'
import { commerce } from '@/lib/commerce'

export default async function BundleRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const bundle = commerce.bundles.getBySlug(slug)
  if (!bundle) notFound()
  return <BundleDetailPage bundle={bundle} />
}

export function generateStaticParams() {
  return commerce.bundles.list().map((bundle) => ({ slug: bundle.slug }))
}
