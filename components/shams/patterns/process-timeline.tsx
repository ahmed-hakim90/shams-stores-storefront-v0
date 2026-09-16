import type { LucideIcon } from 'lucide-react'

type ProcessStep = {
  title: string
  description: string
  icon: LucideIcon
  detail?: string
}

type ProcessTimelineProps = {
  steps: ProcessStep[]
}

export function ProcessTimeline({ steps }: ProcessTimelineProps) {
  return (
    <div className="relative">
      {steps.map((step, i) => {
        const isLast = i === steps.length - 1
        return (
          <div key={step.title} className="relative flex gap-5 pb-8 last:pb-0">
            {!isLast && (
              <div
                aria-hidden
                className="absolute left-5 top-10 h-[calc(100%-2.5rem)] w-px bg-border"
              />
            )}
            <span className="relative z-10 inline-flex size-10 shrink-0 items-center justify-center rounded-(--radius-control) border border-border bg-brand-muted text-brand-ink">
              <step.icon className="size-4" />
            </span>
            <div className="min-w-0 pt-1">
              <div className="flex items-baseline gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="text-sm font-semibold tracking-tight text-foreground">
                  {step.title}
                </h3>
              </div>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                {step.description}
              </p>
              {step.detail && (
                <p className="mt-1.5 text-xs text-muted-foreground/80">
                  {step.detail}
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
