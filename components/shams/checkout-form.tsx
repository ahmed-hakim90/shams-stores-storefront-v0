'use client'
import { useRef, useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { useInteractions } from './interaction-provider'
import { useAuth, type SavedAddress } from './auth-provider'
import { BrowserCommerceError, commerceFetch } from '@/lib/commerce/browser'
import type { Address, CheckoutResult } from '@/lib/commerce/types'
import type { PaymentIntentClient } from '@/lib/payments/paymob/types'
import { formatEgp } from '@/lib/commerce'
import { PaymobPixel } from './payments/paymob-pixel'
import { MapPin, Plus, User, Lock, Eye, EyeOff } from 'lucide-react'

const CARD_METHOD = 'paymob-card'
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
  const { user, login, register: registerUser, addAddress } = useAuth()
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
  const submitting = useRef(false)

  const config = useQuery({
    queryKey: ['checkout-config'],
    queryFn: () =>
      commerceFetch<{
        enabled: boolean
        paymob: boolean
        verifiedMethods: string[]
        states: { code: string; name: string }[]
      }>('/api/commerce/checkout'),
  })

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
    const required: (keyof Address)[] = ['firstName', 'phone', 'address1', 'city', 'state']
    if (required.includes(key) && !value.trim()) {
      setFieldErrors((prev) => ({ ...prev, [key]: 'This field is required' }))
      return false
    }
    if (key === 'phone' && value && !/^01[0-9]{9}$/.test(value)) {
      setFieldErrors((prev) => ({ ...prev, [key]: 'Invalid phone number' }))
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
    const required: (keyof Address)[] = ['firstName', 'phone', 'address1', 'city', 'state']
    const errors: FieldErrors = {}
    for (const key of required) {
      if (!address[key].trim()) {
        errors[key] = 'This field is required'
      }
    }
    if (address.phone && !/^01[0-9]{9}$/.test(address.phone)) {
      errors.phone = 'Invalid phone number'
    }
    setFieldErrors(errors)
    setTouched(new Set(Object.keys(address)))
    return Object.keys(errors).length === 0
  }

  const selectSavedAddress = (addrId: string) => {
    if (!user) return
    const saved = user.addresses.find((a) => a.id === addrId)
    if (saved) {
      setAddress(savedToAddress(saved))
      setSelectedAddressId(addrId)
      setSaved(false)
      setFieldErrors({})
    }
  }

  const wooMethods = (cart?.paymentMethods ?? []).filter((x) =>
    config.data?.verifiedMethods.includes(x),
  )
  const names = (id: string) =>
    id === 'cod'
      ? 'Cash on delivery'
      : id === 'bacs'
        ? 'InstaPay / bank transfer'
        : id.includes('installment')
          ? 'Bank installments'
          : 'Pay securely by card'

  const inputClass = (key: keyof Address) =>
    `mt-1.5 min-h-11 w-full rounded-(--radius-control) border bg-background px-3 text-sm font-normal transition-colors ${
      fieldErrors[key] && touched.has(key)
        ? 'border-red-400 focus:border-red-500'
        : 'focus:border-brand'
    }`

  const field = (
    key: keyof Address,
    label: string,
    type = 'text',
    autoComplete?: string,
    required = true,
  ) => (
    <label className="block text-sm font-medium">
      <span className="flex items-center gap-1">
        {label}
        {required && <span className="text-red-500">*</span>}
      </span>
      <input
        required={required}
        type={type}
        autoComplete={autoComplete}
        value={address[key]}
        onChange={(e) => change(key, e.target.value)}
        onBlur={() => blur(key)}
        className={inputClass(key)}
      />
      {fieldErrors[key] && touched.has(key) && (
        <span className="mt-1 block text-xs text-red-600">{fieldErrors[key]}</span>
      )}
    </label>
  )

  const deliveryReady =
    saved && (!cart?.needsShipping || cart.rates.some((r) => r.selected))

  const handleAddressSubmit = async () => {
    if (!validateAll()) return
    setError('')
    try {
      await mutateCart({ action: 'address', address })
      setSaved(true)
      if (saveAddr && user) {
        addAddress(addressToSaved(address, `${address.address1}, ${address.city}`))
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Please check your address.')
    }
  }

  const handleRegisterAndSubmit = async () => {
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
      const result = await registerUser({
        name: `${address.firstName} ${address.lastName}`.trim(),
        email: address.email,
        phone: address.phone,
        password: regPassword,
      })
      if (!result.success) {
        setError(result.error || 'An error occurred creating your account')
        return
      }
      setShowRegister(false)
    }
    await handleAddressSubmit()
  }

  const startPayment = async () => {
    if (submitting.current) return
    submitting.current = true
    setPending(true)
    setError('')
    try {
      if (method === CARD_METHOD) {
        const result = await commerceFetch<PaymentIntentClient>(
          '/api/payments/intention',
          {
            method: 'POST',
            body: JSON.stringify({ address }),
          },
        )
        setIntent(result)
      } else {
        const result = await commerceFetch<CheckoutResult>(
          '/api/commerce/checkout',
          {
            method: 'POST',
            body: JSON.stringify({ address, paymentMethod: method }),
          },
        )
        window.location.assign(result.redirectUrl ?? '/order/success')
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
          amountLabel={formatEgp(intent.amountCents / 100)}
          onCompleted={() => window.location.assign('/order/success')}
          onError={(message) => setError(message)}
        />
        {error && (
          <p
            role="alert"
            className="rounded-(--radius-control) bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </p>
        )}
        <p className="text-xs leading-5 text-muted-foreground">
          After your bank authenticates the payment you will be returned to
          Shams. Your order is confirmed only once your payment is verified —
          never close this page before that happens.
        </p>
      </div>
    )

  return (
    <div>
      {!user && (
        <div className="mb-4 flex items-center gap-3 rounded-(--radius-control) border bg-card p-3 text-sm">
          <User className="size-4 shrink-0 text-brand-ink" />
          <span className="flex-1">
            Have an account?{' '}
            <Link href="/account/login" className="font-medium text-brand-ink underline underline-offset-2">
              Sign in
            </Link>
          </span>
        </div>
      )}

      {user && user.addresses.length > 0 && (
        <section className="mb-4">
          <h2 className="mb-2 text-sm font-semibold">Saved addresses</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {user.addresses.map((addr) => (
              <button
                key={addr.id}
                type="button"
                onClick={() => selectSavedAddress(addr.id)}
                className={`flex items-start gap-2 rounded-(--radius-control) border p-3 text-right text-sm transition-colors ${
                  selectedAddressId === addr.id
                    ? 'border-brand bg-brand/5'
                    : 'hover:border-brand'
                }`}
              >
                <MapPin className="mt-0.5 size-4 shrink-0 text-brand-ink" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">
                    {addr.address1}, {addr.city}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">{addr.phone}</p>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      <form
        onSubmit={async (e) => {
          e.preventDefault()
          await handleRegisterAndSubmit()
        }}
        className="space-y-4"
      >
        <section>
          <h2 className="mb-3 text-sm font-semibold">Contact details</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {field('firstName', 'First name', 'text', 'given-name')}
            {field('lastName', 'Last name', 'text', 'family-name')}
            {field('email', 'Email', 'email', 'email', false)}
            {field('phone', 'Phone number', 'tel', 'tel')}
          </div>
        </section>

        <section className="border-t pt-4">
          <h2 className="mb-3 text-sm font-semibold">Delivery address</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm font-medium">
              <span className="flex items-center gap-1">
                Governorate <span className="text-red-500">*</span>
              </span>
              <select
                required
                value={address.state}
                onChange={(e) => change('state', e.target.value)}
                onBlur={() => blur('state')}
                className={inputClass('state')}
              >
                <option value="">Select governorate</option>
                {config.data?.states.map((s) => (
                  <option key={s.code} value={s.code}>
                    {s.name}
                  </option>
                ))}
              </select>
              {fieldErrors.state && touched.has('state') && (
                <span className="mt-1 block text-xs text-red-600">{fieldErrors.state}</span>
              )}
            </label>
            {field('city', 'City / Area', 'text', 'address-level2')}
            <div className="sm:col-span-2">
              {field('address1', 'Street address', 'text', 'address-line1')}
            </div>
            <div className="sm:col-span-2">
              {field('address2', 'Apartment / Floor / Landmark', 'text', 'address-line2', false)}
            </div>
            {field('postcode', 'Postal code', 'text', 'postal-code', false)}
          </div>
        </section>

        {user && (
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={saveAddr}
              onChange={(e) => setSaveAddr(e.target.checked)}
              className="size-4 accent-brand"
            />
            Save address to my account
          </label>
        )}

        {!user && (
          <div className="border-t pt-4">
            {!showRegister ? (
              <button
                type="button"
                onClick={() => setShowRegister(true)}
                className="flex items-center gap-2 text-sm font-medium text-brand-ink"
              >
                <Plus className="size-4" />
                Create an account at checkout
              </button>
            ) : (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold">Create account</h3>
                <p className="text-xs text-muted-foreground">
                  Set a password to save your address and track orders
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block text-sm font-medium">
                    <span className="flex items-center gap-1">
                      <Lock className="size-3" /> Password
                    </span>
                    <div className="relative mt-1.5">
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        autoComplete="new-password"
                        placeholder="At least 6 characters"
                        className="min-h-11 w-full rounded-(--radius-control) border bg-background px-3 pr-3 text-sm font-normal"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      >
                        {showRegPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                      </button>
                    </div>
                  </label>
                  <label className="block text-sm font-medium">
                    Confirm password
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      value={regConfirm}
                      onChange={(e) => setRegConfirm(e.target.value)}
                      autoComplete="new-password"
                      placeholder="Re-enter password"
                      className="mt-1.5 min-h-11 w-full rounded-(--radius-control) border bg-background px-3 text-sm font-normal"
                    />
                  </label>
                </div>
                <button
                  type="button"
                  onClick={() => setShowRegister(false)}
                  className="text-xs text-muted-foreground underline"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={cartPending || !config.data?.states.length}
          className="min-h-11 rounded-(--radius-control) border border-brand px-5 text-sm font-semibold text-brand-ink"
        >
          {cartPending
            ? 'Calculating delivery…'
            : saved
              ? 'Update delivery details'
              : 'Calculate delivery'}
        </button>
      </form>

      {saved && (
        <section className="mt-4 border-t pt-4">
          <h2 className="mb-2 text-sm font-semibold">Delivery options</h2>
          {cart?.rates.length ? (
            cart.rates.map((rate) => (
              <label
                key={rate.id}
                className="mb-2 flex min-h-12 items-center gap-3 rounded-(--radius-control) border p-3 text-sm"
              >
                <input
                  type="radio"
                  className="size-4 accent-brand"
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
                <span className="flex-1">{rate.name}</span>
                <span>{formatEgp(rate.price)}</span>
              </label>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              No delivery method is available for this address. Please check the
              area or contact Shams.
            </p>
          )}
        </section>
      )}
      <section className="mt-4 border-t pt-4">
        <h2 className="mb-2 text-sm font-semibold">Payment</h2>
        {config.data?.paymob && (
          <label className="mb-2 flex min-h-12 items-center gap-3 rounded-(--radius-control) border p-3 text-sm">
            <input
              type="radio"
              className="size-4 accent-brand"
              name="payment"
              checked={method === CARD_METHOD}
              onChange={() => setMethod(CARD_METHOD)}
            />
            Credit / debit card
          </label>
        )}
        {config.data?.enabled ? (
          wooMethods.map((id) => (
            <label
              key={id}
              className="mb-2 flex min-h-12 items-center gap-3 rounded-(--radius-control) border p-3 text-sm"
            >
              <input
                type="radio"
                className="size-4 accent-brand"
                name="payment"
                checked={method === id}
                onChange={() => setMethod(id)}
              />
              {names(id)}
            </label>
          ))
        ) : (
          !config.data?.paymob && (
            <p className="rounded-(--radius-control) bg-muted/40 p-3 text-sm leading-6 text-muted-foreground">
              Online checkout is being prepared. Your cart is saved while you
              continue exploring.
            </p>
          )
        )}
      </section>
      {error && (
        <div className="mt-3 space-y-3">
          <p
            role="alert"
            className="rounded-(--radius-control) bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </p>
          <div className="flex flex-wrap gap-2">
            {!uncertain && (
              <button
                onClick={() => { setError(''); startPayment() }}
                disabled={pending}
                className="min-h-9 rounded-(--radius-control) bg-brand px-4 text-xs font-semibold text-brand-foreground disabled:opacity-60"
              >
                Try again
              </button>
            )}
            <button
              onClick={() => { setError(''); setMethod('') }}
              className="min-h-9 rounded-(--radius-control) border px-4 text-xs font-medium"
            >
              Choose different method
            </button>
            <Link
              href="/support"
              className="inline-flex min-h-9 items-center px-2 text-xs font-medium text-brand-ink underline underline-offset-2"
            >
              Contact support
            </Link>
          </div>
        </div>
      )}
      {config.isError && (
        <button
          onClick={() => config.refetch()}
          className="mt-3 min-h-11 text-brand-ink"
        >
          Retry checkout options
        </button>
      )}
      <button
        disabled={
          uncertain ||
          !method ||
          !deliveryReady ||
          pending ||
          cartPending ||
          (method === CARD_METHOD
            ? !config.data?.paymob
            : !config.data?.enabled)
        }
        onClick={startPayment}
        className="mt-4 min-h-12 w-full rounded-(--radius-control) bg-brand px-6 text-sm font-semibold text-brand-foreground disabled:bg-muted disabled:text-muted-foreground"
      >
        {pending
          ? 'Preparing secure payment…'
          : method === CARD_METHOD
            ? `Pay ${formatEgp(cart?.total ?? 0)}`
            : 'Place order'}
      </button>
    </div>
  )
}
