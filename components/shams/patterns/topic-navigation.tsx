'use client'

import { useState, useRef, useCallback } from 'react'

type TopicNavigationProps = {
  topics: Array<{ key: string; label: string }>
}

export function TopicNavigation({ topics }: TopicNavigationProps) {
  const [active, setActive] = useState(topics[0]?.key ?? '')
  const scrollRef = useRef<HTMLDivElement>(null)

  const handleSelect = useCallback(
    (key: string) => {
      setActive(key)
      const el = document.getElementById(`faq-${key}`)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    },
    [],
  )

  return (
    <div className="border-b border-border bg-surface">
      <div className="shams-container">
        <div
          ref={scrollRef}
          className="-mb-px flex gap-1 overflow-x-auto py-3 scrollbar-none"
        >
          {topics.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => handleSelect(t.key)}
              className={`shrink-0 rounded-(--radius-control) px-3 py-1.5 text-xs font-medium transition-colors ${
                active === t.key
                  ? 'bg-brand text-brand-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
