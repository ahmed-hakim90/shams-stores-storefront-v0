'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { ShoppingCart, X, Minus, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function CartDrawer() {
  const [open, setOpen] = useState(false)
  const [quantity, setQuantity] = useState(1)

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-label="Open cart" className="group relative flex min-h-11 flex-col items-center gap-0.5 rounded-lg px-2.5 py-1.5 text-foreground/80 transition-colors hover:text-brand">
        <span className="relative"><ShoppingCart className="size-5.5" /><span className="absolute -right-2 -top-2 inline-flex min-w-4.5 items-center justify-center rounded-full bg-brand px-1 text-[0.6rem] font-semibold leading-4.5 text-brand-foreground">3</span></span>
        <span className="hidden text-[0.65rem] font-medium xl:block">Cart</span>
      </button>
      {open && <div className="fixed inset-0 z-[70] bg-black/40" onClick={() => setOpen(false)} aria-hidden="true" />}
      <aside className={`fixed inset-y-0 right-0 z-[71] flex w-full max-w-md flex-col bg-background shadow-2xl transition-transform duration-200 ${open ? 'translate-x-0' : 'translate-x-full'}`} aria-label="Shopping cart" aria-hidden={!open}>
        <div className="flex items-center justify-between border-b border-border px-5 py-4"><div><p className="text-xs font-semibold uppercase tracking-widest text-brand">Your cart</p><h2 className="mt-1 text-lg font-semibold">3 items</h2></div><button type="button" onClick={() => setOpen(false)} className="flex size-11 items-center justify-center rounded-lg border border-border" aria-label="Close cart"><X /></button></div>
        <div className="flex-1 overflow-y-auto p-5"><div className="flex gap-4 border-b border-border pb-5"><div className="relative size-20 shrink-0 rounded-lg bg-white"><Image src="/images/hero-mirrorless.png" alt="Aperture A7 IV" fill sizes="80px" className="object-contain p-2" /></div><div className="min-w-0 flex-1"><p className="truncate font-medium">Aperture A7 IV</p><p className="mt-1 text-sm text-muted-foreground">Body only</p><div className="mt-3 flex items-center justify-between gap-3"><div className="flex items-center rounded-md border border-border"><button type="button" className="flex size-9 items-center justify-center" onClick={() => setQuantity(Math.max(1, quantity - 1))} aria-label="Decrease quantity"><Minus /></button><span className="w-8 text-center text-sm">{quantity}</span><button type="button" className="flex size-9 items-center justify-center" onClick={() => setQuantity(quantity + 1)} aria-label="Increase quantity"><Plus /></button></div><span className="font-semibold">EGP 129,900</span></div></div></div><p className="mt-5 text-sm text-muted-foreground">Free delivery across Egypt on eligible orders.</p></div>
        <div className="border-t border-border p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]"><div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span className="text-lg font-semibold">EGP 129,900</span></div><div className="mt-4 grid gap-2"><Link href="/cart" onClick={() => setOpen(false)}><Button variant="outline" className="min-h-12 w-full">View cart</Button></Link><Link href="/checkout" onClick={() => setOpen(false)}><Button className="min-h-12 w-full">Checkout</Button></Link></div></div>
      </aside>
    </>
  )
}
