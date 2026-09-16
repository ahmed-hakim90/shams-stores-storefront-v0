'use client'

import { useState } from 'react'
import { Check, Send, AlertCircle } from 'lucide-react'

export function Newsletter() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [error, setError] = useState('')

  const validate = (value: string) => {
    if (!value.trim()) return 'Please enter your email address.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email address.'
    return ''
  }

  return (
    <section className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 sm:py-10">
      <div className="relative overflow-hidden border border-border bg-brand px-5 py-7 text-brand-foreground sm:px-8 sm:py-9">
        <div
          aria-hidden
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'radial-gradient(100% 120% at 90% 10%, rgba(255,255,255,0.16) 0%, transparent 55%)',
          }}
        />
        <div className="relative grid gap-4 lg:grid-cols-2 lg:items-center">
          <div className="space-y-1.5">
            <h2 className="text-balance text-xl font-semibold tracking-tight sm:text-2xl">
              First to know. First to shoot.
            </h2>
            <p className="max-w-md text-xs text-brand-foreground/80 sm:text-sm">
              New arrivals, restocks and creator deals — straight to your inbox.
              No spam, just gear worth knowing about.
            </p>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              const validationError = validate(email)
              if (validationError) {
                setError(validationError)
                setStatus('error')
                return
              }
              setError('')
              setStatus('success')
            }}
            className="flex w-full flex-col gap-2 sm:flex-row lg:justify-end"
            noValidate
          >
            <div className="flex w-full flex-col gap-1 sm:max-w-xs">
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <input
                id="newsletter-email"
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (status === 'error') {
                    setError('')
                    setStatus('idle')
                  }
                }}
                placeholder="you@email.com"
                aria-invalid={status === 'error'}
                aria-describedby={status === 'error' ? 'newsletter-error' : undefined}
                className="h-9 w-full border border-transparent bg-brand-foreground/95 px-3 text-xs text-brand outline-none placeholder:text-brand/50 focus:ring-2 focus:ring-brand-foreground/40"
              />
              {status === 'error' && error && (
                <p id="newsletter-error" role="alert" className="flex items-center gap-1 text-[11px] font-medium text-brand-foreground/90">
                  <AlertCircle className="size-3" /> {error}
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={status === 'success'}
              className="inline-flex h-9 items-center justify-center gap-1.5 bg-brand-foreground px-5 text-xs font-semibold text-brand disabled:opacity-70"
            >
              {status === 'success' ? (
                <>
                  <Check className="size-3.5" /> Subscribed
                </>
              ) : (
                <>
                  <Send className="size-3.5" /> Subscribe
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}
