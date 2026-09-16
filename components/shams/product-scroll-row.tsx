'use client'
import { useRef } from 'react'
import type { Product } from '@/lib/commerce'
import { ProductCard } from './product-card'

export function ProductScrollRow({
  products,
}: {
  products: Product[]
}) {
  const scroller = useRef<HTMLDivElement>(null)
  return (
    <div
      ref={scroller}
      className="shams-home-row"
      role="region"
      aria-label="Product selection"
      tabIndex={0}
    >
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  )
}
