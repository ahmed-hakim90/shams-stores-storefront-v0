'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, ChevronRight, Truck, Tag, Layers, Check } from 'lucide-react'
import { commerce, formatMoney, formatEgp } from '@/lib/commerce'
import type {
  ResolvedHeroCampaign,
  ResolvedHeroStep,
  ProductSummary,
} from '@/lib/commerce'
import { ProductImage } from '../product/product-image'
import { StockStatus } from '../product/stock-status'

const AUTO_ADVANCE_MS = 4000

export function Hero() {
  const campaign = commerce.heroCampaigns.active()
  if (!campaign) return <HeroFallback />

  const steps = campaign.steps.flatMap<ResolvedHeroStep>((step) => {
    const product = commerce.products.byId(step.productId)
    if (!product) return []
    return [
      {
        id: step.id,
        label: step.label,
        categorySlug: step.categorySlug,
        description: step.description,
        product,
      },
    ]
  })
  if (steps.length < 2) return <HeroFallback />

  return (
    <HeroCascade
      campaign={{
        id: campaign.id,
        title: campaign.title,
        subtitle: campaign.subtitle,
        badge: campaign.badge,
        steps,
        compatibleGear: commerce.products.byIds(campaign.compatibleGearIds),
        bundleCtaLabel: campaign.bundleCtaLabel,
        bundleCtaHref: campaign.bundleCtaHref,
      }}
    />
  )
}

export function HeroCascade({ campaign }: { campaign: ResolvedHeroCampaign }) {
  const totalSteps = campaign.steps.length
  const completeStepIndex = totalSteps
  const [activeIndex, setActiveIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null)
  const isComplete = activeIndex === completeStepIndex

  const stepProducts = campaign.steps.map((step) => step.product)
  const compatibleGear = campaign.compatibleGear
  const activeProduct = isComplete ? null : stepProducts[activeIndex]
  const activeStep = isComplete ? null : campaign.steps[activeIndex]

  const goToStep = useCallback(
    (index: number) => {
      if (index === activeIndex) return
      setHasInteracted(true)
      setIsTransitioning(true)
      setTimeout(() => {
        setActiveIndex(index)
        setIsTransitioning(false)
      }, 180)
    },
    [activeIndex],
  )

  const advance = useCallback(() => {
    goToStep(activeIndex >= totalSteps ? 0 : activeIndex + 1)
  }, [activeIndex, totalSteps, goToStep])

  useEffect(() => {
    if (hasInteracted) return
    timerRef.current = setTimeout(advance, AUTO_ADVANCE_MS)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [activeIndex, hasInteracted, advance])

  const handleStepClick = (index: number) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    goToStep(index)
  }

  const view = {
    campaign,
    stepProducts,
    compatibleGear,
    activeIndex,
    activeProduct,
    activeStep,
    isComplete,
    isTransitioning,
    totalSteps,
    onStepClick: handleStepClick,
  }

  return (
    <section className="mx-auto max-w-[1440px] px-4 pt-3 sm:px-6 sm:pt-4">
      <CampaignBar campaign={campaign} />

      <div>
        <MobileHero {...view} />
        <DesktopHero {...view} />
      </div>

      <TrustStrip />
    </section>
  )
}

type HeroViewProps = {
  campaign: ResolvedHeroCampaign
  stepProducts: ProductSummary[]
  compatibleGear: ProductSummary[]
  activeIndex: number
  activeProduct: ProductSummary | null
  activeStep: ResolvedHeroStep | null
  isComplete: boolean
  isTransitioning: boolean
  totalSteps: number
  onStepClick: (index: number) => void
}

function CampaignBar({ campaign }: { campaign: ResolvedHeroCampaign }) {
  return (
    <div className="hero-cascade-fade-in mb-3 flex items-center justify-between gap-3 border border-border bg-surface-editorial-dark px-3 py-2 text-brand-foreground sm:px-4">
      <div className="flex min-w-0 items-center gap-2">
        {campaign.badge && (
          <span className="inline-flex size-1.5 shrink-0 rounded-full bg-brand" />
        )}
        <span className="truncate text-[11px] font-semibold uppercase tracking-wider text-brand-foreground/90">
          {campaign.badge}
        </span>
      </div>
      <span className="hidden shrink-0 text-[11px] text-brand-foreground/60 sm:inline">
        {campaign.subtitle}
      </span>
    </div>
  )
}

/**
 * Mobile composition: product-first. The stage leads, the setup steps become a
 * swipeable segmented rail and commerce collapses into one card — the desktop
 * two-column cascade does not survive a narrow viewport.
 */
function MobileHero({
  campaign,
  stepProducts,
  compatibleGear,
  activeIndex,
  activeProduct,
  activeStep,
  isComplete,
  isTransitioning,
  totalSteps,
  onStepClick,
}: HeroViewProps) {
  return (
    <div className="lg:hidden">
      {/* Headline */}
      <div className="mb-2 space-y-1">
        <h1 className="text-xl font-semibold tracking-[-0.03em] text-foreground sm:text-2xl">
          {campaign.title}
        </h1>
        <p className="text-xs text-muted-foreground">{campaign.subtitle}</p>
      </div>

      {/* Stage */}
      <div className="relative overflow-hidden border border-border bg-surface">
        <StageGlow />
        <div className="relative flex aspect-[4/3] items-center justify-center p-4">
          {isComplete ? (
            <CompleteStage
              products={stepProducts}
              compatibleGear={compatibleGear}
            />
          ) : activeProduct ? (
            <div
              className={`relative aspect-square h-full max-h-full transition-all duration-200 ${
                isTransitioning ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
              }`}
            >
              <ProductImage
                src={activeProduct.image || '/placeholder.svg'}
                alt={`${activeProduct.brand} ${activeProduct.name}`}
                fill
                priority={activeIndex === 0}
                sizes="(max-width: 1023px) 70vw, 420px"
                className="object-contain drop-shadow-xl"
              />
            </div>
          ) : null}
        </div>
        <span className="absolute right-2 top-2 border border-border bg-surface-raised/90 px-2 py-0.5 text-[10px] font-semibold tabular-nums text-muted-foreground">
          {isComplete ? 'Complete' : `${activeIndex + 1} / ${totalSteps}`}
        </span>
      </div>

      {/* Segmented step rail */}
      <nav
        aria-label="Setup steps"
        className="shams-scrollbar-none -mx-4 mt-2 flex gap-1.5 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6"
      >
        {campaign.steps.map((step, index) => {
          const isActive = index === activeIndex && !isComplete
          const isPast = index < activeIndex || isComplete
          return (
            <button
              key={step.id}
              onClick={() => onStepClick(index)}
              className={`flex shrink-0 items-center gap-1.5 border px-3 py-2 text-[11px] font-semibold transition-colors duration-200 ${
                isActive
                  ? 'border-brand bg-brand text-brand-foreground'
                  : isPast
                    ? 'border-brand/40 bg-brand/10 text-brand-ink'
                    : 'border-border bg-surface-raised text-muted-foreground'
              }`}
            >
              <span className="tabular-nums opacity-70">
                {isPast ? <Check className="size-3" /> : index + 1}
              </span>
              {step.label}
            </button>
          )
        })}
        <button
          onClick={() => onStepClick(totalSteps)}
          className={`flex shrink-0 items-center gap-1.5 border px-3 py-2 text-[11px] font-semibold transition-colors duration-200 ${
            isComplete
              ? 'border-brand bg-brand text-brand-foreground'
              : 'border-border bg-surface-raised text-muted-foreground'
          }`}
        >
          <Layers className="size-3" />
          Complete
        </button>
      </nav>

      {/* Commerce card */}
      <div className="mt-2 border border-border bg-surface-raised p-4">
        {isComplete ? (
          <CompleteCommerce campaign={campaign} />
        ) : activeProduct && activeStep ? (
          <MobileStepCommerce
            product={activeProduct}
            step={activeStep}
            isTransitioning={isTransitioning}
          />
        ) : null}
      </div>

      {/* Compatible gear */}
      {!isComplete && compatibleGear.length > 0 && (
        <div className="shams-scrollbar-none -mx-4 mt-2 flex gap-2 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6">
          {compatibleGear.map((gear) => (
            <GearChip key={gear.id} gear={gear} />
          ))}
        </div>
      )}
    </div>
  )
}

function DesktopHero({
  campaign,
  stepProducts,
  compatibleGear,
  activeIndex,
  activeProduct,
  activeStep,
  isComplete,
  isTransitioning,
  totalSteps,
  onStepClick,
}: HeroViewProps) {
  const completeStepIndex = totalSteps
  return (
    <div className="hidden lg:grid lg:grid-cols-12 lg:gap-0">
      {/* Left: Commerce panel */}
      <div className="lg:col-span-5">
        <div className="flex h-full flex-col border border-border bg-surface-raised p-5 sm:p-6">
          <div className="mb-5 space-y-2">
            <h1 className="shams-text-h1 text-foreground">{campaign.title}</h1>
            <p className="text-sm text-muted-foreground">{campaign.subtitle}</p>
          </div>

          <nav className="mb-5 space-y-0.5" aria-label="Setup steps">
            {campaign.steps.map((step, index) => {
              const isActive = index === activeIndex && !isComplete
              const isPast = index < activeIndex || isComplete
              const product = stepProducts[index]

              return (
                <button
                  key={step.id}
                  onClick={() => onStepClick(index)}
                  className={`group flex w-full items-center gap-3 border-l-2 px-3 py-2.5 text-left transition-all duration-200 ${
                    isActive
                      ? 'border-brand bg-accent-warm-muted/40'
                      : isPast
                        ? 'border-brand/30 bg-transparent'
                        : 'border-border bg-transparent hover:border-line-strong hover:bg-surface-subtle'
                  }`}
                >
                  <span
                    className={`flex size-6 shrink-0 items-center justify-center text-[11px] font-bold ${
                      isActive
                        ? 'bg-brand text-brand-foreground'
                        : isPast
                          ? 'bg-brand/15 text-brand-ink'
                          : 'bg-surface-subtle text-muted-foreground'
                    }`}
                  >
                    {isPast ? <Check className="size-3" /> : index + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className={`block text-xs font-semibold ${
                        isActive
                          ? 'text-foreground'
                          : isPast
                            ? 'text-foreground/80'
                            : 'text-muted-foreground'
                      }`}
                    >
                      {step.label}
                    </span>
                    {isActive && product && (
                      <span className="block truncate text-[11px] text-muted-foreground">
                        {product.brand} {product.name}
                      </span>
                    )}
                  </span>
                  {isActive && (
                    <ChevronRight className="size-3.5 shrink-0 text-brand" />
                  )}
                </button>
              )
            })}

            <button
              onClick={() => onStepClick(completeStepIndex)}
              className={`group flex w-full items-center gap-3 border-l-2 px-3 py-2.5 text-left transition-all duration-200 ${
                isComplete
                  ? 'border-brand bg-accent-warm-muted/40'
                  : 'border-border bg-transparent hover:border-line-strong hover:bg-surface-subtle'
              }`}
            >
              <span
                className={`flex size-6 shrink-0 items-center justify-center text-[11px] font-bold ${
                  isComplete
                    ? 'bg-brand text-brand-foreground'
                    : 'bg-surface-subtle text-muted-foreground'
                }`}
              >
                <Layers className="size-3" />
              </span>
              <span
                className={`text-xs font-semibold ${
                  isComplete ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                Complete Setup
              </span>
              {isComplete && (
                <ChevronRight className="size-3.5 shrink-0 text-brand" />
              )}
            </button>
          </nav>

          <div className="mt-auto space-y-3 border-t border-border pt-4">
            {isComplete ? (
              <CompleteCommerce campaign={campaign} />
            ) : activeProduct && activeStep ? (
              <StepCommerce
                product={activeProduct}
                step={activeStep}
                isTransitioning={isTransitioning}
              />
            ) : null}
          </div>
        </div>
      </div>

      {/* Right: Product stage */}
      <div className="lg:col-span-7">
        <div className="relative flex h-full min-h-[360px] flex-col overflow-hidden border border-border bg-surface">
          <StageGlow />

          <div className="relative flex flex-1 items-center justify-center p-6 sm:p-8">
            {isComplete ? (
              <CompleteStage
                products={stepProducts}
                compatibleGear={compatibleGear}
              />
            ) : activeProduct ? (
              <div
                className={`relative aspect-square w-full max-w-sm transition-all duration-200 ${
                  isTransitioning ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
                }`}
              >
                <ProductImage
                  src={activeProduct.image || '/placeholder.svg'}
                  alt={`${activeProduct.brand} ${activeProduct.name}`}
                  fill
                  priority={activeIndex === 0}
                  sizes="(min-width: 1024px) 420px, 70vw"
                  className="object-contain drop-shadow-xl"
                />
              </div>
            ) : null}
          </div>

          {!isComplete && compatibleGear.length > 0 && (
            <div className="border-t border-border bg-surface-raised/80 px-4 py-3 backdrop-blur-sm">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Compatible gear
              </p>
              <div className="shams-scrollbar-none flex gap-2 overflow-x-auto">
                {compatibleGear.map((gear) => (
                  <GearChip key={gear.id} gear={gear} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StageGlow() {
  return (
    <div
      aria-hidden
      className="absolute inset-0 opacity-30"
      style={{
        backgroundImage:
          'radial-gradient(120% 100% at 50% 20%, color-mix(in oklab, var(--color-brand) 12%, transparent) 0%, transparent 60%)',
      }}
    />
  )
}

function GearChip({ gear }: { gear: ProductSummary }) {
  return (
    <Link
      href={`/p/${gear.slug}`}
      className="group flex shrink-0 items-center gap-2 border border-border bg-surface-raised px-2.5 py-1.5 transition-colors hover:border-brand/40"
    >
      <div className="relative size-8 shrink-0">
        <ProductImage
          src={gear.image || '/placeholder.svg'}
          alt={gear.name}
          fill
          sizes="32px"
          className="object-contain"
        />
      </div>
      <div className="min-w-0">
        <p className="truncate text-[11px] font-medium text-foreground">
          {gear.brand} {gear.name}
        </p>
        <p className="text-[10px] text-muted-foreground">
          {formatMoney(gear.price)}
        </p>
      </div>
    </Link>
  )
}

function MobileStepCommerce({
  product,
  step,
  isTransitioning,
}: {
  product: ProductSummary
  step: ResolvedHeroStep
  isTransitioning: boolean
}) {
  return (
    <div
      className={`space-y-3 transition-all duration-200 ${
        isTransitioning ? 'translate-y-1 opacity-0' : 'translate-y-0 opacity-100'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-brand-ink">
            {step.label}
          </p>
          <h2 className="mt-0.5 truncate text-sm font-semibold text-foreground">
            {product.brand} {product.name}
          </h2>
          {product.configuration && (
            <p className="truncate text-[11px] text-muted-foreground">
              {product.configuration}
            </p>
          )}
        </div>
        <StockStatus status={product.stock} compact />
      </div>

      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <span className="text-lg font-semibold tracking-tight text-foreground">
          {formatMoney(product.price)}
        </span>
        {product.previousPrice && (
          <span className="text-[11px] text-muted-foreground line-through">
            {formatMoney(product.previousPrice)}
          </span>
        )}
        {product.installmentFrom && (
          <span className="w-full text-[11px] text-muted-foreground">
            or {formatEgp(product.installmentFrom)}/mo over 24 months
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Link href={`/p/${product.slug}`} className="shams-button text-[11px]">
          Shop {step.label.toLowerCase()}
          <ArrowRight className="size-3" />
        </Link>
        <Link
          href={`/c/${step.categorySlug}`}
          className="shams-button shams-button-secondary text-[11px]"
        >
          Browse
        </Link>
      </div>
    </div>
  )
}

function StepCommerce({
  product,
  step,
  isTransitioning,
}: {
  product: ProductSummary
  step: ResolvedHeroStep
  isTransitioning: boolean
}) {
  return (
    <div
      className={`space-y-3 transition-all duration-200 ${
        isTransitioning ? 'translate-y-1 opacity-0' : 'translate-y-0 opacity-100'
      }`}
    >
      <p className="text-xs leading-relaxed text-muted-foreground">
        {step.description}
      </p>

      <div className="flex flex-wrap items-end gap-x-4 gap-y-1">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-semibold tracking-tight text-foreground">
              {formatMoney(product.price)}
            </span>
            {product.previousPrice && (
              <span className="text-[11px] text-muted-foreground line-through">
                {formatMoney(product.previousPrice)}
              </span>
            )}
          </div>
          {product.installmentFrom && (
            <p className="text-[11px] text-muted-foreground">
              or {formatEgp(product.installmentFrom)}/mo over 24 months
            </p>
          )}
        </div>
        <StockStatus status={product.stock} compact />
      </div>

      <div className="flex flex-wrap gap-2">
        <Link href={`/p/${product.slug}`} className="shams-button text-[11px]">
          Shop {step.label.toLowerCase()}
          <ArrowRight className="size-3" />
        </Link>
        <Link
          href={`/c/${step.categorySlug}`}
          className="shams-button shams-button-secondary text-[11px]"
        >
          Browse {step.label.toLowerCase()}
        </Link>
      </div>
    </div>
  )
}

function CompleteCommerce({ campaign }: { campaign: ResolvedHeroCampaign }) {
  const totalPrice = campaign.steps.reduce(
    (sum, step) => sum + step.product.price.amount,
    0,
  )

  return (
    <div className="space-y-3">
      <p className="text-xs leading-relaxed text-muted-foreground">
        Every piece selected for compatibility. One setup, ready to shoot — from
        body to support.
      </p>
      <div>
        <p className="text-lg font-semibold tracking-tight text-foreground">
          {formatMoney({ amount: totalPrice, currency: 'EGP' })}
        </p>
        <p className="text-[11px] text-muted-foreground">
          Complete {campaign.steps.length}-piece system
        </p>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap">
        {campaign.bundleCtaHref && (
          <Link href={campaign.bundleCtaHref} className="shams-button text-[11px]">
            {campaign.bundleCtaLabel ?? 'Shop complete setup'}
            <ArrowRight className="size-3" />
          </Link>
        )}
        <Link
          href="/w/filmmaking"
          className="shams-button shams-button-secondary text-[11px]"
        >
          Explore workflows
        </Link>
      </div>
    </div>
  )
}

function CompleteStage({
  products,
  compatibleGear,
}: {
  products: ProductSummary[]
  compatibleGear: ProductSummary[]
}) {
  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <div className="hero-assembly-piece relative aspect-square w-32 sm:w-40 lg:w-48">
        <ProductImage
          src={products[0]?.image || '/placeholder.svg'}
          alt={products[0]?.name ?? ''}
          fill
          sizes="192px"
          className="object-contain drop-shadow-lg"
        />
      </div>

      {products.slice(1).map((product, index) => {
        const positions = ['top-0 left-0', 'top-0 right-0', 'bottom-0 left-0']
        return (
          <div
            key={product.id}
            className={`hero-assembly-piece absolute aspect-square w-16 sm:w-20 lg:w-24 ${positions[index] ?? 'bottom-0 right-0'}`}
            style={{ animationDelay: `${(index + 1) * 120}ms` }}
          >
            <ProductImage
              src={product.image || '/placeholder.svg'}
              alt={product.name}
              fill
              sizes="96px"
              className="object-contain drop-shadow-md"
            />
          </div>
        )
      })}

      {compatibleGear.length > 0 && (
        <div className="absolute -bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
          {compatibleGear.map((gear) => (
            <Link
              key={gear.id}
              href={`/p/${gear.slug}`}
              className="hero-assembly-piece flex items-center gap-1 border border-border bg-surface-raised px-1.5 py-1 text-[9px] font-medium text-muted-foreground transition-colors hover:border-brand/40 hover:text-foreground"
            >
              <div className="relative size-4 shrink-0">
                <ProductImage
                  src={gear.image || '/placeholder.svg'}
                  alt=""
                  fill
                  sizes="16px"
                  className="object-contain"
                />
              </div>
              <span className="hidden sm:inline">{gear.brand}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

function TrustStrip() {
  return (
    <div className="hero-cascade-fade-in mt-3 grid grid-cols-2 gap-px border border-border bg-border md:grid-cols-4">
      {[
        { icon: Truck, title: 'Nationwide delivery', sub: 'Free over EGP 5,000' },
        { icon: Tag, title: 'Installments', sub: 'Up to 24 months' },
        { icon: Layers, title: 'Trade-in & used', sub: 'Certified pre-owned' },
        { icon: ArrowRight, title: 'Expert setup', sub: 'Talk to a specialist' },
      ].map((item) => (
        <div
          key={item.title}
          className="flex items-center gap-2.5 bg-card px-3 py-2.5"
        >
          <item.icon className="size-4 shrink-0 text-brand-ink" />
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-foreground">
              {item.title}
            </p>
            <p className="truncate text-[11px] text-muted-foreground">
              {item.sub}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

function HeroFallback() {
  const featured = commerce.products.byId('p-hero')
  if (!featured) return null

  return (
    <section className="mx-auto max-w-[1440px] px-4 pt-3 sm:px-6 sm:pt-4">
      <div className="grid gap-3 lg:grid-cols-12">
        <div className="relative overflow-hidden border border-border bg-brand text-brand-foreground lg:col-span-8">
          <div className="relative flex flex-col gap-4 p-5 sm:p-7 md:flex-row md:items-center">
            <div className="flex-1 space-y-3">
              <h1 className="text-balance text-2xl font-semibold leading-[1.05] tracking-tight sm:text-3xl">
                {featured.brand} {featured.name}
              </h1>
              <p className="text-sm text-brand-foreground/80">
                {featured.configuration}
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-semibold">
                  {formatMoney(featured.price)}
                </span>
                {featured.previousPrice && (
                  <span className="text-xs text-brand-foreground/60 line-through">
                    {formatMoney(featured.previousPrice)}
                  </span>
                )}
              </div>
              <Link
                href={`/p/${featured.slug}`}
                className="inline-flex h-9 items-center gap-1.5 border border-brand-foreground bg-brand-foreground px-5 text-xs font-semibold text-brand"
              >
                Shop now <ArrowRight className="size-3.5" />
              </Link>
            </div>
            <div className="relative aspect-square w-full max-w-xs shrink-0 md:w-2/5">
              <ProductImage
                src={featured.image || '/placeholder.svg'}
                alt={`${featured.brand} ${featured.name}`}
                fill
                priority
                sizes="(max-width: 768px) 80vw, 420px"
                className="object-contain drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
