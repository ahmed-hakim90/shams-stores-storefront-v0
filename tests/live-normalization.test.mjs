import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  mapSummary,
  compatibleProductIds,
  mapDetail,
  mapCart,
  mapAvailability,
  price,
  safeImage,
  text,
  specifications,
} from '../lib/commerce/live/normalize.ts'

const product = {
  id: 42,
  name: 'Camera &amp; lens',
  slug: 'camera',
  type: 'simple',
  prices: {
    currency_code: 'EGP',
    currency_minor_unit: 0,
    price: '165000',
    regular_price: '180000',
  },
  images: [
    { src: 'https://www.shams-stores.com/wp-content/uploads/2026/camera.jpg' },
    { src: 'https://www.shams-stores.com/wp-content/uploads/2026/back.jpg' },
  ],
  is_purchasable: true,
  is_in_stock: true,
  review_count: 0,
  average_rating: '0',
  categories: [],
  brands: [],
}
const totals = {
  currency_code: 'EGP',
  currency_minor_unit: 0,
  total_items: '900',
  total_discount: '100',
  total_tax: '126',
  total_shipping: '50',
  total_price: '1076',
}

test('Store API money preserves integer minor units and positive discounts', () => {
  const p = price(product.prices)
  assert.equal(p.amount, 165000)
  assert.equal(p.minorUnit, 0)
  assert.equal(p.discount, 8)
  const fractional = price({
    ...product.prices,
    currency_minor_unit: 2,
    price: '10050',
  })
  assert.equal(fractional.amount, 10050)
  for (const v of ['NaN', 'Infinity', '-1', '1.5', Number.MAX_SAFE_INTEGER + 1])
    assert.throws(() => price({ ...product.prices, price: v }))
  assert.equal(
    price({ ...product.prices, regular_price: 'bad' }).regularAmount,
    undefined,
  )
  assert.throws(() => price({ ...product.prices, currency_code: 'USD' }))
})
test('zero prices cannot be bought, and never claim a 100% discount', () => {
  const p = mapSummary({
    ...product,
    prices: { ...product.prices, price: '0' },
  })
  assert.equal(p.purchasable, false)
  assert.equal(p.pricing.contactForPrice, true)
  assert.equal(p.pricing.discount, undefined)
})
test('summaries are lightweight, missing data does not fabricate stock/reviews/brand', () => {
  const p = mapSummary({
    ...product,
    is_in_stock: undefined,
    description: 'heavy detail',
    meta_data: [{ key: 'private', value: 'hidden' }],
  })
  assert.equal(p.stock, 'unknown')
  assert.equal(p.reviewCount, 0)
  assert.equal(p.brand, '')
  assert.equal(p.description, undefined)
  assert.equal(p.gallery, undefined)
  assert.equal(p.meta_data, undefined)
  assert.ok(p.secondaryImage)
  assert.equal(
    mapSummary({ ...product, is_in_stock: false }).stock,
    'out_of_stock',
  )
  assert.equal(
    mapSummary({ ...product, has_options: true, type: 'variable' }).purchasable,
    false,
  )
  assert.equal(
    mapSummary({ ...product, type: 'easy_product_bundle' }).purchasable,
    false,
  )
})
test('external images and invalid identities are rejected safely', () => {
  for (const url of [
    'javascript:alert(1)',
    'http://www.shams-stores.com/wp-content/uploads/x',
    'https://evil.test/x',
    'https://www.shams-stores.com/private/x',
  ])
    assert.equal(safeImage(url), undefined)
  assert.equal(mapSummary({ ...product, images: [] }).image, '/placeholder.svg')
  assert.throws(() => mapSummary({ ...product, id: 0 }))
  assert.throws(() => mapSummary({ ...product, name: '' }))
})
test('descriptions become plain text and warranty boolean flags do not leak', () => {
  assert.equal(
    text('<script>alert(1)</script><p>Safe &amp; sound</p>'),
    'Safe & sound',
  )
  assert.equal(
    mapDetail(product, {
      meta_data: [{ key: '_shams_product_warranty', value: 'no' }],
    }).warranty,
    undefined,
  )
  assert.equal(
    mapDetail(product, {
      meta_data: [{ key: '_shams_product_warranty', value: 'yes' }],
    }).warranty,
    'Warranty included',
  )
  const specs = specifications({
    meta_data: [
      {
        key: '_specifications',
        value: '<table><tr><th>Mount</th><td>Sony E</td></tr></table>',
      },
    ],
  })
  assert.equal(specs[0].value, 'Sony E')
  assert.equal(specs[0].filterable, false)
})
test('cart totals use Woo values including coupon, tax and unknown delivery', () => {
  const cart = mapCart({ items: [], totals })
  assert.equal(cart.subtotal, 1000)
  assert.equal(cart.discount, 100)
  assert.equal(cart.total, 1076)
  assert.equal(
    mapCart({ items: [], totals: { ...totals, total_shipping: null } })
      .shipping,
    null,
  )
  assert.throws(() =>
    mapCart({ items: [], totals: { ...totals, total_price: 'broken' } }),
  )
  assert.throws(() =>
    mapCart({ items: [], totals: { ...totals, currency_code: 'USD' } }),
  )
})
test('branch API absence does not invent branch stock', () => {
  const data = mapAvailability({
    available: false,
    branches: [],
    message: 'Check with the store',
  })
  assert.deepEqual(data.branches, [])
  assert.equal(data.message, 'Check with the store')
})

test('compatibility requires explicit confidence and respects exclusions', () => {
  const data = {
    meta_data: [
      { key: '_shams_compat_level', value: 'compatible' },
      { key: '_shams_compat_manual_includes', value: [12, 13, 12] },
      { key: '_shams_compat_manual_exclusions', value: [13] },
    ],
  }
  assert.deepEqual(compatibleProductIds(data), ['12'])
  assert.deepEqual(
    compatibleProductIds({ meta_data: data.meta_data.slice(1) }),
    [],
  )
  assert.deepEqual(
    compatibleProductIds({
      meta_data: [
        ...data.meta_data,
        { key: '_shams_compat_level', value: 'uncertain' },
      ],
    }),
    [],
  )
  assert.throws(() => mapSummary({ ...product, name: '3' }))
})
