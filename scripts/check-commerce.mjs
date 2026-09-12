import { createRequire } from 'node:module'
import { createWooClient, wooConfig } from '../lib/commerce/woocommerce.ts'
const require = createRequire(import.meta.url)
const { loadEnvConfig } = require('@next/env')
loadEnvConfig(process.cwd())
try {
  wooConfig(process.env)
  const result = await createWooClient(process.env).page({ pageSize: 1 })
  console.log(`WooCommerce catalog connection OK. ${result.total} visible products. No writes performed.`)
  console.log(`Configured provider: ${process.env.COMMERCE_PROVIDER ?? 'mock'}. Checkout is not connected.`)
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Connection check failed.')
  process.exitCode = 1
}
