import { OrderStatus } from '@/components/shams/order-status'
export const metadata = {
  title: 'Your order',
  robots: { index: false, follow: false },
}
export default function Page() {
  return <OrderStatus />
}
