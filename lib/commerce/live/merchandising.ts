import 'server-only'
import { cache } from 'react'
import { listProducts, terms, getProduct } from './catalog'
import {
  heroCampaignShell,
  heroGearCategories,
  publishedJourneys,
  setupProducts,
} from '../merchandising'
import type {
  ProductSummary,
  ResolvedHeroCampaign,
  ResolvedHeroStep,
} from '../types'

export const getSpotlight = cache(async () => {
  const categories = await terms('categories')
  const camera = categories.find((c) => c.slug === 'cameras')
  if (!camera) return null
  const page = await listProducts({
    category: camera.slug,
    stock: 'instock',
    sort: 'best-selling',
    pageSize: 3,
  })
  return (
    page.items.find((p) => p.image && p.purchasable && p.price.amount > 0) ??
    null
  )
})

export const getHeroCampaign = cache(async (): Promise<ResolvedHeroCampaign | null> => {
  const categories = await terms('categories')
  const available = new Set(categories.map((c) => c.slug))

  const isHeroWorthy = (p: ProductSummary) =>
    Boolean(p.image) && p.purchasable && p.price.amount > 0

  const resolved = await Promise.all(
    heroCampaignShell.steps.map(async (step): Promise<ResolvedHeroStep | null> => {
      for (const categorySlug of step.categorySlugs) {
        if (!available.has(categorySlug)) continue
        const page = await listProducts({
          category: categorySlug,
          stock: 'instock',
          sort: 'best-selling',
          pageSize: 3,
        }).catch(() => null)
        const product = page?.items.find(isHeroWorthy)
        if (!product) continue
        return {
          id: step.id,
          label: step.label,
          categorySlug,
          description: step.description,
          product,
        }
      }
      return null
    }),
  )

  const steps = resolved.filter(
    (step): step is ResolvedHeroStep => step !== null,
  )
  if (steps.length < 2) return null

  const stepIds = new Set(steps.map((step) => step.product.id))
  let compatibleGear: ProductSummary[] = []
  for (const slug of heroGearCategories) {
    if (!available.has(slug)) continue
    if (steps.some((step) => step.categorySlug === slug)) continue
    const page = await listProducts({
      category: slug,
      stock: 'instock',
      sort: 'best-selling',
      pageSize: 4,
    }).catch(() => null)
    compatibleGear = (page?.items ?? [])
      .filter((product) => isHeroWorthy(product) && !stepIds.has(product.id))
      .slice(0, 3)
    if (compatibleGear.length) break
  }

  return {
    id: heroCampaignShell.id,
    title: heroCampaignShell.title,
    subtitle: heroCampaignShell.subtitle,
    badge: heroCampaignShell.badge,
    steps,
    compatibleGear,
    bundleCtaLabel: heroCampaignShell.bundleCtaLabel,
    bundleCtaHref: heroCampaignShell.bundleCtaHref,
  }
})

export const getBrandShowcase = cache(async () => {
  const brands = await terms('brands')
  const sorted = [...brands].sort((a, b) => b.count - a.count)
  const brand = brands.find((b) => b.slug === 'sony') ?? sorted[0]
  if (!brand) return null
  const page = await listProducts({
    brand: brand.slug,
    stock: 'instock',
    sort: 'best-selling',
    pageSize: 3,
  })
  return {
    brand,
    brands: sorted.filter((b) => b.id !== brand.id).slice(0, 8),
    products: page.items,
  }
})

export const getCreatorJourneys = cache(async () => {
  const selected = publishedJourneys(await terms('tags'))
  return (
    await Promise.all(
      selected.map(async (journey) => {
        const page = await listProducts({
          tag: journey.tag,
          pageSize: 1,
          sort: 'newest',
        }).catch(() => null)
        const product = page?.items[0]
        return product ? { ...journey, image: product.image } : null
      }),
    )
  ).filter((j) => j !== null)
})

export const getSetupDiscovery = cache(async () => {
  const anchor = await getSpotlight().catch(() => null)
  if (!anchor) return null
  const detail = await getProduct(anchor.slug, 'relationships').catch(() => null)
  const products = setupProducts(anchor, detail?.relationships ?? [])
  return products.length ? { anchor, products } : null
})

export const getBundleStory = cache(async () => {
  const category = (await terms('categories')).find((c) => c.slug === 'bundles')
  if (!category) return null
  // Respect Store API visibility. A hidden plugin bundle is not an editorial campaign.
  const page = await listProducts({
    category: category.slug,
    pageSize: 1,
    sort: 'newest',
  })
  const summary = page.items[0]
  if (!summary) return null
  return getProduct(summary.slug, 'summary')
})

export const getBrandCampaign = cache(async () => {
  const brands = await terms('brands')
  const brand =
    brands.find((b) => b.slug === 'dji') ??
    brands.find((b) => b.slug === 'godox')
  if (!brand) return null
  const page = await listProducts({
    brand: brand.slug,
    stock: 'instock',
    pageSize: 1,
    sort: 'newest',
  })
  return page.items[0] ? { brand, product: page.items[0] } : null
})
