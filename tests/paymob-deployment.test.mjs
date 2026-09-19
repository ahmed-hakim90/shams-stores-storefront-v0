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
})

test('paid cart snapshot matches reordered lines but preserves additions and quantity changes',()=>{
 const cart={lines:[{id:'b',productId:'2',quantity:1},{id:'a',productId:'1',quantity:1}],total:100,coupons:[]}
 assert.equal(paymentCartSnapshot(cart),paymentCartSnapshot({...cart,lines:[...cart.lines].reverse()}))
 assert.notEqual(paymentCartSnapshot(cart),paymentCartSnapshot({...cart,lines:[...cart.lines,{id:'c',productId:'3',quantity:1}]}))
 assert.notEqual(paymentCartSnapshot(cart),paymentCartSnapshot({...cart,total:120}))
})
