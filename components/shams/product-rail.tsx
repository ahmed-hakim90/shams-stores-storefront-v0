'use client'
import { useEffect, useId, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Product } from '@/lib/commerce'
import { ProductCard } from './product-card'
import { cn } from '@/lib/utils'
export function ProductRail({
  products,
  className,
}: {
  products: Product[]
  className?: string
}) {
  const scroller = useRef<HTMLDivElement>(null),
    id = useId()
  const [edges, setEdges] = useState({ start: true, end: false })
  useEffect(() => {
    const el = scroller.current
    if (!el) return
    const update = () =>
      setEdges({
        start: el.scrollLeft <= 2,
        end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 2,
      })
    const observer = new ResizeObserver(update)
    observer.observe(el)
    el.addEventListener('scroll', update, { passive: true })
    update()
    return () => {
      observer.disconnect()
      el.removeEventListener('scroll', update)
    }
  }, [products.length])
  const move = (direction: number) => {
    const el = scroller.current
    if (el)
      el.scrollBy({
        left: direction * (el.clientWidth * 0.85),
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
          ? 'instant'
          : 'smooth',
      })
  }
  return (
    <div className={cn('min-w-0', className)}>
      <div
        ref={scroller}
        id={id}
        className="shams-rail"
        role="region"
        aria-label="Product selection"
        tabIndex={0}
      >
        {products.map((p) => (
          <ProductCard key={p.id} product={p} view="rail" />
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          {edges.end && edges.start
            ? 'Explore the selection'
            : 'Scroll to explore more gear'}
        </p>
        <div className="flex gap-2">
          <button
            aria-label="Previous products"
            aria-controls={id}
            disabled={edges.start}
            onClick={() => move(-1)}
            className="shams-icon-control size-11 disabled:cursor-not-allowed disabled:opacity-45"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            aria-label="Next products"
            aria-controls={id}
            disabled={edges.end}
            onClick={() => move(1)}
            className="shams-icon-control size-11 disabled:cursor-not-allowed disabled:opacity-45"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
