'use client'

import { useState } from 'react'
import { Check, Send } from 'lucide-react'

export function Newsletter() {
  const [email, setEmail] = useState('')
  const [done, setDone] = useState(false)

  return (
    <section className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6 sm:py-16">
      <div className="relative overflow-hidden rounded-3xl bg-brand px-6 py-10 text-brand-foreground sm:px-12 sm:py-14">
        <div
          aria-hidden
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'radial-gradient(100% 120% at 90% 10%, rgba(255,255,255,0.16) 0%, transparent 55%)',
          }}
        />
        <div className="relative grid gap-6 lg:grid-cols-2 lg:items-center">
          <div className="space-y-2">
            <h2 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
              First to know. First to shoot.
            </h2>
            <p className="max-w-md text-sm text-brand-foreground/80">
              New arrivals, restocks and creator deals — straight to your inbox.
              No spam, just gear worth knowing about.
            </p>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (!email.trim()) return
              setDone(true)
            }}
            className="flex w-full flex-col gap-3 sm:flex-row lg:justify-end"
          >
            <label htmlFor="newsletter-email" className="sr-only">
              Email address
            </label>
            <input
              id="newsletter-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              className="h-12 w-full rounded-xl border border-transparent bg-brand-foreground/95 px-4 text-sm text-brand outline-none placeholder:text-brand/50 focus:ring-3 focus:ring-brand-foreground/40 sm:max-w-xs"
            />
            <button
              type="submit"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand-foreground px-6 text-sm font-semibold text-brand transition-transform hover:-translate-y-0.5"
            >
              {done ? (
                <>
                  <Check className="size-4" /> Subscribed
                </>
              ) : (
                <>
                  <Send className="size-4" /> Subscribe
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}
