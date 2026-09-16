'use client'

import Link from 'next/link'
import { useAuth, type SavedAddress } from '@/components/shams/auth-provider'
import { Package, MapPin, User, LogOut, Trash2, Star, ArrowLeft, Eye, EyeOff, Pencil, Check, X, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { commerceFetch } from '@/lib/commerce/browser'

type Section = 'overview' | 'orders' | 'addresses' | 'profile'

type OrderSummary = {
  id: number | string
  date: string
  status: string
  total: number
  items: number
}

export function AccountDashboard({ section = 'overview' }: { section?: Section }) {
  const { user, logout, removeAddress, setDefaultAddress, addAddress, updateAddress, updateProfile, changePassword } = useAuth()

  if (!user) {
    return (
      <main className="shams-container max-w-md py-16 text-center">
        <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-brand-muted">
          <User className="size-7 text-brand-ink" />
        </div>
        <h1 className="text-2xl font-semibold">Welcome</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Sign in or create an account to manage your orders and addresses
        </p>
        <div className="mt-8 flex flex-col gap-3">
          <Link
            href="/account/login"
            className="flex min-h-12 items-center justify-center rounded-(--radius-control) bg-brand text-sm font-semibold text-brand-foreground"
          >
            Sign in
          </Link>
          <Link
            href="/account/register"
            className="flex min-h-12 items-center justify-center rounded-(--radius-control) border border-brand text-sm font-semibold text-brand-ink"
          >
            Create account
          </Link>
        </div>
      </main>
    )
  }

  if (section === 'orders') return <OrdersSection />
  if (section === 'addresses') return <AddressesSection user={user} removeAddress={removeAddress} setDefaultAddress={setDefaultAddress} addAddress={addAddress} updateAddress={updateAddress} />
  if (section === 'profile') return <ProfileSection user={user} logout={logout} updateProfile={updateProfile} changePassword={changePassword} />
  return <OverviewSection user={user} logout={logout} />
}

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

function OverviewSection({ user, logout }: { user: NonNullable<ReturnType<typeof useAuth>['user']>; logout: () => void }) {
  const defaultAddress = user.addresses.find((a) => a.isDefault) || user.addresses[0]
  const { data: ordersData } = useQuery({
    queryKey: ['customer-orders-overview'],
    queryFn: ({ signal }) =>
      commerceFetch<{ orders: Array<{ id: string; dateCreated: string; status: string; total: string; itemCount: number }> }>(
        '/api/customer/orders?per_page=3',
        { signal },
      ),
  })
  const recentOrders = (ordersData?.orders ?? []).map((o) => ({
    id: o.id,
    date: o.dateCreated,
    status: o.status,
    total: parseFloat(o.total),
    items: o.itemCount,
  }))

  return (
    <main className="shams-container max-w-3xl py-10">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-ink">My account</p>
          <h1 className="mt-2 text-3xl font-semibold">Hello, {user.name}</h1>
        </div>
        <button
          onClick={logout}
          className="flex min-h-11 items-center gap-2 rounded-(--radius-control) border px-4 text-sm text-muted-foreground hover:text-foreground"
        >
          <LogOut className="size-4" /> Sign out
        </button>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link href="/account/orders" className="rounded-(--radius-card) border bg-card p-5 transition-colors hover:border-brand">
          <Package className="size-5 text-brand-ink" />
          <h2 className="mt-5 font-semibold">Orders</h2>
          <p className="mt-2 text-sm text-muted-foreground">Track your orders and purchase history</p>
        </Link>
        <Link href="/account/addresses" className="rounded-(--radius-card) border bg-card p-5 transition-colors hover:border-brand">
          <MapPin className="size-5 text-brand-ink" />
          <h2 className="mt-5 font-semibold">Addresses</h2>
          <p className="mt-2 text-sm text-muted-foreground">Manage your delivery addresses</p>
        </Link>
      </div>

      <section className="mt-6 rounded-(--radius-card) border bg-card p-5">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-semibold">
            <Package className="size-5 text-brand-ink" /> Recent orders
          </h2>
          {recentOrders.length > 0 && (
            <Link href="/account/orders" className="text-sm text-brand-ink">View all</Link>
          )}
        </div>
        {recentOrders.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            No orders yet. <Link href="/shop" className="text-brand-ink hover:underline">Start shopping</Link>
          </p>
        ) : (
          <div className="mt-3 divide-y">
            {recentOrders.map((order) => (
              <Link
                key={order.id}
                href={`/account/orders/${order.id}`}
                className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0 hover:text-brand-ink"
              >
                <div>
                  <p className="text-sm font-medium">Order #{order.id}</p>
                  <p className="text-xs text-muted-foreground">{new Date(order.date).toLocaleDateString('en-EG')} · {order.items} {order.items === 1 ? 'item' : 'items'}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${order.status === 'completed' || order.status === 'Delivered' ? 'bg-green-50 text-green-700' : 'bg-brand-muted text-brand-ink'}`}>
                    {order.status}
                  </span>
                  <span className="text-sm font-semibold">{order.total.toLocaleString('en-EG')} EGP</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {defaultAddress && (
        <section className="mt-6 rounded-(--radius-card) border bg-card p-5">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-semibold">
              <MapPin className="size-5 text-brand-ink" /> Default address
            </h2>
            <Link href="/account/addresses" className="text-sm text-brand-ink">View all</Link>
          </div>
          <div className="mt-3 rounded-(--radius-control) border bg-background p-4">
            <p className="font-medium">{defaultAddress.firstName} {defaultAddress.lastName}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {defaultAddress.address1}{defaultAddress.address2 && `, ${defaultAddress.address2}`}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{defaultAddress.city}, {defaultAddress.governorate}</p>
            <p className="mt-1 text-sm text-muted-foreground">{defaultAddress.phone}</p>
          </div>
        </section>
      )}

      <section className="mt-6 rounded-(--radius-card) border bg-card p-5">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-semibold">
            <User className="size-5 text-brand-ink" /> Personal info
          </h2>
          <Link href="/account/profile" className="text-sm text-brand-ink">Edit</Link>
        </div>
        <dl className="mt-4 space-y-3 text-sm">
          <div className="flex justify-between"><dt className="text-muted-foreground">Name</dt><dd className="font-medium">{user.name}</dd></div>
          <div className="flex justify-between"><dt className="text-muted-foreground">Email</dt><dd className="font-medium">{user.email}</dd></div>
          <div className="flex justify-between"><dt className="text-muted-foreground">Phone</dt><dd className="font-medium">{user.phone}</dd></div>
        </dl>
      </section>
    </main>
  )
}

function OrdersSection() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['customer-orders'],
    queryFn: ({ signal }) =>
      commerceFetch<{ orders: Array<{ id: string; dateCreated: string; status: string; total: string; itemCount: number }> }>(
        '/api/customer/orders',
        { signal },
      ),
  })

  const orders: OrderSummary[] = (data?.orders || []).map((order) => ({
    id: order.id,
    date: order.dateCreated,
    status: order.status,
    total: parseFloat(order.total),
    items: order.itemCount,
  }))

  return (
    <main className="shams-container max-w-3xl py-10">
      <SectionHeader title="Orders" subtitle="Your order history and current status" onBack="/account" />
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-6 animate-spin text-brand-ink" />
        </div>
      ) : isError ? (
        <div className="rounded-(--radius-card) border border-dashed p-10 text-center">
          <p className="text-muted-foreground">Could not load your orders.</p>
          <button onClick={() => refetch()} className="mt-4 min-h-11 rounded-(--radius-control) border px-5 text-sm">
            Retry
          </button>
        </div>
      ) : !orders?.length ? (
        <div className="rounded-(--radius-card) border border-dashed p-10 text-center">
          <p className="text-muted-foreground">No orders yet.</p>
          <Link href="/shop" className="mt-4 inline-flex min-h-11 items-center rounded-(--radius-control) bg-brand px-6 text-sm font-semibold text-brand-foreground">
            Browse products
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="rounded-(--radius-card) border bg-card p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">Order #{order.id}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{new Date(order.date).toLocaleDateString('en-EG')}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${order.status === 'completed' || order.status === 'Delivered' ? 'bg-green-50 text-green-700' : 'bg-brand-muted text-brand-ink'}`}>
                  {order.status}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between border-t pt-3 text-sm">
                <span className="text-muted-foreground">{order.items} {order.items === 1 ? 'item' : 'items'}</span>
                <span className="font-semibold">{order.total.toLocaleString('en-EG')} EGP</span>
              </div>
              <div className="mt-3 border-t pt-3">
                <Link
                  href={`/account/orders/${order.id}`}
                  className="inline-flex items-center gap-1 text-sm text-brand-ink hover:underline"
                >
                  View details <ArrowLeft className="size-3 rotate-180" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}

function AddressesSection({ user, removeAddress, setDefaultAddress, addAddress, updateAddress }: { user: NonNullable<ReturnType<typeof useAuth>['user']>; removeAddress: (id: string) => void; setDefaultAddress: (id: string) => void; addAddress: (address: Omit<SavedAddress, 'id'>) => Promise<{ success: boolean; error?: string }>; updateAddress: (id: string, address: Partial<SavedAddress>) => Promise<{ success: boolean; error?: string }> }) {
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  return (
    <main className="shams-container max-w-3xl py-10">
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

function ProfileSection({ user, logout, updateProfile, changePassword }: {
  user: NonNullable<ReturnType<typeof useAuth>['user']>
  logout: () => void
  updateProfile: ReturnType<typeof useAuth>['updateProfile']
  changePassword: ReturnType<typeof useAuth>['changePassword']
}) {
  const [editingProfile, setEditingProfile] = useState(false)
  const [profileName, setProfileName] = useState(user.name)
  const [profileEmail, setProfileEmail] = useState(user.email)
  const [profilePhone, setProfilePhone] = useState(user.phone)
  const [profileMsg, setProfileMsg] = useState('')
  const [profileErr, setProfileErr] = useState('')

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [pwMessage, setPwMessage] = useState('')
  const [pwError, setPwError] = useState('')
  const [pwPending, setPwPending] = useState(false)

  const handleProfileSave = async () => {
    setProfileErr('')
    setProfileMsg('')
    if (!profileName.trim()) { setProfileErr('Name is required'); return }
    if (!profileEmail.trim()) { setProfileErr('Email is required'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileEmail)) { setProfileErr('Invalid email address'); return }
    if (!profilePhone.trim()) { setProfileErr('Phone is required'); return }
    if (!/^01[0-9]{9}$/.test(profilePhone)) { setProfileErr('Phone number must be 11 digits starting with 01'); return }
    const result = await updateProfile({ name: profileName, email: profileEmail, phone: profilePhone })
    if (result.success) {
      setProfileMsg('Profile updated successfully')
      setEditingProfile(false)
    } else {
      setProfileErr(result.error || 'Could not update profile')
    }
  }

  const handleProfileCancel = () => {
    setProfileName(user.name)
    setProfileEmail(user.email)
    setProfilePhone(user.phone)
    setProfileErr('')
    setProfileMsg('')
    setEditingProfile(false)
  }

  const handlePasswordChange = async () => {
    setPwError('')
    setPwMessage('')
    if (!currentPassword || !newPassword || !confirmPassword) return
    if (newPassword.length < 6) { setPwError('New password must be at least 6 characters'); return }
    if (newPassword !== confirmPassword) { setPwError('New passwords do not match'); return }
    setPwPending(true)
    const result = await changePassword(currentPassword, newPassword)
    setPwPending(false)
    if (result.success) {
      setPwMessage('Password changed successfully')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } else {
      setPwError(result.error || 'Could not change password')
    }
  }

  return (
    <main className="shams-container max-w-3xl py-10">
      <SectionHeader title="Personal info" subtitle="Edit your account details" onBack="/account" />

      <section className="rounded-(--radius-card) border bg-card p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Account information</h2>
          {!editingProfile && (
            <button onClick={() => setEditingProfile(true)} className="inline-flex items-center gap-1 text-sm text-brand-ink">
              <Pencil className="size-3.5" /> Edit
            </button>
          )}
        </div>

        {editingProfile ? (
          <div className="mt-4 space-y-3">
            <div>
              <label className="block text-sm font-medium">Name</label>
              <input type="text" value={profileName} onChange={(e) => setProfileName(e.target.value)} className="mt-1 min-h-11 w-full rounded-(--radius-control) border bg-background px-3 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium">Email</label>
              <input type="email" value={profileEmail} onChange={(e) => setProfileEmail(e.target.value)} className="mt-1 min-h-11 w-full rounded-(--radius-control) border bg-background px-3 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium">Phone</label>
              <input type="tel" value={profilePhone} onChange={(e) => setProfilePhone(e.target.value)} className="mt-1 min-h-11 w-full rounded-(--radius-control) border bg-background px-3 text-sm" />
            </div>
            {profileErr && <p role="alert" className="rounded-(--radius-control) bg-red-50 p-3 text-sm text-red-700">{profileErr}</p>}
            {profileMsg && <p role="status" className="rounded-(--radius-control) bg-green-50 p-3 text-sm text-green-700">{profileMsg}</p>}
            <div className="flex gap-2">
              <button onClick={handleProfileSave} className="inline-flex min-h-10 items-center gap-1 rounded-(--radius-control) bg-brand px-4 text-sm font-semibold text-brand-foreground">
                <Check className="size-4" /> Save
              </button>
              <button onClick={handleProfileCancel} className="inline-flex min-h-10 items-center gap-1 rounded-(--radius-control) border px-4 text-sm font-medium">
                <X className="size-4" /> Cancel
              </button>
            </div>
          </div>
        ) : (
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between"><dt className="text-muted-foreground">Name</dt><dd className="font-medium">{user.name}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Email</dt><dd className="font-medium">{user.email}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Phone</dt><dd className="font-medium">{user.phone}</dd></div>
          </dl>
        )}
      </section>

      <section className="mt-6 rounded-(--radius-card) border bg-card p-5">
        <h2 className="font-semibold">Change password</h2>
        <div className="mt-4 space-y-3">
          <div className="relative">
            <label className="block text-sm font-medium">Current password</label>
            <input
              type={showCurrent ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="mt-1 min-h-11 w-full rounded-(--radius-control) border bg-background px-3 text-sm"
            />
            <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute bottom-3 right-3 text-muted-foreground" aria-label={showCurrent ? 'Hide password' : 'Show password'}>
              {showCurrent ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          <div className="relative">
            <label className="block text-sm font-medium">New password</label>
            <input
              type={showNew ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-1 min-h-11 w-full rounded-(--radius-control) border bg-background px-3 text-sm"
            />
            <button type="button" onClick={() => setShowNew(!showNew)} className="absolute bottom-3 right-3 text-muted-foreground" aria-label={showNew ? 'Hide password' : 'Show password'}>
              {showNew ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium">Confirm new password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 min-h-11 w-full rounded-(--radius-control) border bg-background px-3 text-sm"
            />
          </div>
          {pwError && <p role="alert" className="rounded-(--radius-control) bg-red-50 p-3 text-sm text-red-700">{pwError}</p>}
          {pwMessage && <p role="status" className="rounded-(--radius-control) bg-green-50 p-3 text-sm text-green-700">{pwMessage}</p>}
          <button
            onClick={handlePasswordChange}
            disabled={pwPending || !currentPassword || !newPassword || !confirmPassword}
            className="min-h-11 rounded-(--radius-control) bg-brand px-5 text-sm font-semibold text-brand-foreground disabled:bg-muted disabled:text-muted-foreground"
          >
            {pwPending ? 'Saving...' : 'Save new password'}
          </button>
        </div>
      </section>

      <section className="mt-6 rounded-(--radius-card) border bg-card p-5">
        <h2 className="font-semibold text-red-600">Danger zone</h2>
        <p className="mt-2 text-sm text-muted-foreground">Sign out of your account on this device.</p>
        <button onClick={logout} className="mt-3 min-h-11 rounded-(--radius-control) border border-red-200 px-5 text-sm font-medium text-red-600 hover:bg-red-50">
          Sign out
        </button>
      </section>
    </main>
  )
}
