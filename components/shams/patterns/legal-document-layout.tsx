import type { ReactNode } from 'react'

type LegalSection = {
  id: string
  title: string
  content: ReactNode
}

type LegalDocumentLayoutProps = {
  title: string
  lastUpdated: string
  sections: LegalSection[]
}

export function LegalDocumentLayout({
  title,
  lastUpdated,
  sections,
}: LegalDocumentLayoutProps) {
  return (
    <main className="pb-[calc(2rem+var(--mobile-bottom-nav-height))] sm:pb-0">
      <div className="border-b border-border bg-surface">
        <div className="shams-container py-8 sm:py-10">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {title}
            </h1>
            <p className="text-xs text-muted-foreground">
              Last updated: {lastUpdated}
            </p>
          </div>
        </div>
      </div>

      <div className="shams-container py-10 sm:py-14">
        <div className="lg:grid lg:grid-cols-[14rem_1fr] lg:gap-12">
          <nav className="mb-8 lg:mb-0">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-ink">
              Contents
            </p>
            <ul className="space-y-1.5 lg:sticky lg:top-24">
              {sections.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="max-w-3xl space-y-8">
            {sections.map((s) => (
              <section key={s.id} id={s.id} className="scroll-mt-24 space-y-3">
                <h2 className="text-lg font-semibold tracking-tight text-foreground">
                  {s.title}
                </h2>
                <div className="text-sm leading-7 text-muted-foreground">
                  {s.content}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
