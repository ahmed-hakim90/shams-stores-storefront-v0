import { test } from 'node:test'
import assert from 'node:assert/strict'
import { wooConfig, catalogQuery, mapWooProduct, createWooClient } from '../lib/commerce/woocommerce.ts'

const env = { WOOCOMMERCE_API_URL: 'https://store.example/wp-json/wc/v3', WOOCOMMERCE_API_KEY: 'ck_test', WOOCOMMERCE_API_SECRET: 'cs_test', WOOCOMMERCE_CURRENCY: 'EGP' }
const product = { id: 12, slug: 'camera', name: 'Camera', type: 'simple', status: 'publish', price: '100.50', regular_price: '120', on_sale: true, purchasable: true, stock_status: 'instock', stock_quantity: 2, average_rating: '4.5', rating_count: 3, images: [{ src: 'https://store.example/camera.jpg' }], categories: [{ slug: 'real-camera-category' }] }

test('requires private HTTPS credentials and explicit EGP confirmation', () => {
  assert.throws(() => wooConfig({}), /not configured/)
  for (const url of ['http://store.example/wp-json/wc/v3', 'https://a:b@store.example/wp-json/wc/v3', 'https://store.example/wp-json/wc/v3?secret=x']) {
    assert.throws(() => wooConfig({ ...env, WOOCOMMERCE_API_URL: url }), /HTTPS/)
  }
  assert.throws(() => wooConfig({ ...env, WOOCOMMERCE_CURRENCY: 'USD' }), /EGP/)
})
test('rejects malformed pagination and unsupported sorting', () => {
  for (const input of [{ cursor: '-1' }, { cursor: 'Infinity' }, { pageSize: 0 }, { pageSize: 41 }, { pageSize: 1.5 }, { sort: 'anything' }, { query: ['bad'] }]) assert.throws(() => catalogQuery(input))
})
test('maps real identifiers, decimal prices, stock and arbitrary category slugs', () => {
  const mapped = mapWooProduct(product)
  assert.equal(mapped.id, '12')
  assert.equal(mapped.price.amount, 100.5)
  assert.equal(mapped.previousPrice.amount, 120)
  assert.equal(mapped.stock, 'low_stock')
  assert.equal(mapped.category, 'real-camera-category')
  assert.equal(mapped.purchasable, true)
  assert.equal(mapWooProduct({ ...product, type: 'variable' }).purchasable, false)
  assert.equal(mapWooProduct({ ...product, stock_status: 'onbackorder' }).stock, 'preorder')
  assert.throws(() => mapWooProduct({ ...product, price: 'invalid' }))
})
test('retains filters and sort across pagination, sends secrets only in headers', async () => {
  const calls = []
  const client = createWooClient(env, async (url, options) => {
    calls.push({ url: new URL(url), options })
    if (url.includes('/categories?')) return Response.json([{ id: 8 }])
    if (url.includes('/brands?')) return Response.json([{ id: 9 }])
    return Response.json([product], { headers: { 'x-wp-total': '23' } })
  })
  const result = await client.page({ cursor: '20', query: 'Camera', category: 'cameras', brand: 'canon', sort: 'price-asc' })
  const { url, options } = calls.at(-1)
  assert.equal(url.searchParams.get('offset'), '20')
  assert.equal(url.searchParams.get('category'), '8')
  assert.equal(url.searchParams.get('brand'), '9')
  assert.equal(url.searchParams.get('order'), 'asc')
  assert.equal(url.searchParams.get('search'), 'Camera')
  assert.equal(options.redirect, 'error')
  assert.equal(options.cache, 'no-store')
  assert.match(options.headers.Authorization, /^Basic /)
  assert.ok(!url.href.includes('ck_test'))
  assert.equal(result.nextCursor, '21')
  assert.equal(result.total, 23)
})
test('unknown category does not accidentally list the whole store', async () => {
  const client = createWooClient(env, async () => Response.json([]))
  assert.deepEqual(await client.page({ category: 'unknown' }), { items: [], total: 0, hasNextPage: false })
})
test('errors do not leak upstream details or fall back to demo data', async () => {
  const client = createWooClient(env, async () => new Response('secret upstream traceback', { status: 401 }))
  await assert.rejects(client.page(), { message: 'WooCommerce could not complete the request.' })
  const network = createWooClient(env, async () => { throw new Error('secret URL') })
  await assert.rejects(network.page(), { message: 'WooCommerce is temporarily unavailable.' })
})
test('missing pagination metadata and non-JSON responses fail explicitly', async () => {
  await assert.rejects(createWooClient(env, async () => Response.json([product])).page(), /pagination/)
  await assert.rejects(createWooClient(env, async () => new Response('HTML')).page(), /invalid response/)
})
test('product slug lookup returns undefined for unavailable products', async () => {
  assert.equal(await createWooClient(env, async () => Response.json([])).bySlug('missing'), undefined)
})
