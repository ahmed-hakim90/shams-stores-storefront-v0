import { Clock, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface BranchInfo {
  name: string
  area: string
  hours: string
  status: 'available' | 'limited'
}

export const branches: BranchInfo[] = [
  { name: 'Shams Downtown', area: 'Cairo · Talaat Harb', hours: '10:00 – 22:00', status: 'available' },
  { name: 'Shams Heliopolis', area: 'Cairo · Korba', hours: '10:00 – 22:00', status: 'available' },
  { name: 'Shams Alexandria', area: 'Alexandria · Roushdy', hours: '11:00 – 21:00', status: 'limited' },
]

export function BranchAvailability({ className }: { className?: string }) {
  return (
    <ul className={cn('space-y-2', className)}>
      {branches.map((b) => (
        <li
          key={b.name}
          className="flex min-w-0 items-center gap-3 rounded-xl border border-border bg-card p-3.5"
        >
          <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-muted text-brand-ink">
            <MapPin className="size-4.5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">{b.name}</p>
            <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
              {b.area} · <Clock className="size-3" /> {b.hours}
            </p>
          </div>
          <span
            className={cn(
              'inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap text-xs font-medium sm:text-sm',
              b.status === 'available' ? 'text-success' : 'text-warning',
            )}
          >
            <span
              className={cn(
                'size-1.5 rounded-full',
                b.status === 'available' ? 'bg-success' : 'bg-warning',
              )}
            />
            {b.status === 'available' ? 'Pickup ready' : 'Limited stock'}
          </span>
        </li>
      ))}
    </ul>
  )
}
