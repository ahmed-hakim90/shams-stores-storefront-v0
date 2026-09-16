'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/components/shams/providers'
import { Mail, Lock, Eye, EyeOff, ArrowRight, CheckCircle2 } from 'lucide-react'

function LoginFormInner() {
  const { login } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const resetSuccess = searchParams.get('reset') === 'success'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!identifier.trim()) {
      setError('Enter your email or phone number')
      return
    }
    if (!password) {
      setError('Enter your password')
      return
    }

    setPending(true)
    const result = await login(identifier, password)
    setPending(false)

    if (result.success) {
      router.push('/account')
    } else {
      setError(result.error || 'Invalid credentials')
    }
  }

  return (
    <main className="shams-container max-w-md py-12 pb-[calc(3rem+var(--mobile-bottom-nav-height))] sm:pb-12">
      <Link href="/account" className="text-sm text-brand-ink">
        &larr; Back to account
      </Link>

      <h1 className="mt-6 text-3xl font-semibold">Sign in</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Enter your email or phone number and password
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        {resetSuccess && (
          <div className="flex items-center gap-2 rounded-(--radius-control) bg-green-50 p-3 text-sm text-green-700">
            <CheckCircle2 className="size-4 shrink-0" />
            Password reset successfully. Sign in with your new password.
          </div>
        )}
        {error && (
          <div role="alert" className="rounded-(--radius-control) bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium">
            Email or phone number
          </label>
          <div className="relative mt-2">
            <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              autoComplete="username"
              placeholder="example@email.com or 01xxxxxxxxx"
              className="min-h-12 w-full rounded-(--radius-control) border bg-background py-3 pr-3 pl-10 text-base"
              required
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium">Password</label>
            <Link href="/account/forgot-password" className="text-xs text-brand-ink hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="relative mt-2">
            <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="••••••••"
              className="min-h-12 w-full rounded-(--radius-control) border bg-background py-3 pr-3 pl-10 text-base"
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

        <button
          type="submit"
          disabled={pending}
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-(--radius-control) bg-brand text-sm font-semibold text-brand-foreground disabled:opacity-60"
        >
          {pending ? 'Signing in...' : 'Sign in'}
          <ArrowRight className="size-4" />
        </button>
      </form>

      <div className="mt-8 text-center text-sm">
        <span className="text-muted-foreground">Don't have an account? </span>
        <Link href="/account/register" className="font-medium text-brand-ink underline underline-offset-2">
          Create one
        </Link>
      </div>
    </main>
  )
}

export function LoginForm() {
  return (
    <Suspense>
      <LoginFormInner />
    </Suspense>
  )
}
