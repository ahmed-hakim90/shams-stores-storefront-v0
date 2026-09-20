'use client'
import type { Address } from '@/lib/commerce/types'
import type { SavedAddress } from '@/components/shams/providers'
import type { FieldErrors } from './use-checkout-submit'
import { Plus } from 'lucide-react'
import { Select } from '@/components/ui/select'

const isPaymob = (method: string) => method === 'paymob-card' || method === 'paymob-installments'

function inputClass(key: keyof Address, fieldErrors: FieldErrors, touched: Set<string>) {
  return `mt-1 min-h-9 w-full rounded-(--radius-control) border bg-white px-2.5 text-sm font-normal transition-colors ${
    fieldErrors[key] && touched.has(key)
      ? 'border-danger focus:border-danger'
      : 'focus:border-brand'
  }`
}

function AddressField({
  fieldKey,
  label,
  type = 'text',
  autoComplete,
  required = true,
  address,
  fieldErrors,
  touched,
  onChange,
  onBlur,
}: {
  fieldKey: keyof Address
  label: string
  type?: string
  autoComplete?: string
  required?: boolean
  address: Address
  fieldErrors: FieldErrors
  touched: Set<string>
  onChange: (key: keyof Address, value: string) => void
  onBlur: (key: keyof Address) => void
}) {
  return (
    <label className="block text-xs font-medium">
      <span className="flex items-center gap-0.5">
        {label}
        {required && <span className="text-danger">*</span>}
      </span>
      <input
        id={`checkout-${fieldKey}`}
        aria-invalid={!!fieldErrors[fieldKey]}
        aria-describedby={fieldErrors[fieldKey] ? `checkout-error-${fieldKey}` : undefined}
        required={required}
        type={type}
        autoComplete={autoComplete}
        value={address[fieldKey]}
        onChange={(e) => onChange(fieldKey, e.target.value)}
        onBlur={() => onBlur(fieldKey)}
        className={inputClass(fieldKey, fieldErrors, touched)}
      />
      {fieldErrors[fieldKey] && touched.has(fieldKey) && (
        <span id={`checkout-error-${fieldKey}`} role="alert" className="mt-0.5 block text-[11px] text-danger">{fieldErrors[fieldKey]}</span>
      )}
    </label>
  )
}

export function CheckoutAddressForm({
  address,
  fieldErrors,
  touched,
  selectedAddressId,
  saveAddr,
  saved,
  user,
  method,
  cartPending,
  config,
  onChange,
  onBlur,
  onSelectSavedAddress,
  onSaveAddrChange,
  onSubmit,
}: {
  address: Address
  fieldErrors: FieldErrors
  touched: Set<string>
  selectedAddressId: string | null
  saveAddr: boolean
  saved: boolean
  user: { addresses: SavedAddress[] } | null
  method: string
  cartPending: boolean
  config: { data?: { states: { code: string; name: string }[] } }
  onChange: (key: keyof Address, value: string) => void
  onBlur: (key: keyof Address) => void
  onSelectSavedAddress: (id: string) => void
  onSaveAddrChange: (checked: boolean) => void
  onSubmit: () => void
}) {
  return (
    <>
      {user && user.addresses.length > 0 && (
        <div className="flex gap-2 overflow-x-auto">
          {user.addresses.map((addr) => (
            <button
              key={addr.id}
              type="button"
              onClick={() => onSelectSavedAddress(addr.id)}
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
        <AddressField fieldKey="firstName" label="First name" autoComplete="given-name" address={address} fieldErrors={fieldErrors} touched={touched} onChange={onChange} onBlur={onBlur} />
        <AddressField fieldKey="lastName" label="Last name" autoComplete="family-name" required={isPaymob(method)} address={address} fieldErrors={fieldErrors} touched={touched} onChange={onChange} onBlur={onBlur} />
        <AddressField fieldKey="phone" label="Phone" type="tel" autoComplete="tel" address={address} fieldErrors={fieldErrors} touched={touched} onChange={onChange} onBlur={onBlur} />
        {(isPaymob(method)) && <AddressField fieldKey="email" label="Email" type="email" autoComplete="email" address={address} fieldErrors={fieldErrors} touched={touched} onChange={onChange} onBlur={onBlur} />}
        <label className="text-xs font-medium">
          <span className="flex items-center gap-0.5">
            Governorate <span className="text-danger">*</span>
          </span>
          <Select
            id="checkout-state"
            aria-invalid={!!fieldErrors.state}
            required
            value={address.state}
            onChange={(e) => onChange('state', e.target.value)}
            onBlur={() => onBlur('state')}
            className={inputClass('state', fieldErrors, touched)}
          >
            <option value="">Select</option>
            {config.data?.states.map((s) => (
              <option key={s.code} value={s.code}>{s.name}</option>
            ))}
          </Select>
          {fieldErrors.state && touched.has('state') && (
            <span className="mt-0.5 block text-[11px] text-danger">{fieldErrors.state}</span>
          )}
        </label>
        <AddressField fieldKey="city" label="City" autoComplete="address-level2" address={address} fieldErrors={fieldErrors} touched={touched} onChange={onChange} onBlur={onBlur} />
        <div className="sm:col-span-2"><AddressField fieldKey="address1" label="Street address" autoComplete="address-line1" address={address} fieldErrors={fieldErrors} touched={touched} onChange={onChange} onBlur={onBlur} /></div>
        <div className="sm:col-span-2"><AddressField fieldKey="address2" label="Apt / Floor / Landmark" autoComplete="address-line2" required={false} address={address} fieldErrors={fieldErrors} touched={touched} onChange={onChange} onBlur={onBlur} /></div>
      </div>

      {user && (
        <label className="flex items-center gap-1.5 text-xs">
          <input
            type="checkbox"
            checked={saveAddr}
            onChange={(e) => onSaveAddrChange(e.target.checked)}
            className="size-3.5 accent-brand"
          />
          Save to my account
        </label>
      )}

      {!saved && (
        <button type="button" onClick={onSubmit} disabled={cartPending} className="min-h-11 rounded-(--radius-control) border px-4 text-sm font-medium hover:bg-brand-muted">
          {cartPending ? 'Updating delivery…' : 'Update delivery options'}
        </button>
      )}
      {cartPending && saved && (
        <p className="text-xs text-muted-foreground">Updating delivery…</p>
      )}
    </>
  )
}
