import Link from 'next/link'
import {
  Aperture,
  Camera,
  Lightbulb,
  Mic,
  Package,
  Plane,
  Sparkles,
  Video,
  type LucideIcon,
} from 'lucide-react'
import { commerce } from '@/lib/commerce'
import type { CategorySlug } from '@/lib/commerce'
import { SectionHeading } from '@/components/shams/shared'
import Image from 'next/image'

const icons: Record<CategorySlug, LucideIcon> = {
  cameras: Camera,
  lenses: Aperture,
  video: Video,
  audio: Mic,
  lighting: Lightbulb,
  drones: Plane,
  'creator-gear': Sparkles,
  accessories: Package,
}

export function CategoryExplorer() {
  const categories = commerce.categories.list()

  return (
    <section className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 sm:py-16">
      <SectionHeading
        eyebrow="Shop by product"
        title="Every category, expertly stocked"
        description="From first mirrorless bodies to full cinema rigs — browse the gear that defines each craft."
        href="/c"
        linkLabel="All categories"
      />
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {categories.map((cat) => {
          const Icon = icons[cat.slug]
          return (
            <Link
              key={cat.slug}
              href={`/c/${cat.slug}`}
              className="group relative flex flex-col gap-3 overflow-hidden rounded-(--radius-card) border border-border bg-card p-5 transition-colors duration-fast hover:border-foreground"
            >
              <div className="relative aspect-[1.45/1] overflow-hidden rounded-(--radius-control) bg-surface-subtle"><Image src={cat.image ?? '/images/hero-mirrorless.png'} alt="" fill sizes="(max-width: 640px) 45vw, 240px" className="object-cover transition-transform duration-standard motion-safe:[@media(hover:hover)]:group-hover:scale-[1.025]" /><span className="absolute inset-0 bg-gradient-to-t from-foreground/55 to-transparent" /><span className="absolute bottom-3 left-3 text-xs font-semibold uppercase tracking-widest text-on-dark">{cat.name}</span></div>
              <div className="mt-1">
                <p className="font-semibold tracking-tight text-foreground">{cat.name}</p>
                <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                  {cat.tagline}
                </p>
              </div>
              <span className="text-xs font-medium text-brand-ink">
                {cat.itemCount} products
              </span>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
