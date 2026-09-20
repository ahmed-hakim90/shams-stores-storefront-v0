'use client'

import { BankTransferDetails } from '@/components/shams/payments/bank-transfer-details'
import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useCheckoutConfig } from '@/components/shams/payments/use-checkout-config'
import { useInteractions, useAuth, type SavedAddress } from '@/components/shams/providers'
import type { Address } from '@/lib/commerce/types'
import { formatEgp } from '@/lib/commerce'
import { PaymobPixel } from '@/components/shams/payments'
import { measureOaiq, trackInitiateCheckout } from '@/lib/tracking'
import { useCheckoutSubmit } from './use-checkout-submit'
import { CheckoutAddressForm } from './address-form'
import { CheckoutShippingSelect } from './shipping-select'
import { CheckoutPaymentSelect } from './payment-select'
import { GuestCheckout } from './guest-checkout'

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
  const { user, addAddress } = useAuth()
  const [address, setAddress] = useState(empty)
  const [method, setMethod] = useState('')
  const [saved, setSaved] = useState(false)
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  const [saveAddr, setSaveAddr] = useState(!!user)
  const [showRegister, setShowRegister] = useState(false)
  const [regPassword, setRegPassword] = useState('')
  const [regConfirm, setRegConfirm] = useState('')

  const config = useCheckoutConfig()

  const submit = useCheckoutSubmit({
    address,
    method,
    saved,
    deliveryReady: saved && (!cart?.needsShipping || cart.rates.some((r) => r.selected)),
    cartPending,
    cartTotal: cart?.total ?? 0,
    config: { data: config.data, isError: config.isError },
    mutateCart,
  })

  useEffect(() => {
    measureOaiq('initiate_checkout')
    trackInitiateCheckout()
  }, [])

  const change = (key: keyof Address, value: string) => {
    setAddress((a) => ({ ...a, [key]: value }))
    setSaved(false)
    if (submit.touched.has(key)) {
      submit.setFieldErrors((prev) => {
        const next = { ...prev }
        delete next[key]
        return next
      })
    }
  }

  const blur = (key: keyof Address) => {
    submit.setTouched((prev) => new Set(prev).add(key))
    submit.validateField(key, address[key])
  }

  const selectSavedAddress = (addrId: string) => {
    if (!user) return
    const a = user.addresses.find((x) => x.id === addrId)
    if (a) {
      setAddress(savedToAddress(a))
      setSelectedAddressId(addrId)
      setSaved(false)
      submit.setFieldErrors({})
    }
  }

  const wooMethods = (cart?.paymentMethods ?? []).filter((x) =>
    !x.startsWith('paymob') && config.data?.verifiedMethods.includes(x),
  )

  const submitAddress = useCallback(async (addr: Address, doSaveAddr: boolean) => {
    submit.setError('')
    try {
      await mutateCart({ action: 'address', address: addr })
      setSaved(true)
      if (doSaveAddr && user) {
        await addAddress(addressToSaved(addr, `${addr.address1}, ${addr.city}`))
      }
      return true
    } catch (e) {
      submit.setError(e instanceof Error ? e.message : 'Please check your address.')
      return false
    }
  }, [mutateCart, user, addAddress, submit])

  const handleFormSubmit = async () => {
    if (showRegister) {
      if (regPassword.length < 6) {
        submit.setError('Password must be at least 6 characters')
        return
      }
      if (regPassword !== regConfirm) {
        submit.setError('Passwords do not match')
        return
      }
      if (!address.email) {
        submit.setError('Enter an email to create an account')
        return
      }
    }
    if (!submit.validateAll()) return
    return submitAddress(address, saveAddr)
  }

  if (submit.intent)
    return (
      <div className="space-y-3">
        <PaymobPixel
          clientSecret={submit.intent.clientSecret}
          publicKey={submit.intent.publicKey}
          method={submit.intent.method}
          pixelMethods={submit.intent.pixelMethods}
          amountLabel={formatEgp(submit.intent.amountCents / 100)}
          onCompleted={() => window.location.assign('/order/success')}
          onError={(message) => submit.setError(message)}
        />
        {method === 'bacs' && config.data?.enabled && wooMethods.includes('bacs') && <BankTransferDetails />}

      {submit.error && (
          <p
            role="alert"
            className="rounded-(--radius-control) bg-danger-muted p-3 text-sm text-danger"
          >
            {submit.error}
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
      <GuestCheckout
        user={user}
        showRegister={showRegister}
        setShowRegister={setShowRegister}
      />

      <CheckoutAddressForm
        address={address}
        fieldErrors={submit.fieldErrors}
        touched={submit.touched}
        selectedAddressId={selectedAddressId}
        saveAddr={saveAddr}
        saved={saved}
        user={user}
        method={method}
        cartPending={cartPending}
        config={config}
        onChange={change}
        onBlur={blur}
        onSelectSavedAddress={selectSavedAddress}
        onSaveAddrChange={setSaveAddr}
        onSubmit={handleFormSubmit}
      />

      <CheckoutShippingSelect
        saved={saved}
        cart={cart}
        mutateCart={mutateCart}
        setError={submit.setError}
      />

      <CheckoutPaymentSelect
        method={method}
        setMethod={setMethod}
        uncertain={submit.uncertain}
        pending={submit.pending}
        paymobOptions={config.data?.paymobOptions}
        paymobUnavailable={config.data?.paymobUnavailable}
        wooMethods={wooMethods}
        paymobEnabled={config.data?.paymob}
        wooEnabled={config.data?.enabled}
      />

      {method === 'bacs' && config.data?.enabled && wooMethods.includes('bacs') && <BankTransferDetails />}

      {submit.error && (
        <div className="space-y-2">
          <p role="alert" className="rounded-(--radius-control) bg-danger-muted p-2.5 text-xs text-danger">
            {submit.error}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {!submit.uncertain && (
              <button
                onClick={() => { submit.setError(''); submit.startPayment() }}
                disabled={submit.pending}
                className="min-h-8 rounded-(--radius-control) bg-brand px-3 text-xs font-semibold text-brand-foreground disabled:opacity-60"
              >
                Try again
              </button>
            )}
            {!submit.uncertain && <button
              onClick={() => { submit.setError(''); setMethod('') }}
              className="min-h-8 rounded-(--radius-control) border px-3 text-xs"
            >
              Change method
            </button>}
            {submit.uncertain && submit.reviewOrderId && (
              <button
                type="button"
                onClick={() => { submit.setError(''); void submit.startPayment({ resume: true }) }}
                disabled={submit.pending}
                className="min-h-11 rounded-(--radius-control) bg-brand px-4 text-sm font-semibold text-brand-foreground disabled:opacity-60"
              >
                {submit.pending ? 'Preparing…' : `Complete payment for Order #${submit.reviewOrderId}`}
              </button>
            )}
            <Link
              href="/support"
              className="inline-flex min-h-8 items-center px-1 text-xs text-brand-ink underline underline-offset-2"
            >
              Support
            </Link>
          </div>
          {submit.uncertain && submit.reviewOrderId && (
            <p className="text-[11px] text-muted-foreground">
              No new order will be created — this resumes Order #{submit.reviewOrderId} and shows the secure payment form.
            </p>
          )}
        </div>
      )}

      {config.isError && (
        <button onClick={() => config.refetch()} className="text-xs text-brand-ink">
          Retry checkout options
        </button>
      )}

      <button
        disabled={submit.uncertain || submit.pending}
        onClick={() => void submit.startPayment()}
        className="min-h-11 w-full rounded-(--radius-control) bg-brand px-6 text-sm font-semibold text-brand-foreground disabled:bg-muted disabled:text-muted-foreground"
      >
        {submit.pending
          ? 'Preparing…'
          : isPaymob(method)
            ? `Pay ${formatEgp(cart?.total ?? 0)}`
            : `Place order · ${formatEgp(cart?.total ?? 0)}`}
      </button>
    </div>
  )
}
