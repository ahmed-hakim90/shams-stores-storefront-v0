import { commerce } from '@/lib/commerce'
import Link from 'next/link'

export function WorkflowIndexPage() {
  const useCases = commerce.useCases.list()
  return (
    <main className="shams-container max-w-[1400px] py-10 pb-[calc(2.5rem+var(--mobile-bottom-nav-height))] sm:pb-10">
      <h1 className="mb-2 text-3xl font-semibold">Shop by workflow</h1>
      <p className="mb-8 text-muted-foreground">Gear curated for how you create.</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {useCases.map((u) => (
          <Link key={u.slug} href={`/w/${u.slug}`} className="rounded-(--radius-card) border bg-card p-6 transition-colors hover:border-foreground">
            <p className="font-semibold">{u.name}</p>
            <p className="mt-1 text-sm text-muted-foreground">{u.description}</p>
          </Link>
        ))}
      </div>
    </main>
  )
}
