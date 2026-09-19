import { HeroCarouselClient } from './hero-carousel-client'

export type ManagedCampaign = {
  id: string
  desktop: string
  mobile: string
  heading: string
  body: string
  eyebrow: string
  alt: string
  href?: string
  label: string
}
// WordPress owns the content; the original carousel owns presentation and controls.
export function ManagedCampaigns({ slides }: { slides: ManagedCampaign[] }) {
  return <HeroCarouselClient slides={slides.map(slide => ({
    id: slide.id,
    categorySlug: '',
    categoryName: slide.eyebrow,
    categoryDescription: slide.body,
    bannerImage: slide.desktop,
    mobileBannerImage: slide.mobile,
    imageAlt: slide.alt,
    productName: slide.heading,
    productSlug: '',
    productPrice: '',
    ctaHref: slide.href,
    ctaLabel: slide.label,
  }))} />
}
