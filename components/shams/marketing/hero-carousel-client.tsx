'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import type { HeroSlide } from './hero-carousel'

const AUTO_ADVANCE_MS = 5000

export function HeroCarouselClient({ slides }: { slides: HeroSlide[] }) {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null)
  const touchStartX = useRef(0)
  const total = slides.length

  const next = useCallback(() => {
    setActive((i) => (i + 1) % total)
  }, [total])

  const prev = useCallback(() => {
    setActive((i) => (i - 1 + total) % total)
  }, [total])

  const goTo = useCallback(
    (index: number) => {
      setActive(index)
    },
    [],
  )

  useEffect(() => {
    if (paused) return
    timerRef.current = setTimeout(next, AUTO_ADVANCE_MS)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [active, paused, next])

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    setPaused(true)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) {
      diff > 0 ? next() : prev()
    }
    setPaused(false)
  }

  const slide = slides[active]

  return (
    <section
      className="relative w-full overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="relative aspect-[16/10] sm:aspect-[21/9] lg:aspect-[2.5/1]">
        {slides.map((s, i) => {
          const isActive = i === active
          return (
            <div
              key={s.id}
              className={`absolute inset-0 transition-all duration-700 ease-out ${
                isActive
                  ? 'z-10 scale-100 opacity-100'
                  : 'z-0 scale-105 opacity-0'
              }`}
              aria-hidden={!isActive}
            >
              <Image
                src={s.bannerImage}
                alt={s.categoryName}
                fill
                sizes="100vw"
                className="object-cover"
                priority={i === 0}
              />
            </div>
          )
        })}

        {/* Gradient overlays */}
        <div className="absolute inset-0 z-20 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
        <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* Content */}
        <div className="absolute inset-0 z-30 flex items-end sm:items-center">
          <div className="w-full px-4 pb-16 pt-4 sm:px-6 sm:pb-0 sm:pt-0 lg:px-8">
            <div className="max-w-[calc(100%-6rem)] sm:max-w-lg space-y-2 sm:space-y-3" key={active}>
              <span className="inline-block rounded-full bg-brand/90 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-brand-foreground sm:px-3 sm:py-1 sm:text-[10px]">
                {slide.categoryName.length > 20 ? slide.categoryName.split(' ')[0] : slide.categoryName}
              </span>
              <h1 className="text-lg font-bold leading-tight tracking-tight text-white sm:text-2xl lg:text-3xl line-clamp-2">
                {slide.productName}
              </h1>
              <p className="hidden text-xs text-white/80 sm:block sm:text-sm lg:text-base">
                {slide.categoryDescription}
              </p>
              {slide.productPrice && (
                <p className="text-sm font-semibold text-white sm:text-lg lg:text-xl">
                  EGP {slide.productPrice}
                </p>
              )}
              <div className="flex flex-wrap gap-2 pt-1">
                <Link
                  href={`/c/${slide.categorySlug}`}
                  className="inline-flex h-8 items-center gap-1.5 bg-brand px-3 text-[10px] font-semibold text-brand-foreground transition-colors hover:bg-brand/90 sm:h-10 sm:gap-2 sm:px-5 sm:text-sm"
                >
                  Shop {slide.categoryName.split(' ')[0]}
                  <ArrowRight className="size-3 sm:size-4" />
                </Link>
                {slide.productSlug && (
                  <Link
                    href={`/p/${slide.productSlug}`}
                    className="inline-flex h-8 items-center gap-1.5 border border-white/30 bg-white/10 px-3 text-[10px] font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20 sm:h-10 sm:gap-2 sm:px-5 sm:text-sm"
                  >
                    View product
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation arrows */}
        <button
          onClick={prev}
          className="absolute left-2 top-1/2 z-40 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition-colors hover:bg-black/50 sm:left-4 sm:size-11 lg:size-12"
          aria-label="Previous slide"
        >
          <ChevronLeft className="size-4 sm:size-5" />
        </button>
        <button
          onClick={next}
          className="absolute right-2 top-1/2 z-40 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition-colors hover:bg-black/50 sm:right-4 sm:size-11 lg:size-12"
          aria-label="Next slide"
        >
          <ChevronRight className="size-4 sm:size-5" />
        </button>

        {/* Dot indicators */}
        <div className="absolute bottom-3 left-1/2 z-40 flex -translate-x-1/2 gap-1.5 sm:bottom-4 sm:gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`h-1.5 rounded-full transition-all duration-300 sm:h-2 ${
                i === active
                  ? 'w-6 bg-brand sm:w-8'
                  : 'w-1.5 bg-white/50 hover:bg-white/80 sm:w-2'
              }`}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === active}
            />
          ))}
        </div>

        {/* Progress bar */}
        {!paused && (
          <div className="absolute bottom-0 left-0 z-40 h-0.5 w-full">
            <div
              className="h-full bg-brand"
              style={{
                animation: `hero-progress ${AUTO_ADVANCE_MS}ms linear`,
              }}
            />
          </div>
        )}
      </div>

      <style>{`
        @keyframes hero-progress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </section>
  )
}
