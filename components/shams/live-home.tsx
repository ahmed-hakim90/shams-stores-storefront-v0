import { Suspense } from 'react'
import Link from 'next/link'
import { ArrowUpRight, ArrowRight, Camera, MessageCircle } from 'lucide-react'
import { primaryCategories } from '@/lib/commerce/navigation'
import { terms, listProducts } from '@/lib/commerce/live/catalog'
import {
  homeCollections,
  type PageExperienceConfig,
} from '@/lib/commerce/experience'
import { ProductRailSection } from './product-rail-section'
import { ProductCard } from './product-card'
import { ProductImage } from './product-image'
import { LiveFooter } from './live-footer'
import { RecentlyViewed } from './saved-products'

async function Categories() {
  const all = await terms('categories').catch(() => [])
  const categories = primaryCategories(all).slice(0, 6)
  if (!categories.length) return null
  return (
    <section className="shams-container shams-section">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="shams-eyebrow">Find your focus</p>
          <h2 className="shams-title mt-3">What will you create?</h2>
        </div>
        <Link
          href="/categories"
          className="inline-flex min-h-11 items-center gap-2 text-sm font-medium"
        >
          Explore all categories <ArrowUpRight className="size-4" />
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {categories.map((cat, i) => (
          <Link
            key={cat.id}
            href={`/c/${cat.slug}`}
            className={`group relative flex min-h-48 flex-col overflow-hidden rounded-[var(--radius-card)] border bg-card ${i < 2 ? 'md:col-span-2 md:row-span-2' : ''}`}
          >
            <div
              className={`relative bg-[#f0efec] ${i < 2 ? 'aspect-square md:aspect-[1.6/1]' : 'aspect-[1.8/1]'}`}
            >
              {cat.image ? (
                <ProductImage
                  src={cat.image}
                  alt=""
                  fill
                  sizes={
                    i < 2
                      ? '(max-width:767px) 44vw, 640px'
                      : '(max-width:767px) 44vw, 320px'
                  }
                  className="object-contain p-3 transition-transform duration-300 motion-safe:[@media(hover:hover)]:group-hover:scale-[1.04]"
                />
              ) : (
                <Camera className="absolute left-1/2 top-1/2 size-12 -translate-x-1/2 -translate-y-1/2 text-muted-foreground" />
              )}
            </div>
            <div className="flex flex-1 items-center justify-between gap-2 p-4 md:p-5">
              <h3
                className={`font-semibold leading-tight ${i < 2 ? 'text-lg md:text-2xl' : 'text-base'}`}
              >
                {cat.name}
              </h3>
              <ArrowUpRight className="size-5 shrink-0 text-brand-ink" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
async function Brands() {
  const brands = (await terms('brands').catch(() => []))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)
  if (!brands.length) return null
  return (
    <section className="shams-container shams-section">
      <div className="grid overflow-hidden rounded-3xl bg-[#20211f] text-white lg:grid-cols-[.85fr_1.15fr]">
        <div className="flex flex-col justify-between p-6 sm:p-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.16em] text-orange-300">
              Your system. Your choice.
            </p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight sm:text-4xl">
              Find the names
              <br />
              behind your next idea.
            </h2>
            <p className="mt-5 max-w-md text-sm leading-7 text-white/75">
              Explore each brand’s range. Discover cameras, lenses and tools
              that fit the way you work.
            </p>
          </div>
          <Link
            href="/brands"
            className="mt-7 inline-flex min-h-11 items-center gap-3 text-sm font-medium text-orange-300"
          >
            Explore all brands <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-px bg-white/15 p-px">
          {brands.map((b) => (
            <Link
              key={b.id}
              href={`/b/${b.slug}`}
              className="group flex min-h-36 flex-col justify-between bg-[#272825] p-5 sm:min-h-44 sm:p-7"
            >
              <span className="text-xl font-semibold tracking-tight sm:text-2xl">
                {b.name}
              </span>
              <span className="mt-5 flex items-center justify-between text-xs text-white/70">
                Explore the collection{' '}
                <ArrowUpRight className="size-4 text-orange-300 transition-transform motion-safe:group-hover:-translate-y-1" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
async function Feed({ config }: { config: PageExperienceConfig }) {
  try {
    const page = await listProducts(config.query)
    if (!page.items.length) return null
    if (config.presentation === 'feature')
      return (
        <section className="border-y border-border bg-[#efede7]">
          <div className="shams-container shams-section grid items-start gap-7 lg:grid-cols-[.65fr_1.35fr]">
            <div className="lg:sticky lg:top-[calc(var(--shell-header-height)+24px)]">
              <p className="shams-eyebrow">{config.eyebrow}</p>
              <h2 className="shams-title mt-4">{config.title}</h2>
              <p className="mt-5 max-w-sm text-sm leading-7 text-muted-foreground">
                {config.description}
              </p>
              <Link href={config.href} className="shams-button mt-6">
                Explore offers <ArrowUpRight className="size-4" />
              </Link>
            </div>
            <div className="grid min-w-0 gap-4">
              {page.items.slice(0, 3).map((p) => (
                <ProductCard key={p.id} product={p} view="list" />
              ))}
            </div>
          </div>
        </section>
      )
    return <ProductRailSection {...config} products={page.items} />
  } catch {
    return (
      <section className="shams-container py-8">
        <Link
          href={config.href}
          className="shams-button shams-button-secondary"
        >
          Explore {config.eyebrow.toLowerCase()} →
        </Link>
      </section>
    )
  }
}
async function DiscoveryHero() {
  const categories = await terms('categories').catch(() => [])
  const camera = categories.find((c) => c.slug === 'cameras')
  const lens = categories.find((c) => c.slug === 'lens')
  return (
    <section className="shams-container pt-5 sm:pt-7">
      <div className="grid overflow-hidden rounded-3xl border border-border bg-[#ece9e2] md:grid-cols-[1fr_1fr]">
        <div className="relative z-10 flex flex-col justify-center p-6 sm:p-9 lg:p-12">
          <p className="shams-eyebrow">Shams Stores · For image makers</p>
          <h1 className="mt-5 text-[clamp(2.5rem,5.2vw,4.7rem)] font-semibold leading-[1.02] tracking-[-.045em]">
            Your vision.
            <br />
            <span className="text-brand-ink">The right gear.</span>
          </h1>
          <p className="mt-5 max-w-md text-base leading-7 text-muted-foreground">
            From your first frame to your next production. Find the tools to
            make it yours.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/shop" className="shams-button">
              Explore all gear <ArrowUpRight className="size-4" />
            </Link>
            <Link
              href="/support"
              className="shams-button shams-button-secondary"
            >
              Talk to a specialist
            </Link>
          </div>
        </div>
        <div className="relative min-h-64 bg-[#20211f] sm:min-h-80 md:min-h-[460px]">
          {camera?.image && (
            <ProductImage
              src={camera.image}
              alt="Photography equipment at Shams Stores"
              fill
              priority
              sizes="(max-width:767px) 92vw, 700px"
              className="object-cover"
            />
          )}
          {camera && (
            <Link
              href={`/c/${camera.slug}`}
              className="absolute bottom-5 left-5 right-5 flex min-h-16 items-center justify-between rounded-2xl border border-white/20 bg-black/65 px-5 py-3 text-white backdrop-blur-sm"
            >
              <span>
                <span className="text-xs uppercase tracking-widest text-white/70">
                  Start with the image
                </span>
                <span className="mt-1 block text-lg font-semibold">
                  Explore cameras
                </span>
              </span>
              <ArrowUpRight className="size-5" />
            </Link>
          )}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b pb-4 text-sm text-muted-foreground">
        <span className="flex min-h-11 items-center">
          Photography. Cinema. Everything you create.
        </span>
        {lens && (
          <Link
            href={`/c/${lens.slug}`}
            className="inline-flex min-h-11 items-center gap-2 font-medium text-foreground"
          >
            Find your next lens <ArrowRight className="size-4" />
          </Link>
        )}
      </div>
    </section>
  )
}
function ExpertSupport() {
  return (
    <section className="shams-container shams-section">
      <div className="flex flex-col items-start justify-between gap-6 rounded-3xl border bg-card p-6 sm:p-9 md:flex-row md:items-center">
        <div>
          <MessageCircle className="mb-4 size-7 text-brand-ink" />
          <h2 className="text-2xl font-semibold">
            Good gear starts with good advice.
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-7 text-muted-foreground">
            Choosing a camera, checking a lens or planning a production? Talk
            through your next step with Shams.
          </p>
        </div>
        <Link href="/support" className="shams-button shrink-0">
          Talk to a specialist <ArrowUpRight className="size-4" />
        </Link>
      </div>
    </section>
  )
}
export function LiveHome() {
  return (
    <>
      <main>
        <Suspense
          fallback={
            <div className="shams-container pt-6">
              <div className="h-96 animate-pulse rounded-3xl bg-muted" />
            </div>
          }
        >
          <DiscoveryHero />
        </Suspense>
        <Suspense fallback={null}>
          <Categories />
        </Suspense>
        <Suspense fallback={null}>
          <Feed config={homeCollections[0]} />
        </Suspense>
        <Suspense fallback={null}>
          <Brands />
        </Suspense>
        <Suspense fallback={null}>
          <Feed config={homeCollections[1]} />
        </Suspense>
        <Suspense fallback={null}>
          <Feed config={homeCollections[2]} />
        </Suspense>
        <RecentlyViewed />
        <ExpertSupport />
      </main>
      <LiveFooter />
    </>
  )
}
