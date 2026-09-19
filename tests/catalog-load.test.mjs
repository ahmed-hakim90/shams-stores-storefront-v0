import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import ts from 'typescript'
import * as normalize from '../lib/commerce/live/normalize.ts'
import * as contract from '../lib/commerce/live/shams-contract.ts'

function load(path, dependencies) {
  const source = readFileSync(new URL(path, import.meta.url), 'utf8')
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
  const m = { exports: {} }
  new Function('require', 'module', 'exports', 'fetch', code)(name => {
    if (!(name in dependencies)) throw Error(`Unexpected dependency: ${name}`)
    return dependencies[name]
  }, m, m.exports, dependencies.fetch)
  return m.exports
}
class Fault extends Error {}
const product = { id: 42, name: 'Camera', slug: 'camera', type: 'variable', prices: { currency_code: 'EGP', currency_minor_unit: 0, price: '1000' }, short_description: 'Real description', images: [], categories: [], brands: [] }
function catalog(request, content = async () => null) {
  return load('../lib/commerce/live/catalog.ts', {
    'server-only': {}, react: { cache: fn => fn }, 'node:crypto': { createHash },
    './client': { request }, './normalize': normalize, './shams-contract': contract,
    './shams-content': { shamsContent: content, enrichProducts: async p => p },
    './errors': { CommerceFault: Fault },
  })
}
test('bundle summary needs one read and preserves visible content', async () => {
  let calls = 0
  const reader = catalog(async path => { calls++; assert.match(path, /products\?slug=/); return { data: [product] } }, () => { throw Error('Unexpected content fetch') })
  const result = await reader.getProduct('camera', 'summary')
  assert.equal(calls, 1)
  assert.equal(result.shortDescription, 'Real description')
  assert.equal(result.price.amount, 1000)
})
test('homepage relationships omit reviews, variations and bundles but retain compatibility', async () => {
  const calls = [], contentCalls = []
  const reader = catalog(async path => {
    calls.push(path)
    if (path.includes('?slug=')) return { data: [product] }
    if (path === '/wc/v3/products/42') return { data: {} }
    if (path.includes('?include=')) return { data: [{ ...product, id: 7, slug: 'lens', name: 'Lens' }] }
    throw Error(`Unexpected request: ${path}`)
  }, async path => {
    contentCalls.push(path)
    return path.includes('/accessories') ? { items: [{ product: { id: 7 }, compatibility: { level: 'exact', source: 'engine' } }] } : null
  })
  const result = await reader.getProduct('camera', 'relationships')
  assert.equal(result.relationships[0].products[0].id, '7')
  assert.equal(result.relationships[0].compatibility['7'].level, 'exact')
  assert.equal(calls.length, 3)
  assert.equal(contentCalls.length, 2)
  assert.ok(![...calls, ...contentCalls].some(p => /reviews|variations|bundles/.test(p)))
})
test('comparison batches four products into two reads, omitting non-public products and metadata', async () => {
  const calls = []
  const reader = catalog(async (path, options) => {
    calls.push({ path, options })
    if (path.startsWith('/wc/store/')) return { data: [{ id: 1 }, { id: 2 }, { id: 3 }] }
    assert.match(path, /include=1,2,3&/)
    assert.equal(options.private, true)
    return { data: [1, 2, 3, 4].map(id => ({ id, attributes: [{ name: 'Mount', options: ['RF'] }], meta_data: [{ key: 'private_note', value: 'Never expose' }] })) }
  }, () => { throw Error('Unexpected content fetch') })
  const result = await reader.comparisonSpecifications(['1', '2', '3', '4'])
  assert.equal(calls.length, 2)
  assert.deepEqual(Object.keys(result), ['1', '2', '3'])
  assert.equal(result['1'][0].value, 'RF')
  assert.ok(!JSON.stringify(result).includes('Never expose'))
})
test('empty or hidden comparisons never make private reads', async () => {
  let calls = 0
  const reader = catalog(async path => { calls++; assert.ok(path.startsWith('/wc/store/')); return { data: [] } })
  assert.deepEqual(await reader.comparisonSpecifications(['bad']), {})
  assert.equal(calls, 0)
  assert.deepEqual(await reader.comparisonSpecifications(['42']), {})
  assert.equal(calls, 1)
})
test('shared HTTP client caches opted-in reads but never tokenized carts or mutations', async () => {
  const calls = []
  const reader = load('../lib/commerce/live/client.ts', {
    'server-only': {}, '../woocommerce': { wooConfig: () => ({ endpoint: 'https://example.test/wp-json/wc/v3', authorization: 'test' }) },
    './errors': { CommerceFault: Fault },
    fetch: async (url, options) => { calls.push(options); return new Response('{}') },
  })
  await reader.request('/shams/v1/site-content', { ttl: 300 })
  await reader.request('/wc/store/v1/cart', { ttl: 300, token: 'cart-a' })
  await reader.request('/wc/store/v1/cart')
  await reader.request('/wc/store/v1/cart/add-item', { ttl: 300, method: 'POST', body: { id: 42 } })
  assert.equal(calls[0].next.revalidate, 300)
  for (const options of calls.slice(1)) {
    assert.equal(options.cache, 'no-store')
    assert.equal(options.next, undefined)
  }
})
