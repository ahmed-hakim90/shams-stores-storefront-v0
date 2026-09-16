'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const [pending, setPending] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email.trim()) {
      setError('Enter your email address')
      return
    }

    setPending(true)
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error || 'Something went wrong')
        return
      }

      setSent(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setPending(false)
    }
  }

  return (
    <main className="shams-container max-w-md py-12 pb-[calc(3rem+var(--mobile-bottom-nav-height))] sm:pb-12">
      <Link href="/account/login" className="text-sm text-brand-ink">
        &larr; Back to sign in
      </Link>

      <h1 className="mt-6 text-3xl font-semibold">Reset your password</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Enter the email address linked to your account and we'll send you a
        reset link.
      </p>

      {sent ? (
        <div className="mt-8 rounded-(--radius-card) border bg-card p-6 text-center">
          <CheckCircle2 className="mx-auto size-10 text-green-600" />
          <h2 className="mt-4 text-lg font-semibold">Check your email</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            If an account exists for <strong>{email}</strong>, you'll receive a
            password reset link shortly.
          </p>
          <Link
            href="/account/login"
            className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-(--radius-control) bg-brand px-5 text-sm font-semibold text-brand-foreground"
          >
            Back to sign in
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {error && (
            <div
              role="alert"
              className="rounded-(--radius-control) bg-red-50 p-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium">Email address</label>
            <div className="relative mt-2">
              <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                placeholder="example@email.com"
                className="min-h-12 w-full rounded-(--radius-control) border bg-background py-3 pr-3 pl-10 text-base"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={pending}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-(--radius-control) bg-brand text-sm font-semibold text-brand-foreground disabled:opacity-60"
          >
            {pending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <>
                Send reset link
                <ArrowRight className="size-4" />
              </>
            )}
          </button>
        </form>
      )}
    </main>
  )
}
