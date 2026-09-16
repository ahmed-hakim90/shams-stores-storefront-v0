import type { LucideIcon } from 'lucide-react'

type PageHeroProps = {
  eyebrow: string
  eyebrowIcon: LucideIcon
  title: string
  description: string
  compact?: boolean
  lastUpdated?: string
}

export function PageHero({
  eyebrow,
  eyebrowIcon: Icon,
  title,
  description,
  compact,
  lastUpdated,
}: PageHeroProps) {
  return (
    <section className="relative overflow-hidden bg-foreground text-on-dark">
      <div
        aria-hidden
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            'radial-gradient(120% 100% at 80% 20%, rgba(255,255,255,0.12) 0%, transparent 50%), radial-gradient(80% 80% at 10% 80%, rgba(255,165,0,0.08) 0%, transparent 50%)',
        }}
      />
      <div
        className={`shams-container relative ${compact ? 'py-10 sm:py-14' : 'py-16 sm:py-24'}`}
      >
        <div className="max-w-2xl space-y-4">
          <span className="inline-flex items-center gap-2 rounded-full bg-on-dark-border px-3 py-1 text-xs font-semibold uppercase tracking-wide">
            <Icon className="size-3.5 text-brand" />
            {eyebrow}
          </span>
          <h1 className="text-balance text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
            {title}
          </h1>
          <p className="max-w-lg text-pretty text-base leading-7 text-on-dark-muted">
            {description}
          </p>
          {lastUpdated && (
            <p className="text-xs text-on-dark-subtle">Last updated: {lastUpdated}</p>
          )}
        </div>
      </div>
    </section>
  )
}
