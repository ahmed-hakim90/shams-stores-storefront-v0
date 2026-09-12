import { commerceProvider } from '@/lib/commerce/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Check, Package, ArrowRight } from 'lucide-react'
import { Footer } from '@/components/shams/footer'

export const metadata = { title: 'Order confirmed | Shams Stores', description: 'Your Shams Stores order has been received.' }

export default function OrderSuccessPage() {
  if (commerceProvider() === 'woocommerce') notFound()
  return <div className="min-h-screen bg-background"><main className="mx-auto flex max-w-2xl flex-col items-center px-5 py-16 text-center sm:py-24"><div className="flex size-14 items-center justify-center rounded-full bg-success-muted text-success"><Check /></div><p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-brand">Order confirmed</p><h1 className="mt-3 text-3xl font-semibold sm:text-4xl">Thank you for your order.</h1><p className="mt-4 max-w-md leading-7 text-muted-foreground">We&apos;ve received your order and will contact you with the next update.</p><div className="mt-8 w-full rounded-lg border border-border bg-card p-5 text-left"><div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Order number</span><strong>SH-10482</strong></div><div className="mt-4 flex items-center gap-3 border-t border-border pt-4 text-sm"><Package className="size-5 text-brand" /><span>Processing · We&apos;ll confirm availability shortly.</span></div></div><div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row"><Link href="/track-order" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground">Track order <ArrowRight data-icon="inline-end" /></Link><Link href="/" className="inline-flex min-h-11 items-center justify-center rounded-md border border-border px-5 text-sm font-semibold">Continue shopping</Link></div></main><Footer /></div>
}
