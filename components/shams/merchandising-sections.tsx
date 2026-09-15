import Link from 'next/link'
import {
  ArrowRight,
  ArrowUpRight,
  Camera,
  MapPin,
  MessageCircle,
  Plus,
  SlidersHorizontal,
} from 'lucide-react'
import type { ReactNode } from 'react'
import type { ProductSummary, TaxonomyTerm } from '@/lib/commerce/types'
import { primaryCategories } from '@/lib/commerce/navigation'
import { terms } from '@/lib/commerce/live/catalog'
import {
  getSpotlight,
  getBrandShowcase,
  getCreatorJourneys,
  getSetupDiscovery,
  getBundleStory,
  getBrandCampaign,
} from '@/lib/commerce/live/merchandising'
import { ProductImage } from './product-image'
import { PriceDisplay } from './price-display'
import { StockStatus } from './stock-status'
import { ProductCard } from './product-card'

export function MerchSectionHeading({
  eyebrow,
  title,
  description,
  href,
  action = 'Explore all',
}: {
  eyebrow?: string
  title: string
  description?: string
  href?: string
  action?: string
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        {eyebrow && <p className="shams-eyebrow mb-2">{eyebrow}</p>}
        <h2 className="text-[clamp(24px,2.3vw,34px)] font-semibold leading-tight tracking-tight">
          {title}
        </h2>
        {description && (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {href && (
        <Link
          href={href}
          className="inline-flex min-h-11 shrink-0 items-center gap-2 text-sm font-semibold text-brand-ink"
        >
          {action}
          <ArrowUpRight className="size-4" />
        </Link>
      )}
    </div>
  )
}

function ProductVisual({
  product,
  priority = false,
  sizes = '(max-width:767px) 90vw, 640px',
}: {
  product: ProductSummary
  priority?: boolean
  sizes?: string
}) {
  return (
    <ProductImage
      src={product.image}
      alt={product.name}
      fill
      priority={priority}
      sizes={sizes}
      className="object-contain p-5 transition-transform duration-300 motion-safe:[@media(hover:hover)]:group-hover:scale-[1.035]"
    />
  )
}

export async function ProductSpotlight() {
  const product = await getSpotlight().catch(() => null)
  return (
    <section className="shams-container pt-4 sm:pt-6" data-merch="hero">
      <div className="overflow-hidden rounded-2xl border border-border bg-[#edeae3]">
        <div className="grid md:min-h-[440px] md:grid-cols-[1fr_1.15fr]">
          <div className="flex min-w-0 flex-col justify-center p-6 sm:p-8 lg:p-11">
            <p className="shams-eyebrow">Capture more. Create more.</p>
            <h1 className="mt-4 text-[clamp(30px,3.5vw,52px)] font-semibold leading-[1.1] tracking-[-.035em]">
              {product?.name ?? 'Your vision. The right gear.'}
            </h1>
            <p className="mt-4 max-w-lg text-base leading-7 text-muted-foreground">
              {product
                ? 'Make room for your next perspective. Explore the details, choose your setup and create with confidence.'
                : 'Cameras, lenses and production tools. Find your next perspective with Shams.'}
            </p>
            {product && (
              <div className="mt-5">
                <PriceDisplay
                  price={product.price}
                  previousPrice={product.previousPrice}
                  installmentFrom={product.installmentFrom}
                  className="text-2xl"
                />
              </div>
            )}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href={product ? `/p/${product.slug}` : '/shop'}
                className="shams-button"
              >
                {product ? 'Explore this camera' : 'Shop all gear'}
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href={
                  product?.brandSlug ? `/b/${product.brandSlug}` : '/categories'
                }
                className="inline-flex min-h-11 items-center gap-2 px-2 text-sm font-semibold"
              >
                {product?.brand
                  ? `Explore ${product.brand}`
                  : 'Shop by category'}
                <ArrowUpRight className="size-4" />
              </Link>
            </div>
          </div>
          {product && (
            <Link
              href={`/p/${product.slug}`}
              aria-label={`View ${product.name}`}
              className="group relative block min-h-64 bg-white sm:min-h-80 md:min-h-[440px]"
            >
              <ProductVisual product={product} priority />
              <span className="absolute bottom-4 left-5 right-5 flex items-center justify-between gap-3 border-t border-border bg-white/95 pt-3 text-xs font-medium text-muted-foreground">
                <span>{product.brand || 'Shams selection'}</span>
                <StockStatus status={product.stock} className="text-xs" />
              </span>
            </Link>
          )}
        </div>
        <div className="grid gap-2 border-t border-border px-6 py-3 text-xs sm:grid-cols-3 sm:px-8">
          <Link href="/support" className="flex min-h-11 items-center gap-2">
            <MessageCircle className="size-4 text-brand-ink" />
            Advice from specialists
          </Link>
          <Link href="/compare" className="flex min-h-11 items-center gap-2">
            <SlidersHorizontal className="size-4 text-brand-ink" />
            Compare before you choose
          </Link>
          <Link href="/branches" className="flex min-h-11 items-center gap-2">
            <MapPin className="size-4 text-brand-ink" />
            Visit Shams Stores
          </Link>
        </div>
      </div>
    </section>
  )
}

export async function CategoryMosaic() {
  const all = await terms('categories').catch(() => [])
  const categories = primaryCategories(all, 6)
  if (!categories.length) return null
  return (
    <section className="shams-container merch-section" data-merch="categories">
      <MerchSectionHeading
        title="Shop by category"
        description="Everything you need to create, all in one place."
        href="/categories"
        action="View all categories"
      />
      <div className="merch-category-grid">
        {categories.map((category, index) => (
          <Link
            key={category.id}
            href={`/c/${category.slug}`}
            className={`group flex min-w-0 flex-col overflow-hidden rounded-xl border bg-card ${index < 2 ? 'merch-category-major' : ''}`}
          >
            <div
              className={`relative bg-[#eeeae4] ${index < 2 ? 'min-h-40 flex-1' : 'h-28'}`}
            >
              {category.image ? (
                <ProductImage
                  src={category.image}
                  alt=""
                  fill
                  sizes={
                    index < 2
                      ? '(max-width:767px) 44vw, 420px'
                      : '(max-width:767px) 44vw, 280px'
                  }
                  className="object-cover transition-transform duration-300 motion-safe:[@media(hover:hover)]:group-hover:scale-[1.04]"
                />
              ) : (
                <Camera className="absolute left-1/2 top-1/2 size-8 -translate-x-1/2 -translate-y-1/2 text-muted-foreground" />
              )}
            </div>
            <div className="flex items-start justify-between gap-2 p-4">
              <div>
                <h3 className="text-base font-semibold">{category.name}</h3>
                <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
                  {all
                    .filter((c) => c.parentId === category.id)
                    .slice(0, 3)
                    .map((c) => c.name)
                    .join(' · ') || 'Explore the collection'}
                </p>
              </div>
              <ArrowUpRight className="mt-1 size-4 shrink-0 text-brand-ink" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

export async function BrandShowcase() {
  const data = await getBrandShowcase().catch(() => null)
  if (!data) return null
  return (
    <section className="shams-container merch-section" data-merch="brands">
      <MerchSectionHeading
        title="Shop by brand"
        description="Find your system. Explore the names behind your next idea."
        href="/brands"
        action="View all brands"
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <Link
          href={`/b/${data.brand.slug}`}
          className="group grid min-h-72 overflow-hidden rounded-xl bg-[#20211f] text-white sm:grid-cols-[.8fr_1.2fr]"
        >
          <div className="flex flex-col justify-between p-6 lg:p-8">
            <div>
              <p className="text-xs uppercase tracking-widest text-orange-300">
                Brand spotlight
              </p>
              <h3 className="mt-3 text-4xl font-semibold tracking-tight">
                {data.brand.name}
              </h3>
              <p className="mt-4 text-sm leading-6 text-white/75">
                Find a new perspective.
                <br />
                Explore the {data.brand.name} collection.
              </p>
            </div>
            <span className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-orange-300">
              Explore {data.brand.name}
              <ArrowRight className="size-4" />
            </span>
          </div>
          <div className="relative grid min-h-56 grid-cols-2 gap-2 bg-white p-3">
            {data.products.slice(0, 3).map((p, i) => (
              <div
                key={p.id}
                className={`relative min-h-24 ${i === 0 ? 'col-span-2 min-h-40' : ''}`}
              >
                <ProductVisual
                  product={p}
                  sizes="(max-width:639px) 80vw, 320px"
                />
              </div>
            ))}
          </div>
        </Link>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
          {data.brands.map((b) => (
            <Link
              href={`/b/${b.slug}`}
              key={b.id}
              className="group flex min-h-32 min-w-0 flex-col items-center justify-between rounded-xl border bg-card p-4 text-center transition-colors hover:border-brand"
            >
              {b.image ? (
                <div className="relative h-12 w-full">
                  <ProductImage
                    src={b.image}
                    alt={b.name}
                    fill
                    sizes="120px"
                    className="object-contain"
                  />
                </div>
              ) : (
                <span className="flex min-h-12 items-center text-lg font-semibold tracking-tight">
                  {b.name}
                </span>
              )}
              <span className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
                Explore gear <ArrowUpRight className="size-3" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export async function UseCaseDiscovery() {
  const journeys = await getCreatorJourneys().catch(() => [])
  if (!journeys.length) return null
  return (
    <section className="shams-container merch-section" data-merch="use-cases">
      <MerchSectionHeading
        title="What are you creating?"
        description="Find a starting point for the way you work."
      />
      <div
        className="merch-discovery-rail"
        role="region"
        aria-label="Creator collections"
        tabIndex={0}
      >
        {journeys.map((j) => (
          <Link
            key={j.tag}
            href={`/w/${j.tag}`}
            className="group w-[72vw] max-w-60 shrink-0 snap-start overflow-hidden rounded-xl border bg-card sm:w-52 xl:max-w-none xl:flex-1"
          >
            <div className="relative aspect-[1.5/1] bg-white">
              <ProductImage
                src={j.image}
                alt=""
                fill
                sizes="240px"
                className="object-contain p-4 transition-transform duration-300 motion-safe:[@media(hover:hover)]:group-hover:scale-[1.04]"
              />
            </div>
            <div className="border-t p-4">
              <h3 className="font-semibold">{j.title}</h3>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                {j.description}
              </p>
              <span className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-brand-ink">
                Explore collection
                <ArrowRight className="size-3" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

export async function SetupDiscovery() {
  const [setup, all] = await Promise.all([
    getSetupDiscovery().catch(() => null),
    terms('categories').catch(() => []),
  ])
  if (setup)
    return (
      <section className="shams-container merch-section" data-merch="setup">
        <MerchSectionHeading
          title="Complete your setup"
          description={`Explore store-selected gear for ${setup.anchor.name}.`}
          href={`/p/${setup.anchor.slug}`}
          action="Explore this setup"
        />
        <div className="grid gap-5 lg:grid-cols-[.7fr_1.3fr]">
          <div className="rounded-xl border bg-[#eeeae4] p-6">
            <p className="shams-eyebrow">Start here</p>
            <Link
              href={`/p/${setup.anchor.slug}`}
              className="mt-3 block text-xl font-semibold"
            >
              {setup.anchor.name}
            </Link>
            <div className="relative mt-4 aspect-[1.4/1] bg-white">
              <ProductVisual product={setup.anchor} sizes="420px" />
            </div>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              Check each item’s options and availability before adding it to
              your kit.
            </p>
          </div>
          <div className="grid gap-3">
            {setup.products.map(({ product, reason }) => (
              <div key={product.id}>
                <p className="mb-2 text-xs font-medium text-muted-foreground">
                  {reason}
                </p>
                <ProductCard product={product} view="compact-related" />
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  const steps = [
    'cameras',
    'lens',
    'rode-audio',
    'memory-cards',
    'camera-support',
  ].flatMap((slug) => {
    const term = all.find((c) => c.slug === slug)
    return term ? [term] : []
  })
  if (!steps.length) return null
  return (
    <section className="shams-container merch-section" data-merch="setup-guide">
      <MerchSectionHeading
        title="Complete your setup"
        description="Think beyond the camera. Explore each part of your kit, then check compatibility with a specialist."
        href="/support"
        action="Plan my setup"
      />
      <div
        className="shams-scrollbar-none flex snap-x gap-3 overflow-x-auto overscroll-x-contain pb-3"
        role="region"
        aria-label="Setup planning categories"
        tabIndex={0}
      >
        {steps.map((t, i) => (
          <div
            key={t.id}
            className="flex min-w-0 shrink-0 snap-start items-center gap-3 lg:flex-1"
          >
            <Link
              href={`/c/${t.slug}`}
              className="group flex w-40 flex-col rounded-xl border bg-card p-4 lg:w-full"
            >
              <span className="text-xs text-muted-foreground">0{i + 1}</span>
              <div className="relative my-3 aspect-square">
                {t.image && (
                  <ProductImage
                    src={t.image}
                    alt=""
                    fill
                    sizes="160px"
                    className="object-contain"
                  />
                )}
              </div>
              <span className="text-sm font-semibold">{t.name}</span>
              <span className="mt-2 text-xs text-brand-ink">
                Explore gear →
              </span>
            </Link>
            {i < steps.length - 1 && (
              <Plus
                aria-hidden
                className="size-4 shrink-0 text-muted-foreground"
              />
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

export async function BundleStory() {
  const bundle = await getBundleStory().catch(() => null)
  if (!bundle) return null
  return (
    <section className="shams-container merch-section" data-merch="bundle">
      <div className="grid overflow-hidden rounded-2xl border bg-[#f0ebe2] md:grid-cols-2">
        <div className="p-6 sm:p-9">
          <p className="shams-eyebrow">A complete starting point</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight">
            {bundle.name}
          </h2>
          {bundle.shortDescription && (
            <p className="mt-4 line-clamp-4 text-sm leading-7 text-muted-foreground">
              {bundle.shortDescription}
            </p>
          )}
          <p className="mt-4 text-sm leading-6">
            Explore the included equipment and configuration with the Shams
            team.
          </p>
          <Link href={`/p/${bundle.slug}`} className="shams-button mt-6">
            Explore the kit
            <ArrowRight className="size-4" />
          </Link>
        </div>
        <Link
          href={`/p/${bundle.slug}`}
          className="group relative min-h-64 bg-white"
        >
          <ProductVisual product={bundle} />
        </Link>
      </div>
    </section>
  )
}

export async function BrandCampaign() {
  const campaign = await getBrandCampaign().catch(() => null)
  if (!campaign) return null
  return (
    <section className="shams-container merch-section" data-merch="campaign">
      <Link
        href={`/b/${campaign.brand.slug}`}
        className="group grid overflow-hidden rounded-xl bg-[#20211f] text-white md:grid-cols-[1fr_320px]"
      >
        <div className="flex flex-col justify-center p-6 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-orange-300">
            Explore {campaign.brand.name}
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">
            A different perspective starts here.
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-white/75">
            Discover {campaign.brand.name} equipment in the Shams catalog.
          </p>
          <span className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold">
            Find your next tool
            <ArrowRight className="size-4" />
          </span>
        </div>
        <div className="relative min-h-60 bg-white">
          <ProductVisual
            product={campaign.product}
            sizes="(max-width:767px) 80vw, 320px"
          />
        </div>
      </Link>
    </section>
  )
}

export function ExpertTrust() {
  return (
    <section className="shams-container merch-section" data-merch="trust">
      <div className="grid gap-4 md:grid-cols-2">
        <TrustCard
          icon={<MessageCircle className="size-6" />}
          title="Expert support. Real people."
          description="Choosing your first camera or planning your next production? Talk through the equipment, options and availability with Shams."
          href="/support"
          action="Talk to a specialist"
        />
        <TrustCard
          icon={<MapPin className="size-6" />}
          title="Visit Shams Stores"
          description="Prefer to talk it through in person? Contact our team for current branch details and availability before your visit."
          href="/branches"
          action="Plan your visit"
        />
      </div>
    </section>
  )
}
function TrustCard({
  icon,
  title,
  description,
  href,
  action,
}: {
  icon: ReactNode
  title: string
  description: string
  href: string
  action: string
}) {
  return (
    <div className="flex flex-col items-start rounded-xl border bg-card p-6 sm:p-8">
      <span className="text-brand-ink">{icon}</span>
      <h2 className="mt-4 text-2xl font-semibold tracking-tight">{title}</h2>
      <p className="mt-3 max-w-lg text-sm leading-7 text-muted-foreground">
        {description}
      </p>
      <Link
        href={href}
        className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-brand-ink"
      >
        {action}
        <ArrowRight className="size-4" />
      </Link>
    </div>
  )
}
