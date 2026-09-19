import { terms } from '@/lib/commerce/live/catalog'
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
  mobileBannerImage?: string
  imageAlt?: string
  ctaHref?: string
  ctaLabel?: string
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
      const bannerImage = bannerImages[cat.slug] ?? '/images/hero/cameras.png'

      return {
        id: cat.id,
        categorySlug: cat.slug,
        categoryName: cat.name,
        categoryDescription: cat.description || `Explore our ${cat.name} collection`,
        bannerImage,
        productName: cat.name,
        productSlug: '',
        productPrice: '',
      }
    }),
  )

  return <HeroCarouselClient slides={slides} />
}
