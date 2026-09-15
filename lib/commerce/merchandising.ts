import type { ProductSummary, RelationshipGroup, TaxonomyTerm } from './types'

/** Editorial labels reference existing backend collections; they never create memberships. */
export const creatorJourneys = [
  {
    tag: 'pro-video-vlogging',
    title: 'Video & vlogging',
    description: 'Bring your story into focus.',
  },
  {
    tag: 'podcasting-equipment',
    title: 'Podcasting',
    description: 'Make every voice count.',
  },
  {
    tag: 'pro-studio',
    title: 'Studio',
    description: 'Take control of your light and sound.',
  },
  {
    tag: 'mobile-photo-gear',
    title: 'Mobile photography',
    description: 'Create wherever you go.',
  },
  {
    tag: 'wedding-event-photography-gear',
    title: 'Weddings & events',
    description: 'Be ready for the moments that matter.',
  },
  {
    tag: 'creator-audio-video',
    title: 'Audio & video',
    description: 'Give your next idea a voice.',
  },
] as const

export function publishedJourneys(tags: TaxonomyTerm[]) {
  return creatorJourneys.flatMap((journey) => {
    const term = tags.find((t) => t.slug === journey.tag && t.count > 0)
    return term ? [{ ...journey, term }] : []
  })
}

/** Keep explicit backend relationships; never relabel generic related/alternative products. */
export function setupProducts(
  anchor: ProductSummary,
  groups: RelationshipGroup[],
) {
  const seen = new Set([anchor.id])
  return groups
    .filter((g) => g.type === 'compatible' || g.type === 'accessories')
    .flatMap((g) =>
      g.products.map((product) => ({
        product,
        reason:
          g.type === 'compatible'
            ? 'Selected compatible gear'
            : 'Store-selected accessory',
      })),
    )
    .filter(({ product }) => {
      if (seen.has(product.id)) return false
      seen.add(product.id)
      return true
    })
    .slice(0, 4)
}
