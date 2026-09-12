import 'server-only'
import { commerce } from './index'
import { CommerceError, createWooClient } from './woocommerce'

export function commerceProvider() {
  const provider = process.env.COMMERCE_PROVIDER ?? 'mock'
  if (provider !== 'mock' && provider !== 'woocommerce') throw new CommerceError('Invalid commerce provider.', 503)
  return provider
}

export function serverProducts() {
  return commerceProvider() === 'woocommerce' ? createWooClient(process.env) : commerce.products
}
