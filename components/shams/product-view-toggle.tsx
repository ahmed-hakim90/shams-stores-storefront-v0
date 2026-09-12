'use client'

import { Grid2X2, List } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ProductView = 'list' | 'grid'

export function ProductViewToggle({ value, onChange }: { value: ProductView; onChange: (value: ProductView) => void }) {
  return <div className="inline-flex items-center gap-0.5 rounded-md border border-border p-0.5" aria-label="Product view">
    <button type="button" aria-label="List view" aria-pressed={value === 'list'} onClick={() => onChange('list')} className={cn('inline-flex size-9 items-center justify-center rounded-sm text-muted-foreground transition-colors duration-150 hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand', value === 'list' && 'bg-brand-muted text-brand')}><List className="size-4" /></button>
    <button type="button" aria-label="Grid view" aria-pressed={value === 'grid'} onClick={() => onChange('grid')} className={cn('inline-flex size-9 items-center justify-center rounded-sm text-muted-foreground transition-colors duration-150 hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand', value === 'grid' && 'bg-brand-muted text-brand')}><Grid2X2 className="size-4" /></button>
  </div>
}
