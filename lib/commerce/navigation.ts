import type { TaxonomyTerm } from './types'

// Editorial navigation order referencing verified taxonomy slugs; never creates categories.
export const primaryCategorySlugs = [
  'cameras',
  'lens',
  'rode-audio',
  'accessories-misc',
  'camera-support',
  'stabilizers',
  'memory-cards',
  'bags',
]
export function primaryCategories(terms: TaxonomyTerm[], limit = 8) {
  return primaryCategorySlugs
    .flatMap((slug) => {
      const term = terms.find((t) => t.slug === slug)
      return term ? [term] : []
    })
    .slice(0, limit)
}
export function topLevelCategories(terms: TaxonomyTerm[]) {
  const top = terms.filter((t) => !t.parentId)
  const primary = primaryCategories(top, primaryCategorySlugs.length)
  const seen = new Set(primary.map((t) => t.id))
  return [
    ...primary,
    ...top.filter((t) => !seen.has(t.id)).sort((a, b) => b.count - a.count),
  ]
}
