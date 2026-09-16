import { OrderDetailPage } from '@/components/shams/content-pages'

export default async function OrderDetailRoute({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <OrderDetailPage orderId={id} />
}
