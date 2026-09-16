import { CartPageContent } from '@/components/shams/cart'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Your Cart',
  description: 'Review your cart and proceed to checkout at Shams Stores.',
  robots: { index: false, follow: true },
}

export default function CartPage() {
  return <CartPageContent />
}
