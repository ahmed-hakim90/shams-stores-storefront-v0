'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { ProductViewToggle, type ProductView } from './product-view-toggle'
import { ChevronDown, SlidersHorizontal, X } from 'lucide-react'
import type { Category, Product } from '@/lib/commerce'
import { ProductCard } from './product-card'
import { Button } from '@/components/ui/button'

const filterMap: Record<string, string[]> = {
  cameras: ['Brand', 'Price', 'Availability', 'Camera type', 'Sensor size', 'Lens mount', 'Resolution', 'Video resolution'],
  lenses: ['Brand', 'Price', 'Availability', 'Lens mount', 'Focal length', 'Maximum aperture', 'Format', 'Lens type'],
  audio: ['Brand', 'Price', 'Availability', 'Microphone type', 'Connectivity', 'Wireless / Wired'],
}

export function CatalogPage({ category, products, title, description, query }: { category?: Category; products: Product[]; title: string; description: string; query?: string }) {
  const [sort, setSort] = useState('Featured')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [view, setView] = useState<ProductView>('grid')
  useEffect(() => {
    const saved = window.localStorage.getItem('shams-product-view')
    if (saved === 'grid' || saved === 'list') setView(saved)
    else if (window.matchMedia('(max-width: 767px)').matches) setView('list')
  }, [])
  useEffect(() => { window.localStorage.setItem('shams-product-view', view) }, [view])
  const filters = filterMap[category?.slug ?? ''] ?? ['Brand', 'Price', 'Availability']
  const sorted = useMemo(() => [...products].sort((a, b) => sort === 'Price: Low to High' ? a.price.amount - b.price.amount : sort === 'Price: High to Low' ? b.price.amount - a.price.amount : sort === 'Newest' ? Number(b.badges.includes('new')) - Number(a.badges.includes('new')) : b.rating - a.rating), [products, sort])
  const toggleFilter = (filter: string) => setActiveFilters((current) => current.includes(filter) ? current.filter((item) => item !== filter) : [...current, filter])

  return <main className="mx-auto max-w-[1400px] px-4 py-7 sm:px-6 sm:py-10">
    <nav aria-label="Breadcrumb" className="mb-5 text-sm text-muted-foreground"><Link href="/" className="hover:text-brand">Home</Link><span className="mx-2">/</span><span className="text-foreground">{title}</span></nav>
    <div className="flex flex-col gap-3 border-b border-border pb-6"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">Shams Stores</p><h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">{query ? <>Results for <span className="text-brand">“{query}”</span></> : title}</h1><p className="max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p><p className="text-sm text-muted-foreground">{products.length} products</p></div>
    {category && <div className="flex gap-2 overflow-x-auto py-5"><Link href={`/c/${category.slug}`} className="shrink-0 rounded-full border border-brand bg-brand/5 px-4 py-2 text-sm font-medium text-brand">All {category.name}</Link>{category.columns[0]?.links.slice(0, 5).map((link) => <Link key={link.href + link.label} href={link.href} className="shrink-0 rounded-full border border-border px-4 py-2 text-sm text-muted-foreground hover:border-brand hover:text-brand">{link.label}</Link>)}</div>}
    <div className="mb-5 flex items-center justify-between gap-3"><ProductViewToggle value={view} onChange={setView} /><Button variant="outline" className="min-h-11 gap-2 lg:hidden" onClick={() => setFiltersOpen(true)}><SlidersHorizontal data-icon="inline-start" />Filters{activeFilters.length > 0 && ` (${activeFilters.length})`}</Button><div className="hidden items-center gap-2 text-sm text-muted-foreground lg:flex"><SlidersHorizontal className="size-4" /> Refine your search</div><label className="flex min-h-11 items-center gap-2 text-sm text-muted-foreground">Sort<select value={sort} onChange={(event) => setSort(event.target.value)} className="min-h-11 rounded-lg border border-border bg-background px-3 font-medium text-foreground outline-none focus:border-brand"><option>Featured</option><option>Best Selling</option><option>Newest</option><option>Price: Low to High</option><option>Price: High to Low</option><option>Top Rated</option></select></label></div>
    <div className="grid gap-6 lg:grid-cols-[210px_1fr]"><aside className="hidden lg:block"><FilterList filters={filters} active={activeFilters} toggle={toggleFilter} clear={() => setActiveFilters([])} /></aside><section><div className="mb-5 flex flex-wrap gap-2">{activeFilters.map((filter) => <button key={filter} onClick={() => toggleFilter(filter)} className="inline-flex min-h-9 items-center gap-1 rounded-full bg-brand/10 px-3 text-sm text-brand">{filter}<X className="size-3.5" /></button>)}{activeFilters.length > 0 && <button onClick={() => setActiveFilters([])} className="text-sm text-muted-foreground underline">Clear all</button>}</div>{sorted.length > 0 ? <div className={view === 'list' ? 'grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3' : 'grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-6 xl:grid-cols-4'}>{sorted.map((product) => <ProductCard key={product.id} product={product} view={view} />)}</div> : <div className="rounded-xl border border-dashed border-border p-12 text-center"><h2 className="text-lg font-semibold">No exact matches found.</h2><p className="mt-2 text-sm text-muted-foreground">Try a different term or explore our popular categories.</p><Link href="/c/cameras" className="mt-5 inline-flex min-h-11 items-center rounded-lg bg-brand px-5 text-sm font-medium text-brand-foreground">Browse cameras</Link></div>}</section></div>
    {filtersOpen && <div className="fixed inset-0 z-50 bg-black/40 lg:hidden" role="presentation" onClick={() => setFiltersOpen(false)}><div className="absolute inset-x-0 bottom-0 rounded-t-2xl bg-background p-5" role="dialog" aria-modal="true" aria-label="Filters" onClick={(event) => event.stopPropagation()}><div className="mb-5 flex items-center justify-between"><h2 className="text-lg font-semibold">Filter products</h2><button aria-label="Close filters" onClick={() => setFiltersOpen(false)} className="rounded-full p-2 hover:bg-muted"><X className="size-5" /></button></div><FilterList filters={filters} active={activeFilters} toggle={toggleFilter} clear={() => setActiveFilters([])} /><Button className="mt-5 min-h-11 w-full" onClick={() => setFiltersOpen(false)}>Show {products.length} products</Button></div></div>}
  </main>
}

function FilterList({ filters, active, toggle, clear }: { filters: string[]; active: string[]; toggle: (filter: string) => void; clear: () => void }) { return <div className="flex flex-col gap-2">{filters.map((filter) => <button key={filter} onClick={() => toggle(filter)} className="flex min-h-11 items-center justify-between border-b border-border py-2 text-left text-sm"><span className={active.includes(filter) ? 'font-medium text-brand' : 'text-foreground'}>{filter}</span><ChevronDown className="size-4 text-muted-foreground" /></button>)}{active.length > 0 && <button onClick={clear} className="mt-2 text-left text-sm text-brand underline">Clear all filters</button>}</div> }
