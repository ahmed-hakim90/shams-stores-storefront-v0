'use client'

import { BankTransferDetails } from '@/components/shams/payments/bank-transfer-details'
import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { checkoutErrors, requiredCheckoutFields as requiredFields } from '@/lib/commerce/checkout-validation'
import { useCheckoutConfig } from '@/components/shams/payments/use-checkout-config'
import { useInteractions, useAuth, type SavedAddress } from '@/components/shams/providers'
import { BrowserCommerceError, commerceFetch } from '@/lib/commerce/browser'
import type { Address, CheckoutResult } from '@/lib/commerce/types'
import type { PaymentIntentClient } from '@/lib/payments/paymob/types'
import { formatEgp } from '@/lib/commerce'
import { PaymobPixel, preloadPaymobPixel } from '@/components/shams/payments'
import { Plus, User, Lock, Eye, EyeOff, X, Mail, ArrowRight, Banknote, Building2, CreditCard, Calendar } from 'lucide-react'

const isPaymob = (method: string) => method === 'paymob-card' || method === 'paymob-installments'
const empty: Address = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  country: 'EG',
  state: '',
  city: '',
  address1: '',
  address2: '',
  postcode: '',
}

type FieldErrors = Partial<Record<keyof Address | 'password' | 'confirmPassword', string>>

function addressToSaved(addr: Address, label: string): Omit<SavedAddress, 'id'> {
  return {
    label,
    firstName: addr.firstName,
    lastName: addr.lastName,
    phone: addr.phone,
    governorate: addr.state,
    city: addr.city,
    address1: addr.address1,
    address2: addr.address2,
    postcode: addr.postcode,
    isDefault: false,
  }
}

function savedToAddress(s: SavedAddress): Address {
  return {
    firstName: s.firstName,
    lastName: s.lastName,
    email: '',
    phone: s.phone,
    country: 'EG',
    state: s.governorate,
    city: s.city,
    address1: s.address1,
    address2: s.address2,
    postcode: s.postcode,
  }
}

export function CheckoutForm() {
  const { cart, mutateCart, cartPending } = useInteractions()
  const { user, addAddress, login } = useAuth()
  const [address, setAddress] = useState(empty)
  const [method, setMethod] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const [uncertain, setUncertain] = useState(false)
  const [saved, setSaved] = useState(false)
  const [intent, setIntent] = useState<PaymentIntentClient | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [touched, setTouched] = useState<Set<string>>(new Set())
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  const [showRegister, setShowRegister] = useState(false)
  const [regPassword, setRegPassword] = useState('')
  const [regConfirm, setRegConfirm] = useState('')
  const [showRegPassword, setShowRegPassword] = useState(false)
  const [saveAddr, setSaveAddr] = useState(!!user)
  const [showLogin, setShowLogin] = useState(false)
  const [loginId, setLoginId] = useState('')
  const [loginPw, setLoginPw] = useState('')
  const [showLoginPw, setShowLoginPw] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [loginPending, setLoginPending] = useState(false)
  const submitting = useRef(false)
  const addressRef = useRef(address)
  addressRef.current = address

  const config = useCheckoutConfig()

  const change = (key: keyof Address, value: string) => {
    setAddress((a) => ({ ...a, [key]: value }))
    setSaved(false)
    if (touched.has(key)) {
      setFieldErrors((prev) => {
        const next = { ...prev }
        delete next[key]
        return next
      })
    }
  }

  const blur = (key: keyof Address) => {
    setTouched((prev) => new Set(prev).add(key))
    validateField(key, address[key])
  }

  const validateField = (key: keyof Address, value: string) => {
    if (requiredFields.includes(key) && !value.trim()) {
      setFieldErrors((prev) => ({ ...prev, [key]: 'Required' }))
      return false
    }
    if (key === 'phone' && value && !/^01[0-9]{9}$/.test(value)) {
      setFieldErrors((prev) => ({ ...prev, [key]: 'Invalid phone' }))
      return false
    }
    setFieldErrors((prev) => {
      const next = { ...prev }
      delete next[key]
      return next
    })
    return true
  }

  const validateAll = (): boolean => {
    const errors = checkoutErrors(address)
    if (isPaymob(method)) {
      if (!address.lastName.trim()) errors.lastName = 'Required for online payment'
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address.email.trim())) errors.email = 'Enter an email for your payment receipt'
    }
    setFieldErrors(errors)
    setTouched(new Set(Object.keys(address)))
    const first = Object.keys(errors)[0]
    if (first) document.getElementById(`checkout-${first}`)?.focus()
    return !first
  }

  const selectSavedAddress = (addrId: string) => {
    if (!user) return
    const a = user.addresses.find((x) => x.id === addrId)
    if (a) {
      setAddress(savedToAddress(a))
      setSelectedAddressId(addrId)
      setSaved(false)
      setFieldErrors({})
    }
  }

  const wooMethods = (cart?.paymentMethods ?? []).filter((x) =>
    !x.startsWith('paymob') && config.data?.verifiedMethods.includes(x),
  )
  const names = (id: string) =>
    id === 'cod'
      ? 'Cash on delivery'
      : id === 'bacs'
        ? 'InstaPay / bank transfer'
        : id.includes('installment')
          ? 'Bank installments'
          : 'Pay securely by card'

  const paymentIcon = (id: string) =>
    id === 'cod'
      ? Banknote
      : id === 'bacs'
        ? Building2
        : id.includes('installment')
          ? Calendar
          : CreditCard

  const inputClass = (key: keyof Address) =>
    `mt-1 min-h-9 w-full rounded-(--radius-control) border bg-white px-2.5 text-sm font-normal transition-colors ${
      fieldErrors[key] && touched.has(key)
        ? 'border-danger focus:border-danger'
        : 'focus:border-brand'
    }`

  const field = (
    key: keyof Address,
    label: string,
    type = 'text',
    autoComplete?: string,
    required = true,
  ) => (
    <label className="block text-xs font-medium">
      <span className="flex items-center gap-0.5">
        {label}
        {required && <span className="text-danger">*</span>}
      </span>
      <input
        id={`checkout-${key}`}
        aria-invalid={!!fieldErrors[key]}
        aria-describedby={fieldErrors[key] ? `checkout-error-${key}` : undefined}
        required={required}
        type={type}
        autoComplete={autoComplete}
        value={address[key]}
        onChange={(e) => change(key, e.target.value)}
        onBlur={() => blur(key)}
        className={inputClass(key)}
      />
      {fieldErrors[key] && touched.has(key) && (
        <span id={`checkout-error-${key}`} role="alert" className="mt-0.5 block text-[11px] text-danger">{fieldErrors[key]}</span>
      )}
    </label>
  )

  const deliveryReady =
    saved && (!cart?.needsShipping || cart.rates.some((r) => r.selected))

  const submitAddress = useCallback(async (addr: Address, doSaveAddr: boolean) => {
    setError('')
    try {
      await mutateCart({ action: 'address', address: addr })
      setSaved(true)
      if (doSaveAddr && user) {
        await addAddress(addressToSaved(addr, `${addr.address1}, ${addr.city}`))
      }
      return true
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Please check your address.')
      return false
    }
  }, [mutateCart, user, addAddress])

  const handleFormSubmit = async () => {
    if (showRegister) {
      if (regPassword.length < 6) {
        setError('Password must be at least 6 characters')
        return
      }
      if (regPassword !== regConfirm) {
        setError('Passwords do not match')
        return
      }
      if (!address.email) {
        setError('Enter an email to create an account')
        return
      }
    }
    if (!validateAll()) return
    return submitAddress(addressRef.current, saveAddr)
  }

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

  const startPayment = async () => {
    if (submitting.current || uncertain) return
    if (!validateAll()) { setError('Please complete the highlighted fields.'); return }
    if (cartPending) { setError('Delivery is updating. Please try again when it finishes.'); return }
    if (!saved) { if (await handleFormSubmit()) setError('Review the delivery and payment options, then confirm your order.'); return }
    if (!deliveryReady) { setError('Choose an available delivery option before confirming.'); return }
    if (!method) { setError('Choose a payment method before confirming.'); return }
    if (isPaymob(method) ? !config.data?.paymob : !config.data?.enabled) { setError('This payment method is currently unavailable. Choose another method or retry checkout options.'); return }
    submitting.current = true
    setPending(true)
    setError('')
    try {
      if (isPaymob(method)) {
        const result = await commerceFetch<PaymentIntentClient>(
          '/api/payments/intention',
          {
            method: 'POST',
            body: JSON.stringify({ address, paymentMethod: method }),
          },
        )
        setIntent(result)
      } else {
        await commerceFetch<CheckoutResult>(
          '/api/commerce/checkout',
          {
            method: 'POST',
            body: JSON.stringify({ address, paymentMethod: method }),
          },
        )
        window.location.assign('/order/success')
      }
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'We could not confirm your order.',
      )
      setPending(false)
      if (
        e instanceof BrowserCommerceError &&
        ['NETWORK_ERROR', 'SERVER_ERROR', 'UNKNOWN'].includes(e.code)
      ) {
        setUncertain(true)
        setError(
          'We could not confirm the result. Contact Shams before trying again to avoid a duplicate order.',
        )
      } else submitting.current = false
    }
  }

  if (intent)
    return (
      <div className="space-y-3">
        <PaymobPixel
          clientSecret={intent.clientSecret}
          publicKey={intent.publicKey}
          method={intent.method}
          pixelMethods={intent.pixelMethods}
          amountLabel={formatEgp(intent.amountCents / 100)}
          onCompleted={() => window.location.assign('/order/success')}
          onError={(message) => setError(message)}
        />
        {method === 'bacs' && config.data?.enabled && wooMethods.includes('bacs') && <BankTransferDetails />}

      {error && (
          <p
            role="alert"
            className="rounded-(--radius-control) bg-danger-muted p-3 text-sm text-danger"
          >
            {error}
          </p>
        )}
        <p className="text-xs leading-5 text-muted-foreground">
          After your bank authenticates the payment you will be returned to
          Shams. Your order is confirmed only once your payment is verified.
        </p>
      </div>
    )

  return (
    <div className="space-y-3">
      {!user && !showLogin && (
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

      {!user && showLogin && (
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

      {user && user.addresses.length > 0 && (
        <div className="flex gap-2 overflow-x-auto">
          {user.addresses.map((addr) => (
            <button
              key={addr.id}
              type="button"
              onClick={() => selectSavedAddress(addr.id)}
              className={`flex shrink-0 items-center gap-1.5 rounded-(--radius-control) border px-2.5 py-1.5 text-xs transition-colors ${
                selectedAddressId === addr.id
                  ? 'border-brand bg-brand/5'
                  : 'hover:border-brand'
              }`}
            >
              <span className="truncate font-medium">{addr.address1}, {addr.city}</span>
            </button>
          ))}
        </div>
      )}

      <div className="grid gap-2 sm:grid-cols-2">
        {field('firstName', 'First name', 'text', 'given-name')}
        {field('lastName', 'Last name', 'text', 'family-name', isPaymob(method))}
        {field('phone', 'Phone', 'tel', 'tel')}
        {(isPaymob(method) || showRegister) && field('email', 'Email', 'email', 'email', true)}
        <label className="text-xs font-medium">
          <span className="flex items-center gap-0.5">
            Governorate <span className="text-danger">*</span>
          </span>
          <select
                id="checkout-state"
                aria-invalid={!!fieldErrors.state}
            required
            value={address.state}
            onChange={(e) => change('state', e.target.value)}
            onBlur={() => blur('state')}
            className={inputClass('state')}
          >
            <option value="">Select</option>
            {config.data?.states.map((s) => (
              <option key={s.code} value={s.code}>{s.name}</option>
            ))}
          </select>
          {fieldErrors.state && touched.has('state') && (
            <span className="mt-0.5 block text-[11px] text-danger">{fieldErrors.state}</span>
          )}
        </label>
        {field('city', 'City', 'text', 'address-level2')}
        <div className="sm:col-span-2">{field('address1', 'Street address', 'text', 'address-line1')}</div>
        <div className="sm:col-span-2">{field('address2', 'Apt / Floor / Landmark', 'text', 'address-line2', false)}</div>
      </div>

      {user && (
        <label className="flex items-center gap-1.5 text-xs">
          <input
            type="checkbox"
            checked={saveAddr}
            onChange={(e) => setSaveAddr(e.target.checked)}
            className="size-3.5 accent-brand"
          />
          Save to my account
        </label>
      )}

      {!user && !showRegister && (
        <button
          type="button"
          onClick={() => setShowRegister(true)}
          className="flex items-center gap-1.5 text-xs font-medium text-brand-ink"
        >
          <Plus className="size-3" />
          Create account
        </button>
      )}

      {!user && showRegister && (
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

      {!saved && <button type="button" onClick={handleFormSubmit} disabled={cartPending} className="min-h-11 rounded-(--radius-control) border px-4 text-sm font-medium hover:bg-brand-muted">{cartPending ? 'Updating delivery…' : 'Update delivery options'}</button>}
      {cartPending && saved && (
        <p className="text-xs text-muted-foreground">Updating delivery…</p>
      )}

      {saved && cart?.rates.length ? (
        <div className="space-y-2">
          <p className="text-xs font-medium">Delivery method</p>
          <div className="flex flex-col gap-1.5 sm:flex-row sm:flex-wrap">
            {cart.rates.map((rate) => (
              <label
                key={rate.id}
                className={`flex cursor-pointer items-center gap-2 rounded-(--radius-control) border px-3 py-2 text-xs transition-colors ${
                  rate.selected ? 'border-brand bg-brand/5' : 'hover:border-brand'
                }`}
              >
                <input
                  type="radio"
                  className="size-3.5 accent-brand"
                  name={`shipping-${rate.packageId}`}
                  checked={rate.selected}
                  onChange={() =>
                    void mutateCart({
                      action: 'shipping',
                      rateId: rate.id,
                      packageId: rate.packageId,
                    }).catch((e) => setError(e.message))
                  }
                />
                <span>{rate.name}</span>
                <span className="font-semibold">{formatEgp(rate.price)}</span>
              </label>
            ))}
          </div>
        </div>
      ) : saved && !cart?.rates.length ? (
        <p className="text-xs text-muted-foreground">
          No delivery methods for this area.{' '}
          <Link href="/support" className="text-brand-ink underline">Contact Shams</Link>
        </p>
      ) : null}

      <div className="space-y-2">
        <p className="text-xs font-medium">Payment method</p>
        <div className="flex flex-col gap-1.5 sm:flex-row sm:flex-wrap">
          {config.data?.paymobOptions?.map((option) => {
            const Icon = option.kind === 'installments' ? Calendar : CreditCard
            return (
              <label key={option.id} className={`flex min-h-20 cursor-pointer items-start gap-3 rounded-(--radius-control) border p-3 text-sm transition-colors sm:flex-1 ${method === option.id ? 'border-brand bg-brand/5' : 'hover:border-brand'}`}>
                <input type="radio" name="payment" className="mt-1 size-4 accent-brand" checked={method === option.id} onChange={() => { setMethod(option.id); preloadPaymobPixel() }} />
                <Icon className="mt-0.5 size-5 shrink-0 text-brand-ink" />
                <span><span className="block font-semibold">{option.title}</span><span className="mt-1 block text-xs leading-5 text-muted-foreground">{option.description}</span></span>
              </label>
            )
          })}
          {config.data?.paymobUnavailable && <p role="status" className="text-xs text-muted-foreground">Online payment options could not load. Refresh checkout options or contact Shams.</p>}
          {config.data?.enabled && wooMethods.map((id) => {
            const Icon = paymentIcon(id)
            return (
              <label
                key={id}
                className={`flex cursor-pointer items-center gap-2 rounded-(--radius-control) border px-3 py-2 text-xs transition-colors ${
                  method === id ? 'border-brand bg-brand/5' : 'hover:border-brand'
                }`}
              >
                <input
                  type="radio"
                  className="size-3.5 accent-brand"
                  name="payment"
                  checked={method === id}
                  onChange={() => setMethod(id)}
                />
                <Icon className="size-4 shrink-0" />
                <span>{names(id)}</span>
              </label>
            )
          })}
          {!config.data?.paymob && !config.data?.enabled && (
            <p className="text-xs text-muted-foreground">
              Online checkout is being prepared.
            </p>
          )}
        </div>
      </div>

      {method === 'bacs' && config.data?.enabled && wooMethods.includes('bacs') && <BankTransferDetails />}

      {error && (
        <div className="space-y-2">
          <p role="alert" className="rounded-(--radius-control) bg-danger-muted p-2.5 text-xs text-danger">
            {error}
          </p>
          <div className="flex flex-wrap gap-2">
            {!uncertain && (
              <button
                onClick={() => { setError(''); startPayment() }}
                disabled={pending}
                className="min-h-8 rounded-(--radius-control) bg-brand px-3 text-xs font-semibold text-brand-foreground disabled:opacity-60"
              >
                Try again
              </button>
            )}
            <button
              onClick={() => { setError(''); setMethod('') }}
              className="min-h-8 rounded-(--radius-control) border px-3 text-xs"
            >
              Change method
            </button>
            <Link
              href="/support"
              className="inline-flex min-h-8 items-center px-1 text-xs text-brand-ink underline underline-offset-2"
            >
              Support
            </Link>
          </div>
        </div>
      )}

      {config.isError && (
        <button onClick={() => config.refetch()} className="text-xs text-brand-ink">
          Retry checkout options
        </button>
      )}

      <button
        disabled={uncertain || pending}
        onClick={startPayment}
        className="min-h-11 w-full rounded-(--radius-control) bg-brand px-6 text-sm font-semibold text-brand-foreground disabled:bg-muted disabled:text-muted-foreground"
      >
        {pending
          ? 'Preparing…'
          : isPaymob(method)
            ? `Pay ${formatEgp(cart?.total ?? 0)}`
            : `Place order · ${formatEgp(cart?.total ?? 0)}`}
      </button>
    </div>
  )
}
