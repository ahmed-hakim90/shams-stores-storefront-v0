import test from 'node:test'
import assert from 'node:assert/strict'
import { publishedJourneys, setupProducts } from '../lib/commerce/merchandising.ts'

test('creator discovery only exposes nonempty, explicitly mapped backend tags', () => {
  const tags = [
    { slug: 'pro-video-vlogging', count: 12 },
    { slug: 'podcasting-equipment', count: 0 },
    { slug: 'camera-name-looks-like-a-vlogging-kit', count: 200 },
  ]
  assert.deepEqual(publishedJourneys(tags).map(j => j.tag), ['pro-video-vlogging'])
  assert.deepEqual(publishedJourneys([]), [])
})

test('setup selection excludes unverified relationships and deduplicates the anchor and accessories', () => {
  const anchor = { id: '1' }
  const groups = [
    { type: 'related', products: [{ id: '2' }] },
    { type: 'alternatives', products: [{ id: '3' }] },
    { type: 'compatible', products: [{ id: '1' }, { id: '4' }] },
    { type: 'accessories', products: [{ id: '4' }, { id: '5' }, { id: '6' }, { id: '7' }, { id: '8' }] },
  ]
  assert.deepEqual(setupProducts(anchor, groups).map(x => x.product.id), ['4', '5', '6', '7'])
  assert.equal(setupProducts(anchor, groups)[1].reason, 'Store-selected accessory')
  assert.deepEqual(setupProducts(anchor, [{ type: 'related', products: [{ id: '2' }] }]), [])
})
