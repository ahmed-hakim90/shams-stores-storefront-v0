'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/shams/auth-provider'
import { User, Mail, Phone, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'

export function RegisterForm() {
  const { register } = useAuth()
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Enter your full name')
      return
    }
    if (!email.trim()) {
      setError('Enter your email address')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Invalid email address')
      return
    }
    if (!phone.trim()) {
      setError('Enter your phone number')
      return
    }
    if (!/^01[0-9]{9}$/.test(phone)) {
      setError('Phone number must be 11 digits starting with 01')
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

    setPending(true)
    const result = await register({ name, email, phone, password })
    setPending(false)

    if (result.success) {
      router.push('/account')
    } else {
      setError(result.error || 'An error occurred creating your account')
    }
  }

  return (
    <main className="shams-container max-w-md py-12">
      <Link href="/account" className="text-sm text-brand-ink">
        &larr; Back to account
      </Link>

      <h1 className="mt-6 text-3xl font-semibold">Create account</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Register to enjoy a smoother shopping experience
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        {error && (
          <div role="alert" className="rounded-(--radius-control) bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium">Full name</label>
          <div className="relative mt-2">
            <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              placeholder="First and last name"
              className="min-h-12 w-full rounded-(--radius-control) border bg-background py-3 pr-3 pl-10 text-base"
              required
            />
          </div>
        </div>

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

        <div>
          <label className="block text-sm font-medium">Phone number</label>
          <div className="relative mt-2">
            <Phone className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
              placeholder="01xxxxxxxxx"
              className="min-h-12 w-full rounded-(--radius-control) border bg-background py-3 pr-3 pl-10 text-base"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">Password</label>
          <div className="relative mt-2">
            <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              placeholder="At least 6 characters"
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

        <div>
          <label className="block text-sm font-medium">Confirm password</label>
          <div className="relative mt-2">
            <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              placeholder="Re-enter password"
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
          {pending ? 'Creating account...' : 'Create account'}
          <ArrowRight className="size-4" />
        </button>
      </form>

      <div className="mt-8 text-center text-sm">
        <span className="text-muted-foreground">Already have an account? </span>
        <Link href="/account/login" className="font-medium text-brand-ink underline underline-offset-2">
          Sign in
        </Link>
      </div>
    </main>
  )
}
