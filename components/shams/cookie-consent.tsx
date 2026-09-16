'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

type Consent = 'accepted' | 'rejected' | null

export function CookieConsent() {
  const [consent, setConsent] = useState<Consent>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem('shams-cookie-consent') as Consent
      if (stored) {
        setConsent(stored)
      } else {
        setVisible(true)
      }
    } catch {
      setVisible(true)
    }
  }, [])

  const save = (choice: 'accepted' | 'rejected') => {
    setConsent(choice)
    setVisible(false)
    try {
      window.localStorage.setItem('shams-cookie-consent', choice)
    } catch {}
  }

  if (!visible || consent) return null

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed inset-x-4 bottom-4 z-[120] mx-auto max-w-lg animate-in fade-in-0 slide-in-from-bottom-4 duration-300"
    >
      <div className="rounded-(--radius-card) border bg-card p-5 shadow-lg">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-foreground">We use cookies</p>
            <p className="mt-1 text-sm text-muted-foreground">
              We use cookies to improve your experience and analyse traffic.{' '}
              <Link href="/cookies" className="font-medium text-brand-ink underline underline-offset-2">
                Learn more
              </Link>
            </p>
          </div>
          <button
            type="button"
            onClick={() => setVisible(false)}
            aria-label="Dismiss"
            className="shams-icon-control size-8 shrink-0"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => save('accepted')}
            className="rounded-(--radius-control) bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand-hover"
          >
            Accept all
          </button>
          <button
            type="button"
            onClick={() => save('rejected')}
            className={cn(
              'rounded-(--radius-control) border px-4 py-2 text-sm font-semibold transition-colors',
              'border-border text-foreground hover:bg-muted',
            )}
          >
            Essential only
          </button>
        </div>
      </div>
    </div>
  )
}
