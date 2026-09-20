import type { ProductDetail } from '@/lib/commerce/types'
import { priceToMajor } from '@/lib/commerce'

const ORIGIN = process.env.NEXT_PUBLIC_APP_URL || 'https://www.shams-stores.com'

function availability(stock: ProductDetail['stock']) {
  if (stock === 'unknown') return undefined
  if (stock === 'in_stock' || stock === 'low_stock')
    return 'https://schema.org/InStock'
  if (stock === 'preorder') return 'https://schema.org/BackOrder'
  return 'https://schema.org/OutOfStock'
}

export function productJsonLd(product: ProductDetail) {
  const priceSource = product.pricing ?? product.price
  const amount = priceToMajor(priceSource)
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.gallery.map((i) => i.url),
    sku: product.sku,
    brand: product.brand
      ? { '@type': 'Brand', name: product.brand }
      : undefined,
    offers:
      amount > 0
        ? {
            '@type': 'Offer',
            url: `${ORIGIN}/p/${product.slug}`,
            priceCurrency: 'EGP',
            price: amount,
            availability: availability(product.stock),
          }
        : undefined,
    aggregateRating:
      product.reviewCount > 0
        ? {
            '@type': 'AggregateRating',
            ratingValue: product.rating,
            reviewCount: product.reviewCount,
          }
        : undefined,
  }
}

export function productBreadcrumbJsonLd(product: ProductDetail) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: ORIGIN },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Shop',
        item: ORIGIN + '/shop',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: product.name,
        item: ORIGIN + '/p/' + product.slug,
      },
    ],
  }
}

export function serializeJsonLd(...nodes: unknown[]) {
  return JSON.stringify(nodes).replace(/</g, '\\u003c')
}
