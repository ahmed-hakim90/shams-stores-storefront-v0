'use client'
import { useState } from 'react'
import { User, Lock, Eye, EyeOff, X, Mail, ArrowRight, Plus } from 'lucide-react'
import { useAuth } from '@/components/shams/providers'

export function GuestCheckout({
  user,
  showRegister,
  setShowRegister,
}: {
  user: { addresses: { id: string }[] } | null
  showRegister: boolean
  setShowRegister: (show: boolean) => void
}) {
  const { login } = useAuth()
  const [showLogin, setShowLogin] = useState(false)
  const [loginId, setLoginId] = useState('')
  const [loginPw, setLoginPw] = useState('')
  const [showLoginPw, setShowLoginPw] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [loginPending, setLoginPending] = useState(false)
  const [regPassword, setRegPassword] = useState('')
  const [regConfirm, setRegConfirm] = useState('')
  const [showRegPassword, setShowRegPassword] = useState(false)

  const handleLogin = async () => {
    if (!loginId.trim()) { setLoginError('Enter your email or phone'); return }
    if (!loginPw) { setLoginError('Enter your password'); return }
    setLoginPending(true)
    setLoginError('')
    const result = await login(loginId, loginPw)
    setLoginPending(false)
    if (result.success) {
      setShowLogin(false)
      setLoginId('')
      setLoginPw('')
    } else {
      setLoginError(result.error || 'Invalid credentials')
    }
  }

  if (user) return null

  return (
    <>
      {!showLogin && (
        <div className="flex items-center gap-2 rounded-(--radius-control) border bg-card px-3 py-2 text-xs">
          <User className="size-3.5 shrink-0 text-brand-ink" />
          <span className="flex-1">
            Have an account?{' '}
            <button type="button" onClick={() => setShowLogin(true)} className="font-medium text-brand-ink underline underline-offset-2">
              Sign in
            </button>
          </span>
        </div>
      )}

      {showLogin && (
        <div className="space-y-2 rounded-(--radius-control) border bg-card p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold">Sign in to your account</span>
            <button type="button" onClick={() => { setShowLogin(false); setLoginError('') }} className="text-muted-foreground">
              <X className="size-3.5" />
            </button>
          </div>
          {loginError && (
            <p role="alert" className="rounded-(--radius-control) bg-danger-muted p-2 text-[11px] text-danger">{loginError}</p>
          )}
          <label className="block text-xs font-medium">
            Email
            <div className="relative mt-1">
              <Mail className="pointer-events-none absolute left-2 top-1/2 size-3 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                autoComplete="username"
                placeholder="example@email.com"
                className="min-h-9 w-full rounded-(--radius-control) border bg-background py-1.5 pr-2.5 pl-7 text-sm"
              />
            </div>
          </label>
          <label className="block text-xs font-medium">
            Password
            <div className="relative mt-1">
              <Lock className="pointer-events-none absolute left-2 top-1/2 size-3 -translate-y-1/2 text-muted-foreground" />
              <input
                type={showLoginPw ? 'text' : 'password'}
                value={loginPw}
                onChange={(e) => setLoginPw(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleLogin() }}
                autoComplete="current-password"
                placeholder="••••••••"
                className="min-h-9 w-full rounded-(--radius-control) border bg-background py-1.5 pr-7 pl-7 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowLoginPw(!showLoginPw)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showLoginPw ? <EyeOff className="size-3" /> : <Eye className="size-3" />}
              </button>
            </div>
          </label>
          <button
            type="button"
            onClick={handleLogin}
            disabled={loginPending}
            className="flex w-full items-center justify-center gap-1.5 rounded-(--radius-control) bg-brand py-2 text-xs font-semibold text-brand-foreground disabled:opacity-60"
          >
            {loginPending ? 'Signing in…' : 'Sign in'}
            <ArrowRight className="size-3" />
          </button>
        </div>
      )}

      {!showRegister && (
        <button
          type="button"
          onClick={() => setShowRegister(true)}
          className="flex items-center gap-1.5 text-xs font-medium text-brand-ink"
        >
          <Plus className="size-3" />
          Create account
        </button>
      )}

      {showRegister && (
        <div className="space-y-2 rounded-(--radius-control) border p-2.5">
          <div className="grid gap-2 sm:grid-cols-2">
            <label className="block text-xs font-medium">
              <span className="flex items-center gap-0.5"><Lock className="size-2.5" /> Password</span>
              <div className="relative mt-1">
                <input
                  type={showRegPassword ? 'text' : 'password'}
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  autoComplete="new-password"
                  placeholder="6+ characters"
                  className="min-h-9 w-full rounded-(--radius-control) border bg-background px-2.5 pr-7 text-sm font-normal"
                />
                <button
                  type="button"
                  onClick={() => setShowRegPassword(!showRegPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showRegPassword ? <EyeOff className="size-3" /> : <Eye className="size-3" />}
                </button>
              </div>
            </label>
            <label className="block text-xs font-medium">
              Confirm
              <input
                type={showRegPassword ? 'text' : 'password'}
                value={regConfirm}
                onChange={(e) => setRegConfirm(e.target.value)}
                autoComplete="new-password"
                placeholder="Re-enter"
                className="mt-1 min-h-9 w-full rounded-(--radius-control) border bg-background px-2.5 text-sm font-normal"
              />
            </label>
          </div>
          <button
            type="button"
            onClick={() => setShowRegister(false)}
            className="text-[11px] text-muted-foreground underline"
          >
            Cancel
          </button>
        </div>
      )}
    </>
  )
}
