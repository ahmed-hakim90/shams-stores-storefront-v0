'use client'
import { useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useInteractions } from './interaction-provider'
import { BrowserCommerceError, commerceFetch } from '@/lib/commerce/browser'
import type { Address, CheckoutResult } from '@/lib/commerce/types'
import { formatEgp } from '@/lib/commerce'
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
export function CheckoutForm() {
  const { cart, mutateCart, cartPending } = useInteractions(),
    [address, setAddress] = useState(empty),
    [method, setMethod] = useState(''),
    [error, setError] = useState(''),
    [pending, setPending] = useState(false),
    [uncertain, setUncertain] = useState(false),
    [saved, setSaved] = useState(false),
    submitting = useRef(false)
  const config = useQuery({
    queryKey: ['checkout-config'],
    queryFn: () =>
      commerceFetch<{
        enabled: boolean
        verifiedMethods: string[]
        states: { code: string; name: string }[]
      }>('/api/commerce/checkout'),
  })
  const change = (key: keyof Address, value: string) => {
    setAddress((a) => ({ ...a, [key]: value }))
    setSaved(false)
  }
  const methods = (cart?.paymentMethods ?? []).filter((x) =>
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
  const field = (
    key: keyof Address,
    label: string,
    type = 'text',
    autoComplete?: string,
    required = true,
  ) => (
    <label className="block text-sm font-medium">
      {label}
      <input
        required={required}
        type={type}
        autoComplete={autoComplete}
        value={address[key]}
        onChange={(e) => change(key, e.target.value)}
        className="mt-2 min-h-12 w-full rounded-lg border bg-background px-3 text-base font-normal"
      />
    </label>
  )
  return (
    <div>
      <form
        onSubmit={async (e) => {
          e.preventDefault()
          setError('')
          try {
            await mutateCart({ action: 'address', address })
            setSaved(true)
          } catch (e) {
            setError(
              e instanceof Error ? e.message : 'Please check your address.',
            )
          }
        }}
        className="space-y-6"
      >
        <section>
          <h2 className="mb-4 text-lg font-semibold">Contact details</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {field('firstName', 'First name', 'text', 'given-name')}
            {field('lastName', 'Last name', 'text', 'family-name')}
            {field('email', 'Email', 'email', 'email')}
            {field('phone', 'Mobile number', 'tel', 'tel')}
          </div>
        </section>
        <section className="border-t pt-6">
          <h2 className="mb-4 text-lg font-semibold">Delivery address</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium">
              Governorate
              <select
                required
                value={address.state}
                onChange={(e) => change('state', e.target.value)}
                className="mt-2 min-h-12 w-full rounded-lg border bg-background px-3 text-base font-normal"
              >
                <option value="">Choose governorate</option>
                {config.data?.states.map((s) => (
                  <option key={s.code} value={s.code}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>
            {field('city', 'City / area', 'text', 'address-level2')}
            <div className="sm:col-span-2">
              {field(
                'address1',
                'Street and building',
                'text',
                'address-line1',
              )}
            </div>
            <div className="sm:col-span-2">
              {field(
                'address2',
                'Apartment, floor or landmark',
                'text',
                'address-line2',
                false,
              )}
            </div>
          </div>
        </section>
        <button
          disabled={cartPending || !config.data?.states.length}
          className="min-h-12 rounded-lg border border-brand px-5 text-sm font-semibold text-brand-ink"
        >
          {cartPending
            ? 'Calculating delivery…'
            : saved
              ? 'Update delivery details'
              : 'Calculate delivery'}
        </button>
      </form>
      {saved && (
        <section className="mt-6 border-t pt-6">
          <h2 className="mb-3 text-lg font-semibold">Delivery options</h2>
          {cart?.rates.length ? (
            cart.rates.map((rate) => (
              <label
                key={rate.id}
                className="mb-3 flex min-h-14 items-center gap-3 rounded-lg border p-3 text-sm"
              >
                <input
                  type="radio"
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
      <section className="mt-6 border-t pt-6">
        <h2 className="mb-3 text-lg font-semibold">Payment</h2>
        {config.data?.enabled ? (
          methods.map((id) => (
            <label
              key={id}
              className="mb-3 flex min-h-14 items-center gap-3 rounded-lg border p-3 text-sm"
            >
              <input
                type="radio"
                name="payment"
                checked={method === id}
                onChange={() => setMethod(id)}
              />
              {names(id)}
            </label>
          ))
        ) : (
          <p className="rounded-lg bg-muted/40 p-4 text-sm leading-6 text-muted-foreground">
            Online checkout is being prepared. Your cart is saved while you
            continue exploring.
          </p>
        )}
      </section>
      {error && (
        <p
          role="alert"
          className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </p>
      )}
      {config.isError && (
        <button
          onClick={() => config.refetch()}
          className="mt-4 min-h-11 text-brand-ink"
        >
          Retry checkout options
        </button>
      )}
      <button
        disabled={
          uncertain ||
          !config.data?.enabled ||
          !method ||
          !saved ||
          pending ||
          cartPending ||
          (cart?.needsShipping && !cart.rates.some((r) => r.selected))
        }
        onClick={async () => {
          if (submitting.current) return
          submitting.current = true
          setPending(true)
          setError('')
          try {
            const result = await commerceFetch<CheckoutResult>(
              '/api/commerce/checkout',
              {
                method: 'POST',
                body: JSON.stringify({ address, paymentMethod: method }),
              },
            )
            window.location.assign(result.redirectUrl ?? '/order/success')
          } catch (e) {
            setError(
              e instanceof Error
                ? e.message
                : 'We could not confirm your order.',
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
        }}
        className="mt-6 min-h-12 w-full rounded-lg bg-brand px-6 text-sm font-semibold text-brand-foreground disabled:bg-muted disabled:text-muted-foreground"
      >
        {pending ? 'Confirming your order…' : 'Place order'}
      </button>
    </div>
  )
}
