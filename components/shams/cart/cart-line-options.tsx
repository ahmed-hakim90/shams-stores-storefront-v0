import { cn } from '@/lib/utils'

export function CartLineOptions({
  options,
  className,
}: {
  options?: string[]
  className?: string
}) {
  if (!options?.length) return null

  return (
    <p className={cn('mt-1 line-clamp-2 text-xs text-muted-foreground', className)}>
      {options.join(' · ')}
    </p>
  )
}
