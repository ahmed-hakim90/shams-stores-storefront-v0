import type { ProductAssurances } from '../types'

const obj = (v: unknown): Record<string, unknown> =>
  v && typeof v === 'object' && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : {}
const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '')
export function mapAssurances(value: unknown): ProductAssurances {
  const v = obj(value)
  const badge = (raw: unknown) => {
    if (!raw || typeof raw !== 'object') return null
    const b = obj(raw)
    return { enabled: b.enabled === true, label: str(b.label), customLabel: str(b.custom_label) }
  }
  return {
    authorized: typeof v.authorized === 'boolean' ? v.authorized : null,
    warrantyText: str(v.warranty_text),
    agent: badge(v.agent),
    warrantyBadge: badge(v.warranty_badge),
  }
}
export function contentBatches(ids: string[]): string[][] {
  const unique = [...new Set(ids.filter((id) => /^\d+$/.test(id)))].slice(
    0,
    100,
  )
  return Array.from({ length: Math.ceil(unique.length / 20) }, (_, i) =>
    unique.slice(i * 20, i * 20 + 20),
  )
}
/** Keep unknown WordPress paths on WordPress; only rewrite routes we own. */
export function storefrontLink(value: unknown): string | undefined {
  const input = str(value)
  if (!input || /[\u0000-\u0020\\]/.test(input)) return undefined
  try {
    const url = new URL(input, 'https://www.shams-stores.com')
    if (
      !['https:', 'http:'].includes(url.protocol) ||
      url.username ||
      url.password
    )
      return undefined
    if (!['www.shams-stores.com', 'shams-stores.com'].includes(url.hostname))
      return url.href
    const path = url.pathname.replace(/\/$/, '') || '/'
    const known = path
      .replace(/^\/product\//, '/p/')
      .replace(/^\/product-category\//, '/c/')
      .replace(/^\/product-brand\//, '/b/')
    if (
      known !== path ||
      /^\/(p|c|b)\//.test(path) ||
      /^\/(shop|cart|checkout|branches|contact|about|support|terms|privacy|shipping|returns|warranty|payment|faq|categories|brands|deals)?$/.test(
        path,
      )
    )
      return known + url.search + url.hash
    return url.href
  } catch {
    return undefined
  }
}
export function publicImage(value: unknown): string | undefined {
  try {
    const u = new URL(str(value))
    return u.protocol === 'https:' && !u.username && !u.password
      ? u.href
      : undefined
  } catch {
    return undefined
  }
}
export function mergeAssurances<
  T extends { official?: boolean; assurances?: ProductAssurances },
>(product: T, content: unknown): T {
  const raw = obj(obj(content).product)
  if (!raw.assurances || typeof raw.assurances !== 'object') return product
  const assurances = mapAssurances(raw.assurances)
  return { ...product, assurances, official: assurances.authorized === true }
}

export function mapSiteContent(value: unknown) {
  const data = obj(value),
    shell = obj(data.shell)
  const branches = (Array.isArray(shell.branches) ? shell.branches : [])
    .map((raw) => {
      const b = obj(raw)
      return {
        name: str(b.name),
        address: str(b.address),
        hours: str(b.hours),
        phones: (Array.isArray(b.phones) ? b.phones : []).filter(
          (p): p is string =>
            typeof p === 'string' && /^[+\d\s()-]{5,30}$/.test(p),
        ),
        map: storefrontLink(b.map),
      }
    })
    .filter((b) => b.name && b.address)
  const menus = Object.fromEntries(
    Object.entries(obj(shell.menus)).map(([location, raw]) => [
      location,
      (Array.isArray(raw) ? raw : []).flatMap((item) => {
        const m = obj(item),
          href = storefrontLink(m.url)
        return href && str(m.label)
          ? [
              {
                id: String(m.id),
                parent: Number(m.parent) || 0,
                label: str(m.label),
                href,
              },
            ]
          : []
      }),
    ]),
  )
  const ui = obj(data.commerce_ui)
  return {
    branches,
    menus,
    labels: { add: str(ui.add_label), details: str(ui.details_label) },
  }
}
export type SiteShell = ReturnType<typeof mapSiteContent>
