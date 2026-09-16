'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/shams/auth-provider'
import { Lock, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react'

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuth()
  const key = searchParams.get('key') || ''
  const loginParam = searchParams.get('login') || ''

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  const hasResetParams = key && loginParam

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!password) {
      setError('Enter a new password')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (!hasResetParams) {
      setError('Invalid or expired reset link')
      return
    }

    setPending(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, login: loginParam, password }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error || 'Failed to reset password')
        return
      }

      const data = await res.json()

      if (data.token) {
        router.push('/account')
        return
      }

      router.push('/account/login?reset=success')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setPending(false)
    }
  }

  if (!hasResetParams) {
    return (
      <main className="shams-container max-w-md py-12">
        <Link href="/account/login" className="text-sm text-brand-ink">
          &larr; Back to sign in
        </Link>
        <div className="mt-8 rounded-(--radius-card) border border-dashed p-10 text-center">
          <h1 className="text-xl font-semibold">Invalid reset link</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            This password reset link is invalid or has expired. Please request a
            new one.
          </p>
          <Link
            href="/account/forgot-password"
            className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-(--radius-control) bg-brand px-5 text-sm font-semibold text-brand-foreground"
          >
            Request new link
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="shams-container max-w-md py-12">
      <Link href="/account/login" className="text-sm text-brand-ink">
        &larr; Back to sign in
      </Link>

      <h1 className="mt-6 text-3xl font-semibold">Set new password</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Enter your new password below.
      </p>

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
          <label className="block text-sm font-medium">New password</label>
          <div className="relative mt-2">
            <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              placeholder="At least 6 characters"
              className="min-h-12 w-full rounded-(--radius-control) border bg-background py-3 pr-10 pl-10 text-base"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">Confirm password</label>
          <div className="relative mt-2">
            <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              placeholder="Re-enter your password"
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
              Reset password
              <ArrowRight className="size-4" />
            </>
          )}
        </button>
      </form>
    </main>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <main className="shams-container flex items-center justify-center py-16">
          <Loader2 className="size-6 animate-spin text-brand-ink" />
        </main>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  )
}
