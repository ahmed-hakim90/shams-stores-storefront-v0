import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import ts from 'typescript'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import * as jsx from 'react/jsx-runtime'
import * as icons from 'lucide-react'

function load(path, deps) {
  const code = ts.transpileModule(readFileSync(new URL(path, import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText
  const m = { exports: {} }
  new Function('require', 'module', 'exports', code)(name => {
    if (!(name in deps)) throw Error(`Unexpected dependency ${name}`)
    return deps[name]
  }, m, m.exports)
  return m.exports
}
const { HeroCarouselClient } = load('../components/shams/marketing/hero-carousel-client.tsx', {
  react: React, 'react/jsx-runtime': jsx, 'lucide-react': icons,
  'next/link': ({ prefetch, ...props }) => React.createElement('a', props),
  'next/image': { __esModule: true, default: ({ fill, priority, ...props }) => React.createElement('img', props), getImageProps: ({ fill, ...props }) => ({ props: { ...props, srcSet: `${props.src} 640w` } }) },
})
const { ManagedCampaigns } = load('../components/shams/marketing/managed-campaigns.tsx', {
  'react/jsx-runtime': jsx, './hero-carousel-client': { HeroCarouselClient },
})
const slide = { id: 'wp-1', desktop: '/desktop.jpg', mobile: '/mobile.jpg', heading: 'WordPress heading', body: 'WordPress body', eyebrow: 'Full WordPress campaign label', alt: 'Real campaign image', href: '/c/lens/tamron', label: 'Browse the offer' }
test('WordPress campaigns reuse the original carousel with responsive images and exact CTA', () => {
  const html = renderToStaticMarkup(React.createElement(ManagedCampaigns, { slides: [slide, { ...slide, id: 'wp-2' }] }))
  for (const value of ['WordPress heading', 'WordPress body', 'Full WordPress campaign label', '/mobile.jpg', '/desktop.jpg', '/c/lens/tamron', 'Browse the offer', 'Previous slide', 'Next slide', 'Go to slide 2', 'aspect-[16/10]']) assert.ok(html.includes(value), value)
  assert.ok(!html.includes('Complete Setup'))
  assert.ok(!html.includes('EGP'))
})
test('missing campaign CTA does not fabricate a category link', () => {
  const html = renderToStaticMarkup(React.createElement(ManagedCampaigns, { slides: [{ ...slide, href: undefined }] }))
  assert.ok(!html.includes('<a '))
})
test('empty carousel is safe and category fallback keeps its original link', () => {
  assert.equal(renderToStaticMarkup(React.createElement(HeroCarouselClient, { slides: [] })), '')
  const html = renderToStaticMarkup(React.createElement(HeroCarouselClient, { slides: [{ id: '1', categorySlug: 'cameras', categoryName: 'Cameras', categoryDescription: 'Browse cameras', bannerImage: '/cameras.jpg', productName: 'Cameras', productSlug: '', productPrice: '' }] }))
  assert.ok(html.includes('href="/c/cameras"'))
})
test('live homepage selects the local category carousel, not managed WordPress campaigns', async () => {
  const { LiveHero } = load('../components/shams/live/live-hero.tsx', {
    react: React, 'react/jsx-runtime': jsx,
    '@/components/shams/marketing/hero-carousel': { HeroCarousel: () => React.createElement('div', null, 'Local category banners') },
  })
  const html = renderToStaticMarkup(await LiveHero())
  assert.ok(html.includes('Local category banners'))
})
