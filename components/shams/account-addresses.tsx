'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, MapPin, Star, Trash2, Pencil } from 'lucide-react'
import type { SavedAddress } from '@/components/shams/auth-provider'

function SectionHeader({ title, subtitle, onBack }: { title: string; subtitle?: string; onBack?: string }) {
  return (
    <div className="mb-6">
      {onBack && (
        <Link href={onBack} className="mb-3 inline-flex items-center gap-1 text-sm text-brand-ink">
          <ArrowLeft className="size-4" /> Back to account
        </Link>
      )}
      <h1 className="text-2xl font-semibold">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
    </div>
  )
}

function EditAddressForm({ address, updateAddress, onDone, onCancel }: {
  address: SavedAddress
  updateAddress: (id: string, address: Partial<SavedAddress>) => Promise<{ success: boolean; error?: string }>
  onDone: () => void
  onCancel: () => void
}) {
  const [form, setForm] = useState({
    label: address.label,
    firstName: address.firstName,
    lastName: address.lastName,
    phone: address.phone,
    governorate: address.governorate,
    city: address.city,
    address1: address.address1,
    address2: address.address2,
    postcode: address.postcode,
  })
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!form.firstName.trim() || !form.lastName.trim()) { setError('Name is required'); return }
    if (!form.phone.trim()) { setError('Phone is required'); return }
    if (!form.governorate.trim()) { setError('Governorate is required'); return }
    if (!form.city.trim()) { setError('City is required'); return }
    if (!form.address1.trim()) { setError('Address is required'); return }

    setPending(true)
    const result = await updateAddress(address.id, {
      label: form.label || form.firstName,
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      phone: form.phone.trim(),
      governorate: form.governorate.trim(),
      city: form.city.trim(),
      address1: form.address1.trim(),
      address2: form.address2.trim(),
      postcode: form.postcode.trim(),
    })
    setPending(false)
    if (result.success) {
      onDone()
    } else {
      setError(result.error || 'Could not update address')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h3 className="mb-3 font-semibold">Edit address</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">First name</label>
          <input type="text" value={form.firstName} onChange={(e) => update('firstName', e.target.value)} className="mt-1 min-h-11 w-full rounded-(--radius-control) border bg-background px-3 text-sm" required />
        </div>
        <div>
          <label className="block text-sm font-medium">Last name</label>
          <input type="text" value={form.lastName} onChange={(e) => update('lastName', e.target.value)} className="mt-1 min-h-11 w-full rounded-(--radius-control) border bg-background px-3 text-sm" required />
        </div>
        <div>
          <label className="block text-sm font-medium">Phone</label>
          <input type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)} className="mt-1 min-h-11 w-full rounded-(--radius-control) border bg-background px-3 text-sm" required />
        </div>
        <div>
          <label className="block text-sm font-medium">Label</label>
          <input type="text" value={form.label} onChange={(e) => update('label', e.target.value)} className="mt-1 min-h-11 w-full rounded-(--radius-control) border bg-background px-3 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium">Governorate</label>
          <input type="text" value={form.governorate} onChange={(e) => update('governorate', e.target.value)} className="mt-1 min-h-11 w-full rounded-(--radius-control) border bg-background px-3 text-sm" required />
        </div>
        <div>
          <label className="block text-sm font-medium">City</label>
          <input type="text" value={form.city} onChange={(e) => update('city', e.target.value)} className="mt-1 min-h-11 w-full rounded-(--radius-control) border bg-background px-3 text-sm" required />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium">Address line 1</label>
          <input type="text" value={form.address1} onChange={(e) => update('address1', e.target.value)} className="mt-1 min-h-11 w-full rounded-(--radius-control) border bg-background px-3 text-sm" required />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium">Address line 2 (optional)</label>
          <input type="text" value={form.address2} onChange={(e) => update('address2', e.target.value)} className="mt-1 min-h-11 w-full rounded-(--radius-control) border bg-background px-3 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium">Postal code (optional)</label>
          <input type="text" value={form.postcode} onChange={(e) => update('postcode', e.target.value)} className="mt-1 min-h-11 w-full rounded-(--radius-control) border bg-background px-3 text-sm" />
        </div>
      </div>
      {error && <p role="alert" className="mt-3 rounded-(--radius-control) bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <div className="mt-4 flex gap-2">
        <button type="submit" disabled={pending} className="inline-flex min-h-10 items-center gap-1 rounded-(--radius-control) bg-brand px-4 text-sm font-semibold text-brand-foreground disabled:opacity-60">
          {pending ? 'Saving...' : 'Save changes'}
        </button>
        <button type="button" onClick={onCancel} className="inline-flex min-h-10 items-center rounded-(--radius-control) border px-4 text-sm font-medium">
          Cancel
        </button>
      </div>
    </form>
  )
}

function AddAddressForm({ addAddress, onDone }: { addAddress: (address: Omit<SavedAddress, 'id'>) => Promise<{ success: boolean; error?: string }>; onDone: () => void }) {
  const [form, setForm] = useState({
    label: '',
    firstName: '',
    lastName: '',
    phone: '',
    governorate: '',
    city: '',
    address1: '',
    address2: '',
    postcode: '',
  })
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!form.firstName.trim() || !form.lastName.trim()) { setError('Name is required'); return }
    if (!form.phone.trim()) { setError('Phone is required'); return }
    if (!form.governorate.trim()) { setError('Governorate is required'); return }
    if (!form.city.trim()) { setError('City is required'); return }
    if (!form.address1.trim()) { setError('Address is required'); return }

    setPending(true)
    const result = await addAddress({
      label: form.label || form.firstName,
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      phone: form.phone.trim(),
      governorate: form.governorate.trim(),
      city: form.city.trim(),
      address1: form.address1.trim(),
      address2: form.address2.trim(),
      postcode: form.postcode.trim(),
      isDefault: false,
    })
    setPending(false)
    if (result.success) {
      onDone()
    } else {
      setError(result.error || 'Could not add address')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-4 rounded-(--radius-card) border bg-card p-5">
      <h3 className="mb-4 font-semibold">New address</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">First name</label>
          <input type="text" value={form.firstName} onChange={(e) => update('firstName', e.target.value)} className="mt-1 min-h-11 w-full rounded-(--radius-control) border bg-background px-3 text-sm" required />
        </div>
        <div>
          <label className="block text-sm font-medium">Last name</label>
          <input type="text" value={form.lastName} onChange={(e) => update('lastName', e.target.value)} className="mt-1 min-h-11 w-full rounded-(--radius-control) border bg-background px-3 text-sm" required />
        </div>
        <div>
          <label className="block text-sm font-medium">Phone</label>
          <input type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="01xxxxxxxxx" className="mt-1 min-h-11 w-full rounded-(--radius-control) border bg-background px-3 text-sm" required />
        </div>
        <div>
          <label className="block text-sm font-medium">Label (optional)</label>
          <input type="text" value={form.label} onChange={(e) => update('label', e.target.value)} placeholder="e.g. Home, Work" className="mt-1 min-h-11 w-full rounded-(--radius-control) border bg-background px-3 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium">Governorate</label>
          <input type="text" value={form.governorate} onChange={(e) => update('governorate', e.target.value)} className="mt-1 min-h-11 w-full rounded-(--radius-control) border bg-background px-3 text-sm" required />
        </div>
        <div>
          <label className="block text-sm font-medium">City</label>
          <input type="text" value={form.city} onChange={(e) => update('city', e.target.value)} className="mt-1 min-h-11 w-full rounded-(--radius-control) border bg-background px-3 text-sm" required />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium">Address line 1</label>
          <input type="text" value={form.address1} onChange={(e) => update('address1', e.target.value)} className="mt-1 min-h-11 w-full rounded-(--radius-control) border bg-background px-3 text-sm" required />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium">Address line 2 (optional)</label>
          <input type="text" value={form.address2} onChange={(e) => update('address2', e.target.value)} className="mt-1 min-h-11 w-full rounded-(--radius-control) border bg-background px-3 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium">Postal code (optional)</label>
          <input type="text" value={form.postcode} onChange={(e) => update('postcode', e.target.value)} className="mt-1 min-h-11 w-full rounded-(--radius-control) border bg-background px-3 text-sm" />
        </div>
      </div>
      {error && <p role="alert" className="mt-3 rounded-(--radius-control) bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <div className="mt-4 flex gap-2">
        <button type="submit" disabled={pending} className="inline-flex min-h-10 items-center gap-1 rounded-(--radius-control) bg-brand px-4 text-sm font-semibold text-brand-foreground disabled:opacity-60">
          {pending ? 'Saving...' : 'Save address'}
        </button>
        <button type="button" onClick={onDone} className="inline-flex min-h-10 items-center rounded-(--radius-control) border px-4 text-sm font-medium">
          Cancel
        </button>
      </div>
    </form>
  )
}

export function AddressesSection({ user, removeAddress, setDefaultAddress, addAddress, updateAddress }: { user: NonNullable<ReturnType<typeof import('@/components/shams/auth-provider').useAuth>['user']>; removeAddress: (id: string) => void; setDefaultAddress: (id: string) => void; addAddress: (address: Omit<SavedAddress, 'id'>) => Promise<{ success: boolean; error?: string }>; updateAddress: (id: string, address: Partial<SavedAddress>) => Promise<{ success: boolean; error?: string }> }) {
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  return (
    <main className="shams-container max-w-3xl py-10 pb-[calc(2.5rem+var(--mobile-bottom-nav-height))] sm:pb-10">
      <SectionHeader title="Saved addresses" subtitle="Add and manage your delivery addresses" onBack="/account" />
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => { setShowForm((v) => !v); setEditingId(null) }}
          className="inline-flex min-h-10 items-center gap-1 rounded-(--radius-control) bg-brand px-4 text-sm font-semibold text-brand-foreground"
        >
          {showForm ? 'Cancel' : 'Add new address'}
        </button>
      </div>
      {showForm && <AddAddressForm addAddress={addAddress} onDone={() => setShowForm(false)} />}
      {user.addresses.length === 0 && !showForm ? (
        <div className="rounded-(--radius-card) border border-dashed p-10 text-center">
          <p className="text-muted-foreground">No saved addresses. You can add one during checkout.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {user.addresses.map((addr) => (
            <div key={addr.id} className="rounded-(--radius-control) border bg-card p-4">
              {editingId === addr.id ? (
                <EditAddressForm
                  address={addr}
                  updateAddress={updateAddress}
                  onDone={() => setEditingId(null)}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{addr.firstName} {addr.lastName}</p>
                      {addr.label && <span className="text-xs text-muted-foreground">({addr.label})</span>}
                      {addr.isDefault && (
                        <span className="flex items-center gap-1 rounded-full bg-brand-muted px-2 py-1 text-xs text-brand-ink">
                          <Star className="size-3" /> Default
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {addr.address1}{addr.address2 && `, ${addr.address2}`}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">{addr.city}, {addr.governorate}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{addr.phone}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditingId(addr.id); setShowForm(false) }} className="text-xs text-brand-ink" title="Edit address">
                      <Pencil className="size-4" />
                    </button>
                    {!addr.isDefault && (
                      <button onClick={() => setDefaultAddress(addr.id)} className="text-xs text-brand-ink" title="Set as default">
                        <Star className="size-4" />
                      </button>
                    )}
                    {addr.id !== 'billing' && (
                      <button onClick={() => removeAddress(addr.id)} className="text-xs text-red-600" title="Remove address">
                        <Trash2 className="size-4" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
