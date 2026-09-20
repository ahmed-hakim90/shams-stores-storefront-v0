'use client'
import { Banknote, Building2, CreditCard, Calendar } from 'lucide-react'
import { preloadPaymobPixel } from '@/components/shams/payments'

function paymentIcon(id: string) {
  return id === 'cod'
    ? Banknote
    : id === 'bacs'
      ? Building2
      : id.includes('installment')
        ? Calendar
        : CreditCard
}

function paymentName(id: string) {
  return id === 'cod'
    ? 'Cash on delivery'
    : id === 'bacs'
      ? 'InstaPay / bank transfer'
      : id.includes('installment')
        ? 'Bank installments'
        : 'Pay securely by card'
}

type PaymobOption = { id: string; kind: string; title: string; description: string }

export function CheckoutPaymentSelect({
  method,
  setMethod,
  uncertain,
  pending,
  paymobOptions,
  paymobUnavailable,
  wooMethods,
  paymobEnabled,
  wooEnabled,
}: {
  method: string
  setMethod: (id: string) => void
  uncertain: boolean
  pending: boolean
  paymobOptions: PaymobOption[] | undefined
  paymobUnavailable: boolean | undefined
  wooMethods: string[]
  paymobEnabled: boolean | undefined
  wooEnabled: boolean | undefined
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium">Payment method</p>
      <div className="grid grid-cols-1 items-start gap-2 lg:grid-cols-2">
        {paymobOptions?.map((option) => {
          const Icon = option.kind === 'installments' ? Calendar : CreditCard
          return (
            <label key={option.id} className={`flex min-w-0 min-h-20 cursor-pointer items-start gap-3 rounded-(--radius-control) border p-3 text-sm transition-colors ${method === option.id ? 'border-brand bg-brand/5' : 'hover:border-brand'}`}>
              <input type="radio" name="payment" disabled={uncertain || pending} className="mt-1 size-4 accent-brand" checked={method === option.id} onChange={() => { setMethod(option.id); preloadPaymobPixel() }} />
              <Icon className="mt-0.5 size-5 shrink-0 text-brand-ink" />
              <span className="min-w-0"><span className="block font-semibold">{option.title}</span><span className="mt-1 block text-xs leading-5 text-muted-foreground">{option.description}</span></span>
            </label>
          )
        })}
        {paymobUnavailable && <p role="status" className="text-xs text-muted-foreground">Online payment options could not load. Refresh checkout options or contact Shams.</p>}
        {wooEnabled && wooMethods.map((id) => {
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
                disabled={uncertain || pending}
                checked={method === id}
                onChange={() => setMethod(id)}
              />
              <Icon className="size-4 shrink-0" />
              <span>{paymentName(id)}</span>
            </label>
          )
        })}
        {!paymobEnabled && !wooEnabled && (
          <p className="text-xs text-muted-foreground">
            Online checkout is being prepared.
          </p>
        )}
      </div>
    </div>
  )
}
