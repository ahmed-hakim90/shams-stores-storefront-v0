'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Search, X, Clock3, TrendingUp, ArrowRight, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { commerce, formatMoney } from '@/lib/commerce'
import { useInteractions } from './interaction-provider'

const popularSearches = ['Sony A7 IV', 'Canon RF', 'DJI Mic', 'Mirrorless Cameras']
const popularCategories = [{ label: 'Cameras', href: '/c/cameras' }, { label: 'Lenses', href: '/c/lenses' }, { label: 'Audio', href: '/c/audio' }, { label: 'Drones', href: '/c/drones' }]
const popularBrands = [{ label: 'Sonar', href: '/b/sonar' }, { label: 'Canonet', href: '/b/canonet' }, { label: 'DJX', href: '/b/djx' }]

export function GlobalSearchOverlay() {
  const { searchOpen, closeSearch } = useInteractions()
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(-1)

  useEffect(() => {
    if (!searchOpen) return
    setQuery(new URLSearchParams(window.location.search).get('q') ?? '')
    const frame = window.requestAnimationFrame(() => inputRef.current?.focus())
    return () => window.cancelAnimationFrame(frame)
  }, [searchOpen])

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query.trim()), 240)
    return () => window.clearTimeout(timer)
  }, [query])

  useEffect(() => {
    if (!searchOpen) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeSearch()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => { document.body.style.overflow = previous; document.removeEventListener('keydown', onKeyDown) }
  }, [searchOpen, closeSearch])

  const results = useMemo(() => debouncedQuery.length >= 2 ? commerce.search(debouncedQuery).slice(0, 6) : [], [debouncedQuery])
  const suggestions = useMemo(() => debouncedQuery.length >= 2 ? [`${debouncedQuery} lens`, `${debouncedQuery} accessories`] : [], [debouncedQuery])
  const loading = query.trim() !== debouncedQuery
  const submit = (value = query) => {
    const next = value.trim()
    if (!next) return
    closeSearch()
    router.push(`/search?q=${encodeURIComponent(next)}`)
  }
  const productLinks = results.map((product) => `/p/${product.slug}`)
  const selectableCount = results.length + suggestions.length

  if (!searchOpen) return null
  return <>
    <div className="fixed inset-0 z-[135] bg-foreground/35 backdrop-blur-[2px]" onClick={closeSearch} aria-hidden="true" />
    <section className="fixed inset-x-0 top-0 z-[136] flex max-h-[min(72dvh,680px)] min-h-[min(420px,68dvh)] flex-col overflow-hidden rounded-b-2xl border-b border-border bg-background shadow-2xl md:inset-x-5 md:top-5 md:mx-auto md:max-w-3xl md:rounded-2xl md:border" role="dialog" aria-modal="true" aria-label="Search Shams Stores">
      <form onSubmit={(event) => { event.preventDefault(); submit() }} className="flex shrink-0 items-center gap-2 border-b border-border p-3 sm:p-4">
        <Search className="size-5 shrink-0 text-brand" aria-hidden="true" />
        <input ref={inputRef} value={query} onChange={(event) => { setQuery(event.target.value); setActiveIndex(-1) }} onKeyDown={(event) => {
          if (event.nativeEvent.isComposing || event.keyCode === 229) return
          if (event.key === 'ArrowDown' && selectableCount) { event.preventDefault(); setActiveIndex((index) => Math.min(index + 1, selectableCount - 1)) }
          if (event.key === 'ArrowUp' && selectableCount) { event.preventDefault(); setActiveIndex((index) => Math.max(index - 1, 0)) }
          if (event.key === 'Enter' && activeIndex >= 0) { event.preventDefault(); submit(activeIndex < results.length ? results[activeIndex].name : suggestions[activeIndex - results.length]) }
        }} placeholder="Search by model, brand, category or SKU…" aria-label="Search products" role="combobox" aria-expanded="true" aria-controls="global-search-results" className="min-w-0 flex-1 bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground" autoComplete="off" />
        {query && <button type="button" onClick={() => { setQuery(''); inputRef.current?.focus() }} className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted" aria-label="Clear search"><X /></button>}
        <button type="button" onClick={closeSearch} className="inline-flex min-h-10 shrink-0 items-center rounded-lg px-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Close search">Cancel</button>
      </form>
      <div id="global-search-results" className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        {!debouncedQuery ? <div className="flex flex-col gap-6">
          <SearchGroup title="Recent searches" icon={<Clock3 className="size-4" />} items={popularSearches.slice(0, 2)} onSelect={submit} />
          <SearchGroup title="Popular searches" icon={<TrendingUp className="size-4" />} items={popularSearches} onSelect={submit} />
          <LinkGrid title="Popular categories" items={popularCategories} onSelect={(href) => { closeSearch(); router.push(href) }} />
          <LinkGrid title="Popular brands" items={popularBrands} onSelect={(href) => { closeSearch(); router.push(href) }} />
        </div> : loading ? <div className="flex flex-col gap-3" aria-busy="true" aria-label="Loading search suggestions">{[1, 2, 3].map((item) => <div key={item} className="flex items-center gap-3 rounded-xl border border-border p-3"><div className="size-12 animate-pulse rounded-lg bg-muted" /><div className="flex-1"><div className="h-3 w-2/3 animate-pulse rounded bg-muted" /><div className="mt-2 h-3 w-1/3 animate-pulse rounded bg-muted" /></div></div>)}</div> : results.length || suggestions.length ? <div className="flex flex-col gap-5"><SearchGroup title="Products" items={results.map((p) => p.name)} productResults={results} activeIndex={activeIndex} onSelect={(value) => submit(value)} /><SearchGroup title="Suggestions" items={suggestions} offset={results.length} activeIndex={activeIndex} onSelect={submit} /><button type="button" onClick={() => submit()} className="flex min-h-12 items-center justify-between border-t border-border pt-4 text-left text-sm font-semibold text-brand">View all results for “{query.trim()}” <ArrowRight className="size-4" /></button></div> : <div className="py-8 text-center"><p className="font-semibold">No exact matches for “{debouncedQuery}”</p><p className="mt-2 text-sm text-muted-foreground">Try another term or browse cameras, lenses, audio or brands.</p></div>}
      </div>
    </section>
  </>
}

function SearchGroup({ title, icon, items, productResults, activeIndex = -1, offset = 0, onSelect }: { title: string; icon?: React.ReactNode; items: string[]; productResults?: ReturnType<typeof commerce.search>; activeIndex?: number; offset?: number; onSelect: (value: string) => void }) {
  const { closeSearch } = useInteractions()
  return <section><h2 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">{icon}{title}</h2><div className="flex flex-col gap-1">{items.map((item, index) => { const product = productResults?.[index]; return product ? <Link key={product.id} href={`/p/${product.slug}`} onClick={() => closeSearch()} className={cn('flex min-h-16 items-center gap-3 rounded-xl px-2 py-2 hover:bg-muted', activeIndex === index + offset && 'bg-muted')}><span className="relative size-12 shrink-0 overflow-hidden rounded-lg border border-border bg-white"><Image src={product.image || '/placeholder.svg'} alt="" fill sizes="48px" className="object-contain p-1" /></span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium">{product.brand} {product.name}</span><span className="block truncate text-xs text-muted-foreground">{product.configuration || 'Product'}</span></span><span className="shrink-0 text-sm font-semibold">{formatMoney(product.price)}</span></Link> : <button key={item} type="button" onClick={() => onSelect(item)} className={cn('flex min-h-11 items-center rounded-lg px-2 text-left text-sm text-foreground hover:bg-muted', activeIndex === index + offset && 'bg-muted')}>{item}</button> })}</div></section>
}

function LinkGrid({ title, items, onSelect }: { title: string; items: { label: string; href: string }[]; onSelect: (href: string) => void }) { return <section><h2 className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">{title}</h2><div className="grid grid-cols-2 gap-2">{items.map((item) => <button type="button" key={item.href} onClick={() => onSelect(item.href)} className="min-h-11 rounded-lg border border-border px-3 text-left text-sm font-medium hover:border-brand hover:text-brand">{item.label}</button>)}</div></section> }

export function SearchTrigger({ className, placeholder = 'Search products' }: { className?: string; placeholder?: string }) {
  const { openSearch } = useInteractions()
  return <button type="button" onClick={openSearch} className={cn('flex h-11 w-full items-center gap-3 rounded-xl border border-border bg-background px-3.5 text-left text-sm text-muted-foreground transition-colors hover:border-brand focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand/15', className)}><Search className="size-4.5 shrink-0" />{placeholder}</button>
}
