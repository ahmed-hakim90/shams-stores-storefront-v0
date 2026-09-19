import type { ProductAssurances as Assurances } from '@/lib/commerce/types'

export function ProductAssurances({ value }: { value?: Assurances }) {
  if (!value) return null
  const labels = [
    ...new Set(
      [
        value.agent?.customLabel?.trim() || (value.agent?.enabled ? value.agent.label.trim() : ''),
        value.warrantyBadge?.customLabel?.trim() || value.warrantyText?.trim() || (value.warrantyBadge?.enabled ? value.warrantyBadge.label.trim() : ''),
      ].filter(Boolean),
    ),
  ]
  if (!labels.length) return null
  return (
    <span className="flex flex-wrap gap-1.5" aria-label="Product assurances">
      {labels.map((label) => (
        <span
          key={label}
          dir="auto"
          className="rounded-(--radius-control) bg-brand-muted px-2 py-1 break-words [overflow-wrap:anywhere] text-xs font-medium text-brand-ink"
        >
          {label}
        </span>
      ))}
    </span>
  )
}
