'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { useInteractions } from './interaction-provider'
import { AddToCartButton } from './add-to-cart-button'
import { Check, Heart, Minus, Plus, ShieldCheck, ShoppingBag, Truck } from 'lucide-react'
import type { Product } from '@/lib/commerce'
import { formatMoney } from '@/lib/commerce'
import { Button } from '@/components/ui/button'
import { BranchAvailability } from './branch-availability'
import { RatingStars } from './rating-stars'
import { StockStatus } from './stock-status'

export function ProductDetail({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(product.image)
  const [showStickyPurchase, setShowStickyPurchase] = useState(false)
  const purchaseRef = useRef<HTMLDivElement>(null)
  const { compareItems, toggleWishlist, isWishlisted } = useInteractions()
  useEffect(() => {
    const element = purchaseRef.current
    if (!element) return
    const observer = new IntersectionObserver(([entry]) => setShowStickyPurchase(!entry.isIntersecting), { threshold: 0.1 })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])
  const images = [product.image, '/images/hero-mirrorless.png'].filter((image, index, all) => all.indexOf(image) === index)
  return <main className="mx-auto max-w-[1400px] px-4 pb-24 pt-[calc(1.75rem+env(safe-area-inset-top))] sm:px-6 sm:py-10">
    <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted-foreground"><Link href="/" className="hover:text-brand">Home</Link><span className="mx-2">/</span><Link href={`/c/${product.category}`} className="hover:text-brand">{product.category}</Link><span className="mx-2">/</span><span className="text-foreground">{product.name}</span></nav>
    <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12"><section className="flex flex-col-reverse gap-3 sm:flex-row"><div className="flex gap-2 overflow-x-auto sm:w-20 sm:flex-col">{images.map((image) => <button key={image} onClick={() => setSelectedImage(image)} className={`relative size-16 shrink-0 overflow-hidden rounded-lg border bg-white p-1 ${selectedImage === image ? 'border-brand ring-2 ring-brand/20' : 'border-border'}`} aria-label={`View ${product.name}`}><Image src={image} alt="" fill sizes="64px" className="object-contain" /></button>)}</div><div className="relative aspect-square min-h-[300px] flex-1 overflow-hidden rounded-xl border border-border bg-white p-5"><Image src={selectedImage} alt={product.name} fill priority sizes="(max-width: 768px) 100vw, 55vw" className="object-contain p-6" /></div></section>
      <section><p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand">{product.brand}</p><h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{product.name}</h1>{product.configuration && <p className="mt-2 text-muted-foreground">{product.configuration}</p>}<div className="mt-4 flex flex-wrap items-center gap-3"><RatingStars rating={product.rating} reviewCount={product.reviewCount} /><span className="text-xs text-muted-foreground/70">SKU: {product.sku ?? product.id}</span></div><div className="my-6 border-y border-border py-5"><div className="flex items-end gap-3"><span className="text-3xl font-semibold">{formatMoney(product.price)}</span>{product.previousPrice && <del className="pb-1 text-sm text-muted-foreground">{formatMoney(product.previousPrice)}</del>}</div>{product.installmentFrom && <p className="mt-1 text-sm text-muted-foreground">From {formatMoney({ amount: product.installmentFrom, currency: 'EGP' })} / month</p>}</div><StockStatus status={product.stock} /><div ref={purchaseRef} className="mt-5 flex gap-2"><div className="flex min-h-12 items-center rounded-lg border border-border"><button className="size-11" aria-label="Decrease quantity" onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus className="mx-auto size-4" /></button><span className="w-8 text-center text-sm">{quantity}</span><button className="size-11" aria-label="Increase quantity" onClick={() => setQuantity(quantity + 1)}><Plus className="mx-auto size-4" /></button></div><AddToCartButton productName={product.name} stock={product.stock} className="min-h-12" /><Button variant="outline" size="icon" className={isWishlisted(product.name) ? 'size-12 border-brand bg-brand-muted text-brand' : 'size-12'} aria-label="Add to wishlist" onClick={() => toggleWishlist(product.name)}><Heart className={isWishlisted(product.name) ? 'fill-current' : ''} /></Button></div><div className="mt-6 grid gap-3 text-sm text-muted-foreground"><p className="flex gap-2"><Truck className="size-5 shrink-0 text-brand" />Delivery across Egypt with reliable tracking.</p><p className="flex gap-2"><ShieldCheck className="size-5 shrink-0 text-brand" />Official warranty and expert support.</p><p className="flex gap-2"><Check className="size-5 shrink-0 text-brand" />Reserve online, collect from your preferred branch.</p></div><BranchAvailability branches={product.branches ?? []} /></section></div>
    <section className="mt-12 grid gap-8 border-t border-border pt-8 lg:grid-cols-[1fr_320px]"><div><h2 className="text-2xl font-semibold">Highlights</h2><div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">{['Professional quality', 'Official warranty', 'Expert support', 'Fast delivery'].map((item) => <div key={item} className="rounded-lg border border-border p-4 text-sm font-medium">{item}</div>)}</div><h2 className="mt-10 text-2xl font-semibold">Overview</h2><p className="mt-3 max-w-3xl leading-7 text-muted-foreground">Designed for creators who expect dependable performance, this {product.name} brings the features and flexibility to make your next project better.</p><h2 className="mt-10 text-2xl font-semibold">Specifications</h2><div className="mt-4 overflow-hidden rounded-lg border border-border"><div className="grid grid-cols-2 border-b border-border p-4 text-sm"><span className="text-muted-foreground">Category</span><span>{product.category}</span></div><div className="grid grid-cols-2 p-4 text-sm"><span className="text-muted-foreground">Availability</span><span>{product.stock === 'in_stock' ? 'In stock' : 'Check branches'}</span></div></div></div><aside className="rounded-xl border border-border bg-card p-5"><h2 className="font-semibold">Need help choosing?</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Our team can help you find the right setup for your work.</p><Button variant="outline" className="mt-5 min-h-11 w-full">Talk to an expert</Button></aside></section>
    <div aria-hidden={!showStickyPurchase} style={{ bottom: compareItems.length ? 'calc(var(--fixed-stack-bottom) + var(--compare-tray-height))' : 'var(--fixed-stack-bottom)' }} className={`pointer-events-none fixed inset-x-0 z-[65] border-t border-border bg-background/95 px-4 pt-3 backdrop-blur transition-[opacity,transform] duration-180 lg:hidden ${showStickyPurchase ? 'pointer-events-auto translate-y-0 opacity-100' : 'translate-y-2 opacity-0'} pb-[calc(0.75rem+var(--safe-area-bottom))]`}>
      <div className="mx-auto flex max-w-md items-center gap-3"><span className="min-w-0 flex-1 truncate text-sm font-semibold">{formatMoney(product.price)}</span><AddToCartButton productName={product.name} stock={product.stock} className="min-h-11 shrink-0" /></div>
    </div>
  </main>
}
