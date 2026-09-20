import { commerce } from '@/lib/commerce'
import { CatalogPage } from '@/components/shams/catalog'
import { notFound } from 'next/navigation'

export function MockCatalogRoute({
  section,
  value,
}: {
  section: string
  value?: string
}) {
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
    isSearch || Boolean(category || useCase || brand)
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
    ? `Explore products, brands and categories related to "${value ?? ''}".`
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
