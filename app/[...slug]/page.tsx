import { contentPage } from '@/lib/commerce/live/shams-content'
import { text } from '@/lib/commerce/live/normalize'
import { ManagedContent } from '@/components/shams/live/managed-content'
import { commerceProvider, serverProducts } from '@/lib/commerce/server'
import { getProduct, terms } from '@/lib/commerce/live/catalog'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { connection } from 'next/server'
import { commerce } from '@/lib/commerce'
import {
  TaxonomyCards,
  CategoriesIndexPage,
  OrderStatus,
  TrackOrderForm,
  ExperiencePage,
  BundlePage,
  CartPage,
  CheckoutPage,
  OrderPage,
  WishlistPage,
  CookiesPage,
  AboutPageV2,
  ContactPageV2,
  BranchesPageV2,
  HelpCenterPage,
  TermsPageV2,
  PrivacyPageV2,
  ShippingPage,
  ReturnsPage,
  FaqPage,
  PaymentPage,
  WarrantyPage,
  GuidesPage,
  ProductDetailPage,
  LiveBranchesPage,
  LiveBrandsIndexPage,
  LiveCategoriesIndexPage,
  LiveManagedPage,
  LiveTagPage,
  LiveTermPage,
  MockCatalogRoute,
  WorkflowIndexPage,
} from '@/components/shams/content-pages'
import { LiveCatalogPage } from '@/components/shams/live'
import { SavedProducts, ProductDetail } from '@/components/shams/product'
import { CatalogPage } from '@/components/shams/catalog'
import { AccountDashboard } from '@/components/shams/account'

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
    'track-order',
    'faq',
    'shipping',
    'returns',
    'payment',
    'warranty',
    'guides',
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
  if (commerceProvider() === 'woocommerce' && slug.length === 1 && ['about', 'contact', 'support', 'terms', 'privacy', 'shipping', 'returns', 'payment', 'warranty', 'faq', 'guides'].includes(slug[0])) {
    const page = await contentPage(slug[0])
    if (page) {
      const seo = page.seo_overrides as Record<string, string> | null
      return { title: seo?.title || text(page.title), description: seo?.description || text(page.content_html).slice(0, 160), alternates: { canonical: `/${slug[0]}` }, ...(seo?.og_image ? { openGraph: { images: [seo.og_image] } } : {}) }
    }
  }
  if (commerceProvider() === 'woocommerce' && slug[0] === 'p') {
    const product = await getProduct(slug[1])
    if (product)
      return {
        title: product.seoOverrides?.title || product.name,
        description: product.seoOverrides?.description || product.shortDescription?.slice(0, 160),
        alternates: { canonical: `/p/${product.slug}` },
        openGraph: { images: [product.seoOverrides?.og_image || product.image] },
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
    'track-order': {
      title: 'Track Your Order · Shams Stores',
      description:
        'Look up your Shams Stores order status using your order number and email address.',
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
    faq: {
      title: 'FAQ · Shams Stores',
      description:
        'Answers to common questions about orders, delivery, returns, payments, warranty and shopping at Shams Stores.',
    },
    shipping: {
      title: 'Shipping & Delivery · Shams Stores',
      description:
        'Delivery times, shipping costs and store pickup options for Shams Stores orders across Egypt.',
    },
    returns: {
      title: 'Returns & Exchanges · Shams Stores',
      description:
        'How to return or exchange gear bought from Shams Stores — eligibility, steps and refund timeline.',
    },
    payment: {
      title: 'Payment Methods · Shams Stores',
      description:
        'Payment options at Shams Stores — Visa, Mastercard, InstaPay, ValU, Fawry, cash on delivery and bank installments.',
    },
    warranty: {
      title: 'Warranty · Shams Stores',
      description:
        'Manufacturer warranty information for gear purchased at Shams Stores. Coverage, claims and after-sales support.',
    },
    guides: {
      title: 'Guides · Shams Stores',
      description:
        'Equipment guides and buying advice from the Shams Stores team — cameras, lenses, audio, lighting and more.',
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

const LIVE_CMS_SECTIONS = ['about', 'contact', 'support', 'terms', 'privacy', 'shipping', 'returns', 'payment', 'warranty', 'faq', 'guides']

export default async function StorefrontRoute({
  params,
  searchParams,
}: PageProps) {
  await connection()
  const { slug } = await params
  const [section, value] = slug
  if (!section) notFound()

  if (commerceProvider() === 'woocommerce') {
    if (slug.length === 1 && LIVE_CMS_SECTIONS.includes(section)) {
      return <LiveManagedPage slug={section} />
    }
    if (section === 'branches') return <LiveBranchesPage />
    const query = await searchParams
    if (section === 'p') return <ProductDetailPage slug={value ?? ''} />
    if (['c', 'b', 'brands'].includes(section) && value) {
      return <LiveTermPage section={section} slug={value} query={query} />
    }
    if (section === 'categories') return <LiveCategoriesIndexPage />
    if (section === 'brands') return <LiveBrandsIndexPage />
    if (section === 'wishlist') return <SavedProducts mode="wishlist" />
    if (section === 'track-order') return <TrackOrderForm />
    if (section === 'orders') return <OrderStatus />
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
    if (section === 'support') return <HelpCenterPage />
    if (section === 'contact') return <ContactPageV2 />
    if (section === 'about') return <AboutPageV2 />
    if (section === 'terms') return <TermsPageV2 />
    if (section === 'privacy') return <PrivacyPageV2 />
    if (section === 'cookies') return <CookiesPage />
    if (section === 'faq') return <FaqPage />
    if (section === 'shipping') return <ShippingPage />
    if (section === 'returns') return <ReturnsPage />
    if (section === 'payment') return <PaymentPage />
    if (section === 'warranty') return <WarrantyPage />
    if (section === 'guides') return <GuidesPage />
    if (section === 'w') return <LiveTagPage slug={value ?? ''} query={query} />
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
  if (section === 'w' && !value) return <WorkflowIndexPage />
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
  if (section === 'track-order') return <TrackOrderForm />
  if (section === 'orders') return <OrderPage />
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
  return <MockCatalogRoute section={section} value={value} />
}
