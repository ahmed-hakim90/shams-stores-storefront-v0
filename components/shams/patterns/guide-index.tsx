import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'

type Guide = {
  title: string
  description: string
  category: string
  href: string
  icon: LucideIcon
}

type GuideIndexProps = {
  guides: Guide[]
}

export function GuideIndex({ guides }: GuideIndexProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {guides.map((guide) => (
        <Link
          key={guide.title}
          href={guide.href}
          className="group flex flex-col gap-4 rounded-(--radius-card) border border-border bg-card p-6 transition-colors hover:border-foreground"
        >
          <span className="inline-flex size-10 items-center justify-center rounded-(--radius-control) bg-brand-muted text-brand-ink transition-colors group-hover:bg-brand group-hover:text-brand-foreground">
            <guide.icon className="size-5" />
          </span>
          <div className="space-y-1">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              {guide.category}
            </p>
            <h3 className="font-semibold tracking-tight text-foreground">
              {guide.title}
            </h3>
            <p className="text-sm leading-6 text-muted-foreground">
              {guide.description}
            </p>
          </div>
          <span className="mt-auto inline-flex items-center gap-1.5 text-xs font-medium text-brand-ink transition-colors group-hover:text-brand">
            Explore
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-3.5 transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </span>
        </Link>
      ))}
    </div>
  )
}
