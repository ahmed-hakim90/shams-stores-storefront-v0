import { siteContent } from '@/lib/commerce/live/shams-content'
import { mapSiteContent } from '@/lib/commerce/live/shams-contract'

export async function LiveBranchesPage() {
  const shell = mapSiteContent(await siteContent())
  if (!shell.branches.length) return null
  return (
    <div className="shams-container py-8">
      <h1 className="mb-6 text-3xl font-semibold">Visit Shams</h1>
      <div className="grid gap-6 md:grid-cols-2">
        {shell.branches.map((b) => (
          <article key={b.name} dir="auto" className="shams-panel p-6">
            <h2 className="text-xl font-semibold">{b.name}</h2>
            <p className="mt-2">{b.address}</p>
            <p className="mt-2 whitespace-pre-line">{b.hours}</p>
            {b.phones.map((phone) => (
              <a
                key={phone}
                href={`tel:${phone.replace(/[^+0-9]/g, '')}`}
                className="mt-2 block text-brand-ink underline"
              >
                {phone}
              </a>
            ))}
            {b.map && (
              <a
                href={b.map}
                className="mt-4 inline-flex min-h-11 items-center text-brand-ink underline"
              >
                Open map
              </a>
            )}
          </article>
        ))}
      </div>
    </div>
  )
}
