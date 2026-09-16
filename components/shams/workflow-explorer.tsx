import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { commerce } from '@/lib/commerce'
import { SectionHeading } from './section-heading'

export function WorkflowExplorer() {
  const useCases = commerce.useCases.list()

  return (
    <section
      id="workflows"
      className="scroll-mt-28 border-y border-border bg-accent/40"
    >
      <div className="mx-auto max-w-[1440px] px-4 py-14 sm:px-6 sm:py-20">
        <SectionHeading
          eyebrow="Shop by workflow"
          title="What are you creating?"
          description="Skip the guesswork. Pick your craft and Shams assembles the camera, lens, audio, lighting and support that actually work together."
          href="/w"
          linkLabel="All workflows"
        />

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {useCases.map((u, i) => (
            <Link
              key={u.slug}
              href={`/w/${u.slug}`}
              className={
                'group relative flex min-h-72 flex-col justify-end overflow-hidden rounded-(--radius-card) border border-border ' +
                (i === 0 ? 'sm:col-span-2 lg:col-span-1' : '')
              }
            >
              <Image
                src={u.image || '/placeholder.svg'}
                alt=""
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 320px"
                className="object-cover transition-transform duration-standard group-hover:scale-[1.04]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface-overlay/90 via-surface-overlay/45 to-transparent" />
              <div className="relative space-y-3 p-5 text-white">
                <div>
                  <p className="text-lg font-semibold tracking-tight">{u.name}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-white/75">
                    {u.description}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {u.gear.slice(0, 4).map((g) => (
                    <span
                      key={g}
                      className="rounded-full bg-white/15 px-2 py-0.5 text-[0.7rem] font-medium text-white/90 backdrop-blur"
                    >
                      {g}
                    </span>
                  ))}
                </div>
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold">
                  Build {u.name.toLowerCase()} setup
                  <ArrowRight className="size-4 transition-transform duration-fast group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
