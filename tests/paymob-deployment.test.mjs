import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import ts from 'typescript'
import { gatewayOptions, approvedGatewayOptions, integrationIds, makeOptions } from '../lib/payments/paymob/methods.ts'
import { orderMeta, ownsOrder, paymentCartSnapshot } from '../lib/payments/order-contract.ts'
import { reconcilePayment } from '../lib/payments/paymob/reconcile.ts'
function moduleAt(path, dependencies) {
  const code = ts.transpileModule(readFileSync(new URL(path, import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
  const m = { exports: {} }
  new Function('require', 'module', 'exports', code)(name => {
    if (!(name in dependencies)) throw Error(`Unexpected dependency: ${name}`)
    return dependencies[name]
  }, m, m.exports)
  return m.exports
}
class Fault extends Error { constructor(code, message, status) { super(message); this.code=code; this.status=status } }
const config = moduleAt('../lib/payments/paymob/config.ts', { '../../commerce/live/errors': { CommerceFault: Fault }, './methods': { integrationIds } })
const environment = { COMMERCE_PROVIDER: 'woocommerce', COMMERCE_CHECKOUT_ENABLED: 'true', PAYMOB_ENABLED: 'true', PAYMOB_SECRET_KEY: 'egy_sk_test_example', PAYMOB_PUBLIC_KEY: 'egy_pk_test_example', PAYMOB_HMAC_SECRET: 'example', NEXT_PUBLIC_APP_URL: 'https://staging.example' }

test('gateway discovery mirrors enabled concrete EGP methods and collapses wrappers/duplicates', () => {
 const option = gatewayOptions([
  { id:'paymob-11-card-vpc-egp', enabled:true }, { id:'paymob-12-card-vpc-egp', enabled:true },
  { id:'paymob-11-card-vpc-egp', enabled:true }, { id:'paymob-13-bank-installments-vpc-egp', enabled:true },
  { id:'paymob-14-card-vpc-egp', enabled:false }, { id:'paymob-main', enabled:true },
  { id:'paymob-pixel', enabled:true }, { id:'paymob-15-card-vpc-usd', enabled:true },
  { id:'cod', enabled:true }, { id:'bacs', enabled:true },
 ])
 assert.deepEqual(option.map(o => [o.id,o.integrationIds]), [['paymob-card',[11,12]],['paymob-installments',[13]]])
 assert.deepEqual(gatewayOptions(null), [])
 assert.deepEqual(makeOptions([], [13]).map(o=>o.kind), ['installments'])
 assert.throws(()=>integrationIds('11,no,12'))
 assert.throws(()=>integrationIds('1e3'))
})
test('configuration gates server writes and rejects mismatched keys, unsafe callback origins and live previews', () => {
 assert.equal(config.paymobEnabled(environment),true)
 for (const patch of [{ PAYMOB_ENABLED:'false' }, {COMMERCE_CHECKOUT_ENABLED:'false'}, {COMMERCE_PROVIDER:'mock'}, {PAYMOB_HMAC_SECRET:''}, {PAYMOB_PUBLIC_KEY:'egy_pk_live_other'}, {NEXT_PUBLIC_APP_URL:'https://user:password@staging.example'}, {NEXT_PUBLIC_APP_URL:'https://staging.example/path'}, {PAYMOB_BASE_URL:'https://attacker.example'}]) assert.equal(config.paymobEnabled({...environment,...patch}),false)
 assert.equal(config.paymobEnabled({...environment,VERCEL_ENV:'preview',PAYMOB_PUBLIC_KEY:'egy_pk_live_example',PAYMOB_SECRET_KEY:'egy_sk_live_example'}),false)
 assert.equal(config.paymobConfig(environment,[13]).notificationUrl,'https://staging.example/api/payments/paymob/webhook')
})
test('Woo metadata is read from the actual array and order ID alone is not ownership proof', () => {
 assert.deepEqual(orderMeta([{key:'_payment_status',value:'paid'}]), {_payment_status:'paid'})
 assert.equal(ownsOrder({id:'8',key:'forged'}, {orderId:'8',orderKey:'real'}),false)
 assert.equal(ownsOrder({id:'8',key:'real'}, {orderId:'8',orderKey:'real'}),true)
})
const event = { verified:true, merchantOrderId:'8', paymobOrderId:'99', transactionId:'100', amountCents:10000, currency:'EGP', integrationId:13, success:true, pending:false, refunded:false, voided:false, authorized:false, captured:false }
const order = { amountCents:10000,currency:'EGP',meta:{payment_provider:'paymob',_shams_checkout:'headless',_paymob_intention_order_id:'99',_paymob_integration_ids:[13]} }
test('callbacks bind signed provider order, amount, currency and integration; authorization is not settlement', () => {
 assert.deepEqual(reconcilePayment(event,order),{action:'apply',state:'paid'})
 for(const patch of [{amountCents:100},{currency:''},{paymobOrderId:''},{paymobOrderId:'98'},{integrationId:14},{transactionId:''},{refunded:true},{voided:true}]) assert.deepEqual(reconcilePayment({...event,...patch},order),{action:'ignore'})
 assert.deepEqual(reconcilePayment({...event,pending:true},order),{action:'apply',state:'processing'})
 assert.deepEqual(reconcilePayment({...event,authorized:true},order),{action:'apply',state:'processing'})
 assert.deepEqual(reconcilePayment({...event,success:false},order),{action:'apply',state:'failed'})
 assert.deepEqual(reconcilePayment(event,{...order,meta:{}}),{action:'retry'})
})
test('disabled intention route rejects before claiming or creating any order', async () => {
 let writes=0
 const route=moduleAt('../app/api/payments/intention/route.ts', {
  '@/lib/commerce/live/cart':{ assertSameOrigin:()=>{},getCart:()=>{throw Error('unexpected')} },
  '@/lib/commerce/live/errors':{CommerceFault:Fault,errorResponse:e=>Response.json({code:e.code},{status:e.status})},
  '@/lib/commerce/live/normalize':{}, '@/lib/payments/orders':{createPendingOrder:()=>writes++},
  '@/lib/payments/paymob/provider':{}, '@/lib/payments/paymob/config':{paymobEnabled:()=>false},
  '@/lib/payments/order-contract':{paymentCartSnapshot},
  '@/lib/payments/paymob/settings':{}, '@/lib/payments/session':{paymentClaim:()=>writes++}, '@/lib/rate-limit':{},
 })
 assert.equal((await route.POST(new Request('https://store.example/api/payments/intention',{method:'POST'}))).status,503)
 assert.equal(writes,0)
})
test('Paymob client provides Pixel method names only from selected integration IDs', async () => {
 const { createPaymobClient } = moduleAt('../lib/payments/paymob/client.ts', {'../../commerce/live/errors':{CommerceFault:Fault}})
 let sent
 const client = createPaymobClient(config.paymobConfig(environment,[13]),async (url,init)=>{
  sent={url,init}; return Response.json({id:'pi_test',client_secret:'client_test',intention_order_id:99,payment_methods:[{integration_id:13,name:'INSTALLMENT'},{integration_id:22,name:'card'}]})
 })
 const result=await client.createIntention({amount:10000,payment_methods:[13]})
 assert.deepEqual(result.pixelMethods,['installment'])
 assert.equal(sent.init.cache,'no-store')
 assert.equal(sent.init.redirect,'error')
 assert.equal(sent.url,'https://accept.paymob.com/v1/intention/')
})

test('live gateway allowlist excludes the test ID enabled on the same Woo store', () => {
 const raw=[{id:'paymob-5035900-card-vpc-egp',enabled:true},{id:'paymob-627615-card-vpc-egp',enabled:true},{id:'paymob-3707775-bank-installments-vpc-egp',enabled:true}]
 assert.deepEqual(approvedGatewayOptions(raw,[5035900],[3707775]).map(o=>o.integrationIds),[[5035900],[3707775]])
 assert.deepEqual(approvedGatewayOptions(raw,[],[]),[])
 assert.deepEqual(approvedGatewayOptions(raw,[5035900],[]).map(o=>o.kind),['card'])
 assert.deepEqual(approvedGatewayOptions(raw.map(g=>({...g,enabled:false})),[5035900],[3707775]),[])
})

import * as jsxRuntime from 'react/jsx-runtime'
import { renderToStaticMarkup } from 'react-dom/server'
test('product installment notice is hidden for loading, failed, disabled and unavailable states', () => {
 let query = {}
 const source = readFileSync(new URL('../components/shams/payments/installment-notice.tsx', import.meta.url), 'utf8')
 const code = ts.transpileModule(source, { compilerOptions: { module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX } }).outputText
 const mod={exports:{}}
 const dependencies={
  'react/jsx-runtime':jsxRuntime,
  'next/link':{default:({children,prefetch,...props})=>jsxRuntime.jsx('a',{...props,children})},
  'lucide-react':{CalendarDays:props=>jsxRuntime.jsx('svg',props)},
  './use-checkout-config':{useCheckoutConfig:()=>query},
 }
 new Function('require','module','exports',code)(name=>dependencies[name],mod,mod.exports)
 const render = props=>renderToStaticMarkup(jsxRuntime.jsx(mod.exports.InstallmentNotice,{eligible:true,...props}))
 for(const value of [{},{isError:true},{data:{paymob:false,paymobOptions:[{kind:'installments'}]}},{data:{paymob:true,paymobOptions:[{kind:'card'}]}}]) {query=value;assert.equal(render({}), '')}
 query={data:{paymob:true,paymobOptions:[{kind:'installments'}]}}
 assert.equal(render({eligible:false}), '')
 assert.match(render({href:'/p/camera#installments'}),/href="\/p\/camera#installments"/)
 assert.match(render({detailed:true}),/Your bank determines eligibility/)
 assert.doesNotMatch(render({detailed:true}),/0%|interest.free|EGP/)
 query={data:{paymob:false,installmentAvailable:true,paymobOptions:[]}}
 assert.match(render({href:'/p/camera#installments'}),/Explore bank installments/)
 assert.match(render({detailed:true}),/online installment payment is not enabled yet/)
 assert.doesNotMatch(render({detailed:true}),/Select Bank installments at checkout/)
 query={data:{paymob:true,installmentAvailable:false,paymobOptions:[{kind:'installments'}]}}
 assert.equal(render({}), '')
})

test('paid cart snapshot matches reordered lines but preserves additions and quantity changes',()=>{
 const cart={lines:[{id:'b',productId:'2',quantity:1},{id:'a',productId:'1',quantity:1}],total:100,coupons:[]}
 assert.equal(paymentCartSnapshot(cart),paymentCartSnapshot({...cart,lines:[...cart.lines].reverse()}))
 assert.notEqual(paymentCartSnapshot(cart),paymentCartSnapshot({...cart,lines:[...cart.lines,{id:'c',productId:'3',quantity:1}]}))
 assert.notEqual(paymentCartSnapshot(cart),paymentCartSnapshot({...cart,total:120}))
})

test('pending order shipping payload uses Woo REST string instance IDs and trusted rate totals', async () => {
 const normalization=await import('../lib/commerce/live/normalize.ts')
 let posted
 const orders=moduleAt('../lib/payments/orders.ts', {
  'server-only':{}, './order-contract':{orderMeta}, 'next/headers':{cookies:async()=>({set(){}})},
  '../commerce/live/client':{request:async(path,options)=>{
   if(path.startsWith('/wc/store/v1/products/')) return {data:{type:'simple'}}
   assert.equal(path,'/wc/v3/orders'); posted=options.body
   for(const line of posted.shipping_lines) assert.equal(typeof line.instance_id,'string')
   return {data:{id:100,order_key:'fixture-key',total:'185.00',currency:'EGP'}}
  }},
  '../commerce/live/cart':{addressPayload:()=>({first_name:'Test',phone:'01000000000',state:'C',city:'Cairo',address_1:'Test'})},
  '../commerce/live/errors':{CommerceFault:Fault}, '../commerce/live/normalize':normalization,
  './paymob/provider':{toAmountCents:n=>Math.round(n*100)},
 })
 for(const [id,instance] of [['flat_rate:12','12'],['custom_shipping','0']]) {
  await orders.createPendingOrder({address:{},cart:{lines:[{productId:'1',quantity:1}],needsShipping:true,rates:[{id,name:'Cairo',price:85,selected:true},{id:'flat_rate:99',price:999,selected:false}],coupons:[],errors:[]}})
  assert.deepEqual(posted.shipping_lines,[{method_id:id.split(':')[0],instance_id:instance,method_title:'Cairo',total:'85.00'}])
 }
})

test('failure after order creation requires review, retains claim and logs only safe stage context', async () => {
 const normalization=await import('../lib/commerce/live/normalize.ts')
 let writes=0,completed=0; const logs=[]; const original=console.error
 const route=moduleAt('../app/api/payments/intention/route.ts',{
  '@/lib/commerce/live/cart':{assertSameOrigin(){},getCart:async()=>({lines:[{productId:'1',quantity:1,total:100}],total:100,coupons:[],rates:[],errors:[],needsShipping:false})},
  '@/lib/commerce/live/errors':{CommerceFault:Fault,errorResponse:e=>Response.json({code:e.code,error:e.message},{status:e.status})},
  '@/lib/commerce/live/normalize':normalization,
  '@/lib/payments/orders':{createPendingOrder:async()=>{writes++;return {orderId:'123',currency:'EGP',amountCents:10000,items:[],billing:{}}}},
  '@/lib/payments/paymob/provider':{createPaymobProvider:()=>({createIntention:async()=>{throw new Fault('NETWORK_ERROR','secret provider detail',503)}})},
  '@/lib/payments/paymob/config':{paymobEnabled:()=>true,paymobConfig:()=>({})},
  '@/lib/payments/paymob/settings':{paymobOptions:async()=>[{id:'paymob-card',integrationIds:[1]}]},
  '@/lib/payments/order-contract':{paymentCartSnapshot},
  '@/lib/payments/session':{paymentClaim:async()=>({claimed:true}),completeClaim:async()=>completed++},
  '@/lib/rate-limit':{rateLimit:()=>({success:true})},
 })
 try {
  console.error=(...args)=>logs.push(args)
  const response=await route.POST(new Request('https://store.example/api/payments/intention',{method:'POST',body:JSON.stringify({paymentMethod:'paymob-card',address:{firstName:'Test',lastName:'Test',email:'fixture@example.test',phone:'01000000000',state:'C',city:'Cairo',address1:'Fixture'}})}))
  const body=await response.json();assert.equal(response.status,409);assert.equal(body.code,'PAYMENT_REVIEW_REQUIRED');assert.match(body.error,/#123/)
  assert.equal(body.orderId,'123')
  assert.equal(writes,1);assert.equal(completed,1);assert.equal(logs[0][1].stage,'create_intention')
  assert.doesNotMatch(JSON.stringify(logs),/secret provider detail|fixture@example|01000000000/)
 } finally {console.error=original}
})

const resumeHarness = async ({ claim, ownership = null, order, intention = null }) => {
 const normalization = await import('../lib/commerce/live/normalize.ts')
 const state = { ordersCreated: 0, providerCalls: 0, completed: 0, remembered: 0, metaWrites: [] }
 const route = moduleAt('../app/api/payments/intention/route.ts', {
  '@/lib/commerce/live/cart': { assertSameOrigin() {}, getCart: async () => ({ lines: [{ productId: '1', quantity: 1, total: 100 }], total: 100, coupons: [], rates: [], errors: [], needsShipping: false }) },
  '@/lib/commerce/live/errors': { CommerceFault: Fault, errorResponse: e => Response.json({ code: e.code, error: e.message }, { status: e.status }) },
  '@/lib/commerce/live/normalize': normalization,
  '@/lib/payments/orders': {
   createPendingOrder: async () => { state.ordersCreated++; return { orderId: '999', currency: 'EGP', amountCents: 10000, items: [], billing: {} } },
   getWooOrder: async () => (order ? { ...order, meta: { ...order.meta } } : null),
   updateWooOrder: async (id, patch) => { state.metaWrites.push(patch) },
   rememberOrder: async () => { state.remembered++ },
   readOwnershipCookie: async () => ownership,
  },
  '@/lib/payments/paymob/provider': { createPaymobProvider: () => ({ createIntention: async () => { state.providerCalls++; if (!intention) throw new Fault('SERVER_ERROR', 'provider down', 502); return intention } }) },
  '@/lib/payments/paymob/config': { paymobEnabled: () => true, paymobConfig: () => ({ publicKey: 'pk' }) },
  '@/lib/payments/paymob/settings': { paymobOptions: async () => [{ id: 'paymob-card', kind: 'card', integrationIds: [1] }] },
  '@/lib/payments/order-contract': { paymentCartSnapshot },
  '@/lib/payments/session': { paymentClaim: claim, completeClaim: async () => { state.completed++ } },
  '@/lib/rate-limit': { rateLimit: () => ({ success: true }) },
 })
 const post = () => route.POST(new Request('https://store.example/api/payments/intention', { method: 'POST', body: JSON.stringify({ paymentMethod: 'paymob-card', address: { firstName: 'Test', lastName: 'Test', email: 'fixture@example.test', phone: '01000000000', state: 'C', city: 'Cairo', address1: 'Fixture' } }) }))
 return { state, post }
}
const baseOrder = (meta = {}, status = 'pending') => ({ orderId: '123', orderKey: 'k', status, total: 100, amountCents: 10000, currency: 'EGP', email: 'f@e.t', meta, items: [{ name: 'x', amountCents: 10000, quantity: 1 }], billing: { firstName: 'T', lastName: 'T', email: 'f@e.t', phone: '01000000000', city: 'Cairo', state: 'C', street: 'S', postalCode: '' }, shipping: {} })
const completeClaimFixture = { claimed: false, orderId: '123', key: 'k', fingerprint: 'f', token: 't' }
const busyClaim = async () => { throw new Fault('PAYMENT_SESSION_BUSY', 'Payment is being prepared or needs review.', 409) }
const intentionFixture = { id: 77, client_secret: 'cs2', intention_order_id: '55', payment_methods: [1] }

test('total mismatch before any provider call keeps the claim running and skips compensation', async () => {
 const normalization = await import('../lib/commerce/live/normalize.ts')
 let writes = 0, completed = 0, providerCalls = 0
 const route = moduleAt('../app/api/payments/intention/route.ts', {
  '@/lib/commerce/live/cart': { assertSameOrigin() {}, getCart: async () => ({ lines: [{ productId: '1', quantity: 1, total: 100 }], total: 100, coupons: [], rates: [], errors: [], needsShipping: false }) },
  '@/lib/commerce/live/errors': { CommerceFault: Fault, errorResponse: e => Response.json({ code: e.code, error: e.message }, { status: e.status }) },
  '@/lib/commerce/live/normalize': normalization,
  '@/lib/payments/orders': { createPendingOrder: async () => { writes++; return { orderId: '123', currency: 'EGP', amountCents: 999999, items: [], billing: {} } }, getWooOrder: async () => null, updateWooOrder: async () => {}, rememberOrder: async () => {}, readOwnershipCookie: async () => null },
  '@/lib/payments/paymob/provider': { createPaymobProvider: () => ({ createIntention: async () => { providerCalls++; return {} } }) },
  '@/lib/payments/paymob/config': { paymobEnabled: () => true, paymobConfig: () => ({}) },
  '@/lib/payments/paymob/settings': { paymobOptions: async () => [{ id: 'paymob-card', kind: 'card', integrationIds: [1] }] },
  '@/lib/payments/order-contract': { paymentCartSnapshot },
  '@/lib/payments/session': { paymentClaim: async () => ({ claimed: true, key: 'k', fingerprint: 'f', token: 't' }), completeClaim: async () => { completed++ } },
  '@/lib/rate-limit': { rateLimit: () => ({ success: true }) },
 })
 const response = await route.POST(new Request('https://store.example/api/payments/intention', { method: 'POST', body: JSON.stringify({ paymentMethod: 'paymob-card', address: { firstName: 'Test', lastName: 'Test', email: 'fixture@example.test', phone: '01000000000', state: 'C', city: 'Cairo', address1: 'Fixture' } }) }))
 const body = await response.json()
 assert.equal(response.status, 409)
 assert.equal(body.code, 'PAYMENT_REVIEW_REQUIRED')
 assert.equal(body.orderId, '123')
 assert.equal(writes, 1); assert.equal(completed, 0); assert.equal(providerCalls, 0)
})

test('resume with a stored unexpired intention returns it without provider calls or new orders', async () => {
 const { state, post } = await resumeHarness({
  claim: async () => completeClaimFixture,
  order: baseOrder({ _paymob_client_secret: 'cs', _paymob_intention_expires: String(Date.now() + 600000), _paymob_pixel_methods: ['card'] }),
 })
 const response = await post()
 const body = await response.json()
 assert.equal(response.status, 200)
 assert.equal(body.clientSecret, 'cs')
 assert.equal(body.orderId, '123')
 assert.equal(state.providerCalls, 0); assert.equal(state.ordersCreated, 0); assert.equal(state.remembered, 1); assert.equal(state.completed, 0)
})

test('resume re-prepares the same order once and falls back to kind-based Pixel names', async () => {
 const { state, post } = await resumeHarness({ claim: async () => completeClaimFixture, order: baseOrder(), intention: intentionFixture })
 const response = await post()
 const body = await response.json()
 assert.equal(response.status, 200)
 assert.equal(body.clientSecret, 'cs2')
 assert.deepEqual(body.pixelMethods, ['card'])
 assert.equal(body.orderId, '123')
 assert.equal(state.ordersCreated, 0); assert.equal(state.providerCalls, 1); assert.equal(state.remembered, 1); assert.equal(state.completed, 0)
 assert.equal(state.metaWrites.length, 2)
 assert.equal(state.metaWrites[0].meta_data[0].key, '_paymob_prep')
 const saved = Object.fromEntries(state.metaWrites[1].meta_data.map(m => [m.key, m.value]))
 assert.equal(saved._paymob_intention_id, 77)
 assert.equal(saved._paymob_intention_order_id, '55')
 assert.deepEqual(saved._paymob_superseded_intentions, [])
})

test('resume cooldown and attempt cap bound provider retries', async () => {
 const cooling = await resumeHarness({ claim: async () => completeClaimFixture, order: baseOrder({ _paymob_prep: { n: 1, ts: Date.now() } }), intention: intentionFixture })
 const coolingResponse = await cooling.post()
 assert.equal(coolingResponse.status, 429)
 assert.equal(cooling.state.providerCalls, 0)
 const capped = await resumeHarness({ claim: async () => completeClaimFixture, order: baseOrder({ _paymob_attempts: Array.from({ length: 5 }, (_, i) => ({ intentionId: `x${i}`, status: 'pending' })) }), intention: intentionFixture })
 const cappedResponse = await capped.post()
 const cappedBody = await cappedResponse.json()
 assert.equal(cappedResponse.status, 409)
 assert.equal(cappedBody.code, 'PAYMENT_REVIEW_REQUIRED')
 assert.equal(capped.state.providerCalls, 0)
})

test('resume refuses orders that already have a result', async () => {
 const { state, post } = await resumeHarness({ claim: async () => completeClaimFixture, order: baseOrder({}, 'processing'), intention: intentionFixture })
 const response = await post()
 const body = await response.json()
 assert.equal(response.status, 409)
 assert.match(body.error, /already has a result/)
 assert.equal(body.orderId, '123')
 assert.equal(state.providerCalls, 0)
})

test('running claim is unlocked through the ownership cookie and stays fail-closed without it', async () => {
 const owned = await resumeHarness({ claim: busyClaim, ownership: { id: '123', key: 'k', email: 'f@e.t' }, order: baseOrder(), intention: intentionFixture })
 const ownedResponse = await owned.post()
 const ownedBody = await ownedResponse.json()
 assert.equal(ownedResponse.status, 200)
 assert.equal(ownedBody.clientSecret, 'cs2')
 assert.equal(owned.state.ordersCreated, 0); assert.equal(owned.state.providerCalls, 1)
 for (const ownership of [null, { id: '123', key: 'other', email: 'f@e.t' }]) {
  const locked = await resumeHarness({ claim: busyClaim, ownership, order: baseOrder(), intention: intentionFixture })
  const lockedResponse = await locked.post()
  const lockedBody = await lockedResponse.json()
  assert.equal(lockedResponse.status, 409)
  assert.equal(lockedBody.code, 'PAYMENT_SESSION_BUSY')
  assert.equal(locked.state.providerCalls, 0); assert.equal(locked.state.ordersCreated, 0)
 }
})

test('intention parsing tolerates numeric ids, numeric strings and bare integration lists', async () => {
 const { createPaymobClient } = moduleAt('../lib/payments/paymob/client.ts', { '../../commerce/live/errors': { CommerceFault: Fault } })
 const cfg = config.paymobConfig(environment, [13])
 const client = createPaymobClient(cfg, async () => Response.json({ id: 77, client_secret: 'cs', intention_order_id: '55', payment_methods: [13, 14] }))
 const result = await client.createIntention({ amount: 100, payment_methods: [13] })
 assert.equal(result.id, '77')
 assert.equal(result.intention_order_id, 55)
 assert.deepEqual(result.pixelMethods, [])
 const bare = createPaymobClient(cfg, async () => Response.json({ id: 'a', client_secret: 'cs' }))
 assert.deepEqual((await bare.createIntention({ amount: 100, payment_methods: [13] })).pixelMethods, [])
})

test('callbacks for superseded intentions still settle the order', () => {
 const withLedger = { ...order, meta: { ...order.meta, _paymob_superseded_intentions: [{ intentionId: 'old', paymobOrderId: '98', supersededAt: 'now' }] } }
 assert.deepEqual(reconcilePayment({ ...event, paymobOrderId: '98' }, withLedger), { action: 'apply', state: 'paid' })
 assert.deepEqual(reconcilePayment({ ...event, paymobOrderId: '97' }, withLedger), { action: 'ignore' })
})
