import { hasMeta, hasGa4, hasTiktok, hasGoogleAds, GOOGLE_ADS_ID } from './pixels'

function metaEvent(event: string, params?: Record<string, unknown>) {
  if (!hasMeta) return
  const fbq = (window as unknown as { fbq?: (...args: unknown[]) => void }).fbq
  if (typeof fbq === 'function') fbq('trackCustom', event, params)
}

function ga4Event(event: string, params?: Record<string, unknown>) {
  if (!hasGa4) return
  const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag
  if (typeof gtag === 'function') gtag('event', event, params)
}

function tiktokEvent(event: string, params?: Record<string, unknown>) {
  if (!hasTiktok) return
  const ttq = (window as unknown as { ttq?: { track: (e: string, p?: unknown) => void } }).ttq
  if (ttq?.track) ttq.track(event, params)
}

function googleAdsEvent(_event: string, _params?: Record<string, unknown>) {
  // Google Ads conversions are conversion-specific; page-level events are not standard.
  // Purchase is handled separately via trackPurchaseGoogleAds.
}

export function trackViewContent(product: { id: string; name: string; price: number }) {
  const params = {
    content_name: product.name,
    content_ids: [product.id],
    content_type: 'product',
    value: product.price,
    currency: 'EGP',
  }
  metaEvent('view_content', params)
  ga4Event('view_item', { ...params, items: [{ item_id: product.id, item_name: product.name, price: product.price }] })
  tiktokEvent('ViewContent', { ...params, contents: [{ content_id: product.id, content_type: 'product' }] })
  googleAdsEvent('view_item')
}

export function trackAddToCart(product: { id: string; name: string; price: number }, quantity: number) {
  const value = product.price * quantity
  const params = {
    content_ids: [product.id],
    content_name: product.name,
    content_type: 'product',
    value,
    currency: 'EGP',
  }
  metaEvent('add_to_cart', params)
  ga4Event('add_to_cart', { ...params, items: [{ item_id: product.id, item_name: product.name, price: product.price, quantity }] })
  tiktokEvent('AddToCart', { ...params, contents: [{ content_id: product.id, content_type: 'product', quantity }] })
  googleAdsEvent('add_to_cart')
}

export function trackInitiateCheckout() {
  metaEvent('initiate_checkout')
  ga4Event('begin_checkout')
  tiktokEvent('InitiateCheckout')
  googleAdsEvent('begin_checkout')
}

export function trackPurchase(data: {
  orderId: string
  total: number
  items: { name: string; quantity: number; total: number }[]
}) {
  const contents = data.items.map((i) => ({
    id: i.name,
    quantity: i.quantity,
    item_price: i.total / i.quantity,
  }))

  if (hasMeta) {
    const fbq = (window as unknown as { fbq?: (...args: unknown[]) => void }).fbq
    if (typeof fbq === 'function') {
      fbq('track', 'Purchase', {
        value: data.total,
        currency: 'EGP',
        content_type: 'product',
        contents: data.items.map((i) => ({ id: i.name, quantity: i.quantity })),
        num_items: data.items.length,
      })
    }
  }

  ga4Event('purchase', {
    transaction_id: data.orderId,
    value: data.total,
    currency: 'EGP',
    items: data.items.map((i, idx) => ({
      item_id: i.name,
      item_name: i.name,
      quantity: i.quantity,
      price: i.total / i.quantity,
      index: idx,
    })),
  })

  if (hasTiktok) {
    const ttq = (window as unknown as { ttq?: { track: (e: string, p?: unknown) => void } }).ttq
    if (ttq?.track) {
      ttq.track('CompletePayment', {
        value: data.total,
        currency: 'EGP',
        contents,
        content_type: 'product',
      })
    }
  }

  if (hasGoogleAds) {
    const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag
    if (typeof gtag === 'function') {
      gtag('event', 'conversion', {
        send_to: GOOGLE_ADS_ID,
        value: data.total,
        currency: 'EGP',
        transaction_id: data.orderId,
      })
    }
  }
}
