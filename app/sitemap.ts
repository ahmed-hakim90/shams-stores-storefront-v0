import type { MetadataRoute } from 'next'
import { commerceProvider } from '@/lib/commerce/server'
import { commerce } from '@/lib/commerce'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_APP_URL || 'https://www.shams-stores.com'

  const staticPages = [
    '',
    '/about',
    '/contact',
    '/branches',
    '/support',
    '/terms',
    '/privacy',
    '/cookies',
    '/deals',
    '/new',
    '/best-sellers',
    '/bundles',
    '/brands',
    '/categories',
  ]

  const staticEntries: MetadataRoute.Sitemap = staticPages.map((page) => ({
    url: `${base}${page}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: page === '' ? 1 : 0.7,
  }))

  if (commerceProvider() === 'woocommerce') {
    return staticEntries
  }

  const categories = commerce.categories.list()
  const brands = commerce.brands.list()
  const products = commerce.products.list()

  const categoryEntries: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${base}/c/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  const brandEntries: MetadataRoute.Sitemap = brands.map((brand) => ({
    url: `${base}/b/${brand.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  const productEntries: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${base}/p/${product.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.9,
  }))

  return [
    ...staticEntries,
    ...categoryEntries,
    ...brandEntries,
    ...productEntries,
  ]
}
