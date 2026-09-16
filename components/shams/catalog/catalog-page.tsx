'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { cn } from '@/lib/utils'
import { ChevronDown, SlidersHorizontal, X } from 'lucide-react'
import type { Category, Product } from '@/lib/commerce'
import { ProductCard } from '@/components/shams/product'
import { Button } from '@/components/ui/button'
import { MobileListingHeader } from './mobile-listing-header'

const filterMap: Record<string, string[]> = {
  cameras: ['Brand', 'Price', 'Availability', 'Camera type', 'Sensor size', 'Lens mount', 'Resolution', 'Video resolution'],
  lenses: ['Brand', 'Price', 'Availability', 'Lens mount', 'Focal length', 'Maximum aperture', 'Format', 'Lens type'],
  audio: ['Brand', 'Price', 'Availability', 'Microphone type', 'Connectivity', 'Wireless / Wired'],
}

export function CatalogPage({ category, products, title, description, query }: { category?: Category; products: Product[]; title: string; description: string; query?: string }) {
  const [sort, setSort] = useState('Featured')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const view = 'list' as const
  const filters = filterMap[category?.slug ?? ''] ?? ['Brand', 'Price', 'Availability']
  const sorted = useMemo(() => [...products].sort((a, b) => sort === 'Price: Low to High' ? a.price.amount - b.price.amount : sort === 'Price: High to Low' ? b.price.amount - a.price.amount : sort === 'Newest' ? Number(b.badges.includes('new')) - Number(a.badges.includes('new')) : b.rating - a.rating), [products, sort])
  const toggleFilter = (filter: string) => setActiveFilters((current) => current.includes(filter) ? current.filter((item) => item !== filter) : [...current, filter])

  const subcategoryColumn = category?.columns.find((col) =>
    ['shop by type', 'microphones', 'lights', 'support', 'stabilization', 'streaming', 'cameras', 'shop by mount'].includes(col.heading.toLowerCase()),
  )
  const brandColumn = category?.columns.find((col) =>
    col.heading.toLowerCase().includes('brand'),
  )
  const otherColumns = category?.columns.filter(
    (col) => col !== subcategoryColumn && col !== brandColumn,
  ) ?? []

  const categoryChips = category && <div className="flex gap-1.5 overflow-x-auto"><Link href={`/c/${category.slug}`} className="shrink-0 border border-brand bg-brand/5 px-2.5 py-1 text-[11px] font-medium text-brand-ink">All {category.name}</Link>{(subcategoryColumn?.links ?? category.columns[0]?.links ?? []).slice(0, 5).map((link) => <Link key={link.href + link.label} href={link.href} className="shrink-0 border border-border px-2.5 py-1 text-[11px] text-muted-foreground hover:border-brand hover:text-brand-ink">{link.label}</Link>)}</div>
  const listingToolbar = <div className="flex items-center justify-between gap-2"><Button variant="outline" className="h-8 gap-1.5 text-xs lg:hidden" onClick={() => setFiltersOpen(true)}><SlidersHorizontal className="size-3.5" />Filters{activeFilters.length > 0 && ` (${activeFilters.length})`}</Button><div className="hidden items-center gap-1.5 text-[11px] text-muted-foreground lg:flex"><SlidersHorizontal className="size-3" /> Refine</div><label className="flex h-8 items-center gap-1.5 text-[11px] text-muted-foreground">Sort<select value={sort} onChange={(event) => setSort(event.target.value)} className="h-8 border border-border bg-background px-2 text-xs font-medium text-foreground outline-none focus:border-brand"><option>Featured</option><option>Best Selling</option><option>Newest</option><option>Price: Low to High</option><option>Price: High to Low</option><option>Top Rated</option></select></label></div>

  return <main className="mobile-storefront-page mx-auto max-w-[1440px] px-4 py-4 pb-[calc(2rem+var(--mobile-bottom-nav-height))] sm:py-10 sm:pb-10">
    <MobileListingHeader title={title} description={description} count={products.length} query={query} chips={categoryChips} toolbar={listingToolbar} />

    {category && (subcategoryColumn || brandColumn || otherColumns.length > 0) && (
      <section className="mb-3 border border-border bg-card p-3 sm:p-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {subcategoryColumn && (
            <div>
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                {subcategoryColumn.heading}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {subcategoryColumn.links.map((link) => (
                  <Link
                    key={link.href + link.label}
                    href={link.href}
                    className="border border-border px-2 py-0.5 text-[11px] text-muted-foreground transition-colors hover:border-brand hover:text-brand-ink"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          )}
          {brandColumn && (
            <div>
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                {brandColumn.heading}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {brandColumn.links.map((link) => (
                  <Link
                    key={link.href + link.label}
                    href={link.href}
                    className="border border-border px-2 py-0.5 text-[11px] text-muted-foreground transition-colors hover:border-brand hover:text-brand-ink"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          )}
          {otherColumns.map((col) => (
            <div key={col.heading}>
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                {col.heading}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {col.links.map((link) => (
                  <Link
                    key={link.href + link.label}
                    href={link.href}
                    className="border border-border px-2 py-0.5 text-[11px] text-muted-foreground transition-colors hover:border-brand hover:text-brand-ink"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    )}

    <div className="grid gap-3 lg:grid-cols-[210px_1fr]"><aside className="hidden lg:block"><FilterList filters={filters} active={activeFilters} toggle={toggleFilter} clear={() => setActiveFilters([])} /></aside><section><div className="mb-2 flex flex-wrap gap-1">{activeFilters.map((filter) => <button key={filter} onClick={() => toggleFilter(filter)} className="inline-flex h-5 items-center border border-border bg-surface-subtle px-1.5 text-[10px] text-foreground hover:border-brand">{filter}<X className="ml-0.5 size-2.5" /></button>)}{activeFilters.length > 0 && <button onClick={() => setActiveFilters([])} className="text-[11px] text-muted-foreground underline">Clear all</button>}</div>{sorted.length > 0 ? <div className="shams-product-grid">{sorted.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <div className="border border-dashed border-border p-8 text-center"><h2 className="text-sm font-semibold">No exact matches found.</h2><p className="mt-1 text-xs text-muted-foreground">Try a different term or explore our popular categories.</p><Link href="/c/cameras" className="mt-3 inline-flex h-8 items-center bg-brand px-3 text-xs font-medium text-brand-foreground">Browse cameras</Link></div>}</section></div>
    {filtersOpen && <div className="fixed inset-0 z-[70] bg-black/40 lg:hidden" role="presentation" onClick={() => setFiltersOpen(false)}><div className="absolute inset-x-0 bottom-[var(--fixed-stack-bottom)] flex max-h-[calc(100dvh-var(--fixed-stack-bottom))] flex-col overflow-hidden rounded-t-(--radius-editorial) bg-background" role="dialog" aria-modal="true" aria-label="Filters" onClick={(event) => event.stopPropagation()}><div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-5"><h2 className="text-lg font-semibold">Filter products</h2><button aria-label="Close filters" onClick={() => setFiltersOpen(false)} className="flex size-11 items-center justify-center rounded-full hover:bg-muted"><X className="size-5" /></button></div><div className="min-h-0 flex-1 overflow-y-auto px-5 pb-4"><FilterList filters={filters} active={activeFilters} toggle={toggleFilter} clear={() => setActiveFilters([])} /></div><div className="shrink-0 border-t border-border bg-background px-5 pb-[calc(1rem+var(--safe-area-bottom))] pt-4"><Button className="min-h-11 w-full" onClick={() => setFiltersOpen(false)}>Show {products.length} products</Button></div></div></div>}
  </main>
}

function FilterList({ filters, active, toggle, clear }: { filters: string[]; active: string[]; toggle: (filter: string) => void; clear: () => void }) {
  const [expanded, setExpanded] = useState<string | null>(null)
  return <div className="flex flex-col">{filters.map((filter) => { const isExpanded = expanded === filter; const isActive = active.includes(filter); return <div key={filter} className="border-b border-border"><button type="button" aria-expanded={isExpanded} onClick={() => setExpanded(isExpanded ? null : filter)} className="flex h-8 w-full items-center justify-between text-left text-xs"><span className={isActive ? 'font-medium text-brand-ink' : 'text-foreground'}>{filter}</span><ChevronDown className={`size-3.5 text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`} /></button>{isExpanded && <div className="flex items-center justify-between gap-2 pb-2"><p className="text-[11px] text-muted-foreground">Choose {filter.toLowerCase()} filters</p><button type="button" onClick={() => toggle(filter)} className={`h-6 border px-2 text-[11px] font-medium ${isActive ? 'border-brand bg-brand/10 text-brand-ink' : 'border-border hover:border-brand'}`}>{isActive ? 'Selected' : 'Select'}</button></div>}</div>})}{active.length > 0 && <button type="button" onClick={clear} className="mt-2 h-6 text-left text-[11px] text-brand underline">Clear all filters</button>}</div>
}
