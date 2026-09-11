import Link from 'next/link'
import { ArrowRight, Check, Scale } from 'lucide-react'
import { commerce, formatMoney } from '@/lib/commerce'
import { Header } from '@/components/shams/header'
import { Footer } from '@/components/shams/footer'

export const metadata = { title: 'Compare gear | Shams Stores', description: 'Compare photography and creator gear side by side.' }

export default function ComparePage() {
  const products = commerce.products.list().slice(0, 3)
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 sm:py-12">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">Shortlist</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <div><h1 className="text-3xl font-semibold sm:text-4xl">Compare gear</h1><p className="mt-2 text-muted-foreground">See the details that matter before you choose.</p></div>
          <Link href="/c/cameras" className="inline-flex min-h-11 items-center gap-2 rounded-md border border-border px-4 text-sm font-semibold hover:border-brand hover:text-brand">Continue shopping <ArrowRight data-icon="inline-end" /></Link>
        </div>
        <div className="mt-8 overflow-x-auto rounded-lg border border-border bg-card">
          <div className="grid min-w-[720px] grid-cols-4">
            <div className="border-b border-r border-border p-4 text-sm font-semibold text-muted-foreground">Product</div>
            {products.map((product) => <div key={product.id} className="border-b border-r border-border p-4 last:border-r-0"><div className="relative aspect-square rounded-md bg-white"><img src={product.image} alt={product.name} className="size-full object-contain p-4" /></div><p className="mt-3 text-xs font-semibold uppercase text-brand">{product.brand}</p><h2 className="mt-1 min-h-12 text-sm font-semibold">{product.name}</h2><p className="mt-2 font-semibold">{formatMoney(product.price)}</p></div>)}
            <div className="border-r border-border p-4 text-sm font-medium">Availability</div>
            {products.map((product) => <div key={`${product.id}-stock`} className="border-r border-border p-4 text-sm last:border-r-0"><span className="inline-flex items-center gap-1.5 text-success"><Check className="size-4" />{product.stock === 'in_stock' ? 'In stock' : product.stock === 'low_stock' ? 'Low stock' : product.stock === 'preorder' ? 'Pre-order' : 'Out of stock'}</span><p className="mt-2 text-xs text-muted-foreground">Pickup available at selected branches</p></div>)}
            {['Rating', 'Configuration', 'Best for'].map((label, index) => <div key={label} className="contents"><div className="border-r border-t border-border p-4 text-sm font-medium">{label}</div>{products.map((product) => <div key={`${product.id}-${label}`} className="border-r border-t border-border p-4 text-sm last:border-r-0">{index === 0 ? `${product.rating ?? 4.8} / 5 (${product.reviewCount ?? 0})` : index === 1 ? product.configuration : 'Photography and hybrid work'}</div>)}</div>)}
          </div>
        </div>
        <div className="mt-8 flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-4 text-sm text-muted-foreground"><Scale className="size-5 shrink-0 text-brand" />Compare up to four products. Add another from any product card to refine your shortlist.</div>
      </main>
      <Footer />
    </div>
  )
}
