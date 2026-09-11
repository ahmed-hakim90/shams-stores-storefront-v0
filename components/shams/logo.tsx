import { cn } from '@/lib/utils'

export function ShamsLogo({
  className,
  showWordmark = true,
}: {
  className?: string
  showWordmark?: boolean
}) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <span
        aria-hidden
        className="relative inline-flex size-8 items-center justify-center rounded-md bg-brand text-brand-foreground"
      >
        <svg viewBox="0 0 24 24" className="size-5" fill="none">
          <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="1.6" />
          <path
            d="M12 5v14M5 12h14M7 7l10 10M17 7L7 17"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            opacity="0.55"
          />
          <circle cx="12" cy="12" r="2.4" fill="currentColor" />
        </svg>
      </span>
      {showWordmark && (
        <span className="flex flex-col leading-none">
          <span className="text-lg font-semibold tracking-tight text-foreground">
            Shams
          </span>
          <span className="text-[0.6rem] font-medium uppercase tracking-[0.28em] text-muted-foreground">
            Stores
          </span>
        </span>
      )}
    </span>
  )
}
