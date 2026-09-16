import Link from 'next/link'
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Camera,
  HelpCircle,
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
import {
  getEnabledGearGuides,
  getEnabledBuyingQuestions,
} from '@/lib/commerce/home-content'
import { ProductImage } from '../product/product-image'
import { PriceDisplay } from '../product/price-display'
import { StockStatus } from '../product/stock-status'
import { ProductCard } from '../product/product-card'

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
    <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
      <div>
        {eyebrow && <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-brand-ink">{eyebrow}</p>}
        <h2 className="text-base font-semibold leading-tight tracking-tight sm:text-lg">
          {title}
        </h2>
        {description && (
          <p className="mt-1 max-w-2xl text-xs leading-5 text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {href && (
        <Link
          href={href}
          className="inline-flex h-7 shrink-0 items-center gap-1 text-xs font-semibold text-brand-ink"
        >
          {action}
          <ArrowUpRight className="size-3" />
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
      className="object-contain p-5 transition-transform duration-standard motion-safe:[@media(hover:hover)]:group-hover:scale-[1.04]"
    />
  )
}

export async function ProductSpotlight() {
  const product = await getSpotlight().catch(() => null)
  return (
    <section className="shams-container pt-3 sm:pt-4" data-merch="hero">
      <div className="overflow-hidden border border-border bg-surface-tint">
        <div className="grid md:min-h-[360px] md:grid-cols-[1fr_1.15fr]">
          <div className="flex min-w-0 flex-col justify-center p-5 sm:p-6 lg:p-8">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-brand-ink">Capture more. Create more.</p>
            <h1 className="text-2xl font-semibold leading-[1.1] tracking-[-.035em] sm:text-3xl lg:text-[2.5rem]">
              {product?.name ?? 'Your vision. The right gear.'}
            </h1>
            <p className="mt-3 max-w-lg text-sm leading-6 text-muted-foreground">
              {product
                ? 'Make room for your next perspective. Explore the details, choose your setup and create with confidence.'
                : 'Cameras, lenses and production tools. Find your next perspective with Shams.'}
            </p>
            {product && (
              <div className="mt-4">
                <PriceDisplay
                  price={product.price}
                  previousPrice={product.previousPrice}
                  installmentFrom={product.installmentFrom}
                  className="text-xl"
                />
              </div>
            )}
            <div className="mt-4 flex flex-wrap items-center gap-2">
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
                className="inline-flex h-8 items-center gap-1.5 px-2 text-xs font-semibold"
              >
                {product?.brand
                  ? `Explore ${product.brand}`
                  : 'Shop by category'}
                <ArrowUpRight className="size-3" />
              </Link>
            </div>
          </div>
          {product && (
            <Link
              href={`/p/${product.slug}`}
              aria-label={`View ${product.name}`}
              className="group relative block min-h-56 bg-white sm:min-h-64 md:min-h-[360px]"
            >
              <ProductVisual product={product} priority />
              <span className="absolute bottom-3 left-4 right-4 flex items-center justify-between gap-3 border-t border-border bg-white/95 pt-2 text-[11px] font-medium text-muted-foreground">
                <span>{product.brand || 'Shams selection'}</span>
                <StockStatus status={product.stock} compact className="text-[11px]" />
              </span>
            </Link>
          )}
        </div>
        <div className="grid gap-1 border-t border-border px-5 py-2 text-[11px] sm:grid-cols-3 sm:px-6">
          <Link href="/support" className="flex h-8 items-center gap-1.5">
            <MessageCircle className="size-3.5 text-brand-ink" />
            Advice from specialists
          </Link>
          <Link href="/compare" className="flex h-8 items-center gap-1.5">
            <SlidersHorizontal className="size-3.5 text-brand-ink" />
            Compare before you choose
          </Link>
          <Link href="/branches" className="flex h-8 items-center gap-1.5">
            <MapPin className="size-3.5 text-brand-ink" />
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
    <section className="shams-container py-4 sm:py-5" data-merch="categories">
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
            className={`group flex min-w-0 flex-col overflow-hidden border bg-card ${index < 2 ? 'merch-category-major' : ''}`}
          >
            <div
              className={`relative bg-surface-tint ${index < 2 ? 'min-h-32 flex-1' : 'h-20'}`}
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
                  className="object-cover transition-transform duration-standard motion-safe:[@media(hover:hover)]:group-hover:scale-[1.04]"
                />
              ) : (
                <Camera className="absolute left-1/2 top-1/2 size-6 -translate-x-1/2 -translate-y-1/2 text-muted-foreground" />
              )}
            </div>
            <div className="flex items-start justify-between gap-2 p-3">
              <div>
                <h3 className="text-sm font-semibold">{category.name}</h3>
                <p className="mt-0.5 line-clamp-2 text-[11px] leading-4 text-muted-foreground">
                  {all
                    .filter((c) => c.parentId === category.id)
                    .slice(0, 3)
                    .map((c) => c.name)
                    .join(' · ') || 'Explore the collection'}
                </p>
              </div>
              <ArrowUpRight className="mt-0.5 size-3 shrink-0 text-brand-ink" />
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
    <section className="shams-container py-4 sm:py-5" data-merch="brands">
      <MerchSectionHeading
        title="Shop by brand"
        description="Find your system. Explore the names behind your next idea."
        href="/brands"
        action="View all brands"
      />
      <div className="grid gap-3 lg:grid-cols-2">
        <Link
          href={`/b/${data.brand.slug}`}
          className="group grid min-h-56 overflow-hidden border bg-surface-editorial-dark text-white sm:grid-cols-[.8fr_1.2fr]"
        >
          <div className="flex flex-col justify-between p-5 lg:p-6">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-orange-300">
                Brand spotlight
              </p>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight">
                {data.brand.name}
              </h3>
              <p className="mt-3 text-xs leading-5 text-white/75">
                Find a new perspective.
                <br />
                Explore the {data.brand.name} collection.
              </p>
            </div>
            <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-orange-300">
              Explore {data.brand.name}
              <ArrowRight className="size-3" />
            </span>
          </div>
          <div className="relative grid min-h-44 grid-cols-2 gap-1.5 bg-white p-2">
            {data.products.slice(0, 3).map((p, i) => (
              <div
                key={p.id}
                className={`relative min-h-20 ${i === 0 ? 'col-span-2 min-h-32' : ''}`}
              >
                <ProductVisual
                  product={p}
                  sizes="(max-width:639px) 80vw, 320px"
                />
              </div>
            ))}
          </div>
        </Link>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
          {data.brands.map((b) => (
            <Link
              href={`/b/${b.slug}`}
              key={b.id}
              className="group flex min-h-24 min-w-0 flex-col items-center justify-between border bg-card p-3 text-center transition-colors hover:border-brand"
            >
              {b.image ? (
                <div className="relative h-10 w-full">
                  <ProductImage
                    src={b.image}
                    alt={b.name}
                    fill
                    sizes="120px"
                    className="object-contain"
                  />
                </div>
              ) : (
                <span className="flex min-h-10 items-center text-sm font-semibold tracking-tight">
                  {b.name}
                </span>
              )}
              <span className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground">
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
    <section className="shams-container py-4 sm:py-5" data-merch="use-cases">
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
            className="group w-[72vw] max-w-52 shrink-0 snap-start overflow-hidden border bg-card sm:w-44 xl:max-w-none xl:flex-1"
          >
            <div className="relative aspect-[1.5/1] bg-white">
              <ProductImage
                src={j.image}
                alt=""
                fill
                sizes="240px"
                className="object-contain p-3 transition-transform duration-standard motion-safe:[@media(hover:hover)]:group-hover:scale-[1.04]"
              />
            </div>
            <div className="border-t p-3">
              <h3 className="text-sm font-semibold">{j.title}</h3>
              <p className="mt-0.5 text-[11px] leading-4 text-muted-foreground">
                {j.description}
              </p>
              <span className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-semibold text-brand-ink">
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
      <section className="shams-container py-4 sm:py-5" data-merch="setup">
        <MerchSectionHeading
          title="Complete your setup"
          description={`Explore store-selected gear for ${setup.anchor.name}.`}
          href={`/p/${setup.anchor.slug}`}
          action="Explore this setup"
        />
        <div className="grid gap-3 lg:grid-cols-[.7fr_1.3fr]">
          <div className="border bg-surface-tint p-4 sm:p-5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-ink">Start here</p>
            <Link
              href={`/p/${setup.anchor.slug}`}
              className="mt-2 block text-base font-semibold"
            >
              {setup.anchor.name}
            </Link>
            <div className="relative mt-3 aspect-[1.4/1] bg-white">
              <ProductVisual product={setup.anchor} sizes="420px" />
            </div>
            <p className="mt-3 text-xs leading-5 text-muted-foreground">
              Check each item's options and availability before adding it to
              your kit.
            </p>
          </div>
          <div className="grid gap-2">
            {setup.products.map(({ product, reason }) => (
              <div key={product.id}>
                <p className="mb-1.5 text-[11px] font-medium text-muted-foreground">
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
    <section className="shams-container py-4 sm:py-5" data-merch="setup-guide">
      <MerchSectionHeading
        title="Complete your setup"
        description="Think beyond the camera. Explore each part of your kit, then check compatibility with a specialist."
        href="/support"
        action="Plan my setup"
      />
      <div
        className="shams-scrollbar-none flex snap-x gap-2 overflow-x-auto overscroll-x-contain pb-2"
        role="region"
        aria-label="Setup planning categories"
        tabIndex={0}
      >
        {steps.map((t, i) => (
          <div
            key={t.id}
            className="flex min-w-0 shrink-0 snap-start items-center gap-2 lg:flex-1"
          >
            <Link
              href={`/c/${t.slug}`}
              className="group flex w-36 flex-col border bg-card p-3 lg:w-full"
            >
              <span className="text-[10px] text-muted-foreground">0{i + 1}</span>
              <div className="relative my-2 aspect-square">
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
              <span className="text-xs font-semibold">{t.name}</span>
              <span className="mt-1 text-[11px] text-brand-ink">
                Explore gear →
              </span>
            </Link>
            {i < steps.length - 1 && (
              <Plus
                aria-hidden
                className="size-3.5 shrink-0 text-muted-foreground"
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
    <section className="shams-container py-4 sm:py-5" data-merch="bundle">
      <div className="grid overflow-hidden border md:grid-cols-2">
        <div className="p-5 sm:p-7">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-ink">A complete starting point</p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">
            {bundle.name}
          </h2>
          {bundle.shortDescription && (
            <p className="mt-3 line-clamp-4 text-xs leading-5 text-muted-foreground">
              {bundle.shortDescription}
            </p>
          )}
          <p className="mt-3 text-xs leading-5">
            Explore the included equipment and configuration with the Shams
            team.
          </p>
          <Link href={`/p/${bundle.slug}`} className="shams-button mt-4">
            Explore the kit
            <ArrowRight className="size-4" />
          </Link>
        </div>
        <Link
          href={`/p/${bundle.slug}`}
          className="group relative min-h-56 bg-white"
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
    <section className="shams-container py-4 sm:py-5" data-merch="campaign">
      <Link
        href={`/b/${campaign.brand.slug}`}
        className="group grid overflow-hidden bg-surface-editorial-dark text-white md:grid-cols-[1fr_320px]"
      >
        <div className="flex flex-col justify-center p-5 sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-orange-300">
            Explore {campaign.brand.name}
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">
            A different perspective starts here.
          </h2>
          <p className="mt-2 max-w-xl text-xs leading-5 text-white/75">
            Discover {campaign.brand.name} equipment in the Shams catalog.
          </p>
          <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold">
            Find your next tool
            <ArrowRight className="size-3" />
          </span>
        </div>
        <div className="relative min-h-48 bg-white">
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
    <section className="shams-container py-4 sm:py-5" data-merch="trust">
      <div className="grid gap-3 md:grid-cols-2">
        <TrustCard
          icon={<MessageCircle className="size-5" />}
          title="Expert support. Real people."
          description="Choosing your first camera or planning your next production? Talk through the equipment, options and availability with Shams."
          href="/support"
          action="Talk to a specialist"
        />
        <TrustCard
          icon={<MapPin className="size-5" />}
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
    <div className="flex flex-col items-start border bg-card p-4 sm:p-5">
      <span className="text-brand-ink">{icon}</span>
      <h2 className="mt-3 text-base font-semibold tracking-tight sm:text-lg">{title}</h2>
      <p className="mt-2 max-w-lg text-xs leading-5 text-muted-foreground">
        {description}
      </p>
      <Link
        href={href}
        className="mt-3 inline-flex h-7 items-center gap-1.5 text-xs font-semibold text-brand-ink"
      >
        {action}
        <ArrowRight className="size-3" />
      </Link>
    </div>
  )
}

export function GearGuides() {
  const guides = getEnabledGearGuides()
  if (!guides.length) return null
  const featured = guides.find((g) => g.featured) ?? guides[0]
  const supporting = guides.filter((g) => g.id !== featured.id).slice(0, 3)
  return (
    <section className="shams-container py-4 sm:py-5" data-merch="guides">
      <MerchSectionHeading
        eyebrow="Learn before you buy"
        title="Gear guides"
        description="Equipment advice from the Shams team — start with a question, end with the right gear."
      />
      <div className="mt-3 grid gap-3 md:grid-cols-[1.4fr_1fr]">
        <Link
          href={featured.destination}
          className="group flex min-h-48 flex-col overflow-hidden border bg-surface-editorial-dark text-white md:min-h-64"
        >
          <div className="flex flex-1 flex-col justify-between p-5 sm:p-6">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-orange-300">
                {featured.eyebrow}
              </p>
              <h3 className="mt-2 text-lg font-semibold tracking-tight sm:text-xl">
                {featured.title}
              </h3>
              <p className="mt-2 max-w-md text-xs leading-5 text-white/75">
                {featured.description}
              </p>
            </div>
            <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-orange-300">
              Read the guide
              <ArrowRight className="size-3" />
            </span>
          </div>
        </Link>
        <div className="grid gap-2">
          {supporting.map((guide) => (
            <Link
              key={guide.id}
              href={guide.destination}
              className="group flex items-start gap-3 border bg-card p-4 transition-colors hover:border-brand"
            >
              <BookOpen className="mt-0.5 size-4 shrink-0 text-brand-ink" />
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {guide.eyebrow}
                </p>
                <h4 className="mt-0.5 text-sm font-semibold leading-snug">
                  {guide.title}
                </h4>
                <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-muted-foreground">
                  {guide.description}
                </p>
              </div>
              <ArrowUpRight className="mt-0.5 size-3 shrink-0 text-brand-ink opacity-0 transition-opacity group-hover:opacity-100" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export function BuyingQuestions() {
  const questions = getEnabledBuyingQuestions()
  if (!questions.length) return null
  return (
    <section className="shams-container py-4 sm:py-5" data-merch="questions">
      <MerchSectionHeading
        eyebrow="Buying help"
        title="Questions? Start here"
        description="Quick shortcuts to the gear and guides you need."
      />
      <div className="mt-3 grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {questions.map((q) => (
          <Link
            key={q.id}
            href={q.destination}
            className="group flex items-start gap-3 border bg-card p-3.5 transition-colors hover:border-brand"
          >
            <HelpCircle className="mt-0.5 size-4 shrink-0 text-brand-ink" />
            <div className="min-w-0">
              <p className="text-sm font-semibold leading-snug">{q.question}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                {q.hint}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
