'use client'
import { useEffect, useId, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Product } from '@/lib/commerce'
import { ProductCard } from './product-card'
import { cn } from '@/lib/utils'

export function ProductScrollRow({
  products,
}: {
  products: Product[]
}) {
  const scroller = useRef<HTMLDivElement>(null)
  const id = useId()
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
    <div className="min-w-0">
      <div className="relative">
        {!edges.end && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-linear-to-l from-background to-transparent"
          />
        )}
        <div
          ref={scroller}
          id={id}
          className="shams-home-row"
          role="region"
          aria-label="Product selection"
          tabIndex={0}
        >
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between gap-3">
        <p className="text-[11px] text-muted-foreground">
          {edges.end && edges.start
            ? 'Explore the selection'
            : 'Scroll to explore more gear'}
        </p>
        <div className="flex gap-1.5">
          <button
            aria-label="Previous products"
            aria-controls={id}
            disabled={edges.start}
            onClick={() => move(-1)}
            className="shams-icon-control size-8 disabled:cursor-not-allowed disabled:opacity-45"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            aria-label="Next products"
            aria-controls={id}
            disabled={edges.end}
            onClick={() => move(1)}
            className="shams-icon-control size-8 disabled:cursor-not-allowed disabled:opacity-45"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
