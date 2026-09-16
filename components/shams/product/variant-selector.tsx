'use client'

import { useMemo, useState } from 'react'
import type { ProductVariant } from '@/lib/commerce/types'
import { cn } from '@/lib/utils'

export type SelectedVariant = {
  variantId: string
  options: { attribute: string; value: string }[]
  price: ProductVariant['price']
  stock: ProductVariant['stock']
  image?: ProductVariant['image']
}

export function VariantSelector({
  variants,
  onSelect,
}: {
  variants: ProductVariant[]
  onSelect: (selected: SelectedVariant | null) => void
}) {
  const attributeNames = useMemo(() => {
    const seen = new Set<string>()
    for (const v of variants) {
      for (const a of v.attributes) seen.add(a.name)
    }
    return [...seen]
  }, [variants])

  const [selection, setSelection] = useState<Record<string, string>>({})

  const valuesFor = (attrName: string) => {
    const values = new Set<string>()
    for (const v of variants) {
      const attr = v.attributes.find((a) => a.name === attrName)
      if (attr) values.add(attr.value)
    }
    return [...values]
  }

  const isValueAvailable = (attrName: string, attrValue: string) => {
    const testSelection = { ...selection, [attrName]: attrValue }
    return variants.some((v) =>
      v.attributes.every((a) => {
        const selected = testSelection[a.name]
        return !selected || selected === a.value
      }),
    )
  }

  const findMatchingVariant = (
    sel: Record<string, string>,
  ): ProductVariant | null => {
    if (Object.keys(sel).length !== attributeNames.length) return null
    return (
      variants.find((v) =>
        v.attributes.every((a) => sel[a.name] === a.value),
      ) ?? null
    )
  }

  const handleSelect = (attrName: string, attrValue: string) => {
    const next =
      selection[attrName] === attrValue
        ? { ...selection, [attrName]: '' }
        : { ...selection, [attrName]: attrValue }
    const cleaned: Record<string, string> = {}
    for (const [k, v] of Object.entries(next)) {
      if (v) cleaned[k] = v
    }
    setSelection(cleaned)

    const match = findMatchingVariant(cleaned)
    if (match) {
      onSelect({
        variantId: match.id,
        options: match.attributes.map((a) => ({
          attribute: a.name,
          value: a.value,
        })),
        price: match.price,
        stock: match.stock,
        image: match.image,
      })
    } else {
      onSelect(null)
    }
  }

  if (!attributeNames.length) return null

  return (
    <div className="space-y-4">
      {attributeNames.map((attrName) => (
        <fieldset key={attrName}>
          <legend className="mb-2 text-sm font-medium text-foreground">
            {attrName}
            {selection[attrName] && (
              <span className="ml-2 font-normal text-muted-foreground">
                {selection[attrName]}
              </span>
            )}
          </legend>
          <div className="flex flex-wrap gap-2">
            {valuesFor(attrName).map((value) => {
              const available = isValueAvailable(attrName, value)
              const selected = selection[attrName] === value
              return (
                <button
                  key={value}
                  type="button"
                  disabled={!available}
                  onClick={() => handleSelect(attrName, value)}
                  aria-pressed={selected}
                  className={cn(
                    'inline-flex min-h-10 items-center rounded-(--radius-control) border px-4 text-sm transition-colors',
                    selected
                      ? 'border-brand bg-brand-muted font-medium text-brand-ink'
                      : 'border-border bg-background text-foreground hover:border-brand/50',
                    !available && 'cursor-not-allowed opacity-40 line-through',
                  )}
                >
                  {value}
                </button>
              )
            })}
          </div>
        </fieldset>
      ))}
    </div>
  )
}
