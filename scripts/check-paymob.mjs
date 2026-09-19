// Read-only configuration report. Never prints keys, values or customer data.
import envLoader from '@next/env'
envLoader.loadEnvConfig(process.cwd())
const env = process.env
const checks = []
const check = (name, pass) => { checks.push(pass); console.log(`${pass ? 'PASS' : 'FAIL'} ${name}`) }
for (const key of ['WOOCOMMERCE_API_URL', 'WOOCOMMERCE_API_KEY', 'WOOCOMMERCE_API_SECRET', 'PAYMOB_SECRET_KEY', 'PAYMOB_HMAC_SECRET']) check(`${key} configured`, !!env[key]?.trim())
const publicKey = env.PAYMOB_PUBLIC_KEY || env.NEXT_PUBLIC_PAYMOB_PUBLIC_KEY || ''
check('Paymob public key configured', !!publicKey.trim())
const keyMode = /(?:^|_)(test|live)_/.exec(env.PAYMOB_SECRET_KEY || '')?.[1]
check('Public and secret keys use the same mode', !!keyMode && /(?:^|_)(test|live)_/.exec(publicKey)?.[1] === keyMode)
check('Preview does not use live keys', env.VERCEL_ENV !== 'preview' || keyMode === 'test')
try {
 const url = new URL(env.NEXT_PUBLIC_APP_URL)
 check('Frontend URL is an HTTPS origin', url.protocol === 'https:' && !url.username && !url.password && !url.search && !url.hash && url.pathname === '/' && !url.hostname.endsWith('.example'))
} catch { check('Frontend URL is an HTTPS origin', false) }
check('Egypt Paymob base URL', (env.PAYMOB_BASE_URL || 'https://accept.paymob.com') === 'https://accept.paymob.com')
check('Commerce currency is EGP', env.WOOCOMMERCE_CURRENCY === 'EGP')
const source = env.PAYMOB_METHOD_SOURCE || 'woocommerce'
check('Recognized method source', ['woocommerce','environment'].includes(source))
{
 const ids = [env.PAYMOB_INTEGRATION_ID, env.PAYMOB_INSTALLMENT_INTEGRATION_IDS].filter(v=>v?.trim())
 check('At least one valid integration list', ids.length > 0 && ids.every(v=>v.split(',').every(id=>/^[1-9][0-9]*$/.test(id.trim()) && Number.isSafeInteger(Number(id)))))
}
console.log(`Checkout switch: ${env.COMMERCE_CHECKOUT_ENABLED === 'true' ? 'ON' : 'OFF'}; Paymob switch: ${env.PAYMOB_ENABLED === 'true' ? 'ON' : 'OFF'}`)
console.log('No API writes performed. This does not verify account activation, integration mode, callbacks or payment completion. See docs/PAYMOB-VERCEL.md.')
process.exitCode = checks.every(Boolean) ? 0 : 1
