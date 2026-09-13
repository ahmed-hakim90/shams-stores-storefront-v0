import test from 'node:test'
import assert from 'node:assert/strict'
import { catalogParams } from '../lib/commerce/experience.ts'
import { comparisonRows } from '../lib/commerce/comparison.ts'
test('catalog scope keeps brand changes inside a category and retains validated children', () => {
  const scope = { category: 'cameras', categoryOptions: ['mirrorless'] }
  assert.equal(
    new URLSearchParams(
      catalogParams('brand=sony&category=unrelated', scope),
    ).get('category'),
    'cameras',
  )
  assert.equal(
    new URLSearchParams(
      catalogParams('brand=sony&category=mirrorless', scope),
    ).get('category'),
    'mirrorless',
  )
})
test('query identity removes cursor, normalizes order, and retains workflow tag', () => {
  assert.equal(
    catalogParams('brand=sony&stock=instock&cursor=old'),
    catalogParams('stock=instock&brand=sony'),
  )
  assert.equal(
    new URLSearchParams(
      catalogParams('', { tag: 'filmmaking', onSale: true }),
    ).get('tag'),
    'filmmaking',
  )
  assert.equal(
    new URLSearchParams(catalogParams('q=Sony')).get('sort'),
    'relevance',
  )
})
test('comparison orders real differences before shared attributes and retains missing specifications', () => {
  const product = (id, brand) => ({
    id,
    brand,
    stock: 'in_stock',
    price: { amount: 200, currency: 'EGP' },
    highlights: [],
  })
  const rows = comparisonRows([product('1', 'Sony'), product('2', 'Canon')], {
    1: [{ key: 'mount', label: 'Mount', value: 'E', comparable: true }],
  })
  assert.equal(rows[0].different, true)
  assert.deepEqual(rows.find((r) => r.key === 'spec:mount').values, ['E', '—'])
  assert.equal(rows.find((r) => r.key === 'price').different, false)
})

test('unlabelled highlights remain a named comparison row without losing values', () => {
  const p = {
    id: '1',
    brand: 'Sony',
    stock: 'in_stock',
    price: { amount: 1, currency: 'EGP' },
    highlights: [
      { label: '', value: '33MP' },
      { label: '', value: 'Full frame' },
    ],
  }
  const row = comparisonRows([p]).find((r) => r.key === 'highlights')
  assert.equal(row.label, 'Highlights')
  assert.equal(row.values[0], '33MP · Full frame')
})
