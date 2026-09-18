'use client'
import { useOverlayPresence } from '@/components/shams/shared'
import { useEffect, useId, useState } from 'react'
import { Drawer } from '@base-ui/react/drawer'
import { SlidersHorizontal, X } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import type { FacetResult, FilterDefinition } from '@/lib/commerce/types'
import { commerceFetch } from '@/lib/commerce/browser'

export function activeCatalogFilterKeys(
  params: URLSearchParams,
  facets: FacetResult,
  lockedFilters: string[] = [],
) {
  const keys = new Set([
    'minPrice',
    'maxPrice',
    'onSale',
    ...facets.groups.map((group) => group.key),
  ])
  return [...keys].filter(
    (key) => params.has(key) && !lockedFilters.includes(key),
  )
}

export function clearCatalogFilters(
  params: URLSearchParams,
  facets: FacetResult,
  lockedFilters: string[] = [],
) {
  activeCatalogFilterKeys(params, facets, lockedFilters).forEach((key) =>
    params.delete(key),
  )
}

export function FilterFields({
  facets,
  values,
  change,
}: {
  facets: FacetResult
  values: URLSearchParams
  change: (key: string, value: string) => void
}) {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-1.5">
        <PriceField
          label="Min price"
          value={values.get('minPrice') ?? ''}
          change={(v) => change('minPrice', v)}
        />
        <PriceField
          label="Max price"
          value={values.get('maxPrice') ?? ''}
          change={(v) => change('maxPrice', v)}
        />
      </div>
      <label className="flex h-7 items-center gap-2 text-xs">
        <input
          type="checkbox"
          checked={values.get('onSale') === 'true'}
          onChange={(e) => change('onSale', e.target.checked ? 'true' : '')}
          className="size-3.5 accent-brand"
        />
        On sale
      </label>
      {facets.groups.map((group) => (
        <FilterGroup
          key={group.key}
          group={group}
          value={values.get(group.key) ?? ''}
          change={(v) => change(group.key, v)}
        />
      ))}
    </div>
  )
}
function PriceField({
  label,
  value,
  change,
}: {
  label: string
  value: string
  change: (value: string) => void
}) {
  const [draft, setDraft] = useState(value)
  useEffect(() => setDraft(value), [value])
  return (
    <label className="text-[11px] text-muted-foreground">
      {label}
      <input
        type="number"
        inputMode="numeric"
        min="0"
        value={draft}
        placeholder="EGP"
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => {
          if (draft !== value) change(draft)
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') e.currentTarget.blur()
        }}
        className="mt-1 h-7 w-full border border-border bg-surface-raised px-2 text-xs text-foreground"
      />
    </label>
  )
}
function FilterGroup({
  group,
  value,
  change,
}: {
  group: FilterDefinition
  value: string
  change: (value: string) => void
}) {
  const name = useId()
  const [search, setSearch] = useState(''),
    [expanded, setExpanded] = useState(false),
    [opened, setOpened] = useState(true)
  const options = group.options
      .filter((x) => x.label.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => Number(b.id === value) - Number(a.id === value)),
    shown = expanded ? options : options.slice(0, 7)
  return (
    <details
      open={opened}
      onToggle={(e) => setOpened(e.currentTarget.open)}
      className="border-t border-border pt-2"
    >
      <summary className="flex h-8 cursor-pointer items-center text-xs font-semibold">
        {group.label}
      </summary>
      <div className="mt-1">
        {group.options.length > 10 && (
          <input
            aria-label={`Search ${group.label}`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Find ${group.label.toLowerCase()}`}
            className="mb-1.5 h-6 w-full border border-border px-2 text-[11px]"
          />
        )}
        <label className="flex h-6 items-center gap-1.5 text-xs">
          <input
            type="radio"
            name={name}
            checked={!value}
            onChange={() => change('')}
          />
          All
        </label>
        {shown.map((x) => (
          <label
            key={x.id}
            className="flex h-6 cursor-pointer items-center gap-1.5 text-xs"
          >
            <input
              type="radio"
              name={name}
              checked={value === x.id}
              onChange={() => change(x.id)}
              className="accent-brand"
            />
            <span className="min-w-0 flex-1">{x.label}</span>
            <span className="text-[10px] tabular-nums text-muted-foreground">
              {x.count}
            </span>
          </label>
        ))}
        {options.length > 7 && (
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="h-6 text-[11px] font-medium text-brand-ink"
          >
            {expanded ? 'Show less' : 'Show more'}
          </button>
        )}
      </div>
    </details>
  )
}
export function MobileFilterDrawer({
  params,
  facets,
  apply,
  lockedFilters = [],
}: {
  params: string
  lockedFilters?: string[]
  facets: FacetResult
  apply: (value: URLSearchParams) => void
}) {
  const [open, setOpen] = useState(false),
    [draft, setDraft] = useState(params)
  useOverlayPresence(open)
  const [preview, setPreview] = useState(draft)
  useEffect(() => {
    const t = setTimeout(() => setPreview(draft), 250)
    return () => clearTimeout(t)
  }, [draft])
  const result = useQuery({
    queryKey: ['filter-preview', preview],
    queryFn: ({ signal }) =>
      commerceFetch<{ total: number }>(
        `/api/commerce/products?${preview}&pageSize=24`,
        { signal },
      ),
    enabled: open,
    staleTime: 30000,
  })
  const previewFacets = useQuery({
    queryKey: ['facets', preview],
    queryFn: ({ signal }) =>
      commerceFetch<FacetResult>(`/api/commerce/facets?${preview}`, { signal }),
    enabled: open,
    staleTime: 30000,
  })
  const availableFacets = previewFacets.data ?? facets
  const visibleFacets = {
    ...availableFacets,
    groups: availableFacets.groups.filter(
      (group) => !lockedFilters.includes(group.key),
    ),
  }
  const change = (key: string, value: string) => {
    const p = new URLSearchParams(draft)
    if (value) p.set(key, value)
    else p.delete(key)
    p.delete('cursor')
    setDraft(p.toString())
  }
  const selected = activeCatalogFilterKeys(
    new URLSearchParams(draft),
    availableFacets,
    lockedFilters,
  ).length
  return (
    <Drawer.Root
      open={open}
      onOpenChange={(v) => {
        if (v) setDraft(params)
        setOpen(v)
      }}
    >
      <Drawer.Trigger className="shams-filter-fab fixed bottom-[calc(var(--fixed-stack-bottom)+var(--sticky-purchase-offset)+var(--compare-tray-offset)+1rem)] right-4 z-[56] inline-flex h-10 items-center gap-2 rounded-full bg-foreground/85 px-4 text-xs font-semibold text-on-dark shadow-lg backdrop-blur-xl backdrop-saturate-150 hover:bg-foreground/95 lg:hidden">
        <SlidersHorizontal className="size-3.5" />
        Filters
        {selected > 0 && (
          <span className="inline-flex size-5 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-brand-foreground">
            {selected}
          </span>
        )}
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Backdrop data-overlay-backdrop className="fixed inset-0 z-[140] bg-black/50" />
        <Drawer.Viewport className="fixed inset-0 z-[141] flex">
          <Drawer.Popup data-overlay="filter" className="flex h-dvh w-full flex-col bg-background outline-none">
            <header className="flex h-12 shrink-0 items-center justify-between border-b px-4">
              <Drawer.Title className="text-sm font-semibold">
                Filters {selected > 0 && `(${selected})`}
              </Drawer.Title>
              <Drawer.Close
                aria-label="Close filters"
                className="flex size-8 items-center justify-center border border-border"
              >
                <X className="size-4" />
              </Drawer.Close>
            </header>
            <Drawer.Content className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4">
              <FilterFields
                facets={visibleFacets}
                values={new URLSearchParams(draft)}
                change={change}
              />
            </Drawer.Content>
            {result.isError && (
              <div role="alert" className="border-t px-4 py-2.5 text-xs">
                <p>
                  {result.error.message || 'Could not preview these filters.'}
                </p>
                <button
                  onClick={() => result.refetch()}
                  className="h-9 font-medium text-brand-ink"
                >
                  Retry preview
                </button>
              </div>
            )}
            <footer className="flex gap-2 border-t p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              <button
                onClick={() => {
                  const p = new URLSearchParams(draft)
                  clearCatalogFilters(p, availableFacets, lockedFilters)
                  setDraft(p.toString())
                }}
                className="h-10 border border-border px-3 text-xs"
              >
                Clear all
              </button>
              <button
                disabled={
                  result.isError || result.isFetching || preview !== draft
                }
                onClick={() => {
                  apply(new URLSearchParams(draft))
                  setOpen(false)
                }}
                className="h-10 flex-1 bg-brand px-3 text-xs font-semibold text-brand-foreground disabled:opacity-50"
              >
                {result.isError
                  ? 'Check your filters'
                  : result.isFetching || preview !== draft
                    ? 'Updating…'
                    : result.data
                      ? `Show ${result.data.total} results`
                      : 'Apply filters'}
              </button>
            </footer>
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
