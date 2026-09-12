'use client'

import { useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Product } from '@/lib/commerce'
import { ProductCard } from './product-card'

export function ProductRail({
  products,
  className,
}: {
  products: Product[]
  className?: string
}) {
  const scroller = useRef<HTMLDivElement>(null)

  const scrollBy = (dir: 1 | -1) => {
    const el = scroller.current
    if (!el) return
    el.scrollBy({ left: dir * (el.clientWidth * 0.8), behavior: 'smooth' })
  }

  return (
    <div className={cn('relative', className)}>
      <div className="pointer-events-none absolute -top-14 right-0 hidden gap-2 sm:flex">
        <button
          type="button"
          onClick={() => scrollBy(-1)}
          aria-label="Scroll left"
          className="pointer-events-auto inline-flex size-9 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:border-brand hover:text-brand"
        >
          <ChevronLeft className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => scrollBy(1)}
          aria-label="Scroll right"
          className="pointer-events-auto inline-flex size-9 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:border-brand hover:text-brand"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      <div
        ref={scroller}
        className="shams-scrollbar-none -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain scroll-px-4 px-4 pb-1 sm:mx-0 sm:gap-4 sm:px-0 sm:scroll-px-0"
      >
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            view="rail"
            className="w-[min(78vw,292px)] shrink-0 snap-start sm:w-64"
          />
        ))}
      </div>
    </div>
  )
}
