'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { commerce, formatMoney } from '@/lib/commerce'
import type { Product } from '@/lib/commerce/types'

const STORAGE_KEY = 'shams-recently-viewed'
const MAX_ITEMS = 8

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
        .slice(0, 6)
      setItems(found)
    }
    setMounted(true)
  }, [currentSlug])

  if (!mounted || items.length === 0) return null

  return (
    <section className="mt-12 border-t border-border pt-8">
      <h2 className="text-2xl font-semibold">Recently viewed</h2>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {items.map((product) => (
          <Link key={product.id} href={`/p/${product.slug}`} className="group rounded-(--radius-control) border border-border bg-card p-3 transition-colors hover:border-brand/40">
            <div className="relative aspect-square overflow-hidden rounded-(--radius-control) bg-white">
              <Image src={product.image} alt={product.name} fill sizes="140px" className="object-contain p-2" />
            </div>
            <p className="mt-2 line-clamp-2 text-xs font-medium">{product.name}</p>
            <p className="mt-1 text-xs font-semibold">{formatMoney(product.price)}</p>
          </Link>
        ))}
      </div>
    </section>
  )
}
