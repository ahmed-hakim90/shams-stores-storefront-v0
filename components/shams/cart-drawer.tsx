'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useInteractions } from './interaction-provider'
import { ShoppingCart, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function CartDrawer({ showTrigger = true }: { showTrigger?: boolean }) {
  const { cartOpen: open, openCart, closeCart, cartCount, cartLines, removeBundleFromCart, notify } = useInteractions()
  const bundleGroups = Array.from(new Map(cartLines.filter((line) => line.bundleGroupId).map((line) => [line.bundleGroupId!, line])).values())
  const standaloneLines = cartLines.filter((line) => !line.bundleGroupId)

  return (
    <>
      {showTrigger && <button type="button" onClick={openCart} aria-label="Open cart" className="group relative flex size-10 shrink-0 items-center justify-center rounded-lg text-foreground/80 transition-colors hover:text-brand xl:size-11">
        <span className="relative"><ShoppingCart className="size-5.5" />{cartCount > 0 && <span className="absolute -right-2 -top-2 inline-flex min-w-4.5 items-center justify-center rounded-full bg-brand px-1 text-[0.6rem] font-semibold leading-4.5 text-brand-foreground">{cartCount}</span>}</span>
        <span className="sr-only">Cart</span>
      </button>}
      {open && <div className="fixed inset-0 z-[100] bg-foreground/40 backdrop-blur-sm" onClick={closeCart} aria-hidden="true" />}
      <aside className={`fixed inset-y-0 right-0 z-[101] flex h-dvh w-full max-w-md flex-col overflow-hidden bg-card shadow-2xl transition-transform duration-200 ${open ? 'translate-x-0' : 'pointer-events-none translate-x-full'}`} role="dialog" aria-modal="true" aria-label="Shopping cart" aria-hidden={!open}>
        <header className="shrink-0 border-b border-border bg-background px-5 py-4"><div className="flex items-center justify-between"><div><p className="text-xs font-semibold uppercase tracking-widest text-brand">Your cart</p><h2 className="mt-1 text-lg font-semibold">{cartCount} {cartCount === 1 ? 'item' : 'items'}</h2></div><button type="button" onClick={closeCart} className="flex size-11 items-center justify-center rounded-lg border border-border" aria-label="Close cart"><X /></button></div></header>
        <div className="min-h-0 flex-1 overflow-y-auto bg-background p-5">{bundleGroups.map((bundle) => { const lines = cartLines.filter((line) => line.bundleGroupId === bundle.bundleGroupId); return <section key={bundle.bundleGroupId} className="border-b border-border pb-5"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-widest text-brand">Complete setup</p><h3 className="mt-1 font-semibold">{bundle.bundleName}</h3><p className="mt-1 text-sm text-muted-foreground">{lines.length} items · Save EGP {bundle.bundlePricingMetadata?.savingsAmount.toLocaleString()}</p></div><button type="button" onClick={() => removeBundleFromCart(bundle.bundleGroupId!)} className="min-h-11 rounded-lg border border-border px-3 text-xs font-semibold">Remove setup</button></div><div className="mt-4 flex flex-col gap-3">{lines.map((line) => <div key={line.id} className="flex items-center gap-3"><div className="relative size-14 shrink-0 rounded-lg bg-white"><Image src={line.productImage || '/placeholder.svg'} alt={line.productName} fill sizes="56px" className="object-contain p-1" /></div><div className="min-w-0"><p className="truncate text-sm font-medium">{line.productName}</p><p className="text-xs text-muted-foreground">{line.bundleItemRole} × {line.quantity}</p></div></div>)}</div><div className="mt-4 flex items-center justify-between font-semibold"><span>Bundle total</span><span>EGP {bundle.bundlePricingMetadata?.bundleTotal.toLocaleString()}</span></div></section>})}{standaloneLines.map((line) => <div key={line.id} className="border-b border-border py-4"><p className="font-medium">{line.productName}</p><p className="text-sm text-muted-foreground">{line.quantity} item</p></div>)}{!cartLines.length && <div className="py-12 text-center"><p className="font-semibold">Your cart is empty</p><p className="mt-2 text-sm text-muted-foreground">Add a setup or product to get started.</p></div>}<p className="mt-5 text-sm text-muted-foreground">Free delivery across Egypt on eligible orders.</p></div>
        <footer className="shrink-0 border-t border-border bg-background p-5 pb-[calc(1.25rem+var(--safe-area-bottom))]"><div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span className="text-lg font-semibold">EGP {bundleGroups.reduce((total, line) => total + (line.bundlePricingMetadata?.bundleTotal ?? 0), 0) + standaloneLines.reduce((total, line) => total + line.price * line.quantity, 0).toLocaleString()}</span></div><div className="mt-4 grid gap-2"><Link href="/cart" onClick={closeCart}><Button variant="outline" className="min-h-12 w-full">View cart</Button></Link><Link href="/checkout" onClick={closeCart}><Button className="min-h-12 w-full">Checkout</Button></Link></div></footer>
      </aside>
    </>
  )
}
