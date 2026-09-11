import Link from 'next/link'
import { ArrowRight, Check, Package, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { commerce, formatMoney } from '@/lib/commerce'
import { ProductCard } from './product-card'

const steps = [
  { title: 'Choose your camera', category: 'cameras', label: 'Bodies that stay sharp on the move' },
  { title: 'Choose your audio', category: 'audio', label: 'Clear voice, indoors or outside' },
  { title: 'Add stabilization', category: 'creator-gear', label: 'Smoother handheld footage' },
  { title: 'Add lighting', category: 'lighting', label: 'Reliable light for every scene' },
  { title: 'Storage & power', category: 'accessories', label: 'Keep shooting without interruptions' },
]

export function ExperiencePage({ name, description }: { name: string; description: string }) {
  const products = commerce.products.byUseCase(name.toLowerCase() as Parameters<typeof commerce.products.byUseCase>[0]).slice(0, 6)
  const fallback = commerce.products.trending()
  return (
    <main className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 sm:py-12">
      <section className="rounded-xl bg-brand-dark px-5 py-8 text-brand-foreground sm:px-8 sm:py-12">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-foreground/70">Creator setups</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">{name}</h1>
        <p className="mt-4 max-w-2xl leading-7 text-brand-foreground/75">{description}</p>
      </section>
      <section className="mt-10">
        <div className="flex items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">Build your setup</p><h2 className="mt-2 text-2xl font-semibold">Start with what you need</h2></div><span className="hidden text-sm text-muted-foreground sm:block">Browse freely — no configurator required</span></div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {steps.map((step, index) => {
            const product = (products[index] ?? fallback[index])
            return <Link href={`/c/${step.category}`} key={step.title} className="group overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><div className="relative aspect-[4/3] bg-white"><img src={product?.image} alt="" className="size-full object-contain p-5 transition-transform duration-300 group-hover:scale-105" /></div><div className="p-4"><span className="text-xs font-semibold tracking-[0.16em] text-brand">0{index + 1}</span><h3 className="mt-2 font-semibold group-hover:text-brand">{step.title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{step.label}</p><span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand">Shop compatible gear <ArrowRight className="size-4" /></span></div></Link>
          })}
        </div>
      </section>
      <section className="mt-14"><div className="flex items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">Curated for you</p><h2 className="mt-2 text-2xl font-semibold">Recommended {name} gear</h2></div><Link href="/c/creator-gear" className="hidden text-sm font-semibold text-brand sm:inline-flex sm:items-center sm:gap-1">View all <ArrowRight className="size-4" /></Link></div><div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{(products.length ? products : fallback).map((product) => <ProductCard key={product.id} product={product} />)}</div></section>
    </main>
  )
}

export function BundlePage() {
  const products = commerce.products.trending().slice(0, 3)
  const total = products.reduce((sum, product) => sum + product.price.amount, 0)
  const bundleTotal = Math.round(total * 0.94)
  return <main className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 sm:py-12"><div className="grid gap-10 lg:grid-cols-[1fr_0.8fr]"><section><p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">Shams bundle</p><h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">The creator starter setup</h1><p className="mt-4 max-w-xl leading-7 text-muted-foreground">A considered collection of essentials for making your first complete setup. Compatible, practical and backed by our team.</p><div className="mt-8 flex flex-col gap-3">{products.map((product) => <div key={product.id} className="flex items-center gap-4 rounded-lg border border-border p-3"><div className="relative size-16 shrink-0 rounded bg-white"><img src={product.image} alt={product.name} className="size-full object-contain p-1" /></div><div className="flex-1"><p className="font-medium">{product.name}</p><p className="text-sm text-muted-foreground">{formatMoney(product.price)}</p></div><Check className="size-5 text-brand" /></div>)}</div></section><aside className="h-fit rounded-xl border border-border bg-card p-6 lg:sticky lg:top-32"><Package className="size-5 text-brand" /><h2 className="mt-5 text-xl font-semibold">Complete bundle</h2><div className="mt-5 flex items-baseline gap-3"><span className="text-3xl font-semibold">{formatMoney({ amount: bundleTotal, currency: 'EGP' })}</span><del className="text-sm text-muted-foreground">{formatMoney({ amount: total, currency: 'EGP' })}</del></div><p className="mt-2 text-sm text-brand">Save {formatMoney({ amount: total - bundleTotal, currency: 'EGP' })} when bought together</p><Button className="mt-6 min-h-12 w-full">Add entire bundle</Button><Link href="/" className="mt-4 block text-center text-sm text-muted-foreground">Continue shopping</Link></aside></div></main>
}
