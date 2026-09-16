'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useAuth } from '@/components/shams/providers'
import { Package, MapPin, User, LogOut } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { commerceFetch } from '@/lib/commerce/browser'

const OrdersSection = dynamic(
  () => import('./account-orders').then((mod) => mod.OrdersSection),
  { ssr: false, loading: () => <div className="flex items-center justify-center py-12"><div className="size-6 animate-spin rounded-full border-2 border-brand-ink border-t-transparent" /></div> }
)

const AddressesSection = dynamic(
  () => import('./account-addresses').then((mod) => mod.AddressesSection),
  { ssr: false, loading: () => <div className="flex items-center justify-center py-12"><div className="size-6 animate-spin rounded-full border-2 border-brand-ink border-t-transparent" /></div> }
)

const ProfileSection = dynamic(
  () => import('./account-profile').then((mod) => mod.ProfileSection),
  { ssr: false, loading: () => <div className="flex items-center justify-center py-12"><div className="size-6 animate-spin rounded-full border-2 border-brand-ink border-t-transparent" /></div> }
)

type Section = 'overview' | 'orders' | 'addresses' | 'profile'

export function AccountDashboard({ section = 'overview' }: { section?: Section }) {
  const { user, logout, removeAddress, setDefaultAddress, addAddress, updateAddress, updateProfile, changePassword } = useAuth()

  if (!user) {
    return (
      <main className="shams-container max-w-md py-16 pb-[calc(4rem+var(--mobile-bottom-nav-height))] text-center sm:pb-16">
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
    <main className="shams-container max-w-3xl py-10 pb-[calc(2.5rem+var(--mobile-bottom-nav-height))] sm:pb-10">
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
