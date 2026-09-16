import { CartPageContent } from '@/components/shams/cart'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Checkout',
  description: 'Complete your order at Shams Stores.',
  robots: { index: false, follow: true },
}

export default function CheckoutPage() {
  return <CartPageContent checkout />
}
