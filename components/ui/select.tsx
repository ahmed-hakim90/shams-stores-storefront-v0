import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'

function Select({ className, children, ...props }: React.ComponentProps<'select'>) {
  return (
    <div className="relative">
      <select
        data-slot="select"
        className={cn(
          'min-h-9 w-full appearance-none rounded-(--radius-control) border border-border bg-background bg-none pe-8 ps-3 py-1 text-sm shadow-xs transition-colors outline-none',
          'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
          'aria-invalid:border-destructive aria-invalid:ring-destructive/20',
          'disabled:pointer-events-none disabled:opacity-50',
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute end-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
    </div>
  )
}

export { Select }
