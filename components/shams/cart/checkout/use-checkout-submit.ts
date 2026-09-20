'use client'
import { useCallback, useRef, useState } from 'react'
import { checkoutErrors, requiredCheckoutFields as requiredFields } from '@/lib/commerce/checkout-validation'
import { BrowserCommerceError, commerceFetch } from '@/lib/commerce/browser'
import type { Address, CheckoutResult } from '@/lib/commerce/types'
import type { PaymentIntentClient } from '@/lib/payments/paymob/types'

const isPaymob = (method: string) => method === 'paymob-card' || method === 'paymob-installments'

export type FieldErrors = Partial<Record<keyof Address | 'password' | 'confirmPassword', string>>

type CheckoutSubmitConfig = {
  enabled: boolean
  paymob: boolean
  paymobUnavailable: boolean
  verifiedMethods: string[]
  states: { code: string; name: string }[]
  paymobOptions: { id: string; kind: string; title: string; description: string }[]
}

type UseCheckoutSubmitArgs = {
  address: Address
  method: string
  saved: boolean
  deliveryReady: boolean
  cartPending: boolean
  cartTotal: number
  config: { data: CheckoutSubmitConfig | undefined; isError: boolean }
  mutateCart: (input: Record<string, unknown>) => Promise<unknown>
}

export function useCheckoutSubmit({
  address,
  method,
  saved,
  deliveryReady,
  cartPending,
  cartTotal,
  config,
  mutateCart,
}: UseCheckoutSubmitArgs) {
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const [uncertain, setUncertain] = useState(false)
  const [reviewOrderId, setReviewOrderId] = useState<string | null>(null)
  const [intent, setIntent] = useState<PaymentIntentClient | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [touched, setTouched] = useState<Set<string>>(new Set())
  const submitting = useRef(false)
  const addressRef = useRef(address)
  addressRef.current = address

  const validateField = useCallback(
    (key: keyof Address, value: string) => {
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
    },
    [],
  )

  const validateAll = useCallback((): boolean => {
    const errors = checkoutErrors(addressRef.current)
    if (isPaymob(method)) {
      if (!addressRef.current.lastName.trim()) errors.lastName = 'Required for online payment'
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addressRef.current.email.trim())) errors.email = 'Enter an email for your payment receipt'
    }
    setFieldErrors(errors)
    setTouched(new Set(Object.keys(addressRef.current)))
    const first = Object.keys(errors)[0]
    if (first) document.getElementById(`checkout-${first}`)?.focus()
    return !first
  }, [method])

  const startPayment = useCallback(
    async (opts?: { resume?: boolean }) => {
      if (submitting.current || (uncertain && !opts?.resume)) return
      if (!validateAll()) { setError('Please complete the highlighted fields.'); return }
      if (cartPending) { setError('Delivery is updating. Please try again when it finishes.'); return }
      if (!saved) { setError('Review the delivery and payment options, then confirm your order.'); return }
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
              body: JSON.stringify({ address: addressRef.current, paymentMethod: method }),
            },
          )
          setIntent(result)
        } else {
          await commerceFetch<CheckoutResult>(
            '/api/commerce/checkout',
            {
              method: 'POST',
              body: JSON.stringify({ address: addressRef.current, paymentMethod: method }),
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
          ['NETWORK_ERROR', 'SERVER_ERROR', 'UNKNOWN', 'PAYMENT_REVIEW_REQUIRED', 'PAYMENT_SESSION_BUSY'].includes(e.code)
        ) {
          setUncertain(true)
          if (e.orderId) setReviewOrderId(e.orderId)
          setError(
            e.code === 'PAYMENT_REVIEW_REQUIRED' || e.code === 'PAYMENT_SESSION_BUSY' ? e.message : 'We could not confirm the result. Contact Shams before trying again to avoid a duplicate order.',
          )
        } else submitting.current = false
      }
    },
    [uncertain, validateAll, cartPending, saved, deliveryReady, method, config.data, mutateCart],
  )

  return {
    error,
    setError,
    pending,
    uncertain,
    reviewOrderId,
    intent,
    setIntent,
    fieldErrors,
    setFieldErrors,
    touched,
    setTouched,
    submitting,
    validateField,
    validateAll,
    startPayment,
  }
}
