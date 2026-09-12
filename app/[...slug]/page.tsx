import { commerceProvider, serverProducts } from '@/lib/commerce/server'
import { getProduct, terms } from '@/lib/commerce/live/catalog'
import { LiveCatalogPage } from '@/components/shams/live-catalog-page'
import { LiveProductDetail } from '@/components/shams/live-product-detail'
import { TaxonomyCards } from '@/components/shams/taxonomy-cards'
import { SavedProducts } from '@/components/shams/saved-products'
import { OrderStatus } from '@/components/shams/order-status'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { CatalogPage } from '@/components/shams/catalog-page'
import { ProductDetail } from '@/components/shams/product-detail'
import { ExperiencePage, BundlePage } from '@/components/shams/curated-pages'
import {
  AccountPage,
  CartPage,
  CheckoutPage,
  OrderPage,
  WishlistPage,
} from '@/components/shams/commerce-pages'
import { commerce } from '@/lib/commerce'

export const dynamicParams = true

type PageProps = {
  params: Promise<{ slug: string[] }>
  searchParams: Promise<Record<string, string | undefined>>
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  if (commerceProvider() === 'woocommerce' && slug[0] === 'p') {
    const product = await getProduct(slug[1])
    if (product)
      return {
        title: product.name,
        description: product.shortDescription?.slice(0, 160),
        alternates: { canonical: `/p/${product.slug}` },
        openGraph: { images: [product.image] },
      }
  }
  if (
    commerceProvider() === 'woocommerce' &&
    ['c', 'b', 'brands'].includes(slug[0]) &&
    slug[1]
  ) {
    const term = (await terms(slug[0] === 'c' ? 'categories' : 'brands')).find(
      (t) => t.slug === slug[1],
    )
    if (term)
      return {
        title: term.name,
        description:
          term.description.slice(0, 160) ||
          `Explore ${term.name} at Shams Stores.`,
        alternates: {
          canonical: `/${slug[0] === 'c' ? 'c' : 'b'}/${term.slug}`,
        },
      }
  }
  const title = slug.join(' / ').replaceAll('-', ' ')
  return {
    title: `${title.replace(/\b\w/g, (letter) => letter.toUpperCase())} · Shams Stores`,
    description: 'Shop photography, cinema and creator gear from Shams Stores.',
  }
}

export default async function StorefrontRoute({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params
  const [section, value] = slug
  if (!section) notFound()
  if (commerceProvider() === 'woocommerce') {
    const query = await searchParams
    if (section === 'p') {
      const product = await getProduct(value ?? '')
      if (!product) notFound()
      const origin =
        process.env.NEXT_PUBLIC_APP_URL || 'https://www.shams-stores.com'
      const structured = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        image: product.gallery.map((i) => i.url),
        sku: product.sku,
        brand: product.brand
          ? { '@type': 'Brand', name: product.brand }
          : undefined,
        offers:
          product.price.amount > 0
            ? {
                '@type': 'Offer',
                url: `${origin}/p/${product.slug}`,
                priceCurrency: 'EGP',
                price: product.price.amount,
                availability:
                  product.stock === 'unknown'
                    ? undefined
                    : product.stock === 'in_stock' ||
                        product.stock === 'low_stock'
                      ? 'https://schema.org/InStock'
                      : product.stock === 'preorder'
                        ? 'https://schema.org/BackOrder'
                        : 'https://schema.org/OutOfStock',
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
      return (
        <>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify([
                structured,
                {
                  '@context': 'https://schema.org',
                  '@type': 'BreadcrumbList',
                  itemListElement: [
                    {
                      '@type': 'ListItem',
                      position: 1,
                      name: 'Home',
                      item: origin,
                    },
                    {
                      '@type': 'ListItem',
                      position: 2,
                      name: 'Shop',
                      item: origin + '/shop',
                    },
                    {
                      '@type': 'ListItem',
                      position: 3,
                      name: product.name,
                      item: origin + '/p/' + product.slug,
                    },
                  ],
                },
              ]).replace(/</g, '\\u003c'),
            }}
          />
          <LiveProductDetail product={product} />
        </>
      )
    }
    if (['c', 'b', 'brands'].includes(section) && value) {
      const kind = section === 'c' ? 'categories' : 'brands'
      const term = (await terms(kind)).find((t) => t.slug === value)
      if (!term) notFound()
      return (
        <LiveCatalogPage
          query={{
            ...query,
            [kind === 'categories' ? 'category' : 'brand']: term.slug,
          }}
          title={term.name}
          description={
            term.description || `Explore ${term.name} at Shams Stores.`
          }
          hub={{ kind: kind === 'categories' ? 'category' : 'brand', term }}
        />
      )
    }
    if (section === 'brands' || section === 'categories') {
      const ts = await terms(section === 'brands' ? 'brands' : 'categories')
      return (
        <main className="mobile-storefront-page mx-auto max-w-[1400px] px-4 py-10 sm:px-6">
          <h1 className="mb-6 text-3xl font-semibold">
            Shop by {section === 'brands' ? 'brand' : 'category'}
          </h1>
          <TaxonomyCards
            terms={ts}
            kind={section === 'brands' ? 'brand' : 'category'}
          />
        </main>
      )
    }
    if (section === 'wishlist') return <SavedProducts mode="wishlist" />
    if (['orders', 'track-order'].includes(section)) return <OrderStatus />
    if (['deals', 'new', 'trending', 'best-sellers'].includes(section))
      return (
        <LiveCatalogPage
          query={{
            ...query,
            ...(section === 'deals' ? { onSale: 'true' } : {}),
            sort: ['trending', 'best-sellers'].includes(section)
              ? 'best-selling'
              : 'newest',
          }}
          title={
            section === 'deals'
              ? 'Current offers'
              : section === 'new'
                ? 'New arrivals'
                : 'Popular gear'
          }
          discovery={false}
        />
      )
    if (section === 'account')
      return (
        <main className="mobile-storefront-page mx-auto max-w-3xl px-4 py-12">
          <h1 className="text-3xl font-semibold">My Shams</h1>
          <p className="mt-4 text-sm text-muted-foreground">
            Your saved gear and recent order on this device.
          </p>
          <div className="mt-6 flex gap-4">
            <Link href="/wishlist" className="rounded-xl border p-5">
              Wishlist →
            </Link>
            <Link href="/orders" className="rounded-xl border p-5">
              Recent order →
            </Link>
          </div>
        </main>
      )
    if (['support', 'branches'].includes(section))
      return (
        <main className="mobile-storefront-page mx-auto max-w-3xl px-4 py-12">
          <h1 className="text-3xl font-semibold">
            {section === 'branches' ? 'Visit Shams Stores' : 'Talk to Shams'}
          </h1>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            Our team can help with product availability, selecting gear and your
            order.
          </p>
          <a
            href="https://www.shams-stores.com/shams-contact-2026/"
            className="mt-6 inline-flex min-h-11 items-center text-brand"
          >
            Contact Shams Stores →
          </a>
        </main>
      )
    if (section === 'w') {
      const tags = await terms('tags')
      const selected = tags.find((t) => t.slug === value)
      if (!selected) redirect('/categories')
      return (
        <LiveCatalogPage
          query={{ ...query, tag: selected.slug }}
          title={selected.name}
          discovery={false}
        />
      )
    }
    if (section === 'bundles')
      return (
        <LiveCatalogPage
          query={{ ...query, category: 'bundles' }}
          title="Complete setups"
          description="Explore the kits available from Shams. Open a product for its included configuration and current availability."
          discovery={false}
        />
      )
    notFound()
  }
  if (section === 'cart') return <CartPage />
  if (section === 'checkout') return <CheckoutPage />
  if (section === 'bundles') return <BundlePage />
  if (section === 'w' && value) {
    const experience = commerce.useCases.bySlug(value)
    if (experience)
      return (
        <ExperiencePage
          name={experience.name}
          description={experience.description}
        />
      )
  }
  if (section === 'account') return <AccountPage />
  if (section === 'wishlist') return <WishlistPage />
  if (section === 'orders' || section === 'track-order') return <OrderPage />
  if (section === 'brands' && !value)
    return (
      <CatalogPage
        products={commerce.products.list()}
        title="Shop by brand"
        description="Explore cameras, lenses, audio and creator gear from the brands Shams trusts."
      />
    )
  if (section === 'p') {
    const product = await serverProducts().bySlug(value ?? '')
    if (!product) notFound()
    return <ProductDetail product={product} />
  }
  const isSearch = section === 'search'
  const category =
    section === 'c' ? commerce.categories.bySlug(value ?? '') : undefined
  const useCase =
    section === 'w' ? commerce.useCases.bySlug(value ?? '') : undefined
  const brand =
    section === 'brands' || section === 'b'
      ? commerce.brands.bySlug(value ?? '')
      : undefined
  const isCollection =
    section === 'deals' || section === 'new' || section === 'trending'
  const hasValidRoute =
    isSearch || isCollection || Boolean(category || useCase || brand)
  if (!hasValidRoute) notFound()
  const products = isSearch
    ? commerce.search(value ?? '')
    : section === 'deals'
      ? commerce.products.deals()
      : section === 'new'
        ? commerce.products.featured()
        : section === 'trending'
          ? commerce.products.trending()
          : category
            ? commerce.products.byCategory(category.slug)
            : useCase
              ? commerce.products.byUseCase(useCase.slug)
              : brand
                ? commerce.products
                    .list()
                    .filter(
                      (product) =>
                        product.brand.toLowerCase() ===
                        brand.name.toLowerCase(),
                    )
                : []
  const title = isSearch
    ? `Search results`
    : (category?.name ??
      useCase?.name ??
      brand?.name ??
      (section === 'deals'
        ? 'Deals worth catching'
        : section === 'new'
          ? 'New arrivals'
          : 'Trending gear'))
  const description = isSearch
    ? `Explore products, brands and categories related to “${value ?? ''}”.`
    : (category?.tagline ??
      useCase?.description ??
      brand?.tagline ??
      'Expertly selected photography, cinema and creator gear, ready to ship across Egypt.')
  return (
    <CatalogPage
      category={category}
      products={products}
      title={title}
      description={description}
      query={isSearch ? value : undefined}
    />
  )
}

export function generateStaticParams() {
  return []
}
export const revalidate = 3600
