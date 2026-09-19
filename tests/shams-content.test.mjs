import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mapAssurances, contentBatches, storefrontLink, mergeAssurances, mapSiteContent } from '../lib/commerce/live/shams-contract.ts'
import { checkoutErrors } from '../lib/commerce/checkout-validation.ts'

test('assurances preserve explicit false, unknown and Arabic owner labels', () => {
  assert.equal(mapAssurances(null).authorized, null)
  assert.equal(mapAssurances({ authorized: false }).authorized, false)
  const result = mapAssurances({ authorized: true, warranty_text: 'ضمان الوكيل', agent: { enabled: true, label: 'وكيل معتمد' }, warranty_badge: { enabled: false, label: 'Do not display' } })
  assert.equal(result.agent.label, 'وكيل معتمد')
  assert.equal(result.warrantyText, 'ضمان الوكيل')
  assert.equal(result.warrantyBadge.enabled, false)
  assert.equal(mapAssurances({ authorized: 'yes', agent: { enabled: 'yes' } }).authorized, null)
  assert.equal(mapAssurances({ agent: { enabled: 'yes' } }).agent.enabled, false)
})
test('batch limit is twenty unique valid IDs, including forty-product pages', () => {
  const ids = Array.from({ length: 40 }, (_, i) => String(i + 1))
  assert.deepEqual(contentBatches([...ids, '2', 'bad']).map(x => x.length), [20, 20])
  assert.deepEqual(contentBatches([]), [])
})
test('optional content cannot change core price, stock, slug or fabricate assurance', () => {
  const product = { id: '1', slug: 'camera', price: 50, stock: 'out_of_stock' }
  assert.equal(mergeAssurances(product, null), product)
  const enriched = mergeAssurances(product, { product: { price: '10', assurances: { authorized: false } } })
  assert.equal(enriched.price, 50)
  assert.equal(enriched.stock, 'out_of_stock')
  assert.equal(enriched.slug, 'camera')
  assert.equal(enriched.official, false)
})
test('only supported internal routes are rewritten; unsafe links rejected', () => {
  assert.equal(storefrontLink('https://www.shams-stores.com/product/camera/'), '/p/camera')
  assert.equal(storefrontLink('/product-category/cameras/'), '/c/cameras')
  assert.equal(storefrontLink('https://www.shams-stores.com/some-wp-page/'), 'https://www.shams-stores.com/some-wp-page/')
  for (const url of ['javascript:alert(1)', 'data:text/html,hi', 'https://user:pass@example.com/', '\\evil.test']) assert.equal(storefrontLink(url), undefined)
})
test('site content tolerates absent owners and validates contacts/menu links', () => {
  assert.deepEqual(mapSiteContent(null), { branches: [], menus: {}, labels: { add: '', details: '' } })
  const shell = mapSiteContent({ shell: { branches: [{ name: 'فرع', address: 'عنوان', phones: ['+201011111111', 'bad'] }], menus: { help: [{ id: 1, label: 'Shop', url: '/shop' }, { label: 'Bad', url: 'javascript:alert(1)' }] } } })
  assert.equal(shell.branches[0].phones.length, 1)
  assert.equal(shell.menus.help.length, 1)
})
test('checkout requires phone and highlights missing fields before submitting', () => {
  const address = { firstName: 'Test', phone: '01011111111', address1: 'Street', city: 'Cairo', state: 'C', lastName: '', email: '', country: 'EG', address2: '', postcode: '' }
  assert.deepEqual(checkoutErrors(address), {})
  assert.equal(checkoutErrors({ ...address, phone: '' }).phone, 'Required')
  assert.ok(checkoutErrors({ ...address, phone: 'abc' }).phone)
  assert.equal(checkoutErrors({ ...address, city: ' ' }).city, 'Required')
})

// Exercise the server boundary with only HTTP/cache dependencies substituted.
import ts from 'typescript'
import { readFileSync } from 'node:fs'
import * as normalization from '../lib/commerce/live/normalize.ts'
import * as contract from '../lib/commerce/live/shams-contract.ts'
function serverReader(request) {
  const source = readFileSync(new URL('../lib/commerce/live/shams-content.ts', import.meta.url), 'utf8')
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
  const module = { exports: {} }
  const dependencies = { 'server-only': {}, react: { cache: fn => fn }, './client': { request }, './normalize': normalization, './shams-contract': contract }
  new Function('require', 'module', 'exports', compiled)(name => {
    if (!(name in dependencies)) throw Error(`Unexpected dependency: ${name}`)
    return dependencies[name]
  }, module, module.exports)
  return module.exports
}
test('server enrichment batches forty IDs and merges by ID rather than response order', async () => {
  const calls = []
  const reader = serverReader(async (path, options) => {
    calls.push({ path, options })
    const ids = new URL('https://example.test' + path).searchParams.getAll('ids[]')
    return { data: { items: ids.reverse().map(id => ({ product: { id: Number(id), assurances: { authorized: Number(id) % 2 === 0 } } })) } }
  })
  const products = Array.from({ length: 40 }, (_, i) => ({ id: String(i + 1), name: `Product ${i + 1}`, price: { amount: 50 } }))
  const result = await reader.enrichProducts(products)
  assert.equal(calls.length, 2)
  assert.ok(calls.every(call => call.options.ttl === 120 && call.options.signal instanceof AbortSignal))
  assert.deepEqual(result.map(p => p.id), products.map(p => p.id))
  assert.equal(result[0].official, false)
  assert.equal(result[1].official, true)
  assert.deepEqual(result[0].price, products[0].price)
})
test('unavailable optional API leaves core products usable and empty lists make no request', async () => {
  let calls = 0
  const reader = serverReader(async () => { calls++; throw Error('unavailable') })
  const products = [{ id: '1', name: 'Camera' }]
  assert.deepEqual(await reader.enrichProducts(products), products)
  assert.deepEqual(await reader.enrichProducts([]), [])
  assert.equal(calls, 1)
})
test('concurrent content reads share a request; persistence is delegated to Next', async () => {
  let calls = 0
  let resolve
  const reader = serverReader(async () => { calls++; return new Promise(done => { resolve = done }) })
  const a = reader.shamsContent('products/1/content'), b = reader.shamsContent('products/1/content')
  assert.equal(calls, 1)
  resolve({ data: { product: { id: 1 } } })
  await Promise.all([a, b])
  const c = reader.shamsContent('products/1/content')
  assert.equal(calls, 2)
  resolve({ data: { product: { id: 1 } } })
  await c
})

test('only public content routes receive a cache TTL; account and payment paths remain live', () => {
  const reader = serverReader(async () => ({ data: {} }))
  assert.equal(reader.contentTtl('site-content'), 300)
  assert.equal(reader.contentTtl('catalog/terms?taxonomy=product_cat'), 3600)
  assert.equal(reader.contentTtl('products/123/reviews?per_page=10'), 120)
  assert.equal(reader.contentTtl('products/123/accessories?limit=12'), 120)
  for (const path of ['customer/wishlist', 'checkout', 'payment-sessions', 'products/123/unknown']) {
    assert.equal(reader.contentTtl(path), undefined)
  }
})

import * as jsxRuntime from 'react/jsx-runtime'
import { renderToStaticMarkup } from 'react-dom/server'
test('assurance UI shows explicit product text without flags, hides defaults and escapes content', () => {
  const source = readFileSync(new URL('../components/shams/product/product-assurances.tsx', import.meta.url), 'utf8')
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }).outputText
  const m = { exports: {} }
  new Function('require','module','exports',compiled)(name => { if(name === 'react/jsx-runtime') return jsxRuntime; throw Error(name) },m,m.exports)
  const render = raw => renderToStaticMarkup(jsxRuntime.jsx(m.exports.ProductAssurances,{value:mapAssurances(raw)}))
  assert.equal(render({agent:{enabled:false,label:'Official'},warranty_badge:{enabled:false,label:'Warranty included'}}),'')
  const html=render({agent:{enabled:false,custom_label:' وكيل معتمد '},warranty_badge:{enabled:false,custom_label:'ضمان سنة'}})
  assert.match(html,/وكيل معتمد/); assert.match(html,/ضمان سنة/); assert.match(html,/dir="auto"/)
  assert.match(render({warranty_text:'ضمان مكتوب'}),/ضمان مكتوب/)
  assert.equal(render({agent:{enabled:false,custom_label:'  '}}),'')
  assert.match(render({agent:{custom_label:'<script>alert(1)</script>'}}),/&lt;script&gt;/)
  assert.equal((render({agent:{custom_label:'ضمان'},warranty_badge:{custom_label:'ضمان'}}).match(/>ضمان</g)||[]).length,1)
})
