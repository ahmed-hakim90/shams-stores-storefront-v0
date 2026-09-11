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
import { SectionHeading } from './section-heading'

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
    <section className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6 sm:py-16">
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
              className="group relative flex flex-col gap-3 overflow-hidden rounded-2xl border border-border bg-card p-5 transition-all hover:border-brand/40 hover:shadow-[0_12px_30px_-20px_rgba(21,63,112,0.4)]"
            >
              <span className="inline-flex size-11 items-center justify-center rounded-xl bg-brand-muted text-brand transition-colors group-hover:bg-brand group-hover:text-brand-foreground">
                <Icon className="size-5.5" />
              </span>
              <div className="mt-1">
                <p className="font-semibold tracking-tight text-foreground">{cat.name}</p>
                <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                  {cat.tagline}
                </p>
              </div>
              <span className="text-xs font-medium text-brand">
                {cat.itemCount} products
              </span>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
