import type { ProductSummary, ProductSpecification } from './types'
export interface ComparisonRow {
  key: string
  label: string
  values: string[]
  different: boolean
}
export function comparisonRows(
  products: ProductSummary[],
  specifications: Record<string, ProductSpecification[]> = {},
): ComparisonRow[] {
  const rows = new Map<string, { label: string; values: string[] }>()
  const add = (key: string, label: string, index: number, value: string) => {
    const row = rows.get(key) ?? { label, values: products.map(() => '—') }
    row.values[index] = value || '—'
    rows.set(key, row)
  }
  products.forEach((p, i) => {
    add('brand', 'Brand', i, p.brand)
    add(
      'price',
      'Price',
      i,
      p.price.amount > 0
        ? `EGP ${p.price.amount.toLocaleString('en-EG')}`
        : 'Contact for price',
    )
    add('stock', 'Availability', i, p.stock.replaceAll('_', ' '))
    for (const spec of specifications[p.id] ?? [])
      if (spec.comparable) add(`spec:${spec.key}`, spec.label, i, spec.value)
    const labelled = (p.highlights ?? []).filter((h) => h.label.trim())
    const unlabelled = (p.highlights ?? []).filter((h) => !h.label.trim())
    for (const h of labelled)
      if (!rows.has(`spec:${h.label.toLowerCase()}`))
        add(`highlight:${h.label}`, h.label, i, h.value)
    if (unlabelled.length)
      add(
        'highlights',
        'Highlights',
        i,
        unlabelled.map((h) => h.value).join(' · '),
      )
  })
  return [...rows]
    .map(([key, r]) => ({
      key,
      ...r,
      different: new Set(r.values.map((v) => v.trim().toLowerCase())).size > 1,
    }))
    .sort((a, b) => Number(b.different) - Number(a.different))
}
