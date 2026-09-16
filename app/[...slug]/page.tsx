import { commerceProvider, serverProducts } from '@/lib/commerce/server'
import { getProduct, terms } from '@/lib/commerce/live/catalog'
import { LiveCatalogPage } from '@/components/shams/live-catalog-page'
import { LiveProductDetail } from '@/components/shams/live-product-detail'
import { TaxonomyCards } from '@/components/shams/taxonomy-cards'
import { CategoriesIndexPage } from '@/components/shams/categories-index-page'
import { SavedProducts } from '@/components/shams/saved-products'
import { OrderStatus } from '@/components/shams/order-status'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { connection } from 'next/server'
import { CatalogPage } from '@/components/shams/catalog-page'
import { ProductDetail } from '@/components/shams/product-detail'
import { ExperiencePage, BundlePage } from '@/components/shams/curated-pages'
import {
  CartPage,
  CheckoutPage,
  OrderPage,
  WishlistPage,
} from '@/components/shams/commerce-pages'
import { AccountDashboard } from '@/components/shams/account-dashboard'
import { commerce } from '@/lib/commerce'
import {
  AboutPage,
  ContactPage,
  BranchesPage,
  SupportPage,
  TermsPage,
  PrivacyPage,
  CookiesPage,
} from '@/components/shams/static-pages'

export const dynamicParams = true

export function generateStaticParams() {
  const staticSlugs = [
    'about',
    'contact',
    'branches',
    'support',
    'terms',
    'privacy',
    'cookies',
    'deals',
    'new',
    'best-sellers',
    'bundles',
    'brands',
    'categories',
  ]
  const accountSlugs = [
    ['account', 'orders'],
    ['account', 'addresses'],
    ['account', 'profile'],
    ['account', 'forgot-password'],
  ]
  return [
    ...staticSlugs.map((slug) => ({ slug: [slug] })),
    ...accountSlugs.map((slug) => ({ slug })),
  ]
}

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
  const staticMeta: Record<string, { title: string; description: string }> = {
    about: {
      title: 'About Shams Stores',
      description:
        'Egypt\'s trusted destination for professional photography, cinema and creator equipment. Authorized reseller with showrooms in Downtown Cairo and Heliopolis.',
    },
    contact: {
      title: 'Contact Shams Stores',
      description:
        'Get in touch with Shams Stores. Call, WhatsApp or visit our showrooms in Downtown Cairo and Heliopolis. We are here to help.',
    },
    branches: {
      title: 'Our Showrooms · Shams Stores',
      description:
        'Visit Shams Stores in Downtown Cairo and Heliopolis. Explore gear hands-on, get expert advice and same-day pickup.',
    },
    support: {
      title: 'Support · Shams Stores',
      description:
        'Product advice, order tracking, warranty and returns. Talk to the Shams Stores team by phone, WhatsApp or visit our showrooms.',
    },
    terms: {
      title: 'Terms & Conditions · Shams Stores',
      description:
        'Read the terms and conditions for purchasing from Shams Stores — pricing, delivery, returns, warranty and liability.',
    },
    privacy: {
      title: 'Privacy Policy · Shams Stores',
      description:
        'How Shams Stores collects, uses and protects your personal data. Your rights and our commitments.',
    },
    cookies: {
      title: 'Cookie Policy · Shams Stores',
      description:
        'Learn about the cookies Shams Stores uses and how to manage your cookie preferences.',
    },
    categories: {
      title: 'Shop by Category · Shams Stores',
      description:
        'Browse photography, cinema and creator gear by category at Shams Stores.',
    },
    'best-sellers': {
      title: 'Best Sellers · Shams Stores',
      description:
        'The most popular photography, cinema and creator gear at Shams Stores.',
    },
    account: {
      title: 'My Account',
      description: 'Manage your orders, addresses and account at Shams Stores.',
    },
  }
  if (slug[0] === 'account' && slug[1]) {
    const accountMeta: Record<string, { title: string; description: string }> = {
      orders: { title: 'My Orders', description: 'Track your orders and purchase history at Shams Stores.' },
      addresses: { title: 'My Addresses', description: 'Manage your saved delivery addresses at Shams Stores.' },
      profile: { title: 'Personal Info', description: 'Edit your account details and password at Shams Stores.' },
      'forgot-password': { title: 'Forgot Password', description: 'Reset your Shams Stores account password.' },
    }
    if (accountMeta[slug[1]]) {
      return { title: accountMeta[slug[1]].title, description: accountMeta[slug[1]].description, robots: { index: false } }
    }
  }
  if (staticMeta[slug[0]]) {
    return {
      title: staticMeta[slug[0]].title,
      description: staticMeta[slug[0]].description,
      alternates: { canonical: `/${slug[0]}` },
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
  // Render query-aware hubs at request time; catalog fetches retain their own TTL.
  await connection()
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
            [kind === 'categories' ? 'category' : 'brand']: query[kind === 'categories' ? 'category' : 'brand'] ?? term.slug,
          }}
          title={term.name}
          description={
            term.description || `Explore ${term.name} at Shams Stores.`
          }
          hub={{ kind: kind === 'categories' ? 'category' : 'brand', term }}
        />
      )
    }
    if (section === 'categories') {
      const allCats = await terms('categories')
      const allBrands = await terms('brands')
      const roots = allCats.filter((t) => !t.parentId)
      const enriched = roots.map((root) => {
        const children = allCats.filter((t) => t.parentId === root.id)
        const topBrands = allBrands
          .filter((b) => b.count > 0)
          .sort((a, b) => b.count - a.count)
          .slice(0, 5)
        return {
          id: root.id,
          slug: root.slug as import('@/lib/commerce/types').Category['slug'],
          name: root.name,
          tagline: root.description || '',
          image: root.image,
          itemCount: root.count,
          productCount: root.count,
          columns: children.length
            ? [
                {
                  heading: 'Subcategories',
                  links: children.map((c) => ({
                    label: c.name,
                    href: `/c/${c.slug}`,
                  })),
                },
                {
                  heading: 'Top brands',
                  links: topBrands.map((b) => ({
                    label: b.name,
                    href: `/b/${b.slug}`,
                  })),
                },
              ]
            : [],
        }
      })
      return <CategoriesIndexPage categories={enriched} />
    }
    if (section === 'brands') {
      const ts = await terms('brands')
      return (
        <main className="shams-container max-w-[1400px] py-10">
          <h1 className="mb-6 text-3xl font-semibold">Shop by brand</h1>
          <TaxonomyCards terms={ts} kind="brand" />
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
    if (section === 'account') {
      const accountSection = ['orders', 'addresses', 'profile'].includes(value ?? '') ? value as 'orders' | 'addresses' | 'profile' : 'overview'
      return <AccountDashboard section={accountSection} />
    }
    if (section === 'support') return <SupportPage />
    if (section === 'branches') return <BranchesPage />
    if (section === 'contact') return <ContactPage />
    if (section === 'about') return <AboutPage />
    if (section === 'terms') return <TermsPage />
    if (section === 'privacy') return <PrivacyPage />
    if (section === 'cookies') return <CookiesPage />
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
  if (section === 'categories' && !value) {
    const categories = commerce.categories.list()
    const enriched = categories.map((c) => ({
      ...c,
      productCount: commerce.products.byCategory(c.slug).length,
    }))
    return <CategoriesIndexPage categories={enriched} />
  }
  if (section === 'w' && !value) {
    const useCases = commerce.useCases.list()
    return (
      <main className="shams-container max-w-[1400px] py-10">
        <h1 className="mb-2 text-3xl font-semibold">Shop by workflow</h1>
        <p className="mb-8 text-muted-foreground">Gear curated for how you create.</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {useCases.map((u) => (
            <Link key={u.slug} href={`/w/${u.slug}`} className="rounded-(--radius-card) border bg-card p-6 transition-colors hover:border-brand">
              <p className="font-semibold">{u.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">{u.description}</p>
            </Link>
          ))}
        </div>
      </main>
    )
  }
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
  if (section === 'account') {
    const accountSection = ['orders', 'addresses', 'profile'].includes(value ?? '') ? value as 'orders' | 'addresses' | 'profile' : 'overview'
    return <AccountDashboard section={accountSection} />
  }
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
    section === 'deals' || section === 'new' || section === 'trending' || section === 'best-sellers'
  const hasValidRoute =
    isSearch || isCollection || Boolean(category || useCase || brand)
  if (!hasValidRoute) notFound()
  const products = isSearch
    ? commerce.search(value ?? '')
    : section === 'deals'
      ? commerce.products.deals()
      : section === 'new'
        ? commerce.products.featured()
        : section === 'trending' || section === 'best-sellers'
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
          : section === 'best-sellers'
            ? 'Best sellers'
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
