'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, TrendingUp, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { commerce, formatMoney } from '@/lib/commerce'

const POPULAR = ['Aperture A7 IV', 'RF 24-70', 'DJX Mic', 'Cinema camera', 'Prime lens']
const QUICK = [
  { label: 'Cameras', href: '/c/cameras' },
  { label: 'Lenses', href: '/c/lenses' },
  { label: 'Drones', href: '/c/drones' },
  { label: 'Audio', href: '/c/audio' },
]

export function SearchBar({ className }: { className?: string }) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const composing = useRef(false)
  const results = query ? commerce.search(query).slice(0, 5) : []

  const submit = (q: string) => {
    if (!q.trim()) return
    setOpen(false)
    router.push(`/search?q=${encodeURIComponent(q.trim())}`)
  }

  return (
    <div className={cn('relative min-w-0', className)}>
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault()
          submit(query)
        }}
        className="relative flex items-center"
      >
        <Search className="pointer-events-none absolute left-3.5 size-4.5 text-muted-foreground" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          onBlur={() => window.setTimeout(() => setOpen(false), 150)}
          onCompositionStart={() => (composing.current = true)}
          onCompositionEnd={() => (composing.current = false)}
          onKeyDown={(e) => {
            if (
              e.key === 'Enter' &&
              (composing.current || e.nativeEvent.isComposing || e.keyCode === 229)
            ) {
              e.preventDefault()
            }
          }}
          placeholder="Search by model, brand, category or SKU…"
          aria-label="Search products"
          className="h-11 w-full rounded-(--radius-control) border border-border bg-background pl-10 pr-10 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-brand focus:ring-3 focus:ring-brand/15 [&::-webkit-search-cancel-button]:hidden"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            aria-label="Clear search"
            className="absolute right-3 inline-flex size-6 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
          >
            <X className="size-4" />
          </button>
        )}
      </form>

      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 overflow-hidden rounded-(--radius-editorial) border border-border bg-popover">
          {results.length > 0 ? (
            <ul className="max-h-[60vh] overflow-y-auto py-1.5">
              {results.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/p/${p.slug}`}
                    className="flex items-center gap-3 px-3 py-2 transition-colors hover:bg-muted"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => setOpen(false)}
                  >
                    <span className="relative size-11 shrink-0 overflow-hidden rounded-(--radius-control) border border-border bg-white">
                      <Image
                        src={p.image || '/placeholder.svg'}
                        alt=""
                        fill
                        sizes="44px"
                        className="object-contain p-1"
                      />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-foreground">
                        <span className="text-brand-ink">{p.brand}</span> {p.name}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {p.configuration}
                      </span>
                    </span>
                    <span className="shrink-0 text-sm font-semibold text-foreground">
                      {formatMoney(p.price)}
                    </span>
                  </Link>
                </li>
              ))}
              <li className="border-t border-border">
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => submit(query)}
                  className="w-full px-3 py-2.5 text-left text-sm font-medium text-brand hover:bg-muted"
                >
                  See all results for “{query}”
                </button>
              </li>
            </ul>
          ) : (
            <div className="p-4">
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <TrendingUp className="size-3.5" /> Popular searches
              </p>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => submit(term)}
                    className="rounded-full border border-border px-3 py-1 text-sm text-foreground transition-colors hover:border-brand hover:text-brand-ink"
                  >
                    {term}
                  </button>
                ))}
              </div>
              <p className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Jump to
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {QUICK.map((c) => (
                  <Link
                    key={c.href}
                    href={c.href}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => setOpen(false)}
                    className="rounded-(--radius-control) border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-brand hover:text-brand-ink"
                  >
                    {c.label}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
