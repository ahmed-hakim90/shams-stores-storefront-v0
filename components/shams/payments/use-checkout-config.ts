'use client'
import { useQuery } from '@tanstack/react-query'
import { commerceFetch } from '@/lib/commerce/browser'
export interface CheckoutConfig {
  enabled: boolean
  paymob: boolean
  paymobOptions: { id: string; kind: string; title: string; description: string }[]
  paymobUnavailable: boolean
  verifiedMethods: string[]
  states: { code: string; name: string }[]
}
// All cards, product details and checkout share one request/cache key. Payment
// creation still revalidates the current server-side gateway configuration.
export function useCheckoutConfig(enabled = true) {
  return useQuery({
    queryKey: ['checkout-config'],
    queryFn: () => commerceFetch<CheckoutConfig>('/api/commerce/checkout'),
    staleTime: 60000,
    retry: false,
    enabled,
  })
}
