// Read-only readiness check. No credentials or response bodies are printed.
try { process.loadEnvFile('.env.local') } catch {}
const base = process.env.WOOCOMMERCE_API_URL?.replace(/\/wc\/v3\/?$/, '')
if (!base) { console.error('WOOCOMMERCE_API_URL is not configured.'); process.exit(1) }
for (const path of ['/shams/v1/modules', '/shams/v1/site-content', '/shams/v1/catalog/terms?taxonomy=product_cat&per_page=1']) {
  try {
    const response = await fetch(base + path, { redirect: 'error', signal: AbortSignal.timeout(10000), cache: 'no-store' })
    console.log(`${path}: HTTP ${response.status}`)
    if (!response.ok) process.exitCode = 1
    else { const body = await response.json(); console.log(`Response keys: ${Object.keys(body).join(', ')}`) }
  } catch { console.error(`${path}: unavailable`); process.exitCode = 1 }
}
