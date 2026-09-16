import { Suspense } from 'react'
import { HeroCarousel } from '@/components/shams/marketing/hero-carousel'

export async function LiveHero() {
  return (
    <Suspense fallback={<HeroCarouselSkeleton />}>
      <HeroCarousel />
    </Suspense>
  )
}

function HeroCarouselSkeleton() {
  return (
    <div className="relative aspect-[16/9] w-full animate-pulse bg-muted sm:aspect-[21/9] lg:aspect-[2.5/1]" />
  )
}
