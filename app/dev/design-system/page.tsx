import { notFound } from 'next/navigation'
import { ProductCard, PriceDisplay } from '@/components/shams/product'
import type { ProductSummary } from '@/lib/commerce/types'
export const metadata = {
  title: 'Shams design system',
  robots: { index: false, follow: false },
}
export default function DesignSystem() {
  if (process.env.NODE_ENV !== 'development') notFound()
  const fixture: ProductSummary = {
    id: 'design-preview',
    slug: 'design-preview',
    name: 'Camera with a very long configuration name and professional imaging accessories',
    brand: 'Preview brand',
    category: 'cameras',
    price: { amount: 1650000, currency: 'EGP' },
    rating: 0,
    reviewCount: 0,
    stock: 'unknown',
    image: '/placeholder.svg',
    badges: [],
    useCases: [],
    purchasable: false,
  }
  return (
    <main className="shams-container shams-section">
      <p className="shams-eyebrow">Development preview · Sample data</p>
      <h1 className="shams-title mt-3">The Shams interface.</h1>
      <p className="mt-4 max-w-xl text-muted-foreground">
        Shared surfaces, controls and difficult product data. Preview products
        cannot be purchased.
      </p>
      <section className="mt-10">
        <h2 className="text-xl font-semibold">Controls and states</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <button className="shams-button">Primary action</button>
          <button className="shams-button shams-button-secondary">
            Secondary action
          </button>
          <button className="shams-button" disabled>
            Unavailable
          </button>
          <button className="shams-button" disabled aria-busy="true">
            Adding…
          </button>
          <button className="shams-button shams-button-success">Added ✓</button>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="text-sm">
            Email
            <input
              className="mt-2 block min-h-12 w-full rounded-(--radius-control) border bg-card px-3"
              placeholder="name@example.com"
            />
          </label>
          <label className="text-sm">
            Validation state
            <input
              aria-invalid="true"
              aria-describedby="preview-error"
              className="mt-2 block min-h-12 w-full rounded-(--radius-control) border border-danger bg-card px-3"
            />
            <span id="preview-error" className="mt-2 block text-sm text-danger">
              Enter a valid email address.
            </span>
          </label>
        </div>
      </section>
      <section className="mt-10">
        <h2 className="mb-4 text-xl font-semibold">
          Horizontal cards · Long titles and prices
        </h2>
        <ProductCard product={fixture} view="list" purchaseDisabled />
      </section>
      <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <ProductCard
          product={{
            ...fixture,
            id: 'empty-preview',
            brand: '',
            name: 'Missing optional data',
            price: { amount: 0, currency: 'EGP' },
          }}
          view="rail"
          purchaseDisabled
        />
        <ProductCard
          product={{
            ...fixture,
            id: 'sale-preview',
            name: 'Sale and unavailable',
            stock: 'out_of_stock',
            badges: ['sale'],
            previousPrice: { amount: 1800000, currency: 'EGP' },
          }}
          view="rail"
          purchaseDisabled
        />
        <div className="rounded-(--radius-card) border bg-card p-5">
          <h2 className="mb-5 text-xl font-semibold">Price states</h2>
          <PriceDisplay price={fixture.price} />
          <div
            className="my-5 h-48 animate-pulse rounded-(--radius-control) bg-muted"
            aria-label="Loading product"
          />
          <PriceDisplay price={{ amount: 0, currency: 'EGP' }} />
        </div>
      </section>
    </main>
  )
}
