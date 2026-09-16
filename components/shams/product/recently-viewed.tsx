'use client'

import { useEffect, useState } from 'react'
import { commerce } from '@/lib/commerce'
import type { Product } from '@/lib/commerce/types'
import { ProductRail } from './product-rail'

const STORAGE_KEY = 'shams-recently-viewed'
const MAX_ITEMS = 12

function getRecentSlugs(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function recordView(slug: string) {
  try {
    const slugs = getRecentSlugs().filter((s) => s !== slug)
    slugs.unshift(slug)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(slugs.slice(0, MAX_ITEMS)))
  } catch {}
}

export function RecentlyViewed({ currentSlug }: { currentSlug: string }) {
  const [items, setItems] = useState<Product[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    recordView(currentSlug)
    const slugs = getRecentSlugs().filter((s) => s !== currentSlug)
    if (slugs.length === 0) {
      setItems([])
    } else {
      const allProducts = commerce.products.list()
      const found = slugs
        .map((slug) => allProducts.find((p) => p.slug === slug))
        .filter((p): p is NonNullable<typeof p> => p != null)
        .slice(0, 12)
      setItems(found)
    }
    setMounted(true)
  }, [currentSlug])

  if (!mounted || items.length === 0) return null

  return (
    <section className="mt-8 border-t border-border pt-6">
      <h2 className="mb-3 text-xl font-semibold">Recently viewed</h2>
      <ProductRail products={items} hideActions />
    </section>
  )
}
