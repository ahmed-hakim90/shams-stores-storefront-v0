import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export function SectionHeading({
  eyebrow,
  title,
  description,
  href,
  linkLabel = 'View all',
  className,
}: {
  eyebrow?: string
  title: string
  description?: string
  href?: string
  linkLabel?: string
  className?: string
}) {
  return (
    <div className={cn('flex flex-wrap items-end justify-between gap-2', className)}>
      <div className="space-y-1">
        {eyebrow && (
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-ink">
            {eyebrow}
          </p>
        )}
        <h2 className="text-base font-semibold leading-tight tracking-tight text-foreground sm:text-lg">
          {title}
        </h2>
        {description && (
          <p className="max-w-2xl text-xs text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {href && (
        <Link
          href={href}
          className="group inline-flex h-7 shrink-0 items-center gap-1 text-xs font-medium text-brand-ink hover:underline"
        >
          {linkLabel}
          <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  )
}
