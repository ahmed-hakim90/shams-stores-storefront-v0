'use client'
import { useOverlayPresence } from './shell-policy'
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
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
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
      <label className="flex min-h-11 items-center gap-3 text-sm">
        <input
          type="checkbox"
          checked={values.get('onSale') === 'true'}
          onChange={(e) => change('onSale', e.target.checked ? 'true' : '')}
          className="size-4 accent-orange-500"
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
    <label className="text-xs text-muted-foreground">
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
        className="mt-2 h-11 w-full rounded-lg border px-3 text-base text-foreground"
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
      className="border-t border-border pt-4"
    >
      <summary className="min-h-11 cursor-pointer text-sm font-semibold">
        {group.label}
      </summary>
      <div className="mt-3">
        {group.options.length > 10 && (
          <input
            aria-label={`Search ${group.label}`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Find ${group.label.toLowerCase()}`}
            className="mb-2 h-10 w-full rounded-lg border px-3 text-sm"
          />
        )}
        <label className="flex min-h-11 items-center gap-2 text-sm">
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
            className="flex min-h-11 cursor-pointer items-center gap-2 text-sm"
          >
            <input
              type="radio"
              name={name}
              checked={value === x.id}
              onChange={() => change(x.id)}
              className="accent-orange-500"
            />
            <span className="min-w-0 flex-1">{x.label}</span>
            <span className="text-xs tabular-nums text-muted-foreground">
              {x.count}
            </span>
          </label>
        ))}
        {options.length > 7 && (
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="min-h-11 text-xs font-medium text-brand-ink"
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
      <Drawer.Trigger className="inline-flex min-h-11 items-center gap-2 rounded-lg border px-4 text-sm font-medium lg:hidden">
        <SlidersHorizontal className="size-4" />
        Filters
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Backdrop className="fixed inset-0 z-[140] bg-black/40" />
        <Drawer.Viewport className="fixed inset-0 z-[141] flex items-end">
          <Drawer.Popup className="shams-overlay flex h-[95dvh] w-full flex-col rounded-t-3xl bg-background outline-none md:ml-auto md:h-dvh md:max-w-lg md:rounded-none">
            <div className="mx-auto my-2 h-1 w-10 rounded-full bg-muted" />
            <header className="flex items-center justify-between border-b px-5 pb-4">
              <Drawer.Title className="text-lg font-semibold">
                Filters {selected > 0 && `(${selected})`}
              </Drawer.Title>
              <Drawer.Close
                aria-label="Close filters"
                className="size-11 rounded-full border"
              >
                <X className="mx-auto size-5" />
              </Drawer.Close>
            </header>
            <Drawer.Content className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5">
              <FilterFields
                facets={visibleFacets}
                values={new URLSearchParams(draft)}
                change={change}
              />
            </Drawer.Content>
            {result.isError && (
              <div role="alert" className="border-t px-5 py-3 text-sm">
                <p>
                  {result.error.message || 'Could not preview these filters.'}
                </p>
                <button
                  onClick={() => result.refetch()}
                  className="min-h-11 font-medium text-brand-ink"
                >
                  Retry preview
                </button>
              </div>
            )}
            <footer className="flex gap-3 border-t p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <button
                onClick={() => {
                  const p = new URLSearchParams(draft)
                  clearCatalogFilters(p, availableFacets, lockedFilters)
                  setDraft(p.toString())
                }}
                className="min-h-12 rounded-lg border px-4 text-sm"
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
                className="min-h-12 flex-1 rounded-lg bg-brand px-4 text-sm font-semibold text-brand-foreground"
              >
                {result.isError
                  ? 'Check your filters'
                  : result.isFetching || preview !== draft
                    ? 'Updating results…'
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
