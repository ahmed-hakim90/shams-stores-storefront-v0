import { terms, listProducts } from '@/lib/commerce/live/catalog'
import { primaryCategories } from '@/lib/commerce/navigation'
import { HeroCarouselClient } from './hero-carousel-client'

const bannerImages: Record<string, string> = {
  cameras: '/images/hero/cameras.png',
  lens: '/images/hero/lenses.png',
  'rode-audio': '/images/hero/audio.png',
  'accessories-misc': '/images/hero/accessories.png',
}

export type HeroSlide = {
  id: string
  categorySlug: string
  categoryName: string
  categoryDescription: string
  bannerImage: string
  productName: string
  productSlug: string
  productPrice: string
}

export async function HeroCarousel() {
  const allCategories = await terms('categories').catch(() => [])
  const categories = primaryCategories(allCategories, 4)

  if (categories.length === 0) return null

  const slides: HeroSlide[] = await Promise.all(
    categories.map(async (cat): Promise<HeroSlide> => {
      const products = await listProducts({
        category: cat.slug,
        pageSize: 1,
        sort: 'best-selling',
      }).catch(() => ({ items: [], total: 0, hasNextPage: false }))

      const hero = products.items[0]
      const bannerImage = bannerImages[cat.slug] ?? '/images/hero/cameras.png'

      return {
        id: cat.id,
        categorySlug: cat.slug,
        categoryName: cat.name,
        categoryDescription: cat.description || `Explore our ${cat.name} collection`,
        bannerImage,
        productName: hero ? `${hero.brand} ${hero.name}`.slice(0, 50) : cat.name,
        productSlug: hero?.slug ?? '',
        productPrice: hero
          ? `${hero.price.amount.toLocaleString()}`
          : '',
      }
    }),
  )

  return <HeroCarouselClient slides={slides} />
}
