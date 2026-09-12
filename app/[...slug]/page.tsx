import { commerceProvider, serverProducts } from '@/lib/commerce/server'
import { notFound, redirect } from 'next/navigation'
import { CatalogPage } from '@/components/shams/catalog-page'
import { ProductDetail } from '@/components/shams/product-detail'
import { ExperiencePage, BundlePage } from '@/components/shams/curated-pages'
import { AccountPage, CartPage, CheckoutPage, OrderPage, WishlistPage } from '@/components/shams/commerce-pages'
import { commerce } from '@/lib/commerce'

export const dynamicParams = true

type PageProps = { params: Promise<{ slug: string[] }> }

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const title = slug.join(' / ').replaceAll('-', ' ')
  return { title: `${title.replace(/\b\w/g, (letter) => letter.toUpperCase())} · Shams Stores`, description: 'Shop photography, cinema and creator gear from Shams Stores.' }
}

export default async function StorefrontRoute({ params }: PageProps) {
  const { slug } = await params
  const [section, value] = slug
  if (!section) notFound()
  if (commerceProvider() === 'woocommerce' && ['c', 'b', 'brands'].includes(section)) {
    const filter = section === 'c' ? 'category' : 'brand'
    redirect(value ? `/shop?${filter}=${encodeURIComponent(value)}` : '/shop')
  }
  if (commerceProvider() === 'woocommerce' && !['p', 'cart', 'checkout'].includes(section)) notFound()
  if (section === 'cart') return <CartPage />
  if (section === 'checkout') return <CheckoutPage />
  if (section === 'bundles') return <BundlePage />
  if (section === 'w' && value) { const experience = commerce.useCases.bySlug(value); if (experience) return <ExperiencePage name={experience.name} description={experience.description} /> }
  if (section === 'account') return <AccountPage />
  if (section === 'wishlist') return <WishlistPage />
  if (section === 'orders' || section === 'track-order') return <OrderPage />
  if (section === 'brands' && !value) return <CatalogPage products={commerce.products.list()} title="Shop by brand" description="Explore cameras, lenses, audio and creator gear from the brands Shams trusts." />
  if (section === 'p') {
    const product = await serverProducts().bySlug(value ?? '')
    if (!product) notFound()
    return <ProductDetail product={product} />
  }
  const isSearch = section === 'search'
  const category = section === 'c' ? commerce.categories.bySlug(value ?? '') : undefined
  const useCase = section === 'w' ? commerce.useCases.bySlug(value ?? '') : undefined
  const brand = section === 'brands' || section === 'b' ? commerce.brands.bySlug(value ?? '') : undefined
  const isCollection = section === 'deals' || section === 'new' || section === 'trending'
  const hasValidRoute = isSearch || isCollection || Boolean(category || useCase || brand)
  if (!hasValidRoute) notFound()
  const products = isSearch ? commerce.search(value ?? '') : section === 'deals' ? commerce.products.deals() : section === 'new' ? commerce.products.featured() : section === 'trending' ? commerce.products.trending() : category ? commerce.products.byCategory(category.slug) : useCase ? commerce.products.byUseCase(useCase.slug) : brand ? commerce.products.list().filter((product) => product.brand.toLowerCase() === brand.name.toLowerCase()) : []
  const title = isSearch ? `Search results` : category?.name ?? useCase?.name ?? brand?.name ?? (section === 'deals' ? 'Deals worth catching' : section === 'new' ? 'New arrivals' : 'Trending gear')
  const description = isSearch ? `Explore products, brands and categories related to “${value ?? ''}”.` : category?.tagline ?? useCase?.description ?? brand?.tagline ?? 'Expertly selected photography, cinema and creator gear, ready to ship across Egypt.'
  return <CatalogPage category={category} products={products} title={title} description={description} query={isSearch ? value : undefined} />
}

export function generateStaticParams() { return [] }
export const revalidate = 3600
