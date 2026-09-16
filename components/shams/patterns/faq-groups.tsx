type FaqGroup = {
  id: string
  title: string
  items: Array<{ question: string; answer: string }>
}

type FaqGroupsProps = {
  groups: FaqGroup[]
}

export function FaqGroups({ groups }: FaqGroupsProps) {
  return (
    <div className="space-y-10">
      {groups.map((group) => (
        <section key={group.id} id={`faq-${group.id}`} className="scroll-mt-32">
          <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-ink">
            {group.title}
          </p>
          <div className="space-y-0">
            {group.items.map((item, i) => (
              <details
                key={i}
                className="group border-b border-border [&[open]>summary]:text-foreground"
              >
                <summary className="flex cursor-pointer items-center justify-between gap-4 py-4 text-sm font-medium text-foreground transition-colors hover:text-brand list-none">
                  <span>{item.question}</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-45"
                    aria-hidden="true"
                  >
                    <path d="M12 5v14" />
                    <path d="M5 12h14" />
                  </svg>
                </summary>
                <div className="pb-4 pr-8 text-sm leading-7 text-muted-foreground">
                  {item.answer}
                </div>
              </details>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
