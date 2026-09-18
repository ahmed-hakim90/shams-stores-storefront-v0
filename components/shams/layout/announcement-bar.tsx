'use client'

import { useEffect, useState } from 'react'
import { X, Truck, Tag } from 'lucide-react'
import { theme } from '@/lib/theme'

const STORAGE_KEY = 'shams-announcement-dismissed'

export function AnnouncementBar() {
  const [dismissed, setDismissed] = useState(true)
  const [index, setIndex] = useState(0)

  useEffect(() => {
    setDismissed(localStorage.getItem(STORAGE_KEY) === 'true')
  }, [])

  useEffect(() => {
    if (dismissed || !theme.announcement.autoRotate) return
    const id = setInterval(
      () => setIndex((i) => (i + 1) % theme.announcement.messages.length),
      theme.announcement.rotateInterval,
    )
    return () => clearInterval(id)
  }, [dismissed])

  if (dismissed || !theme.announcement.enabled) return null

  const messages = theme.announcement.messages
  const icons = [Truck, Tag, Truck]
  const Icon = icons[index % icons.length]

  return (
    <div className="relative z-50 bg-foreground text-on-dark">
      <div className="mx-auto flex h-8 max-w-[1440px] items-center justify-center gap-2 px-8 text-[11px]">
        <Icon className="size-3 shrink-0" />
        <span className="truncate">{messages[index]}</span>
      </div>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={() => {
          setDismissed(true)
          localStorage.setItem(STORAGE_KEY, 'true')
        }}
        className="absolute right-2 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-full text-on-dark-subtle hover:text-on-dark"
      >
        <X className="size-3" />
      </button>
    </div>
  )
}
