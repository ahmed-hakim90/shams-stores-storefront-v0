import { contentPage } from '@/lib/commerce/live/shams-content'
import { text } from '@/lib/commerce/live/normalize'
import { ManagedContent } from '@/components/shams/live/managed-content'
import Link from 'next/link'

const FALLBACK_SECTIONS = ['terms', 'privacy', 'shipping', 'returns', 'payment', 'warranty']

export async function LiveManagedPage({ slug }: { slug: string }) {
  const page = await contentPage(slug)
  if (page) return <ManagedContent title={text(page.title)} html={String(page.content_html)} />
  if (FALLBACK_SECTIONS.includes(slug))
    return (
      <div className="shams-container py-12">
        <h1 className="text-2xl font-semibold">
          {slug.charAt(0).toUpperCase() + slug.slice(1)}
        </h1>
        <p className="mt-4">
          This information is currently unavailable. Please contact Shams to confirm the details before ordering.
        </p>
        <Link
          href="/support"
          className="mt-4 inline-flex min-h-11 items-center text-brand-ink underline"
        >
          Contact support
        </Link>
      </div>
    )
  return null
}
