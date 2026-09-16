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

/**
 * Editorial shell for the motion-led hero. Steps declare candidate categories
 * rather than products so the live catalog resolves real in-stock gear.
 *
 * The WooCommerce taxonomy is brand-organized, not function-organized: there is
 * no general "audio" or "lenses" bucket. Candidates are ordered by editorial
 * preference and tried lazily, so the happy path costs one request per step.
 * Camera and lens are deliberately both Sony E-mount so the "works as one
 * system" claim is literally true of the gear shown.
 */
export const heroCampaignShell = {
  id: 'campaign-complete-setup',
  title: 'The Complete Setup',
  subtitle: 'Camera · Lens · Audio · Support — gear that works as one system.',
  badge: 'Shams specialist pick',
  steps: [
    {
      id: 'step-camera',
      label: 'Camera',
      categorySlugs: ['sony', 'nikon', 'canon', 'cameras'],
      description:
        'The body everything else hangs off. Resolution, autofocus and video specs chosen for paid work, not just good photos.',
    },
    {
      id: 'step-lens',
      label: 'Lens',
      categorySlugs: ['sigma-lens', 'sony-lens', 'tamron', 'lens'],
      description:
        'Glass that matches the body. Fast, sharp and consistent across the frame — the difference between a camera and a kit.',
    },
    {
      id: 'step-audio',
      label: 'Audio',
      categorySlugs: ['rode-audio', 'sennheiser-audio', 'samson-audio'],
      description:
        'Clean sound is what makes footage feel professional. Wireless or on-camera, sized to the shoot.',
    },
    {
      id: 'step-support',
      label: 'Support',
      categorySlugs: ['camera-support', 'tripods'],
      description:
        'Stable shots and repeatable framing. Support is the piece that makes the rest of the system usable on location.',
    },
  ],
  bundleCtaLabel: 'Shop complete setups',
  bundleCtaHref: '/bundles',
} as const

/** Categories searched for secondary gear shown around the hero product. */
export const heroGearCategories = [
  'nanlite',
  'ulanzi-lighting',
  'accessories-misc',
] as const

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
