// App-wide constants
export const APP_CONFIG = {
  name: 'Shams Stores',
  description: 'Premium electronics and gadgets store',
  currency: 'EGP',
  locale: 'en-EG',
} as const

export const API_ENDPOINTS = {
  cart: '/api/commerce/cart',
  checkout: '/api/commerce/checkout',
  search: '/api/commerce/search',
  orders: '/api/customer/orders',
  addresses: '/api/customer/addresses',
  wishlist: '/api/customer/wishlist',
  trackOrder: '/api/customer/track-order',
  paymentIntention: '/api/payments/intention',
} as const

export const AUTH_COOKIE = 'shams-auth-token'

export const RATE_LIMITS = {
  login: { limit: 5, windowMs: 60_000 },
  register: { limit: 3, windowMs: 60_000 },
  payment: { limit: 10, windowMs: 60_000 },
} as const
